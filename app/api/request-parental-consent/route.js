import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'
import { sendParentalConsentRequest } from '@/lib/email'

export async function OPTIONS() {
  return handleOPTIONS()
}

// Request parental consent for a student under 14
export async function POST(request) {
  try {
    const body = await request.json()
    const { studentName, parentEmail, schoolId, teacherId } = body

    // Validation
    if (!studentName || !parentEmail) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Nombre del estudiante y email del padre/madre son requeridos' },
        { status: 400 }
      ))
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(parentEmail)) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      ))
    }

    // Create consent record (pending)
    const { data: consentData, error: consentError } = await supabaseAdmin
      .from('consents')
      .insert({
        user_id: null, // Will be linked to student later
        consent_type: 'parental_minor_under_14',
        given_at: null, // Not given yet
        ip_address: getClientIP(request),
        metadata: {
          studentName,
          parentEmail,
          schoolId,
          teacherId,
          status: 'pending',
          requestedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (consentError) {
      throw new Error(`Error al crear registro de consentimiento: ${consentError.message}`)
    }

    const consentLink = `${process.env.NEXT_PUBLIC_BASE_URL}/consent/${consentData.id}`
    
    // Send parental consent request email
    await sendParentalConsentRequest({
      parentEmail,
      studentName,
      schoolName: 'Su Centro Educativo', // TODO: Fetch from schoolId
      consentLink
    })

    // Audit log
    await writeAuditLog({
      userId: teacherId || null,
      schoolId: schoolId || null,
      action: AuditActions.CONSENT_GIVEN,
      affectedTable: 'consents',
      affectedRecordId: consentData.id,
      ipAddress: getClientIP(request),
      metadata: {
        consentType: 'parental_minor_under_14',
        studentName,
        parentEmail,
        status: 'pending'
      }
    })

    return handleCORS(NextResponse.json({
      success: true,
      message: `Solicitud de consentimiento enviada a ${parentEmail}`,
      consentId: consentData.id,
      consentLink // For testing
    }))

  } catch (error) {
    console.error('POST /api/request-parental-consent error:', error)
    return handleCORS(NextResponse.json(
      { success: false, error: error.message || 'Error al solicitar consentimiento' },
      { status: 500 }
    ))
  }
}

// Check if student has parental consent
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')

    if (!studentName) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Nombre del estudiante requerido' },
        { status: 400 }
      ))
    }

    // Check if consent exists and is given
    const { data, error } = await supabaseAdmin
      .from('consents')
      .select('*')
      .eq('consent_type', 'parental_minor_under_14')
      .ilike('metadata->>studentName', studentName)
      .not('given_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw new Error(error.message)

    const hasConsent = data && data.length > 0

    return handleCORS(NextResponse.json({
      success: true,
      hasConsent,
      consent: hasConsent ? data[0] : null
    }))

  } catch (error) {
    console.error('GET /api/request-parental-consent error:', error)
    return handleCORS(NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    ))
  }
}

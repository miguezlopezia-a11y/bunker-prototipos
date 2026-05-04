import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'

export async function OPTIONS() {
  return handleOPTIONS()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, name, role = 'teacher', schoolId } = body

    // Validation
    if (!email || !name) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Email y nombre son requeridos' },
        { status: 400 }
      ))
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      ))
    }

    // Check if teacher already exists
    const { data: existingTeacher } = await supabaseAdmin
      .from('teachers')
      .select('email')
      .eq('email', email)
      .single()

    if (existingTeacher) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Este profesor ya existe en el sistema' },
        { status: 409 }
      ))
    }

    // Invite user via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        school_id: schoolId
      },
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
    })

    if (authError) {
      console.error('Supabase invite error:', authError)
      throw new Error(`Error al enviar invitación: ${authError.message}`)
    }

    // Create teacher record (will be linked when they accept invite)
    // Note: The auth.uid will be available after they set their password
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .insert({
        id: authData.user.id,
        school_id: schoolId || null,
        name,
        email,
        role
      })
      .select()
      .single()

    if (teacherError) {
      console.error('Teacher insert error:', teacherError)
      // Try to delete the auth user if teacher record creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error('Error al crear registro de profesor')
    }

    // Audit log: Teacher invited
    await writeAuditLog({
      userId: null, // TODO: Get current admin user from auth
      schoolId: schoolId || null,
      action: AuditActions.INVITE_TEACHER,
      affectedTable: 'teachers',
      affectedRecordId: teacherData.id,
      ipAddress: getClientIP(request),
      metadata: {
        invitedEmail: email,
        invitedName: name,
        role
      }
    })

    return handleCORS(NextResponse.json({
      success: true,
      message: `Invitación enviada a ${email}`,
      teacherId: teacherData.id
    }))

  } catch (error) {
    console.error('POST /api/invite-teacher error:', error)
    return handleCORS(NextResponse.json(
      { success: false, error: error.message || 'Error al invitar profesor' },
      { status: 500 }
    ))
  }
}

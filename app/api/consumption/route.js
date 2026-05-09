import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { PRICING_TIERS, OVERAGE_PRICE_PER_PAGE } from '@/lib/pricing'

export async function OPTIONS() {
  return handleOPTIONS()
}

// GET /api/consumption?schoolId=xxx — returns current month consumption + alerts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // If no schoolId, return aggregate (anon mode for MVP)
    let row = null
    if (schoolId) {
      const { data, error } = await supabaseAdmin
        .from('monthly_consumption')
        .select('*')
        .eq('school_id', schoolId)
        .eq('period_year', year)
        .eq('period_month', month)
        .maybeSingle()
      if (error) throw new Error(error.message)
      row = data
    } else {
      // Aggregate: count pages this month from exam_results (no school auth yet)
      const monthStart = new Date(year, month - 1, 1).toISOString()
      const monthEnd = new Date(year, month, 1).toISOString()
      const { count, error } = await supabaseAdmin
        .from('exam_results')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd)
        .is('deleted_at', null)
      if (error) throw new Error(error.message)
      row = {
        pages_processed: count || 0,
        quota_limit: PRICING_TIERS.basico.quota,
        plan_tier: 'basico',
        alert_80_sent: false,
        alert_95_sent: false
      }
    }

    const pagesUsed = row?.pages_processed || 0
    const quota = row?.quota_limit || PRICING_TIERS.basico.quota
    const plan = row?.plan_tier || 'basico'
    const tierInfo = PRICING_TIERS[plan] || PRICING_TIERS.basico
    const percentage = quota > 0 ? Math.min(100, Math.round((pagesUsed / quota) * 100 * 10) / 10) : 0
    const overagePages = Math.max(0, pagesUsed - quota)
    const overageCost = parseFloat((overagePages * OVERAGE_PRICE_PER_PAGE).toFixed(2))

    let alertLevel = null
    if (percentage >= 95) alertLevel = 'critical'
    else if (percentage >= 80) alertLevel = 'warning'

    return handleCORS(NextResponse.json({
      success: true,
      period: { year, month },
      pagesUsed,
      quota,
      percentage,
      remaining: Math.max(0, quota - pagesUsed),
      overagePages,
      overageCost,
      planTier: plan,
      planName: tierInfo.name,
      planPrice: tierInfo.price,
      alertLevel,
      alert80Sent: row?.alert_80_sent || false,
      alert95Sent: row?.alert_95_sent || false
    }))
  } catch (error) {
    console.error('GET /api/consumption error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}

// POST /api/consumption/increment — internal: increment pages_processed by N
export async function POST(request) {
  try {
    const body = await request.json()
    const { schoolId, pages = 1, planTier = 'basico' } = body
    if (!schoolId) {
      return handleCORS(NextResponse.json({ success: true, skipped: true, reason: 'no schoolId' }))
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const quotaLimit = PRICING_TIERS[planTier]?.quota || PRICING_TIERS.basico.quota

    // Upsert: increment if exists, create if not
    const { data: existing } = await supabaseAdmin
      .from('monthly_consumption')
      .select('id, pages_processed')
      .eq('school_id', schoolId)
      .eq('period_year', year)
      .eq('period_month', month)
      .maybeSingle()

    if (existing) {
      const { error } = await supabaseAdmin
        .from('monthly_consumption')
        .update({ pages_processed: existing.pages_processed + pages })
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabaseAdmin
        .from('monthly_consumption')
        .insert({
          school_id: schoolId,
          period_year: year,
          period_month: month,
          pages_processed: pages,
          quota_limit: quotaLimit,
          plan_tier: planTier
        })
      if (error) throw new Error(error.message)
    }

    return handleCORS(NextResponse.json({ success: true, pages }))
  } catch (error) {
    console.error('POST /api/consumption error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}

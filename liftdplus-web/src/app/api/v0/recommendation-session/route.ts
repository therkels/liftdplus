import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    session_id,
    goal,
    experience_level,
    state_code,
    legal_status,
    has_medical_card,
    product_ids,
    claude_summary,
  } = body

  if (!session_id || !goal || !experience_level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('recommendation_sessions')
    .insert({
      session_id,
      goal,
      experience_level,
      state_code: state_code || null,
      legal_status: legal_status || null,
      has_medical_card: has_medical_card ?? null,
      product_ids: product_ids || [],
      claude_summary: claude_summary || null,
    })

  if (error) {
    console.error('recommendation_session insert error:', error)
    return NextResponse.json({ error: 'Failed to log session' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

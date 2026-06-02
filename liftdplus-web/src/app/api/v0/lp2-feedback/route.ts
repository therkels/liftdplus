import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { session_id, goal, state_code, feedback } = body

  if (!feedback?.trim()) {
    return NextResponse.json({ error: 'Missing feedback' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('lp2_feedback')
    .insert({
      session_id: session_id || null,
      goal: goal || null,
      state_code: state_code || null,
      feedback: feedback.trim(),
    })

  if (error) {
    console.error('lp2_feedback insert error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const goal = searchParams.get('goal')
  const experience = searchParams.get('experience')

  if (!goal) {
    return NextResponse.json({ error: 'Missing goal param' }, { status: 400 })
  }

  // Map experience_level values to experience_level_id values in DB
  const experienceMap: Record<string, string> = {
    never: 'never',
    tried_once: 'beginner',
    occasional: 'occasional',
    regular: 'regular',
  }

  const experienceLevelId = experienceMap[experience || ''] || 'never'

  const { data, error } = await supabaseAdmin
    .from('budtender_questions')
    .select('question, sort_order')
    .eq('goal_id', goal)
    .eq('experience_level_id', experienceLevelId)
    .order('sort_order', { ascending: true })
    .limit(4)

  if (error) {
    console.error('budtender_questions error:', error)
    return NextResponse.json({ questions: [] })
  }

  const questions = (data || []).map((row: { question: string }) => row.question)
  return NextResponse.json({ questions })
}

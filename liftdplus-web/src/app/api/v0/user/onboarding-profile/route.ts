import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { primary_goal_id, experience_level_id, secondary_goal_id, tertiary_goal_id } = await req.json();
    if (!primary_goal_id || !experience_level_id) {
      return NextResponse.json({ error: 'Missing goal or experience level' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_recommendation_profile')
      .upsert({
        user_id: user.id,
        primary_goal_id,
        experience_level_id,
        secondary_goal_id: secondary_goal_id ?? null,
        goal_scores: tertiary_goal_id ? { tertiary_goal_id } : {},
        last_computed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to create recommendation profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

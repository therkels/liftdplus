// src/app/api/v0/profile/generate/route.ts
// Generates or refreshes a user's dispensary recommendation profile.
// Called when user visits /profile/guide or hits a milestone.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  user_id: string;
  primary_goal_id: string;
  experience_level_id: string;
}

interface SignalCounts {
  articles_viewed: number;
  qualified_reads: number;
  saves: number;
  checklist_complete: boolean;
}

interface MilestoneRow {
  feature_key: string;
  min_articles_read: number;
  min_qualified_reads: number;
  min_saves: number;
  requires_checklist: boolean;
  unlocks: string[];
}

interface RecommendationData {
  terpenes: TerpeneRow[];
  cannabinoidRatio: CannabinoidRatioRow | null;
  formats: FormatRow[];
  doseRange: DoseRangeRow | null;
  budtenderQuestions: BudtenderQuestionRow[];
  avoidances: AvoidanceRow[];
  products: ProductRow[];
}

interface TerpeneRow {
  display_name: string;
  description: string;
  aroma: string;
  found_in: string;
  rationale: string;
}

interface CannabinoidRatioRow {
  display_name: string;
  description: string;
  thc_range: string;
  cbd_range: string;
  rationale: string;
}

interface FormatRow {
  display_name: string;
  description: string;
  onset_time: string;
  duration: string;
  rationale: string;
}

interface DoseRangeRow {
  cannabinoid: string;
  starting_dose_mg: number;
  max_dose_mg: number;
  notes: string;
}

interface BudtenderQuestionRow {
  question: string;
  why_it_matters: string;
}

interface AvoidanceRow {
  avoid_what: string;
  reason: string;
}

interface ProductRow {
  id: string;
  name: string;
  brand_name: string;
  format_id: string;
  cannabinoid_ratio_id: string;
  thc_mg: number | null;
  cbd_mg: number | null;
  description: string;
  why_its_good: string;
  starter_dose_note: string;
  experience_tags: string[];
  onset_minutes_min: number | null;
  onset_minutes_max: number | null;
  ships_nationally: boolean;
  available_at_dispensaries: boolean;
  price_range: string;
}

// ─── Milestone determination ───────────────────────────────────────────────────

function determineMilestone(
  milestones: MilestoneRow[],
  signals: SignalCounts
): MilestoneRow {
  const qualified = milestones.filter((m) => {
    const articlesOk = signals.articles_viewed >= m.min_articles_read;
    const readsOk = signals.qualified_reads >= m.min_qualified_reads;
    const savesOk = signals.saves >= m.min_saves;
    const checklistOk = !m.requires_checklist || signals.checklist_complete;
    return articlesOk && readsOk && savesOk && checklistOk;
  });
  return qualified[qualified.length - 1] ?? milestones[0];
}

// ─── Claude prompt assembly ────────────────────────────────────────────────────

function buildPrompt(
  profile: UserProfile,
  signals: SignalCounts,
  milestone: MilestoneRow,
  data: RecommendationData,
  articleTitles: string
): string {
  const goalLabel = profile.primary_goal_id.replace(/_/g, ' ');
  const experienceLabel = profile.experience_level_id.replace(/_/g, ' ');

  const terpeneList = data.terpenes
    .map((t) => `${t.display_name} (${t.rationale})`)
    .join(', ');

  const formatList = data.formats
    .map((f) => `${f.display_name} — onset ${f.onset_time}, lasts ${f.duration}`)
    .join('; ');

  const avoidList = data.avoidances
    .map((a) => a.avoid_what)
    .join(', ');

  const ratioSummary = data.cannabinoidRatio
    ? `${data.cannabinoidRatio.display_name}: ${data.cannabinoidRatio.rationale}`
    : 'No specific ratio data available';

  const doseSummary = data.doseRange
    ? `Start at ${data.doseRange.starting_dose_mg}mg ${data.doseRange.cannabinoid}, max ${data.doseRange.max_dose_mg}mg. ${data.doseRange.notes}`
    : 'Start low and go slow';

  const topProducts = data.products
    .slice(0, 3)
    .map((p) => `${p.brand_name} ${p.name}`)
    .join(', ');

  const recentReading = articleTitles
    ? `Recent articles they've read: ${articleTitles}`
    : 'No articles read yet.';

  return `You are writing a friendly, personalized dispensary profile summary for a cannabis beginner using the LIFTD+ app.

User profile:
- Goal: ${goalLabel}
- Experience level: ${experienceLabel}
- Articles read: ${signals.articles_viewed}
- Deep reads (75%+ scroll): ${signals.qualified_reads}
- Saved articles: ${signals.saves}
- Checklist complete: ${signals.checklist_complete ? 'Yes' : 'Not yet'}
- Profile milestone: ${milestone.feature_key}

Recommendations pulled from database:
- Cannabinoid ratio: ${ratioSummary}
- Top terpenes: ${terpeneList}
- Best formats: ${formatList}
- Dosing: ${doseSummary}
- Avoid: ${avoidList}
- Example products to look for: ${topProducts}

${recentReading}

Write 2–3 sentences that feel like advice from a knowledgeable, calm friend — not a doctor, not a brochure, not a cannabis enthusiast.
If their recent reading is relevant to their goal, briefly acknowledge what they already know before telling them what to do next.
Speak directly to this person's goal (${goalLabel}) and experience level (${experienceLabel}).
Be specific and actionable. Reference what to look for at a dispensary.
Plain English only. Warm but not flowery. Never say "cannabis journey."
Do not use markdown, headers, bullet points, or emoji. Plain sentences only.`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 2. Get user's goal and experience level from recommendation profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_recommendation_profile')
      .select('primary_goal_id, experience_level_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const userProfile: UserProfile = {
      user_id: userId,
      primary_goal_id: profileData.primary_goal_id,
      experience_level_id: profileData.experience_level_id,
    };

    const { primary_goal_id: goalId, experience_level_id: experienceId } = userProfile;

    // 3. Count content signals
    const { data: eventData, error: signalError } = await supabaseAdmin
      .from('user_events')
      .select('event_name')
      .eq('user_id', userId);

    if (signalError) {
      return NextResponse.json({ error: 'Failed to load content signals' }, { status: 500 });
    }

    const { data: checklistData } = await supabaseAdmin
      .from('user_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_name', 'checklist_completed')
      .limit(1);

    const signals: SignalCounts = {
      articles_viewed: eventData?.filter((e) => e.event_name === 'article_viewed').length ?? 0,
      qualified_reads: 0, // not yet tracked
      saves: eventData?.filter((e) => e.event_name === 'post_archived').length ?? 0,
      checklist_complete: (checklistData?.length ?? 0) > 0,
    };

    // 4. Load milestones and determine current level
    const { data: milestoneData, error: milestoneError } = await supabaseAdmin
      .from('profile_unlock_milestones')
      .select('*')
      .order('sort_order', { ascending: true });

    if (milestoneError || !milestoneData?.length) {
      return NextResponse.json({ error: 'Failed to load milestones' }, { status: 500 });
    }

    const currentMilestone = determineMilestone(milestoneData, signals);
    const unlockedFeatures = currentMilestone.unlocks ?? [];

    // 5. Query recommendation tables and recent reads in parallel
    const [terpenes, ratios, formats, doseRanges, questions, avoidances, products, recentSignals] =
      await Promise.all([
        // Terpenes for goal
        supabaseAdmin
          .from('goal_terpenes')
          .select(`
            rationale,
            terpenes:terpene_id (
              display_name, description, aroma, found_in
            )
          `)
          .eq('goal_id', goalId)
          .order('priority', { ascending: true })
          .limit(3),

        // Cannabinoid ratio for goal + experience
        supabaseAdmin
          .from('goal_cannabinoid_ratios')
          .select(`
            rationale,
            cannabinoid_ratios:cannabinoid_ratio_id (
              display_name, description, thc_range, cbd_range
            )
          `)
          .eq('goal_id', goalId)
          .eq('experience_level_id', experienceId)
          .order('priority', { ascending: true })
          .limit(1),

        // Formats for goal + experience
        supabaseAdmin
          .from('goal_formats')
          .select(`
            rationale,
            formats:format_id (
              display_name, description, onset_time, duration
            )
          `)
          .eq('goal_id', goalId)
          .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
          .order('priority', { ascending: true })
          .limit(3),

        // Dose ranges for experience + top format
        supabaseAdmin
          .from('dose_ranges')
          .select('cannabinoid, starting_dose_mg, max_dose_mg, notes')
          .eq('experience_level_id', experienceId)
          .limit(1),

        // Budtender questions for goal + experience
        supabaseAdmin
          .from('budtender_questions')
          .select('question, why_it_matters')
          .eq('goal_id', goalId)
          .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
          .order('sort_order', { ascending: true }),

        // Avoidances for goal
        supabaseAdmin
          .from('goal_avoidances')
          .select('avoid_what, reason')
          .eq('goal_id', goalId)
          .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
          .order('sort_order', { ascending: true }),

        // Brand products matching primary goal, beginner-friendly
        supabaseAdmin
          .from('brand_products')
          .select(`
            id, name, format_id, cannabinoid_ratio_id,
            thc_mg, cbd_mg, description, why_its_good,
            starter_dose_note, experience_tags,
            onset_minutes_min, onset_minutes_max,
            ships_nationally, available_at_dispensaries, price_range,
            brands:brand_id ( name )
          `)
          .eq('primary_goal_id', goalId)
          .eq('beginner_friendly', true)
          .order('ships_nationally', { ascending: true }) // dispensary products first
          .limit(6),

        // Recently read articles
        supabaseAdmin
          .from('user_events')
          .select('properties, event_name')
          .eq('user_id', userId)
          .eq('event_name', 'article_viewed')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

    const recentPostIds =
      recentSignals.data?.map((s: any) => s.properties?.post_id).filter(Boolean) ?? [];

    const { data: recentArticles } =
      recentPostIds.length > 0
        ? await supabaseAdmin.from('post').select('id, title').in('id', recentPostIds)
        : { data: [] as { id: string; title: string }[] | null };

    const articleTitles = (recentArticles ?? []).map((a) => a.title).join(', ');

    // 6. Shape the recommendation data
    const recData: RecommendationData = {
      terpenes: (terpenes.data ?? []).map((row: any) => ({
        ...row.terpenes,
        rationale: row.rationale,
      })),
      cannabinoidRatio: ratios.data?.[0]
        ? { ...ratios.data[0].cannabinoid_ratios, rationale: ratios.data[0].rationale }
        : null,
      formats: (formats.data ?? []).map((row: any) => ({
        ...row.formats,
        rationale: row.rationale,
      })),
      doseRange: doseRanges.data?.[0] ?? null,
      budtenderQuestions: questions.data ?? [],
      avoidances: avoidances.data ?? [],
      products: (products.data ?? []).map((p: any) => ({
        ...p,
        brand_name: p.brands?.name ?? '',
      })),
    };

    // 7. Call Claude Haiku for the personalized summary
    let generatedSummary = '';
    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: buildPrompt(
                userProfile,
                signals,
                currentMilestone,
                recData,
                articleTitles
              ),
            },
          ],
        }),
      });

      if (claudeResponse.ok) {
        const claudeData = await claudeResponse.json();
        generatedSummary = claudeData.content?.[0]?.text ?? '';
      }
    } catch (claudeError) {
      // Claude failure is non-fatal — profile still saves, summary just stays empty
      console.error('Claude API error:', claudeError);
    }

    // 8. Build the full profile snapshot (what gets stored + shown)
    const profileSnapshot = {
      goal_id: goalId,
      experience_level_id: experienceId,
      milestone_key: currentMilestone.feature_key,
      unlocked_features: unlockedFeatures,
      terpenes: recData.terpenes,
      cannabinoid_ratio: recData.cannabinoidRatio,
      formats: recData.formats,
      dose_range: recData.doseRange,
      budtender_questions: recData.budtenderQuestions,
      avoidances: recData.avoidances,
      products: recData.products,
      generated_summary: generatedSummary,
    };

    // 9. Log to user_recommendation_impressions
    const { data: impression, error: impressionError } = await supabaseAdmin
      .from('user_recommendation_impressions')
      .insert({
        user_id: userId,
        milestone_level: currentMilestone.feature_key,
        profile_snapshot: profileSnapshot,
        generated_summary: generatedSummary,
        goal_id: goalId,
        experience_level_id: experienceId,
        articles_viewed: signals.articles_viewed,
        qualified_reads: signals.qualified_reads,
        saves: signals.saves,
        checklist_complete: signals.checklist_complete,
      })
      .select('id')
      .single();

    if (impressionError) {
      console.error('Failed to log impression:', impressionError);
      return NextResponse.json(
        {
          error: 'impression_failed',
          detail: impressionError.message,
          code: impressionError.code,
        },
        { status: 500 }
      );
    }

    const impressionId = impression?.id ?? null;

    // 10. Upsert to user_recommendation_profile
    const { error: upsertError } = await supabaseAdmin
      .from('user_recommendation_profile')
      .upsert(
        {
          user_id: userId,
          primary_goal_id: goalId,
          experience_level_id: experienceId,
          milestone_key: currentMilestone.feature_key,
          unlocked_features: unlockedFeatures,
          recommendation_id: impressionId,
          last_computed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('Failed to upsert recommendation profile:', upsertError);
    }

    // 11. Return full profile to client
    return NextResponse.json({
      success: true,
      profile: profileSnapshot,
      impression_id: impressionId,
    });
  } catch (error) {
    console.error('Profile generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_recommendation_impressions')
      .select('profile_snapshot, generated_summary, created_at, milestone_level')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    // Check current signals to see if user has hit a new milestone
    const { data: signalData } = await supabaseAdmin
      .from('user_events')
      .select('event_name')
      .eq('user_id', user.id);

    const { data: checklistData } = await supabaseAdmin
      .from('user_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_name', 'checklist_completed')
      .limit(1);

    const signals = {
      articles_viewed: signalData?.filter(s => s.event_name === 'article_viewed').length ?? 0,
      qualified_reads: 0,
      saves: signalData?.filter(s => s.event_name === 'post_archived').length ?? 0,
      checklist_complete: (checklistData?.length ?? 0) > 0,
    };

    const { data: milestoneData } = await supabaseAdmin
      .from('profile_unlock_milestones')
      .select('*')
      .order('sort_order', { ascending: true });

    const lastMilestoneKey = (profile.profile_snapshot as any)?.milestone_key ?? null;
    let should_regenerate = false;

    if (milestoneData?.length) {
      const qualified = milestoneData.filter(m =>
        signals.articles_viewed >= m.min_articles_read &&
        signals.qualified_reads >= m.min_qualified_reads &&
        signals.saves >= m.min_saves &&
        (!m.requires_checklist || signals.checklist_complete)
      );
      const currentMilestone = qualified[qualified.length - 1] ?? milestoneData[0];
      if (currentMilestone.feature_key !== lastMilestoneKey) {
        should_regenerate = true;
      }
    }

    return NextResponse.json({
      success: true,
      profile: profile.profile_snapshot,
      generated_at: profile.created_at,
      should_regenerate,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// src/app/api/v0/profile/generate-temp/route.ts
// Public preview endpoint: builds a temp profile + Claude summary from quiz inputs.
// No auth, no database writes.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateTempBody {
  topic: string;
  experience_level: string;
  dispensary_status?: string;
  location?: string;
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
  format_id?: string;
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
  hemp_derived?: boolean;
  available_in_states?: string[] | null;
  primary_goal_id?: string;
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

// ─── Input mapping ────────────────────────────────────────────────────────────

const TOPIC_TO_GOAL: Record<string, string> = {
  sleep: 'sleep',
  stress: 'stress',
  pain: 'pain',
  focus: 'focus',
  intimacy: 'intimacy',
  hormonal: 'hormonal',
  Sleep: 'sleep',
  'Sleep & Rest': 'sleep',
  'Stress and anxiety': 'stress',
  'Stress & Anxiety': 'stress',
  'Focus and productivity': 'focus',
  'Focus & Creativity': 'focus',
  'Pain and recovery': 'pain',
  'Pain Relief': 'pain',
  'Intimacy & Libido': 'intimacy',
  'Hormonal Changes': 'hormonal',
  "I'm not sure yet": 'stress',
  "I'm Not Sure Yet": 'stress',
};

const EXPERIENCE_TO_ID: Record<string, string> = {
  never: 'never',
  beginner: 'beginner',
  occasional: 'occasional',
  regular: 'regular',
  'Never tried cannabis': 'never',
  "I've never tried cannabis": 'never',
  'Tried it once or twice': 'beginner',
  "I've tried it a few times": 'beginner',
  'I use it occasionally': 'occasional',
  'I use it regularly': 'regular',
  'I used to use cannabis but stopped': 'never',
};

const GOAL_LABELS: Record<string, string> = {
  sleep: 'Sleep & Rest',
  stress: 'Stress & Anxiety',
  pain: 'Pain Relief',
  focus: 'Focus & Creativity',
  intimacy: 'Intimacy',
  hormonal: 'Hormonal Changes',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  never: 'Never tried cannabis',
  beginner: 'Tried it once or twice',
  occasional: 'Occasional user',
  regular: 'Regular user',
};

const FLOWER_PATTERN = /flower/i;

type LegalityTier = 'recreational' | 'medical' | 'hemp_only';

interface StateRules {
  name: string;
  tier: LegalityTier;
  maxThcPerServingMg: number;
  typicalThcLowMg: number;
  typicalThcHighMg: number;
}

const DEFAULT_STATE_RULES: StateRules = {
  name: 'your state',
  tier: 'recreational',
  maxThcPerServingMg: 10,
  typicalThcLowMg: 2.5,
  typicalThcHighMg: 10,
};

/** Per-state edible/serving limits and typical retail THC ranges (beginner-focused). */
const STATE_RULES: Record<string, StateRules> = {
  CA: { name: 'California', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  CO: { name: 'Colorado', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  OR: { name: 'Oregon', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  WA: { name: 'Washington', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  NV: { name: 'Nevada', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  AZ: { name: 'Arizona', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  NM: { name: 'New Mexico', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  MA: { name: 'Massachusetts', tier: 'recreational', maxThcPerServingMg: 5, typicalThcLowMg: 2.5, typicalThcHighMg: 5 },
  MI: { name: 'Michigan', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  IL: { name: 'Illinois', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  NY: { name: 'New York', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  NJ: { name: 'New Jersey', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  MD: { name: 'Maryland', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  MO: { name: 'Missouri', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  ME: { name: 'Maine', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  VT: { name: 'Vermont', tier: 'recreational', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  CT: { name: 'Connecticut', tier: 'recreational', maxThcPerServingMg: 5, typicalThcLowMg: 2.5, typicalThcHighMg: 5 },
  FL: { name: 'Florida', tier: 'medical', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  PA: { name: 'Pennsylvania', tier: 'medical', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  OH: { name: 'Ohio', tier: 'medical', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  TX: { name: 'Texas', tier: 'hemp_only', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  GA: { name: 'Georgia', tier: 'hemp_only', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
  NC: { name: 'North Carolina', tier: 'hemp_only', maxThcPerServingMg: 10, typicalThcLowMg: 2.5, typicalThcHighMg: 10 },
};

function getStateRules(stateCode: string): StateRules {
  return STATE_RULES[stateCode] ?? { ...DEFAULT_STATE_RULES, name: stateCode };
}

function getStartingDoseMg(
  experienceId: string,
  doseRange: DoseRangeRow | null,
  stateRules: StateRules
): number {
  if (doseRange?.starting_dose_mg) return doseRange.starting_dose_mg;
  const byExperience: Record<string, number> = {
    never: Math.min(2.5, stateRules.maxThcPerServingMg),
    beginner: Math.min(5, stateRules.maxThcPerServingMg),
    occasional: Math.min(5, stateRules.maxThcPerServingMg),
    regular: Math.min(10, stateRules.maxThcPerServingMg),
  };
  return byExperience[experienceId] ?? 2.5;
}

function deriveThcRangeFromProducts(
  products: ProductRow[],
  stateRules: StateRules
): { low: number; high: number } {
  const values = products
    .map((p) => p.thc_mg)
    .filter((v): v is number => v != null && v > 0);
  if (values.length === 0) {
    return { low: stateRules.typicalThcLowMg, high: stateRules.typicalThcHighMg };
  }
  return {
    low: Math.min(...values),
    high: Math.max(...values, stateRules.typicalThcHighMg),
  };
}

function buildLegalityLine(stateName: string, tier: LegalityTier): string {
  switch (tier) {
    case 'recreational':
      return `In ${stateName}, THC, CBD, and hemp-derived products from licensed dispensaries are legal for adults 21+. All recommendations are legal in this state.`;
    case 'medical':
      return `In ${stateName}, medical THC and CBD products are legal with a valid card; hemp-derived CBD is also available. All recommendations below fit medical or hemp channels legal in this state.`;
    case 'hemp_only':
      return `In ${stateName}, dispensary THC is not broadly available — hemp-derived CBD products (under 0.3% Delta-9 THC) are legal and ship nationwide. All recommendations are legal in this state.`;
  }
}

function buildAvailabilityLine(
  stateName: string,
  products: ProductRow[],
  dispensaryStatus?: string
): string {
  const dispensaryCount = products.filter((p) => p.available_at_dispensaries).length;
  const shipsCount = products.filter((p) => p.ships_nationally).length;
  const status = dispensaryStatus?.toLowerCase() ?? '';

  if (status === 'ships' || status === 'ships_nationally' || status === 'online' || status === 'ships_to_me') {
    return shipsCount > 0
      ? `These products ship nationwide (including to ${stateName}).`
      : `Look for hemp-derived products that ship nationwide to ${stateName}.`;
  }
  if (status === 'dispensary' || status === 'at_dispensary') {
    return dispensaryCount > 0
      ? `These products are available at licensed dispensaries in ${stateName}.`
      : `Visit a licensed dispensary in ${stateName} for products matched to your goal.`;
  }
  if (dispensaryCount > 0 && shipsCount > 0) {
    return `These products are available at dispensaries in ${stateName} and some ship nationwide.`;
  }
  if (dispensaryCount > 0) {
    return `These products are available at dispensaries in ${stateName}.`;
  }
  if (shipsCount > 0) {
    return `These hemp-derived products ship nationwide to ${stateName}.`;
  }
  return `Check licensed dispensaries or online retailers serving ${stateName}.`;
}

interface LocationPromptContext {
  legalityUpfront: string;
  locationDetail: string;
  varianceGuidance: string;
  availabilityNote: string;
}

function buildLocationPromptContext(
  location: string,
  experienceId: string,
  data: RecommendationData,
  dispensaryStatus?: string
): LocationPromptContext {
  const stateCode = normalizeStateCode(location);
  const rules = getStateRules(stateCode);
  const thcRange = deriveThcRangeFromProducts(data.products, rules);
  const startingMg = getStartingDoseMg(experienceId, data.doseRange, rules);
  const formatNames = data.formats.map((f) => f.display_name).join(', ') ||
    'edibles, tinctures, and topicals';

  return {
    legalityUpfront: buildLegalityLine(rules.name, rules.tier),
    locationDetail: `User is in ${rules.name} (${stateCode}). Legal THC limits are ${rules.maxThcPerServingMg}mg per serving. Available formats: ${formatNames}.`,
    varianceGuidance: `In ${rules.name}, products in our database typically range from ${thcRange.low}mg to ${thcRange.high}mg THC per serving. Recommend starting at ${startingMg}mg based on their experience level.`,
    availabilityNote: buildAvailabilityLine(rules.name, data.products, dispensaryStatus),
  };
}

function resolveGoalId(topic: string): string {
  return TOPIC_TO_GOAL[topic] ?? TOPIC_TO_GOAL[topic.trim()] ?? topic.toLowerCase().replace(/\s+/g, '_');
}

function resolveExperienceId(experience: string): string {
  return (
    EXPERIENCE_TO_ID[experience] ??
    EXPERIENCE_TO_ID[experience.trim()] ??
    experience.toLowerCase()
  );
}

function normalizeStateCode(location: string): string {
  return location.trim().toUpperCase();
}

function isFlowerFormat(formatId?: string, displayName?: string): boolean {
  return FLOWER_PATTERN.test(formatId ?? '') || FLOWER_PATTERN.test(displayName ?? '');
}

function filterFormatsNoFlower(formats: FormatRow[]): FormatRow[] {
  return formats.filter(
    (f) => !isFlowerFormat(f.format_id, f.display_name)
  );
}

function filterProducts(
  products: ProductRow[],
  location?: string,
  dispensaryStatus?: string
): ProductRow[] {
  const state = location ? normalizeStateCode(location) : null;
  const status = dispensaryStatus?.toLowerCase() ?? '';

  return products.filter((p) => {
    if (isFlowerFormat(p.format_id)) return false;

    if (state) {
      const states = p.available_in_states ?? [];
      const availableInState =
        states.length === 0 || states.map((s) => s.toUpperCase()).includes(state);
      const shipsToState = Boolean(p.ships_nationally && p.hemp_derived);
      if (!availableInState && !shipsToState) return false;
    }

    if (status === 'dispensary' || status === 'at_dispensary') {
      return p.available_at_dispensaries;
    }
    if (
      status === 'ships' ||
      status === 'ships_nationally' ||
      status === 'online' ||
      status === 'ships_to_me'
    ) {
      return p.ships_nationally;
    }

    return true;
  });
}

// ─── DB queries (mirrors generate/route.ts) ───────────────────────────────────

async function loadRecommendationData(
  goalId: string,
  experienceId: string
): Promise<RecommendationData> {
  const [terpenes, ratios, formats, doseRanges, questions, avoidances, products] =
    await Promise.all([
      supabaseAdmin
        .from('goal_terpenes')
        .select(
          `rationale, terpenes:terpene_id ( display_name, description, aroma, found_in )`
        )
        .eq('goal_id', goalId)
        .order('priority', { ascending: true })
        .limit(3),

      supabaseAdmin
        .from('goal_cannabinoid_ratios')
        .select(
          `rationale, cannabinoid_ratios:cannabinoid_ratio_id ( display_name, description, thc_range, cbd_range )`
        )
        .eq('goal_id', goalId)
        .eq('experience_level_id', experienceId)
        .order('priority', { ascending: true })
        .limit(1),

      supabaseAdmin
        .from('goal_formats')
        .select(
          `rationale, format_id, formats:format_id ( display_name, description, onset_time, duration )`
        )
        .eq('goal_id', goalId)
        .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
        .order('priority', { ascending: true })
        .limit(5),

      supabaseAdmin
        .from('dose_ranges')
        .select('cannabinoid, starting_dose_mg, max_dose_mg, notes')
        .eq('experience_level_id', experienceId)
        .limit(1),

      supabaseAdmin
        .from('budtender_questions')
        .select('question, why_it_matters')
        .eq('goal_id', goalId)
        .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('goal_avoidances')
        .select('avoid_what, reason')
        .eq('goal_id', goalId)
        .or(`experience_level_id.eq.${experienceId},experience_level_id.is.null`)
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('brand_products')
        .select(
          `id, name, format_id, cannabinoid_ratio_id, thc_mg, cbd_mg, description, why_its_good, starter_dose_note, experience_tags, onset_minutes_min, onset_minutes_max, ships_nationally, available_at_dispensaries, price_range, hemp_derived, available_in_states, goal_ids, primary_goal_id, brands:brand_id ( name )`
        )
        .eq('beginner_friendly', true)
        .order('sort_order', { ascending: true })
        .limit(20),
    ]);

  const mappedFormats = (formats.data ?? []).map((row: Record<string, unknown>) => ({
    ...(row.formats as object),
    rationale: row.rationale as string,
    format_id: (row.format_id as string) ?? (row.formats as { format_id?: string })?.format_id,
  })) as FormatRow[];

  const mappedProducts = (products.data ?? [])
    .map((p: Record<string, unknown>) => ({
      ...p,
      brand_name: (p.brands as { name?: string } | null)?.name ?? '',
    }))
    .filter((p) => {
      const row = p as ProductRow & { goal_ids?: string[] | null };
      return (
        row.primary_goal_id === goalId ||
        (row.goal_ids ?? []).includes(goalId)
      );
    }) as ProductRow[];

  return {
    terpenes: (terpenes.data ?? []).map((row: Record<string, unknown>) => ({
      ...(row.terpenes as object),
      rationale: row.rationale as string,
    })) as TerpeneRow[],
    cannabinoidRatio: ratios.data?.[0]
      ? {
          ...(ratios.data[0].cannabinoid_ratios as object),
          rationale: ratios.data[0].rationale as string,
        }
      : null,
    formats: filterFormatsNoFlower(mappedFormats),
    doseRange: (doseRanges.data?.[0] as DoseRangeRow) ?? null,
    budtenderQuestions: (questions.data ?? []) as BudtenderQuestionRow[],
    avoidances: (avoidances.data ?? []) as AvoidanceRow[],
    products: mappedProducts,
  };
}

// ─── Claude prompt ────────────────────────────────────────────────────────────

function buildPrompt(
  topicLabel: string,
  experienceLabel: string,
  experienceId: string,
  dispensaryStatus: string | undefined,
  location: string | undefined,
  data: RecommendationData
): string {
  const terpeneInline = data.terpenes
    .map((t) => `${t.display_name} (${t.rationale})`)
    .join(', ');

  const formatList = data.formats
    .map(
      (f) =>
        `${f.display_name} — onset ${f.onset_time}, lasts ${f.duration}: ${f.rationale}`
    )
    .join('; ');

  const ratioSummary = data.cannabinoidRatio
    ? `${data.cannabinoidRatio.display_name}: ${data.cannabinoidRatio.rationale} (THC ${data.cannabinoidRatio.thc_range}, CBD ${data.cannabinoidRatio.cbd_range})`
    : 'No specific ratio data available';

  const doseSummary = data.doseRange
    ? `Start at ${data.doseRange.starting_dose_mg}mg ${data.doseRange.cannabinoid}, max ${data.doseRange.max_dose_mg}mg. ${data.doseRange.notes}`
    : 'Start low and go slow';

  const productList = data.products
    .slice(0, 5)
    .map(
      (p) =>
        `${p.brand_name} ${p.name} (${p.format_id.replace(/_/g, ' ')}, ${p.why_its_good})`
    )
    .join('; ');

  const avoidList = data.avoidances.map((a) => `${a.avoid_what}: ${a.reason}`).join('; ');

  const locationContext = location
    ? buildLocationPromptContext(location, experienceId, data, dispensaryStatus)
    : null;

  const locationBlock = locationContext
    ? `${locationContext.legalityUpfront}
${locationContext.locationDetail}
${locationContext.varianceGuidance}
${locationContext.availabilityNote}
Only recommend products that are legal and available in this state.`
    : 'User location was not provided — recommend formats and ratios generally, and only name specific products if they ship nationally.';

  const dispensaryBlock =
    !location && dispensaryStatus
      ? `Dispensary access: ${dispensaryStatus.replace(/_/g, ' ')}.`
      : '';

  const terpeneGuidance = terpeneInline
    ? `Based on their goal (${topicLabel}), the most relevant terpenes are ${terpeneInline}. Reference these terpenes when recommending specific products and formats.`
    : `Based on their goal (${topicLabel}), focus on beginner-friendly formats and ratios.`;

  return `You are writing a friendly, personalized dispensary guide summary for a cannabis beginner using the LIFTD+ app.

${locationBlock}
${dispensaryBlock}

User profile:
- Goal: ${topicLabel}
- Experience level: ${experienceLabel}

${terpeneGuidance}

Recommendations pulled from database (focus on edibles, tinctures, and topicals — do not recommend flower or smoking):
- Best formats: ${formatList || 'Edibles and tinctures are typically best for beginners'}
- Cannabinoid ratio: ${ratioSummary}
- Dosing: ${doseSummary}
- What to avoid: ${avoidList || 'High-THC products without CBD balance'}
- Example products: ${productList || 'Ask your budtender for a low-dose edible or tincture matched to your goal'}

Write 2–3 sentences that feel like advice from a knowledgeable, calm friend — not a doctor, not a brochure, not a cannabis enthusiast.
Speak directly to this person's goal (${topicLabel}) and experience level (${experienceLabel}).
${locationContext ? 'Ground your advice in their state: reference serving limits, typical THC ranges, and where they can actually buy (dispensary vs online) when it helps.' : ''}
Weave terpene reasoning into product and format recommendations naturally — do not list terpenes separately.
Be specific and actionable about formats, cannabinoid ratios, dosing, and what to look for at a dispensary or online.
Plain English only. Warm but not flowery. Never say "cannabis journey."
Do not use markdown, headers, bullet points, or emoji. Plain sentences only.`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<GenerateTempBody>;

    if (!body.topic?.trim() || !body.experience_level?.trim()) {
      return NextResponse.json(
        { error: 'topic and experience_level are required' },
        { status: 400 }
      );
    }

    const goalId = resolveGoalId(body.topic);
    const experienceId = resolveExperienceId(body.experience_level);
    const location = body.location?.trim() || undefined;
    const dispensaryStatus = body.dispensary_status?.trim() || undefined;

    const recData = await loadRecommendationData(goalId, experienceId);
    recData.products = filterProducts(recData.products, location, dispensaryStatus);

    const topicLabel = GOAL_LABELS[goalId] ?? body.topic.replace(/_/g, ' ');
    const experienceLabel =
      EXPERIENCE_LABELS[experienceId] ?? body.experience_level.replace(/_/g, ' ');

    const profile = {
      topic: body.topic,
      goal_id: goalId,
      experience_level: body.experience_level,
      experience_level_id: experienceId,
      dispensary_status: dispensaryStatus ?? null,
      location: location ? normalizeStateCode(location) : null,
      terpenes: recData.terpenes,
      cannabinoid_ratio: recData.cannabinoidRatio,
      formats: recData.formats,
      dose_range: recData.doseRange,
      budtender_questions: recData.budtenderQuestions,
      avoidances: recData.avoidances,
      products: recData.products,
    };

    let generatedSummary = '';
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            messages: [
              {
                role: 'user',
                content: buildPrompt(
                  topicLabel,
                  experienceLabel,
                  experienceId,
                  dispensaryStatus,
                  location,
                  recData
                ),
              },
            ],
          }),
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          generatedSummary = claudeData.content?.[0]?.text ?? '';
        } else {
          console.error('Claude API error:', await claudeResponse.text());
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
      }
    }

    return NextResponse.json({
      profile: { ...profile, generated_summary: generatedSummary },
      generated_summary: generatedSummary,
      temp: true,
    });
  } catch (error) {
    console.error('Profile generate-temp error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

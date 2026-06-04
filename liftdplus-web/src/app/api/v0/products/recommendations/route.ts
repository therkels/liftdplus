// GET /api/v0/products/recommendations
// Query: goal, state (optional), experience, has_medical_card (optional)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { GoalSlug, ExperienceLevel, LegalStatus, BrandProduct, GOAL_LABELS } from '@/lib/lp2-types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const goal = searchParams.get('goal') as GoalSlug
    const stateCode = searchParams.get('state') || null
    const experience = searchParams.get('experience') as ExperienceLevel
    const hasMedicalCardRaw = searchParams.get('has_medical_card')

    let hasMedicalCard: boolean | null = null
    if (hasMedicalCardRaw === 'true') hasMedicalCard = true
    if (hasMedicalCardRaw === 'false') hasMedicalCard = false

    if (!goal || !experience) {
      return NextResponse.json({ error: 'Missing required params: goal, experience' }, { status: 400 })
    }

    // 1. Get state legal status (optional — hemp-safe if no state)
    let legalStatus: LegalStatus = 'recreational' // default: show everything
    let stateName = ''
    let isIdaho = false

    if (stateCode) {
      const { data: stateData, error: stateError } = await supabaseAdmin
        .from('state_legal_status')
        .select('legal_status, state_name')
        .eq('state_code', stateCode)
        .single()

      if (stateError || !stateData) {
        return NextResponse.json({ error: 'Unknown state code' }, { status: 400 })
      }
      legalStatus = stateData.legal_status as LegalStatus
      stateName = stateData.state_name
      isIdaho = stateCode === 'ID'
    }

    // 2. Determine hemp_derived filter
    // hemp_derived=true: ships nationally (hemp)
    // hemp_derived=false: dispensary THC products
    // When no state or hemp_only: show hemp_derived only
    const showDispensary = stateCode && (
      legalStatus === 'recreational' ||
      (legalStatus === 'medical_only' && hasMedicalCard === true)
    )

    // 3. Experience-based THC limits
    const maxThcMg = experience === 'never' || experience === 'tried_once' ? 5
      : experience === 'occasional' ? 10
      : null

    const requireBeginner = experience === 'never' || experience === 'tried_once'

    // 4. Build query
    let query = supabaseAdmin
      .from('brand_products')
      .select(`
      id,
      brand_id,
      name,
      why_its_good,
      starter_dose_note,
      price_range,
      format_id,
      thc_mg,
      cbd_mg,
      ships_nationally,
      available_at_dispensaries,
      beginner_friendly,
      primary_goal_id,
      hemp_derived,
      buy_url,
      onset_minutes_min,
      onset_minutes_max,
      brands!inner(name)
    `)
      .eq('primary_goal_id', goal)
      .not('format_id', 'in', '(flower,vape)')

    // Hemp-only or no state: only hemp_derived products
    if (!showDispensary) {
      query = query.eq('hemp_derived', true)
    }

    // Beginner filter
    if (requireBeginner) {
      query = query.eq('beginner_friendly', true)
    }

    // THC cap (applies to low-dose hemp THC products)
    if (maxThcMg !== null) {
      query = query.or(`thc_mg.lte.${maxThcMg},thc_mg.is.null`)
    }

    // Idaho: zero THC only
    if (isIdaho) {
      query = query.or('thc_mg.is.null,thc_mg.eq.0')
    }

    const { data: rawProducts, error: productsError } = await query

    if (productsError) {
      console.error('Product query error:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // 5. Get average ratings
    const productIds = (rawProducts || []).map((p: any) => p.id)
    const ratingsMap: Record<string, number | null> = {}

    if (productIds.length > 0) {
      const { data: ratings } = await supabaseAdmin
        .from('product_ratings')
        .select('product_id, rating')
        .in('product_id', productIds)

      if (ratings) {
        const grouped: Record<string, number[]> = {}
        for (const r of ratings) {
          if (!grouped[r.product_id]) grouped[r.product_id] = []
          grouped[r.product_id].push(r.rating)
        }
        for (const [pid, vals] of Object.entries(grouped)) {
          ratingsMap[pid] = vals.reduce((a, b) => a + b, 0) / vals.length
        }
      }
    }

    // 6. Shape + rank
    const products: BrandProduct[] = (rawProducts || [])
      .map((p: any) => ({
        id: p.id,
        brand_id: p.brand_id,
        brand_name: p.brands.name,
        brand_tier: 'listed', // tier not in schema anymore — default
        name: p.name,
        description: '',
        why_its_good: p.why_its_good,
        starter_dose_note: p.starter_dose_note,
        price_range: p.price_range,
        format: p.format_id, // format_id is the slug (edible, tincture, etc.)
        thc_mg: p.thc_mg,
        cbd_mg: p.cbd_mg,
        ships_nationally: p.ships_nationally,
        available_at_dispensaries: p.available_at_dispensaries,
        beginner_friendly: p.beginner_friendly,
        primary_goal_id: p.primary_goal_id,
        legal_type: p.hemp_derived ? 'hemp_derived' : 'dispensary_thc',
        buy_url: p.buy_url,
        onset_minutes_min: p.onset_minutes_min,
        onset_minutes_max: p.onset_minutes_max,
        avg_rating: ratingsMap[p.id] ?? null,
      }))
      .sort((a: BrandProduct, b: BrandProduct) => {
        // Ships nationally first (better for most users)
        if (a.ships_nationally !== b.ships_nationally) return a.ships_nationally ? -1 : 1
        // Beginner friendly first
        if (a.beginner_friendly !== b.beginner_friendly) return a.beginner_friendly ? -1 : 1
        // Lowest THC first
        const aThc = a.thc_mg ?? 999
        const bThc = b.thc_mg ?? 999
        if (aThc !== bThc) return aThc - bThc
        // Rating desc
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
      })

    // 7. Claude summary
    const claudeSummary = await generateSummary({
      goal, experience, stateName: stateName || 'your state',
      legalStatus, hasMedicalCard, stateCode,
      products: products.slice(0, 3),
      topic: (searchParams.get('topic') || ''),
      learning_goal: (searchParams.get('learning_goal') || ''),
    })

    return NextResponse.json({
      products,
      claudeSummary,
      legalStatus,
      stateName,
      sessionId: crypto.randomUUID(),
    })
  } catch (err) {
    console.error('recommendations error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

async function generateSummary({
  goal, experience, stateName, legalStatus, hasMedicalCard, stateCode, products,
  topic, learning_goal,
}: {
  goal: string; experience: string; stateName: string; stateCode: string | null
  legalStatus: LegalStatus; hasMedicalCard: boolean | null; products: BrandProduct[]
  topic: string; learning_goal: string
}): Promise<string> {
  const goalLabel = GOAL_LABELS[goal as GoalSlug] || goal
  try {
    const systemPrompt = `You are the LIFTD+ guide engine. You write short, plain-language cannabis education summaries for cautious adult beginners — primarily women 35+. Your tone is calm, peer-to-peer, and trustworthy. Never clinical, never hype-y.

Rules:
- 4-5 sentences maximum. Hard limit.
- Lead with the emotional goal, not the cannabinoid name
- Introduce the cannabinoid as the mechanism after establishing the goal
- Reference what's available in their state
- End with a clear transition to the products below
- No em dashes
- Never say "consult your doctor"
- Never use the word "journey"
- Write like a knowledgeable friend, not a brand
- In your final sentence, mention one key terpene for this goal in plain language. Example: "If you visit a dispensary, look for strains with myrcene or linalool in the terpene profile." Frame it as something to look for, not a proven cure. Only mention terpenes if the user has dispensary access (recreational or medical states). Skip for hemp_only states.

Cannabinoid reference:
- CBN = sleep cannabinoid, mild sedative, non-intoxicating
- CBD = calming foundation, builds over 1-2 weeks, non-intoxicating
- CBG = daytime focus cannabinoid, activating, non-intoxicating
- Low-dose THC = 2.5-5mg, supports sleep/stress/relaxation, always start low
- Hemp THC = same effect as THC but ships nationally, Farm Bill compliant

Key terpenes by goal (mention one in your summary):
- sleep → myrcene (sedating, most common in sleep strains) or linalool (calming, same as lavender)
- stress → limonene (reduces THC-induced anxiety, Johns Hopkins 2024 study) or beta-caryophyllene (anti-anxiety, binds CB2 receptors)
- pain → beta-caryophyllene (anti-inflammatory, CB2 receptor binding) or myrcene (muscle relaxation)
- focus → alpha-pinene (mental clarity, alertness, non-sedating)
- hormonal → linalool (mood regulation, cortisol reduction) or beta-caryophyllene (anti-inflammatory)
- intimacy → linalool (relaxation) or limonene (mood-lifting)

Goal framing:
- sleep → CBN + low-dose THC, focus on staying asleep not just falling asleep
- stress → CBD + hemp THC, calm without losing function, beverages are good starters
- pain → CBD topical + oral, localized vs systemic pain
- focus → CBG + CBD only, daytime, non-intoxicating, never recommend THC for focus
- hormonal → CBD + CBN, perimenopause, cycles, mood
- intimacy → CBD topicals first for beginners, low-dose THC only for recreational states`

    const stateContext = stateCode
      ? `${stateName} (${legalStatus}${hasMedicalCard ? ', medical card holder' : ''})`
      : 'location not specified'

    console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Generate a personalized guide summary for:
Goal: ${goal}
Experience level: ${experience}
Topic they selected: ${topic || goalLabel}
Specific concern they want addressed: ${learning_goal || 'not specified'}
State: ${stateContext}
Top recommended product: ${products[0]?.name || ''}

Write exactly 4-5 sentences max. First sentence: name their emotional goal and what's getting in the way. Second sentence: name the key cannabinoid and explain simply what it does for that goal. Remaining sentences: reference their state availability and transition to the products.`,
        }],
      }),
    })

    const data = await res.json()
    return data.content?.[0]?.text?.trim() || ''
  } catch (err) {
    console.error('Claude summary error:', err)
    console.log('Claude summary error detail:', JSON.stringify(err))
    return ''
  }
}

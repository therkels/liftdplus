// LP2 shared types

export type GoalSlug =
  | 'sleep'
  | 'stress'
  | 'pain'
  | 'focus'
  | 'hormonal'
  | 'intimacy'

export type ExperienceLevel =
  | 'never'
  | 'tried_once'
  | 'occasional'
  | 'regular'

export type LegalStatus =
  | 'recreational'
  | 'medical_only'
  | 'hemp_only'

export type LegalType =
  | 'hemp_derived'
  | 'low_dose_thc'
  | 'dispensary_thc'

export type FormatSlug =
  | 'gummy'
  | 'tincture'
  | 'capsule'
  | 'beverage'
  | 'topical'
  | 'patch'

export interface OnboardingData {
  goal: GoalSlug
  experience_level: ExperienceLevel
  state: string // 2-letter state code
  interests: string[]
  dispensary_visit: boolean
  has_medical_card: boolean | null
}

export interface BrandProduct {
  id: string
  brand_id: string
  brand_name: string
  brand_tier: 'featured' | 'listed'
  name: string
  description: string
  why_its_good: string
  starter_dose_note: string
  price_range: string
  format: FormatSlug
  thc_mg: number | null
  cbd_mg: number | null
  ships_nationally: boolean
  available_at_dispensaries: boolean
  beginner_friendly: boolean
  primary_goal_id: string
  legal_type: LegalType
  buy_url: string | null
  avg_rating?: number | null
  onset_minutes_min?: number | null
  onset_minutes_max?: number | null
}

export interface RecommendationsResult {
  products: BrandProduct[]
  claudeSummary: string
  legalStatus: LegalStatus
  stateName: string
  sessionId: string
}

export interface ProductRating {
  product_id: string
  rating: number
  note?: string
}

export const GOAL_LABELS: Record<GoalSlug, string> = {
  sleep: 'Better Sleep',
  stress: 'Stress Relief',
  pain: 'Pain Management',
  focus: 'Focus & Clarity',
  hormonal: 'Hormonal Balance',
  intimacy: 'Intimacy & Connection',
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  never: 'Cannabis curious',
  tried_once: 'Tried it once',
  occasional: 'Occasional user',
  regular: 'Regular user',
}

export const FORMAT_LABELS: Record<FormatSlug, string> = {
  gummy: 'Gummy',
  tincture: 'Tincture',
  capsule: 'Capsule',
  beverage: 'Beverage',
  topical: 'Topical',
  patch: 'Patch',
}

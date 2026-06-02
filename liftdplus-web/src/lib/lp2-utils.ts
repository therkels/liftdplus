// LP2 shared helpers (availability copy, dispensary section, Claude context)

import type { BrandProduct, LegalStatus } from '@/lib/lp2-types'

export const GOAL_CANNABINOID_CONTEXT = `Goal-specific cannabinoid guidance:
- sleep: Prioritize CBN and low-dose THC with CBD; avoid high-THC products late at night.
- stress: Favor CBD-dominant or balanced ratios; keep THC low to reduce anxiety risk.
- pain: CBD-forward topicals or full-spectrum with moderate THC as needed.
- focus: Prefer CBG-forward or CBD-heavy options; minimize intoxicating THC.
- hormonal: CBD with CBN or gentle full-spectrum; consistent low doses.
- intimacy: Start with CBD topicals; add low-dose THC only if comfortable.`

export function getAvailabilityText(
  product: BrandProduct,
  legalStatus: LegalStatus,
  stateName: string
): { icon: 'truck' | 'map-pin'; text: string } {
  if (product.ships_nationally) {
    return { icon: 'truck', text: 'Ships nationwide' }
  }

  const dispensaryOk =
    product.available_at_dispensaries &&
    (legalStatus === 'recreational' ||
      (legalStatus === 'medical_only'))

  if (dispensaryOk) {
    return {
      icon: 'map-pin',
      text: stateName
        ? `Available at dispensaries in ${stateName}`
        : 'Available at dispensaries',
    }
  }

  return { icon: 'map-pin', text: 'Check local availability' }
}

export function shouldShowDispensarySection(
  legalStatus: LegalStatus,
  hasMedicalCard: boolean | null
): boolean {
  if (legalStatus === 'recreational') return true
  if (legalStatus === 'medical_only' && hasMedicalCard === true) return true
  return false
}

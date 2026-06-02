'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, Loader, MapPin, Truck, Bookmark, BookmarkCheck,
  Star, ChevronRight, Hexagon, Droplets, Pill, GlassWater,
  Hand, Square, Pencil, ExternalLink, MessageSquare,
} from 'lucide-react'

import {
  OnboardingData, BrandProduct, RecommendationsResult,
  GOAL_LABELS, EXPERIENCE_LABELS, FORMAT_LABELS, GoalSlug, LegalStatus,
} from '@/lib/lp2-types'
import { getAvailabilityText, shouldShowDispensarySection } from '@/lib/lp2-utils'
// ─── Types ─────────────────────────────────────────────────────────────────
interface SavedProduct { product_id: string }
interface ExistingRating { product_id: string; rating: number; note?: string }

const US_STATES: [string, string][] = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],
  ['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],
  ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],
  ['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],
  ['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
  ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
  ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],
  ['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],
  ['WI','Wisconsin'],['WY','Wyoming'],['DC','District of Columbia'],
]

function getOnsetLabel(product: BrandProduct): string {
  if (product.onset_minutes_min && product.onset_minutes_max) {
    return `${product.onset_minutes_min}${String.fromCharCode(8211)}${product.onset_minutes_max} min`
  }
  switch (product.format) {
    case 'beverage': return '15' + String.fromCharCode(8211) + '30 min'
    case 'tincture': return '15' + String.fromCharCode(8211) + '45 min'
    case 'topical':  return '10' + String.fromCharCode(8211) + '20 min'
    case 'patch':    return '60' + String.fromCharCode(8211) + '120 min'
    case 'capsule':  return '45' + String.fromCharCode(8211) + '90 min'
    default:         return '45' + String.fromCharCode(8211) + '90 min'
  }
}

function FormatIcon({ format, className }: { format: string; className?: string }) {
  const cls = className || 'w-4 h-4'
  switch (format) {
    case 'tincture': return <Droplets className={cls} />
    case 'capsule':  return <Pill className={cls} />
    case 'beverage': return <GlassWater className={cls} />
    case 'topical':  return <Hand className={cls} />
    case 'patch':    return <Square className={cls} />
    default:         return <Hexagon className={cls} />
  }
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>
          <Star className={`w-5 h-5 transition-colors ${n <= (hover || value) ? 'text-[#6b938c] fill-[#6b938c]' : 'text-[#cdcec7]'}`} />
        </button>
      ))}
    </div>
  )
}

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product, isFirst, isLoggedIn, isSaved, existingRating,
  legalStatus, stateName, sessionId, onSaveAttempt, onRatingSubmit,
}: {
  product: BrandProduct; isFirst: boolean; isLoggedIn: boolean
  isSaved: boolean; existingRating: ExistingRating | null
  legalStatus: LegalStatus | null; stateName: string; sessionId: string
  onSaveAttempt: () => void
  onRatingSubmit: (id: string, rating: number, note?: string) => Promise<void>
}) {
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [ratingValue, setRatingValue] = useState(existingRating?.rating || 0)
  const [ratingNote, setRatingNote] = useState(existingRating?.note || '')
  const [currentRating, setCurrentRating] = useState<ExistingRating | null>(existingRating)
  const [submitting, setSubmitting] = useState(false)

  const availability = legalStatus
    ? getAvailabilityText(product, legalStatus, stateName)
    : product.ships_nationally
      ? { icon: 'truck' as const, text: 'Ships nationwide' }
      : { icon: 'map-pin' as const, text: 'Available at dispensaries' }

  const formatLabel = FORMAT_LABELS[product.format as keyof typeof FORMAT_LABELS] || product.format

  const clickUrl = product.buy_url
    ? `/api/v0/product-click?product_id=${product.id}&destination=${encodeURIComponent(product.buy_url)}&session_id=${sessionId}`
    : null

  async function handleSubmit() {
    if (!ratingValue) return
    setSubmitting(true)
    await onRatingSubmit(product.id, ratingValue, ratingNote)
    setCurrentRating({ product_id: product.id, rating: ratingValue, note: ratingNote })
    setShowRatingForm(false)
    setSubmitting(false)
  }

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${isFirst ? 'border-2 border-[#6b938c] bg-[#f4f7f5] shadow-lg' : 'border-[#cdcec7] bg-white'}`}>
      {isFirst && (
        <div className="bg-[#6b938c] px-5 py-3 flex items-center justify-between">
          <span className="text-white text-xs font-bold uppercase tracking-widest">
            ★ RECOMMENDED START
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#f4f7f5] flex items-center justify-center flex-shrink-0">
            <FormatIcon format={product.format} className="w-5 h-5 text-[#6b938c]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#6b938c] uppercase tracking-widest mb-0.5">{product.brand_name}</p>
            <h3 className="font-bold text-[#313a43] text-lg leading-tight">{product.name}</h3>
          </div>
          {isLoggedIn && isSaved && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#6b938c] flex-shrink-0 mt-0.5">
              <BookmarkCheck className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        {product.why_its_good && (
          <p className="text-sm text-[#4f5a58] leading-relaxed mb-4">{product.why_its_good}</p>
        )}

        {product.starter_dose_note && (
          <div className="bg-[#f4f7f5] rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-[#6b938c] uppercase tracking-widest mb-1">How to Start</p>
            <p className="text-sm text-[#313a43] leading-relaxed">{product.starter_dose_note}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-5 mb-3">
          <div>
            <p className="text-xs text-[#6b938c] font-semibold uppercase tracking-wide mb-0.5">Onset</p>
            <p className="text-base font-bold text-[#313a43]">{getOnsetLabel(product)}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b938c] font-semibold uppercase tracking-wide mb-0.5">Format</p>
            <p className="text-base font-bold text-[#313a43]">{formatLabel}</p>
          </div>
          {product.price_range && (
            <div>
              <p className="text-xs text-[#6b938c] font-semibold uppercase tracking-wide mb-0.5">Price</p>
              <p className="text-base font-bold text-[#313a43]">{product.price_range}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#4f5a58] mb-4">
          {availability.icon === 'truck'
            ? <Truck className="w-3.5 h-3.5 text-[#6b938c] flex-shrink-0" />
            : <MapPin className="w-3.5 h-3.5 text-[#6b938c] flex-shrink-0" />
          }
          <span className="bg-[#f4f7f5] px-2 py-0.5 rounded-full text-xs text-[#4f5a58]">
            {availability.text}
          </span>
        </div>

        {/* Review block */}
        {isLoggedIn && currentRating && !showRatingForm && (
          <div className="bg-[#f4f7f5] rounded-xl p-3 mb-4 border border-[#e8ede9]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= currentRating.rating ? 'text-[#6b938c] fill-[#6b938c]' : 'text-[#cdcec7]'}`} />
                ))}
              </div>
              <button onClick={() => { setRatingValue(currentRating.rating); setRatingNote(currentRating.note || ''); setShowRatingForm(true) }}
                className="text-xs text-[#6b938c] hover:underline">Edit</button>
            </div>
            {currentRating.note && <p className="text-xs text-[#313a43] italic mb-1">"{currentRating.note}"</p>}
            <p className="text-[10px] text-[#cdcec7]">Reviewed recently</p>
          </div>
        )}

        {showRatingForm && (
          <div className="border border-[#cdcec7] rounded-xl p-3 mb-4 space-y-2">
            <p className="text-xs font-semibold text-[#313a43]">How did it go?</p>
            <StarRating value={ratingValue} onChange={setRatingValue} />
            <textarea value={ratingNote} onChange={e => setRatingNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full text-xs border border-[#cdcec7] rounded-lg p-2 resize-none h-16 focus:outline-none focus:border-[#6b938c] text-[#313a43] placeholder:text-[#cdcec7]" />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={!ratingValue || submitting}
                className="text-xs px-3 py-1.5 bg-[#313a43] text-white rounded-lg font-medium disabled:opacity-40">
                {submitting ? 'Saving...' : 'Submit'}
              </button>
              <button onClick={() => setShowRatingForm(false)}
                className="text-xs px-3 py-1.5 border border-[#cdcec7] text-[#4f5a58] rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {/* Bottom row */}
        <div className="mt-auto pt-3 border-t border-[#cdcec7]">
          <div className="flex items-center justify-between">
            {clickUrl ? (
              <a href={clickUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-[#4f5a58] border border-[#cdcec7] rounded-full px-3 py-1.5 hover:border-[#6b938c] transition-colors">
                <ExternalLink className="w-3 h-3" /> Find product
              </a>
            ) : <div />}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isLoggedIn && (
                <button onClick={onSaveAttempt}
                  className="flex items-center gap-1 text-xs font-medium text-[#313a43] border border-[#313a43] rounded-full px-3 py-1.5 hover:bg-[#313a43] hover:text-white transition-colors">
                  <Bookmark className="w-3 h-3" /> Save
                </button>
              )}
              {isLoggedIn && !currentRating && !showRatingForm && (
                <button onClick={() => setShowRatingForm(true)}
                  className="flex items-center gap-1 text-xs font-medium text-[#4f5a58] border border-[#cdcec7] rounded-full px-3 py-1.5 hover:border-[#6b938c] transition-colors">
                  <Star className="w-3 h-3" /> I tried this
                </button>
              )}
            </div>
          </div>
          {!isLoggedIn && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4f5a58] bg-[#f9f8f7] rounded-lg px-3 py-2">
              <Bookmark className="w-3 h-3 text-[#6b938c] flex-shrink-0" />
              <span><a href="/login" className="text-[#6b938c] font-medium hover:underline">Create a free account</a> to save this product and keep your guide.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Availability block ────────────────────────────────────────────────────
function AvailabilityBlock({ stateName, stateCode, legalStatus, hasMedicalCard, onChangeState }: {
  stateName: string | null; stateCode: string | null
  legalStatus: LegalStatus | null; hasMedicalCard: boolean | null
  onChangeState: () => void
}) {
  function saveState(code: string) {
    const raw = localStorage.getItem('liftdplus_onboarding')
    if (raw) {
      const data = JSON.parse(raw)
      data.state = code
      localStorage.setItem('liftdplus_onboarding', JSON.stringify(data))
    }
    window.location.reload()
  }

  return (
    <div className="bg-white border border-[#cdcec7] border-l-4 border-l-[#6b938c] rounded-2xl p-6 h-full flex flex-col">
      <p className="text-[10px] font-semibold text-[#6b938c] uppercase tracking-widest mb-3">Available Near You</p>

      {stateCode ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-2xl font-bold text-[#313a43]">{stateName}</p>
            <button onClick={onChangeState} className="flex items-center gap-1 text-xs text-[#6b938c] hover:text-[#313a43] transition-colors">
              <Pencil className="w-3 h-3" /> Change state
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#4f5a58]">
              <Check className="w-3.5 h-3.5 text-[#6b938c] flex-shrink-0" /> Nationally shipped products
            </div>
            {(legalStatus === 'recreational' || legalStatus === 'medical_only') && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#4f5a58]">
                <Check className="w-3.5 h-3.5 text-[#6b938c] flex-shrink-0" /> Low-dose THC products
              </div>
            )}
            {(legalStatus === 'recreational' || (legalStatus === 'medical_only' && hasMedicalCard)) && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#4f5a58]">
                <Check className="w-3.5 h-3.5 text-[#6b938c] flex-shrink-0" />
                Dispensary products available{stateName ? ` in ${stateName}` : ''}
              </div>
            )}
          </div>

          {legalStatus === 'medical_only' && hasMedicalCard === null && (
            <MedicalCardPrompt />
          )}

          <div className="mt-auto pt-4 border-t border-[#cdcec7]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f4f7f5] flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#6b938c]" />
              </div>
              <p className="text-sm text-[#4f5a58] leading-relaxed">
                We show only what can be legally shipped to you or purchased in your state.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#4f5a58]">Tell us where you are to see what's available near you.</p>
          <select onChange={e => { if (e.target.value) saveState(e.target.value) }} defaultValue=""
            className="w-full border border-[#cdcec7] rounded-xl px-3 py-2.5 text-sm text-[#313a43] bg-white focus:outline-none focus:border-[#6b938c]">
            <option value="">Select your state</option>
            {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

function MedicalCardPrompt() {
  function answer(hasCard: boolean) {
    const raw = localStorage.getItem('liftdplus_onboarding')
    if (raw) {
      const data = JSON.parse(raw)
      data.has_medical_card = hasCard
      localStorage.setItem('liftdplus_onboarding', JSON.stringify(data))
    }
    window.location.reload()
  }
  return (
    <div className="bg-[#f4f7f5] rounded-xl p-3 mb-4">
      <p className="text-xs font-semibold text-[#313a43] mb-1">Do you have a medical cannabis card?</p>
      <p className="text-[10px] text-[#4f5a58] mb-3">This helps us show what you can access in your state.</p>
      <div className="flex gap-2">
        <button onClick={() => answer(true)} className="flex-1 py-2 text-xs font-medium bg-[#313a43] text-white rounded-lg hover:bg-[#4f5a58] transition-colors">Yes, I have one</button>
        <button onClick={() => answer(false)} className="flex-1 py-2 text-xs font-medium border border-[#cdcec7] text-[#4f5a58] rounded-lg hover:border-[#6b938c] transition-colors">No, not yet</button>
      </div>
    </div>
  )
}

function StateChangeModal({ onClose }: { onClose: () => void }) {
  function saveState(code: string) {
    const raw = localStorage.getItem('liftdplus_onboarding')
    if (raw) {
      const data = JSON.parse(raw)
      data.state = code
      data.has_medical_card = null
      localStorage.setItem('liftdplus_onboarding', JSON.stringify(data))
    }
    onClose()
    window.location.reload()
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <h3 className="font-semibold text-[#313a43]">Change your state</h3>
        <p className="text-sm text-[#4f5a58]">We'll update your recommendations to show what's available where you are.</p>
        <select onChange={e => { if (e.target.value) saveState(e.target.value) }} defaultValue=""
          className="w-full border border-[#cdcec7] rounded-xl px-3 py-2.5 text-sm text-[#313a43] bg-white focus:outline-none focus:border-[#6b938c]">
          <option value="">Select your state</option>
          {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        <button onClick={onClose} className="text-xs text-[#6b938c] underline w-full text-center">Cancel</button>
      </div>
    </div>
  )
}

function SavePromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div className="w-10 h-10 rounded-full bg-[#6b938c] flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#313a43] mb-1">Save this product</h3>
          <p className="text-sm text-[#4f5a58]">Create a free account to save products and keep your guide.</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href="/login" className="block w-full text-center py-3 bg-[#313a43] text-white rounded-xl font-medium text-sm hover:bg-[#4f5a58] transition-colors">Create free account</a>
          <button onClick={onClose} className="text-xs text-[#6b938c] underline py-1">Not now</button>
        </div>
      </div>
    </div>
  )
}

function WhatMakesItIn() {
  const pillars = [
    { icon: '✦', title: 'Beginner-Friendly', body: 'Products with approachable dosing and clear instructions, so you can start with confidence.' },
    { icon: '◎', title: 'Matched to Your Goals', body: 'Every recommendation is selected based on the goal you\'re looking to support.' },
    { icon: '◈', title: 'Quality Reviewed', body: 'We prioritize products that meet high standards for testing, transparency, and ingredient quality.' },
    { icon: '◉', title: 'Available Near You', body: 'Recommendations are tailored to products available in your state.' },
    { icon: '◐', title: 'Guidance Included', body: 'We explain what a product is, why it may help, and how to approach it.' },
  ]

  return (
    <section className="bg-[#eef3f1] border border-[#cdcec7] rounded-2xl px-8 py-10 my-2">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] font-semibold text-[#6b938c] uppercase tracking-widest mb-2">
          Our Standards
        </p>
        <h2 className="text-2xl font-bold text-[#313a43] mb-2">
          What Makes It Into Your Guide
        </h2>
        <p className="text-sm text-[#4f5a58] mb-8 max-w-xl">
          We don't recommend every product we review. Only the ones we believe 
          are genuinely right for beginners.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <span className="text-[#6b938c] text-xl">{p.icon}</span>
              <p className="text-sm font-semibold text-[#313a43] leading-snug">{p.title}</p>
              <p className="text-xs text-[#4f5a58] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccountCreationBlock() {
  return (
    <div className="bg-[#f4f7f5] border border-[#cdcec7] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#6b938c] flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#313a43] mb-1">Don't lose your guide.</h3>
          <p className="text-sm text-[#4f5a58]">Create a free account to save your results, favorite products, and come back anytime.</p>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs text-[#4f5a58]">✓ Save your guide and plan</span>
            <span className="text-xs text-[#4f5a58]">✓ Keep track of saved products</span>
            <span className="text-xs text-[#4f5a58]">✓ Get updates as new products are added</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
        <a href="/login" className="px-6 py-3 bg-[#313a43] text-white rounded-xl font-medium hover:bg-[#4f5a58] transition-colors text-sm whitespace-nowrap">Save My Guide</a>
        <a href="/login" className="text-xs text-[#6b938c] underline">Already have an account? Log in</a>
      </div>
    </div>
  )
}

const ARTICLES_BY_GOAL: Record<string, { slug: string; title: string; description: string }[]> = {
  sleep: [
    { slug: 'how-to-time-your-cannabis-for-better-sleep', title: 'How to Time Your Cannabis for Better Sleep', description: 'When and how much. Timing makes a bigger difference than most people realize.' },
    { slug: 'thc-vs-cbd-for-sleep-whats-the-difference', title: 'THC vs. CBD for Sleep', description: 'Which one actually helps you fall asleep and stay asleep.' },
    { slug: 'new-to-cannabis', title: 'New to Cannabis?', description: 'A beginner\'s guide to getting started safely and confidently.' },
  ],
  stress: [
    { slug: 'demystifying-microdosing-thc-for-calm-and-stress-relief', title: 'Microdosing THC for Calm and Stress Relief', description: 'How less can actually be more when it comes to stress.' },
    { slug: 'thc-vs-cbd-for-stress-which-one-helps-you-chill-without-the-fog', title: 'THC vs. CBD for Stress', description: 'Which one helps you chill without losing focus.' },
    { slug: 'why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it', title: 'Why Cannabis Can Sometimes Feel Anxious', description: 'What to expect and how to stay in control.' },
  ],
  pain: [
    { slug: 'cannabis-for-pain-relief-a-beginners-guide-to-aches-inflammation--everyday-discomfort', title: 'Cannabis for Pain Relief', description: 'A beginner\'s guide to aches, inflammation, and everyday discomfort.' },
    { slug: 'thc-vs-cbd-whats-the-difference', title: 'THC vs. CBD: What\'s the Difference?', description: 'Understand the difference and what each experience can feel like.' },
    { slug: 'what-the-heck-is-a-tincture', title: 'What the Heck is a Tincture?', description: 'Everything you need to know about one of the most beginner-friendly formats.' },
  ],
  focus: [
    { slug: 'microdosing-for-focus-creativity-and-flow-a-beginner-playbook', title: 'Microdosing for Focus, Creativity, and Flow', description: 'A beginner playbook for using cannabis to get into a flow state.' },
    { slug: 'myth-cannabis-makes-you-lazy-unmotivated-or-numb', title: 'Myth: Cannabis Makes You Lazy', description: 'The truth about cannabis and motivation. It\'s more nuanced than you think.' },
    { slug: 'thc-vs-cbd-whats-the-difference', title: 'THC vs. CBD: What\'s the Difference?', description: 'Understand the difference and what each experience can feel like.' },
  ],
  hormonal: [
    { slug: 'cannabis-and-your-cycle-products-that-support-hormonal-balance', title: 'Cannabis and Your Cycle', description: 'Products that support hormonal balance through every phase.' },
    { slug: 'cannabis--hormones-how-thc-and-cbd-support-pms-mood--monthly-balance', title: 'Cannabis & Hormones', description: 'How THC and CBD support PMS, mood, and monthly balance.' },
    { slug: 'new-to-cannabis', title: 'New to Cannabis?', description: 'A beginner\'s guide to getting started safely and confidently.' },
  ],
  intimacy: [
    { slug: 'low-dose-thc-might-be-the-key-to-better-sex', title: 'Low-Dose THC for Intimacy', description: 'A guide for women on using cannabis to feel more present and connected.' },
    { slug: 'cannabis--sex-what-the-research-actually-says', title: 'Cannabis & Sex: What the Research Says', description: 'What science actually knows about cannabis and intimacy.' },
    { slug: 'not-just-for-sex-how-cannabis-helps-you-feel-more-present', title: 'Not Just for Sex', description: 'How cannabis helps you feel more present in your body and relationships.' },
  ],
}

function ReadNextSection({ goal }: { goal: GoalSlug }) {
  const articles = ARTICLES_BY_GOAL[goal] || ARTICLES_BY_GOAL.sleep
  if (!articles.length) return null
  return (
    <div>
      <h2 className="text-[10px] font-semibold text-[#313a43] uppercase tracking-widest mb-3">Read Next</h2>
      <div className="space-y-2">
        {articles.map(a => (
          <a key={a.slug} href={`/resources/${a.slug}`}
            className="flex items-start justify-between gap-3 bg-white border border-[#cdcec7] rounded-xl p-4 group hover:border-[#6b938c] transition-colors">
            <div>
              <p className="text-sm font-semibold text-[#313a43] group-hover:text-[#6b938c] transition-colors leading-snug mb-1">{a.title}</p>
              <p className="text-xs text-[#4f5a58] leading-relaxed">{a.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#cdcec7] group-hover:text-[#6b938c] transition-colors flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  )
}

function DispensarySection({ questions }: { questions: { question: string; why_it_matters: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (questions.length === 0) return null
  return (
    <div>
      <h2 className="text-[10px] font-semibold text-[#313a43] uppercase tracking-widest mb-1">If You Visit a Dispensary</h2>
      <p className="text-xs text-[#4f5a58] mb-3">Not sure what to say? Try these simple questions.</p>
      <div className="space-y-1.5">
        {questions.map((q, i) => (
          <div key={i} className="border border-[#cdcec7] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f4f7f5] transition-colors"
            >
              <span className="text-sm text-[#313a43] font-medium pr-4">{q.question}</span>
              <ChevronRight className={`w-4 h-4 text-[#6b938c] flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`} />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-xs text-[#4f5a58] leading-relaxed border-t border-[#f0f0ee] pt-3">
                {q.why_it_matters}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#4f5a58] mt-3">These questions can help you have a confident, easy conversation.</p>
    </div>
  )
}

function YourPlanSection({ goal, experience, products }: { goal: GoalSlug; experience: string; products: BrandProduct[] }) {
  if (!products.length) return null
  const top = products[0]
  const formatLabel = FORMAT_LABELS[top.format as keyof typeof FORMAT_LABELS] || top.format
  const startingDose = (experience === 'never' || experience === 'tried_once') ? '2.5' + String.fromCharCode(8211) + '5mg THC (or hemp equivalent)' : experience === 'occasional' ? '5mg THC' : 'Adjust to your experience'
  const timingMap: Record<string, string> = { sleep: '1' + String.fromCharCode(8211) + '2 hours before bed', stress: 'As needed, start at a calm moment', pain: 'With meals or as needed', focus: 'Morning or early afternoon', hormonal: 'Same time daily', intimacy: 'Start with topicals first' }
  const lookForMap: Record<string, string> = { sleep: 'Low-dose THC, CBN', stress: 'CBD-dominant, low THC', pain: 'CBD topical or full spectrum', focus: 'CBG-forward, non-intoxicating', hormonal: 'CBD + CBN, full spectrum', intimacy: 'CBD topical, low-dose THC' }
  return (
    <div>
      <h2 className="text-[10px] font-semibold text-[#313a43] uppercase tracking-widest mb-3">Your Plan</h2>
      <div className="space-y-5">
        {[
          { label: 'Format to try first', value: formatLabel, icon: <FormatIcon format={top.format} className="w-4 h-4 text-[#6b938c]" /> },
          { label: 'What to look for', value: lookForMap[goal] || 'Low-dose, full spectrum', icon: <Check className="w-4 h-4 text-[#6b938c]" /> },
          { label: 'Start low', value: startingDose, icon: <Star className="w-4 h-4 text-[#6b938c]" /> },
          { label: 'When to take it', value: timingMap[goal] || 'As needed', icon: <Loader className="w-4 h-4 text-[#6b938c]" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f4f7f5] flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</div>
            <div>
              <p className="text-xs font-semibold text-[#6b938c] uppercase tracking-widest">{label}</p>
              <p className="text-lg font-bold text-[#313a43]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingGuide({ stateName }: { stateName?: string }) {
  return (
    <div className="space-y-3 py-4">
      <p className="text-sm text-[#6b938c] font-medium animate-pulse">Finding products that match your goals...</p>
      <div className="flex items-center gap-2 text-xs text-[#4f5a58]"><Check className="w-3 h-3 text-[#6b938c]" /> Understanding your experience level</div>
      <div className="flex items-center gap-2 text-xs text-[#4f5a58]"><Check className="w-3 h-3 text-[#6b938c]" /> Checking what's available{stateName ? ` in ${stateName}` : ''}</div>
      <div className="flex items-center gap-2 text-xs text-[#4f5a58]"><Loader className="w-3 h-3 text-[#6b938c] animate-spin" /> Building your personalized guide</div>
    </div>
  )
}

function FeedbackSection({ sessionId, goal, stateCode }: {
  sessionId: string
  goal: string
  stateCode: string | null
}) {
  const [feedback, setFeedback] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  async function handleSubmit() {
    if (!feedback.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/v0/lp2-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          goal,
          state_code: stateCode,
          feedback: feedback.trim(),
        }),
      })
      setSent(true)
      setShowFeedbackModal(false)
    } catch {
      setSent(true) // fail silently, don't block user
      setShowFeedbackModal(false)
    }
    setSubmitting(false)
  }

  if (sent) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Check className="w-4 h-4 text-[#6b938c]" />
        <p className="text-sm text-[#4f5a58]">
          Thanks for the feedback. It helps us get better.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[#313a43] mb-1">
                  Help us improve your guide
                </h3>
                <p className="text-sm text-[#4f5a58]">
                  What did you like? What could be better?
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-[#cdcec7] hover:text-[#313a43] transition-colors ml-4 flex-shrink-0">
                ✕
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full text-sm border border-[#cdcec7] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6b938c] text-[#313a43] placeholder:text-[#cdcec7] resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2.5 text-sm text-[#4f5a58] border border-[#cdcec7] rounded-xl hover:border-[#6b938c] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || submitting}
                className="px-5 py-2.5 bg-[#313a43] text-white text-sm rounded-xl font-medium hover:bg-[#4f5a58] transition-colors disabled:opacity-40">
                {submitting ? 'Sending...' : 'Share Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-[#6b938c] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#313a43]">
            Help us improve your guide
          </p>
          <p className="text-xs text-[#4f5a58]">
            What did you like? What could be better?
          </p>
        </div>
      </div>
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="px-5 py-2.5 border border-[#cdcec7] rounded-xl text-sm text-[#4f5a58] hover:border-[#6b938c] hover:text-[#313a43] transition-colors whitespace-nowrap">
        Share Feedback
      </button>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function ResultsClient({ detectedState }: { detectedState: string | null }) {
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [result, setResult] = useState<RecommendationsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  const [userRatings, setUserRatings] = useState<Map<string, ExistingRating>>(new Map())
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showStateModal, setShowStateModal] = useState(false)
  const [budtenderQuestions, setBudtenderQuestions] = useState<{ question: string; why_it_matters: string }[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'ships' | 'dispensary'>('all')
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('liftdplus_onboarding')
    if (!raw) {
      setShowOnboardingPrompt(true)
      return
    }
    try {
      const data = JSON.parse(raw) as OnboardingData
      if (!data.state && detectedState) {
        data.state = detectedState
        localStorage.setItem('liftdplus_onboarding', JSON.stringify(data))
      }
      setOnboarding(data)
    } catch {
      setShowOnboardingPrompt(true)
    }
  }, [detectedState])

  useEffect(() => {
    if (!onboarding) return
    async function fetch_recs() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ goal: onboarding!.goal, experience: onboarding!.experience_level })
        if (onboarding!.state) params.set('state', onboarding!.state)
        if (onboarding!.has_medical_card !== null && onboarding!.has_medical_card !== undefined) {
          params.set('has_medical_card', String(onboarding!.has_medical_card))
        }
        if (onboarding!.topic) params.set('topic', onboarding!.topic)
        if (onboarding!.learning_goal) params.set('learning_goal', onboarding!.learning_goal)
        const res = await fetch(`/api/v0/products/recommendations?${params}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setResult(data)
        fetch('/api/v0/recommendation-session', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: data.sessionId, goal: onboarding!.goal, experience_level: onboarding!.experience_level,
            state_code: onboarding!.state || null, legal_status: data.legalStatus,
            has_medical_card: onboarding!.has_medical_card,
            product_ids: data.products.map((p: BrandProduct) => p.id), claude_summary: data.claudeSummary }) })
      } catch { setError('Something went wrong loading your guide. Please try refreshing.') }
      finally { setLoading(false) }
    }
    fetch_recs()
  }, [onboarding])

  useEffect(() => {
    fetch('/api/v0/profile/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        setIsLoggedIn(true)
        fetch('/api/v0/product-saves').then(r => r.json()).then((saves: SavedProduct[]) => {
          setSavedProducts(new Set(saves.map(s => s.product_id)))
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!onboarding || !result) return
    if (!shouldShowDispensarySection(result.legalStatus, onboarding.has_medical_card)) return
    fetch(`/api/v0/budtender-questions?goal=${onboarding.goal}&experience=${onboarding.experience_level}`)
      .then(r => r.json()).then(d => setBudtenderQuestions(d.questions || [])).catch(() => {})
  }, [onboarding, result])

  const handleRatingSubmit = useCallback(async (productId: string, rating: number, note?: string) => {
    await fetch('/api/v0/product-rating', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, rating, note }) })
    setUserRatings(prev => { const next = new Map(prev); next.set(productId, { product_id: productId, rating, note }); return next })
  }, [])

  if (!onboarding && !showOnboardingPrompt) return null

  if (showOnboardingPrompt && !onboarding) {
    return (
      <div className="fixed inset-0 bg-[#f9f8f7] flex items-center justify-center z-50 p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#6b938c] flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#6b938c] uppercase tracking-widest mb-2">
              Your Personalized Guide
            </p>
            <h2 className="text-2xl font-bold text-[#313a43] mb-3">
              Start with your goals first.
            </h2>
            <p className="text-sm text-[#4f5a58] leading-relaxed">
              Answer a few quick questions and we&apos;ll build a personalized guide based on what you&apos;re looking to support.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-[#313a43] text-white rounded-xl font-medium hover:bg-[#4f5a58] transition-colors">
            Get started
          </button>
          <p className="text-xs text-[#4f5a58]">
            No account needed to get started.
          </p>
        </div>
      </div>
    )
  }

  const goalLabel = GOAL_LABELS[onboarding!.goal] || onboarding!.goal
  const experienceLabel = EXPERIENCE_LABELS[onboarding!.experience_level] || onboarding!.experience_level
  const stateName = result?.stateName || (onboarding!.state ? US_STATES.find(([c]) => c === onboarding!.state)?.[1] || onboarding!.state : null)

  const goalEyebrow: Record<string, string> = {
    sleep: 'YOUR PERSONALIZED SLEEP GUIDE',
    stress: 'YOUR PERSONALIZED STRESS GUIDE',
    pain: 'YOUR PERSONALIZED PAIN RELIEF GUIDE',
    focus: 'YOUR PERSONALIZED FOCUS GUIDE',
    hormonal: 'YOUR PERSONALIZED HORMONAL SUPPORT GUIDE',
    intimacy: 'YOUR PERSONALIZED INTIMACY GUIDE',
  }

  const allProducts = result?.products || []
  const filteredProducts = allProducts.filter(p => {
    if (activeFilter === 'ships') return p.ships_nationally
    if (activeFilter === 'dispensary') return p.available_at_dispensaries
    return true
  })
  const visibleProducts = showAllProducts
    ? filteredProducts.slice(0, 6)
    : filteredProducts.slice(0, 3)
  const showDispensarySection = result ? shouldShowDispensarySection(result.legalStatus, onboarding!.has_medical_card) : false

  return (
    <>
      {showSaveModal && <SavePromptModal onClose={() => setShowSaveModal(false)} />}
      {showStateModal && <StateChangeModal onClose={() => setShowStateModal(false)} />}

      <div className="min-h-screen bg-[#f9f8f7]">
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(107,147,140,0.28) 0%, rgba(107,147,140,0.14) 40%, rgba(107,147,140,0.04) 70%, transparent 100%)',
          }}
          className="pt-20 pb-16 px-4 min-h-[460px] md:min-h-[520px]"
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-[#6b938c] uppercase tracking-widest mb-2">
                  {goalEyebrow[onboarding.goal] || 'YOUR PERSONALIZED GUIDE'}
                </p>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#313a43] leading-none mb-3">
                  Your guide is ready.
                </h1>
                <p className="text-base text-[#4f5a58] mt-4 max-w-lg">
                  Built for {EXPERIENCE_LABELS[onboarding.experience_level]?.toLowerCase() || 'beginners'},
                  based on your {goalLabel.toLowerCase()} goals
                  {stateName ? `, and what's available in ${stateName}` : ''}.
                </p>
                <div className="w-16 h-0.5 bg-[#6b938c] mt-6 mb-2 rounded-full" />
              </div>
              <div className="flex-shrink-0 self-center">
                <div className="rounded-full p-2 border-2 border-[#6b938c]/30 w-32 h-32 md:w-64 md:h-64 flex items-center justify-center flex-shrink-0">
                  <div className="w-28 h-28 md:w-56 md:h-56 rounded-full bg-[#6b938c] flex flex-col items-center justify-center shadow-lg">
                    <img
                      src="/icons/liftdplus-icon-white.png"
                      alt="LIFTD+"
                      className="w-12 h-12 md:w-20 md:h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-14">

          {/* Summary + Availability */}
          <div className="grid md:grid-cols-5 gap-5">
            <div className="md:col-span-3 bg-white border border-[#cdcec7] rounded-2xl p-6">
              <p className="text-xs font-semibold text-[#6b938c] uppercase tracking-widest mb-3">Your Personalized Summary</p>
              {loading ? <LoadingGuide stateName={stateName || undefined} />
                : error ? <div><p className="text-sm text-red-600 mb-2">{error}</p><button onClick={() => window.location.reload()} className="text-xs text-[#6b938c] underline">Try again</button></div>
                : result?.claudeSummary ? (() => {
                    const sentences = result.claudeSummary.split(/(?<=\.)\s+/)
                    const firstSentence = sentences[0]
                    const rest = sentences.slice(1).join(' ')
                    return (
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-[#313a43] leading-relaxed">
                          {firstSentence}
                        </p>
                        {rest && (
                          <p className="text-base text-[#4f5a58] leading-relaxed">
                            {rest}
                          </p>
                        )}
                      </div>
                    )
                  })()
                : null}
            </div>
            <div className="md:col-span-2">
              <AvailabilityBlock
                stateName={stateName} stateCode={onboarding.state}
                legalStatus={result?.legalStatus || null} hasMedicalCard={onboarding.has_medical_card}
                onChangeState={() => setShowStateModal(true)}
              />
            </div>
          </div>

          {/* Account CTA */}
          {!isLoggedIn && !loading && <AccountCreationBlock />}

          <WhatMakesItIn />

          {/* Products */}
          {!loading && result && result.products.length > 0 && (
            <section className="bg-white py-10 px-8 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 mt-8">
                <div>
                  <h2 className="text-sm font-bold text-[#313a43] uppercase tracking-widest">Products We'd Start With</h2>
                  <p className="text-xs text-[#4f5a58] mt-1">Selected based on your goals, experience level, and what's available{stateName ? ` in ${stateName}` : ''}.</p>
                  <p className="text-sm text-[#6b938c] font-medium mt-1">
                    There&apos;s no wrong choice here. These are starting points,
                    not prescriptions.
                  </p>
                </div>
                <div className="flex gap-1 bg-[#f4f7f5] rounded-full p-1 self-start md:self-auto flex-shrink-0">
                  {(['all','ships','dispensary'] as const).map(f => (
                    <button key={f} onClick={() => { setActiveFilter(f); setShowAllProducts(false) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f ? 'bg-[#313a43] text-white' : 'text-[#4f5a58] hover:text-[#313a43]'}`}>
                      {f === 'all' ? 'All Products' : f === 'ships' ? 'Ships to Me' : 'At a Dispensary'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {visibleProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product}
                    isFirst={i === 0 && activeFilter === 'all'} isLoggedIn={isLoggedIn}
                    isSaved={savedProducts.has(product.id)} existingRating={userRatings.get(product.id) || null}
                    legalStatus={result.legalStatus} stateName={stateName || ''}
                    sessionId={result.sessionId} onSaveAttempt={() => setShowSaveModal(true)}
                    onRatingSubmit={handleRatingSubmit}
                  />
                ))}
              </div>

              {filteredProducts.length > 3 && (
                <div className="text-center mt-5">
                  <button onClick={() => setShowAllProducts(!showAllProducts)}
                    className="text-sm text-[#6b938c] hover:text-[#313a43] transition-colors inline-flex items-center gap-1">
                    {showAllProducts ? 'Show fewer products' : filteredProducts.length > 6
                      ? 'View top 6 recommended products'
                      : `View all ${filteredProducts.length} recommended products`}
                    <ChevronRight className={`w-4 h-4 transition-transform ${showAllProducts ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Bottom three columns */}
          {!loading && (
            <div className="bg-[#f9f8f7] rounded-2xl px-8 py-10">
              <div className="grid md:grid-cols-3 gap-8 pt-2 border-t border-[#cdcec7]">
                <ReadNextSection goal={onboarding.goal} />
                {showDispensarySection && <DispensarySection questions={budtenderQuestions} />}
                {result && result.products.length > 0 && <YourPlanSection goal={onboarding.goal} experience={onboarding.experience_level} products={result.products} />}
              </div>
            </div>
          )}

          {/* Explore goals */}
          {!loading && (
            <div>
              <h2 className="text-sm font-semibold text-[#313a43] mb-1">Explore Something Else?</h2>
              <p className="text-xs text-[#4f5a58] mb-3">Your needs can change. Explore other ways cannabis can support you.</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GOAL_LABELS).filter(([slug]) => slug !== onboarding.goal).map(([slug, label]) => (
                  <a key={slug} href={`/?goal=${slug}`}
                    className="px-4 py-2 rounded-full border border-[#cdcec7] text-sm text-[#4f5a58] hover:border-[#6b938c] hover:text-[#313a43] transition-colors bg-white">
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {!loading && result && (
            <div className="border-t border-[#cdcec7] pt-6">
              <FeedbackSection
                sessionId={result.sessionId}
                goal={onboarding.goal}
                stateCode={onboarding.state}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

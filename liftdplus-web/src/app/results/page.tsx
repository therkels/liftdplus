// src/app/results/page.tsx
// LP2 server component — detects state via Vercel header

import { Suspense } from 'react'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import ResultsClient from './ResultsClient'

export const metadata: Metadata = {
  title: 'Your Guide | LIFTD+',
  description: 'Your personalized cannabis guide, built for your goals.',
  robots: { index: false, follow: false },
}

export default function ResultsPage() {
  const headersList = headers()
  // Vercel injects region as US-MI, US-CA, etc — extract state code
  const region = headersList.get('x-vercel-ip-country-region') || ''
  const detectedState = region.startsWith('US-') ? region.slice(3) : null

  return (
    <Suspense fallback={<ResultsLoadingSkeleton />}>
      <ResultsClient detectedState={detectedState} />
    </Suspense>
  )
}

function ResultsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9f8f7] flex items-center justify-center">
      <div className="animate-pulse text-center space-y-3 px-6">
        <div className="w-16 h-16 rounded-full bg-[#6b938c]/20 mx-auto" />
        <div className="h-4 w-48 bg-[#cdcec7] rounded mx-auto" />
        <div className="h-3 w-32 bg-[#cdcec7]/60 rounded mx-auto" />
      </div>
    </div>
  )
}

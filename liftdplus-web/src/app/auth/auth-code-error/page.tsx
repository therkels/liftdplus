'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthErrorPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/v0/auth/callback?next=/results%3Fsaved%3Dtrue`,
        },
      })
      if (authError) throw authError

      fetch('/api/v0/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      }).catch(() => {})

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      {/* Hero — matches /results sage green header */}
      <div className="w-full bg-[#dde5df] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4f5a58] mb-3">
            Something went wrong
          </p>
          <h1 className="text-4xl font-bold text-[#313a43] mb-3">
            Oops.
          </h1>
          <p className="text-base text-[#4f5a58] max-w-md">
            That link didn't work. Save links need to be opened in the same
            browser where you requested them. Private or incognito windows won't work.
          </p>
        </div>
      </div>

      {/* Card — matches results page card styling */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {!submitted ? (
          <div className="bg-white border border-[#cdcec7] rounded-2xl p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#313a43]">
                Get a new link
              </h2>
              <p className="text-sm text-[#4f5a58]">
                Enter your email and we'll send you a fresh one. Open it in
                this browser to save your guide.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResend()}
                className="w-full border border-[#cdcec7] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#313a43] bg-[#f4f7f5]"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <button
                onClick={handleResend}
                disabled={loading || !email.trim()}
                className="w-full px-6 py-3 bg-[#313a43] text-white rounded-xl font-medium hover:bg-[#4f5a58] transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send me a new link'}
              </button>
            </div>
            <a
              href="/results"
              className="text-sm text-[#4f5a58] underline text-center"
            >
              Continue without saving
            </a>
          </div>
        ) : (
          <div className="bg-white border border-[#cdcec7] rounded-2xl p-8 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#313a43]">
              Check your inbox
            </h2>
            <p className="text-sm text-[#4f5a58]">
              Open the link on this device to save your guide.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

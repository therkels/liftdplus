import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { magicLinkRatelimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await magicLinkRatelimit.limit(ip)
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase().trim())
      .digest('hex')

    // Upsert contact — adds if new, updates if existing, never errors on duplicates
    await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email.toLowerCase().trim(),
          status_if_new: 'subscribed',
        }),
      }
    )

    // Apply lp2-signup tag — works for new and existing members
    await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}/tags`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: [{ name: 'lp2-signup', status: 'active' }],
        }),
      }
    )
  } catch (mcError) {
    // Log but don't fail — magic link still sent regardless
    console.error('Mailchimp error:', mcError)
  }

  return NextResponse.json({ success: true })
}

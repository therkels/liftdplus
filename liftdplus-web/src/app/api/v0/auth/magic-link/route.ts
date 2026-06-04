import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Add to Mailchimp with lp2-signup tag
  try {
    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

    const mcRes = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          tags: ['lp2-signup'],
        }),
      }
    )

    // If member already exists, update their tags
    if (mcRes.status === 400) {
      const mcData = await mcRes.json()
      if (mcData.title === 'Member Exists') {
        const md5 = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(email.toLowerCase())
        )
        // Just log — don't fail the request over Mailchimp
        console.log('Mailchimp member already exists:', email)
      }
    }
  } catch (mcError) {
    // Log but don't fail — magic link still sent
    console.error('Mailchimp error:', mcError)
  }

  return NextResponse.json({ success: true })
}

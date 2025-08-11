import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { data: {user}, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!user || !user.id) {

        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const {data: appUser, error: appUserError} = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id )
        .single()

    if (!appUser) {
        console.log('made it here')
        const { data, error } = await supabase.rpc('create_user', { user_id: user.id, username: "user"+Math.random().toString(36).substring(2,10)});
        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
        console.log(appUser)
        console.log(appUserError)
    }
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
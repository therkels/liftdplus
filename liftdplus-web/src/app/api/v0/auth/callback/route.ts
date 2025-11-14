// src/app/api/v0/auth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");

  // "next" is optional; default to "/"
  let next = requestUrl.searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  // If there is no code, send them to your auth-code-error page
  if (!code) {
    requestUrl.pathname = "/auth/auth-code-error";
    requestUrl.searchParams.delete("code");
    return NextResponse.redirect(requestUrl);
  }

  // Start with a response that redirects to "/" on the SAME origin.
  // We'll update the Location later depending on isNewUser.
  let response = NextResponse.redirect(new URL("/", origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Turn the `code` into a Supabase session + cookies on THIS origin
  const {
    data: { user },
    error: exchangeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (!user || exchangeError) {
    const errUrl = new URL("/auth/auth-code-error", origin);
    return NextResponse.redirect(errUrl);
  }

  // ---------- Your existing "is new user?" logic ----------

  const { data: userData } = await supabase.rpc("get_user", {
    user_id: user.id,
  });

  let isNewUser = false;

  if (!userData || userData.length === 0) {
    // Create new user
    const { error: createError } = await supabase.rpc("create_user", {
      user_id: user.id,
      username: "user_" + Math.random().toString(36).substring(2, 10),
      profile_icon_url: user.user_metadata?.avatar_url,
    });

    if (createError) {
      const errUrl = new URL("/auth/auth-code-error", origin);
      return NextResponse.redirect(errUrl);
    }

    isNewUser = true;
  } else {
    // Check if existing user has preferences
    const { data: preferences } = await supabase.rpc("get_user_preferences", {
      user_id: user.id,
    });

    if (!preferences || preferences.length === 0) {
      isNewUser = true;
    }
  }

  // New users → /disclaimer, existing users → `next`
  const redirectPath = isNewUser ? "/disclaimer" : next;
  const redirectUrl = new URL(redirectPath, origin);

  // Reuse the same response so we keep the cookies we set above
  response.headers.set("Location", redirectUrl.toString());

  return response;
}

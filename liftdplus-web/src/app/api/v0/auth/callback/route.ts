import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }
  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!user || !user.id) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const { data: userData } = await supabase.rpc("get_user", {
      user_id: user.id,
    });
    let isNewUser = false;

    if (!userData || userData.length === 0) {
      // Create new user
      const { data, error } = await supabase.rpc("create_user", {
        user_id: user.id,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        profile_icon_url: user.user_metadata?.avatar_url,
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
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

    if (!error) {
      // Redirect new users to username step (Q1–Q4 already done pre-auth), existing users to main app
      const redirectPath = isNewUser ? "/onboarding/username" : next;

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

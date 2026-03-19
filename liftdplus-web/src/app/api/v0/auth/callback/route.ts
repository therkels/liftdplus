import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
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

    // Use admin client to bypass RLS for user checks
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", user.id)
      .maybeSingle();
    let isNewUser = false;

    if (!userData) {
      // Create new user
      const { error: createError } = await supabaseAdmin.rpc("create_user", {
        user_id: user.id,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        profile_icon_url: user.user_metadata?.avatar_url,
      });
      if (createError && !createError.message.includes("duplicate key")) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      isNewUser = true;
    } else {
      // Check if existing user has preferences using admin client
      const { data: preferences } = await supabaseAdmin
        .from("preferences")
        .select("user_id")
        .eq("user_id", user.id)
        .limit(1);
      if (!preferences || preferences.length === 0) {
        isNewUser = true;
      }
    }

    if (!error) {
      const redirectPath = isNewUser ? "/onboarding/username" : "/explore";

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

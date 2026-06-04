import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  console.log('[callback] full URL:', request.url)
  console.log('[callback] code present:', !!searchParams.get('code'))
  console.log('[callback] next param:', searchParams.get('next'))

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[callback] exchange error:', error)
    console.log('[callback] user:', user?.id)

    if (!user || !user.id) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", user.id)
      .maybeSingle();

    let isNewUser = false;
    if (!userData) {
      const { error: createError } = await supabaseAdmin.rpc("create_user", {
        user_id: user.id,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        profile_icon_url: user.user_metadata?.avatar_url,
      });
      if (createError && !createError.message.includes("duplicate key")) {
        console.error('create_user error (non-fatal for magic link):', createError.message)
      }
      isNewUser = true;
    } else {
      const username = userData?.username ?? "";
      if (username.startsWith("user_") || username === "") {
        isNewUser = true;
      }
    }

    if (!error) {
      const redirectPath = next !== "/"
        ? next
        : isNewUser ? "/getting-started" : "/explore";

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

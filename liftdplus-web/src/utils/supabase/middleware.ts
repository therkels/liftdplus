import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const hasCode = request.nextUrl.searchParams.has("code");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasCode) {
    if (
      user &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/mamas-network") &&
      !pathname.startsWith("/disclaimer") &&
      !pathname.startsWith("/getting-started") &&
      !pathname.startsWith("/about") &&
      !pathname.startsWith("/faq") &&
      !pathname.startsWith("/resources") &&
      !pathname.startsWith("/privacy") &&
      !pathname.startsWith("/terms") &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/results")
    ) {
      try {
        const { data: profileRow, error: profileError } = await supabase
          .schema("private")
          .from("user_recommendation_profile")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("LEGACY CHECK:", {
          userId: user?.id,
          profileRow,
          profileError: profileError?.message,
          pathname,
        });

        if (!profileError && !profileRow) {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding/legacy";
          const redirectResponse = NextResponse.redirect(url);
          redirectResponse.cookies.setAll(supabaseResponse.cookies.getAll());
          return redirectResponse;
        }
      } catch {
        // Fail open — avoid redirect loops if the query throws
      }
    }

    if (
      !user &&
      pathname !== "/" &&
      !pathname.startsWith("/about") &&
      !pathname.startsWith("/faq") &&
      !pathname.startsWith("/resources") &&
      !pathname.startsWith("/privacy") &&
      !pathname.startsWith("/terms") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/mamas-network") &&
      !pathname.startsWith("/disclaimer") &&
      !pathname.startsWith("/getting-started") &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/results")
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

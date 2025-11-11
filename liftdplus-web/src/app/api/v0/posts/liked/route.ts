// src/app/api/v0/posts/liked/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/v0/posts/liked
 * Returns the current user's liked posts (array).
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // who is the user?
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // optional: log the event (safe to keep or remove)
    await supabase.from("event_logs").insert([
      {
        event_type: "get_liked_posts",
        details: {},
        user_id: user.id,
      },
    ]).catch(() => { /* ignore logging failures */ });

    // call your DB function (RPC) that already assembles liked posts
    const { data, error } = await supabase.rpc("get_liked_posts", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("RPC get_liked_posts failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // should be an array; if not, send empty array
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e: any) {
    console.error("GET /posts/liked crashed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

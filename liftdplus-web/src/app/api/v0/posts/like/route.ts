// src/app/api/v0/posts/like/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const LIKES_TABLE = "likes"; // your Supabase table

// ✅ Handle a PUT (add or toggle like)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    // 1) Auth
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr) {
      console.error("Auth error:", authErr);
    }
    if (!user) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED_DEBUG" }, { status: 401 });
    }

    // 2) Parse body + query string
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as any));

    console.log("🔥 LIKE PUT DEBUG body:", body);
    console.log("🔥 LIKE PUT DEBUG query:", Object.fromEntries(url.searchParams));

    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw =
      body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
      // IMPORTANT: distinctive error text
      return NextResponse.json(
        { error: "LIKE_ROUTE_DEBUG_MISSING_OR_INVALID_POST_ID", post_id_raw },
        { status: 400 }
      );
    }

    // 3) Upsert into private.likes (user_id + post_id)
    const { error: upsertErr } = await supabase
      .schema(SCHEMA)
      .from(LIKES_TABLE)
      .upsert(
        { user_id: user.id, post_id },
        { onConflict: "user_id,post_id" }
      );

    if (upsertErr) {
      console.error("Upsert like error:", upsertErr);
      return NextResponse.json(
        { error: "LIKE_ROUTE_DEBUG_UPSERT_FAILED", details: upsertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "LIKE_ROUTE_DEBUG_POST_LIKED",
      post_id,
    });
  } catch (e: any) {
    console.error("PUT /posts/like unexpected error:", e);
    return NextResponse.json(
      { error: "LIKE_ROUTE_DEBUG_UNEXPECTED", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ❌ Handle a DELETE (remove like)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.error("Auth error:", authErr);
    }
    if (!user) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED_DEBUG" }, { status: 401 });
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as any));

    console.log("🔥 LIKE DELETE DEBUG body:", body);
    console.log("🔥 LIKE DELETE DEBUG query:", Object.fromEntries(url.searchParams));

    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw =
      body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
      return NextResponse.json(
        { error: "LIKE_ROUTE_DEBUG_MISSING_OR_INVALID_POST_ID", post_id_raw },
        { status: 400 }
      );
    }

    const { error: delErr } = await supabase
      .schema(SCHEMA)
      .from(LIKES_TABLE)
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (delErr) {
      console.error("Delete like error:", delErr);
      return NextResponse.json(
        { error: "LIKE_ROUTE_DEBUG_DELETE_FAILED", details: delErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "LIKE_ROUTE_DEBUG_POST_UNLIKED",
      post_id,
    });
  } catch (e: any) {
    console.error("DELETE /posts/like unexpected error:", e);
    return NextResponse.json(
      { error: "LIKE_ROUTE_DEBUG_UNEXPECTED", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

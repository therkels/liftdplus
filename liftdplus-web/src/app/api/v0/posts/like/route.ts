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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2) Parse body + query string
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as any));
    console.log("🔥 LIKE PUT body:", body);

    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw =
      body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
  return NextResponse.json(
    { error: "DEBUG_LIKE_MISSING_POST_ID" }, // <--- change to this
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
        { error: "Failed to like post", details: upsertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post liked successfully",
      post_id,
    });
  } catch (e: any) {
    console.error("PUT /posts/like unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error", message: e?.message ?? String(e) },
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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // body + query again
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as any));
    console.log("🔥 LIKE DELETE body:", body);

    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw =
      body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
      return NextResponse.json(
        { error: "Missing or invalid post_id in request" },
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
        { error: "Failed to unlike", details: delErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post unliked successfully",
      post_id,
    });
  } catch (e: any) {
    console.error("DELETE /posts/like unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

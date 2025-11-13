// src/app/api/v0/posts/like/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const LIKES_TABLE = "likes"; // ✅ your table name from Supabase

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

    // 2) Parse JSON body
    // src/app/api/v0/posts/like/route.ts
    // inside PUT
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    console.log("🔥 DEBUG body:", body);
    
    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw = body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
      return NextResponse.json(
        { error: "Missing or invalid post_id in request body" },
        { status: 400 }
      );
    }

    // 3) Upsert into private.likes (user_id + post_id)
    //    Change schema/table/column names if yours differ.
    const { error: upsertErr } = await supabase
      .schema("private")
      .from("likes")
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

    return NextResponse.json({ ok: true, post_id });
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
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // inside DELETE
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    console.log("🔥 DEBUG body (DELETE):", body);
    
    const fromQuery = url.searchParams.get("post_id");
    const post_id_raw = body?.post_id ?? body?.postId ?? body?.id ?? fromQuery;
    const post_id = Number(post_id_raw);

    if (!post_id || Number.isNaN(post_id)) {
      return NextResponse.json(
        { error: "Missing or invalid post_id in request body" },
        { status: 400 }
      );
    }

    const { error: delErr } = await supabase
      .schema("private")
      .from("likes")
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

    return NextResponse.json({ ok: true, post_id });
  } catch (e: any) {
    console.error("DELETE /posts/like unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

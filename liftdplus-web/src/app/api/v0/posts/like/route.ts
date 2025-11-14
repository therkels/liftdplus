// src/app/api/v0/posts/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function toNumber(id: unknown): number {
  const n = Number(id);
  if (!n || Number.isNaN(n)) {
    throw new Error(`Invalid post_id: ${id}`);
  }
  return n;
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const postIdRaw = body?.post_id;

    if (!postIdRaw) {
      return NextResponse.json(
        { error: "post_id required" },
        { status: 400 }
      );
    }

    const post_id = toNumber(postIdRaw);

    const supabase = await createClient();

    // Get the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Insert / upsert into private.likes with BOTH post_id and user_id
    const { error } = await supabase
      .schema("private")
      .from("likes")
      .upsert(
        { post_id, user_id: user.id },
        { onConflict: "user_id,post_id" }
      );

    if (error) {
      console.error("[PUT /api/v0/posts/like] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[PUT /api/v0/posts/like] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const postIdRaw = body?.post_id;

    if (!postIdRaw) {
      return NextResponse.json(
        { error: "post_id required" },
        { status: 400 }
      );
    }

    const post_id = toNumber(postIdRaw);

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .schema("private")
      .from("likes")
      .delete()
      .match({ post_id, user_id: user.id });

    if (error) {
      console.error("[DELETE /api/v0/posts/like] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/v0/posts/like] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

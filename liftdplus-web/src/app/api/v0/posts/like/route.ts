// src/app/api/v0/posts/like/route.ts
const LIKES_TABLE = "likes";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const LIKES_TABLE = "post_likes"; // <-- change if your table name differs

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const post_id = body?.post_id ?? body?.id ?? body?.postId;
    const like = body?.like ?? true; // default: like=true

    if (!post_id) {
      return NextResponse.json(
        { error: "Missing 'post_id' in request body" },
        { status: 400 }
      );
    }

    if (like) {
      // like (upsert for idempotency)
      const { error } = await supabase
        .from(LIKES_TABLE)
        .upsert([{ user_id: user.id, post_id }], { onConflict: "user_id,post_id" });
      if (error) throw error;
      return NextResponse.json({ ok: true, liked: true });
    } else {
      // unlike
      const { error } = await supabase
        .from(LIKES_TABLE)
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post_id);
      if (error) throw error;
      return NextResponse.json({ ok: true, liked: false });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}

// src/app/api/v0/posts/like/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// your tables live in the "private" schema
const SCHEMA = "private";
const LIKES_TABLE = "likes"; // you showed this in Supabase UI

/** Small helpers */
async function getAuthedUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id as string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * PUT /api/v0/posts/like
 * Body: { post_id: number, like?: boolean }
 * - if like === false => remove like (same as DELETE)
 * - else => upsert like
 */
export async function PUT(req: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) return json({ error: "not Authenticated" }, 400);

  const body = await req.json().catch(() => ({}));
  const post_id = Number(body?.post_id);
  const likeFlag: boolean = body?.like !== false;

  if (!post_id || Number.isNaN(post_id)) {
    return json({ error: "post_id is required" }, 400);
  }

  const supabase = await createClient();

  if (!likeFlag) {
    // behave like DELETE
    const { error } = await supabase
      .schema(SCHEMA)
      .from(LIKES_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("post_id", post_id);

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, liked: false });
  }

  // upsert the like
  const { error } = await supabase
    .schema(SCHEMA)
    .from(LIKES_TABLE)
    .upsert(
      { user_id: userId, post_id },
      { onConflict: "user_id,post_id" } // requires unique(user_id, post_id)
    );

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, liked: true });
}

/**
 * DELETE /api/v0/posts/like
 * Body: { post_id: number }
 */
export async function DELETE(req: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) return json({ error: "not Authenticated" }, 400);

  const body = await req.json().catch(() => ({}));
  const post_id = Number(body?.post_id);

  if (!post_id || Number.isNaN(post_id)) {
    return json({ error: "post_id is required" }, 400);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema(SCHEMA)
    .from(LIKES_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("post_id", post_id);

  if (error) return json({ error: error.message }, 500);
  return NextResponse.json({ ok: true, liked: false });
}

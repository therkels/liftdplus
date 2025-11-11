// src/app/api/v0/posts/archive/route.ts
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const ARCHIVE_TABLE = "archives"; // you showed this table exists

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getAuthedUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * PUT /api/v0/posts/archive
 * Body: { post_id: number, category?: string, archived?: boolean }
 * - archived === false => remove (same as DELETE)
 * - else => upsert
 */
export async function PUT(req: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) return json({ error: "not Authenticated" }, 400);

  const body = await req.json().catch(() => ({}));
console.log("🔥 ARCHIVE PUT body:", body);   // <-- Add this line

const post_id = Number(body?.post_id);
const category = (body?.category ?? null) as string | null;
const archived = body?.archived !== false;


  if (!post_id || Number.isNaN(post_id)) {
    return json({ error: "post_id is required" }, 400);
  }

  const supabase = await createClient();

  if (!archived) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(ARCHIVE_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("post_id", post_id);
    if (error) {
  console.error("🧹 ARCHIVE DELETE error:", error);  // <— Add here
  return json({ error: error.message }, 500);
}

  const { error } = await supabase
    .schema(SCHEMA)
    .from(ARCHIVE_TABLE)
    .upsert(
      { user_id: userId, post_id, category },
      { onConflict: "user_id,post_id" } // requires unique(user_id, post_id)
    );

  if (error) {
  console.error("📦 ARCHIVE UPSERT error:", error);  // <— Add here
  return json({ error: error.message }, 500);
}


/**
 * DELETE /api/v0/posts/archive
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
    .from(ARCHIVE_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("post_id", post_id);

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, archived: false });
}

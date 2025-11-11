// /src/app/api/v0/posts/like/route.ts
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const LIKES_TABLE = "likes"; // <-- your table name in private schema

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Return the current user's liked post_ids (optional helper)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(LIKES_TABLE)
    .select("post_id")
    .eq("user_id", user.id);

  if (error) return json({ error: error.message }, 500);
  return json({ liked: (data ?? []).map((r: any) => r.post_id) });
}

// Like a post  (expects JSON: { post_id: number })
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { post_id } = (await req.json().catch(() => ({}))) as {
    post_id?: number;
  };
  if (!post_id && post_id !== 0) return json({ error: "post_id required" }, 400);

  const { error } = await supabase
    .schema(SCHEMA)
    .from(LIKES_TABLE)
    .upsert({ user_id: user.id, post_id }, { onConflict: "user_id,post_id" });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

// Unlike a post  (expects JSON: { post_id: number })
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { post_id } = (await req.json().catch(() => ({}))) as {
    post_id?: number;
  };
  if (!post_id && post_id !== 0) return json({ error: "post_id required" }, 400);

  const { error } = await supabase
    .schema(SCHEMA)
    .from(LIKES_TABLE)
    .delete()
    .match({ user_id: user.id, post_id });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

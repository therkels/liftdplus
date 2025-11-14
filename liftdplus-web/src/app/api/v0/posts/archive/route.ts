import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const ARCHIVES_TABLE = "archives"; // <-- your table name in private schema

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Save/bookmark a post to a category (expects { post_id: number, category?: string })
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { post_id, category } = (await req.json().catch(() => ({}))) as {
    post_id?: number;
    category?: string;
  };

  if (!post_id && post_id !== 0) {
    return json({ error: "post_id required" }, 400);
  }

  // 🔹 Use a safe default category if none is provided
  const effectiveCategory = category ?? "favorites";

  const payload = {
    user_id: user.id,
    post_id,
    category: effectiveCategory,
  };

  const { error } = await supabase
    .schema(SCHEMA)
    .from(ARCHIVES_TABLE)
    .upsert(payload, { onConflict: "user_id,post_id" });

  if (error) {
    console.error("[archive PUT] Supabase error:", error);
    return json({ error: error.message }, 500);
  }

  return json({ ok: true });
}

// Remove bookmark (expects { post_id: number })
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { post_id } = (await req.json().catch(() => ({}))) as {
    post_id?: number;
  };

  if (!post_id && post_id !== 0) {
    return json({ error: "post_id required" }, 400);
  }

  const { error } = await supabase
    .schema(SCHEMA)
    .from(ARCHIVES_TABLE)
    .delete()
    .match({ user_id: user.id, post_id });

  if (error) {
    console.error("[archive DELETE] Supabase error:", error);
    return json({ error: error.message }, 500);
  }

  return json({ ok: true });
}

// src/app/api/v0/posts/archive/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ARCHIVES_TABLE = "archives"; // your table name (seen in your screenshot)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * GET  /api/v0/posts/archive
 * (Optional) Return some quick info – you can expand later.
 * Right now we just confirm auth.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ error: "not Authenticated" }, 400);
  return json({ ok: true });
}

/**
 * PUT  /api/v0/posts/archive
 * Body: { post_id: string | number, archived: boolean, category?: string }
 * - archived = true  -> upsert into archives
 * - archived = false -> delete from archives
 */
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ error: "not Authenticated" }, 400);

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const rawPostId = body?.post_id;
  const archived = Boolean(body?.archived);
  const category: string | null =
    typeof body?.category === "string" && body.category.trim()
      ? body.category.trim()
      : null;

  if (rawPostId === undefined || rawPostId === null) {
    return json({ error: "post_id is required" }, 400);
  }

  // normalize post_id to number if possible, else string
  const post_id =
    typeof rawPostId === "number"
      ? rawPostId
      : /^\d+$/.test(String(rawPostId))
      ? Number(rawPostId)
      : String(rawPostId);

  if (archived) {
    // UPSERT an archive row for this (user, post)
    // If your table has a unique index on (user_id, post_id), this works perfectly.
    const { error } = await supabase
      .schema("private")
      .from(ARCHIVES_TABLE)
      .upsert(
        [
          {
            user_id: user.id,
            post_id,
            category, // ok if null; remove if your schema doesn’t have this column
          },
        ],
        { onConflict: "user_id,post_id" }
      );

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, archived: true });
  } else {
    // Remove any archive rows for this (user, post)
    const { error } = await supabase
      .schema("private")
      .from(ARCHIVES_TABLE)
      .delete()
      .match({ user_id: user.id, post_id });

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, archived: false });
  }
}

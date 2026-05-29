// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

const COLUMNS = `
  id,
  title,
  secondary_title,
  cover_image_url,
  author,
  contributor_name,
  post_template_id,
  markdown,
  config,
  created_at,
  published_at,
  display_id,
  slug
`;

function safeParseJSON(input: unknown) {
  if (!input) return null;
  if (typeof input === "object") return input as any;
  try {
    return JSON.parse(String(input));
  } catch {
    return null;
  }
}

async function fetchOne(supabase: any, column: string, value: string | number) {
  const { data, error } = await supabase
    .schema("private")
    .from("post")
    .select(COLUMNS)
    .eq(column, value)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const key = params.slug;

    // 1) Try by slug (text)
    let row = (await fetchOne(supabase, "slug", key)) || null;

    // 2) If key is numeric, try display_id then id
    if (!row && /^\d+$/.test(key)) {
      const num = Number(key);
      row =
        (await fetchOne(supabase, "display_id", num)) ||
        (await fetchOne(supabase, "id", num)) ||
        null;
    }

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse config (e.g., for carousels)
    const cfg = safeParseJSON(row?.config);
    const isCarousel = row?.post_template_id === "carousel_block";
    const images = Array.isArray(cfg?.images) ? cfg.images : [];

    // Resolve author name + photo (author is UUID FK to private.users.id)
    let author_name: string | null = row?.contributor_name ?? null;
    let author_photo: string | null = null;

    // --- strict user lookup in private schema + rich debug ---
    let userDebug: {
      exists: boolean;
      id: string | null;
      username: string | null;
      photoSample: string | null;
      error?: string | null;
    } = { exists: false, id: null, username: null, photoSample: null, error: null };

    if (row?.author) {
      const { data: user, error: userError } = await supabaseAdmin
        .schema("private")
        .from("users")
        .select("id, username, profile_icon_url")
        .eq("id", row.author)
        .maybeSingle();

      if (userError) {
        userDebug.error = userError.message ?? String(userError);
      }

      if (user) {
        userDebug.exists = true;
        userDebug.id = user.id ?? null;
        userDebug.username = user.username ?? null;
        userDebug.photoSample = typeof user.profile_icon_url === "string" ? user.profile_icon_url.slice(0, 80) : null;

        author_name = author_name ?? user.username ?? null;
        author_photo = typeof user.profile_icon_url === "string" ? user.profile_icon_url : null;
      }
    }

    // Only return valid http(s) URLs
    const sanitizeUrl = (u: unknown) =>
      typeof u === "string" && /^https?:\/\//i.test(u) ? u : null;
    author_photo = sanitizeUrl(author_photo);

    const content_type: "text" | "image" = isCarousel ? "image" : "text";

    const { data: postTagRows } = await supabaseAdmin
      .schema("public")
      .from("post_tag")
      .select("tag_id, tag(display_name, category)")
      .eq("post_id", row.id);

    const post_tag = postTagRows ?? [];

    const post = {
      id: row.id,
      title: row.title,
      secondary_title: row.secondary_title,
      cover_image_url: row.cover_image_url ?? null,
      author_name,
      author_photo,
      post_template_id: row.post_template_id,
      content_type,
      content: isCarousel ? null : row.markdown ?? null,
      images,
      created_at: row.created_at,
      published_at: row.published_at,
      display_id: row.display_id ?? null,
      slug: row.slug ?? null,
      config: cfg ?? null,
      post_tag,
    };

    // TEMP DEBUG (remove once fixed)
    return NextResponse.json({
      post,
      _debug: {
        adminKeyLoaded: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        authorIdSeen: Boolean(row?.author),
        authorLookupUsed: true,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        userDebug,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Supabase error",
        code: e?.code ?? "UNKNOWN",
        message: e?.message ?? "Unexpected error",
        details: e?.details ?? null,
        hint: e?.hint ?? null,
      },
      { status: 500 }
    );
  }
}

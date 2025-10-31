// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS = `
  id,
  title,
  secondary_title,
  cover_image_url,
  author,              -- may be uuid or name
  contributor_name,
  post_template_id,
  markdown,
  config,              -- keep so page can read other opts if needed
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

function looksLikeUuid(s: string | null | undefined) {
  return !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const key = params.slug;

    // Find by slug, display_id, or numeric id
    const row =
      (await fetchOne(supabase, "slug", key)) ||
      (await fetchOne(supabase, "display_id", key)) ||
      (/^\d+$/.test(key) ? await fetchOne(supabase, "id", Number(key)) : null);

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse config for carousel
    const cfg = safeParseJSON(row?.config);
    const isCarousel = row?.post_template_id === "carousel_block";
    const images = Array.isArray(cfg?.images) ? cfg.images : [];

    // Resolve author name + photo
    let author_name: string | null = row?.contributor_name ?? row?.author ?? null;
    let author_photo: string | null = null;

    if (looksLikeUuid(row?.author)) {
      const { data: user } = await supabase
        .schema("private")
        .from("users")
        .select("profile_icon_url, username")
        .eq("id", row.author)
        .maybeSingle();

      if (user) {
        author_photo = user.profile_icon_url ?? null;
        if (!row?.contributor_name && user.username) author_name = user.username;
      }
    }

    const content_type: "text" | "image" = isCarousel ? "image" : "text";

    const post = {
      id: row.id,
      title: row.title,
      secondary_title: row.secondary_title,
      cover_image_url: row.cover_image_url ?? null,
      author_name,
      author_photo,               // <-- important for avatars
      post_template_id: row.post_template_id,
      content_type,
      content: isCarousel ? null : row.markdown ?? null,
      images,                     // <-- important for carousels
      created_at: row.created_at,
      published_at: row.published_at,
      display_id: row.display_id ?? null,
      slug: row.slug ?? null,
      config: cfg ?? null,        // kept for future use
    };

    return NextResponse.json({ post });
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

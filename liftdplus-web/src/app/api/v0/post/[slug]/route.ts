// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS = `
  id,
  title,
  secondary_title,
  cover_image_url,
  post_template_id,
  author,
  contributor_name,
  source,
  post_status,
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

function shapePost(row: any) {
  const cfg = safeParseJSON(row?.config);
  const isCarousel = row?.post_template_id === "carousel_block";

  // IMPORTANT: do NOT include cover in images here.
  const images = Array.isArray(cfg?.images) ? cfg.images : [];

  // old PostContent expects either 'text' (markdown) or 'image' (carousel)
  const content_type = isCarousel ? "image" : "text";

  return {
    id: row.id,
    title: row.title,
    secondary_title: row.secondary_title,
    cover_image_url: row.cover_image_url ?? null,
    author_name: row.contributor_name ?? row.author ?? null,
    post_template_id: row.post_template_id,
    content_type,
    content: isCarousel ? null : row.markdown ?? null,
    images, // ⬅️ what the carousel needs
    created_at: row.created_at,
    published_at: row.published_at,
    display_id: row.display_id ?? null,
    slug: row.slug ?? null,
  };
}

async function fetchOne(supabase: any, column: string, value: string | number) {
  // read from the private schema (your grants already allow anon/authenticated SELECT)
  const { data, error } = await supabase
    .schema("private")
    .from("post")
    .select(COLUMNS)
    .eq(column, value)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const key = params.slug;

    let row =
      (await fetchOne(supabase, "slug", key)) ||
      (await fetchOne(supabase, "display_id", key)) ||
      (/^\d+$/.test(key) ? await fetchOne(supabase, "id", Number(key)) : null);

    if (!row) {
      return NextResponse.json(
        { error: "Supabase error", code: "UNKNOWN", message: "No row" },
        { status: 404 }
      );
    }

    const post = shapePost(row);
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

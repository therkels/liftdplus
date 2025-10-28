// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TABLE = "post";
export const dynamic = "force-dynamic";

const COLUMNS = `
  id,
  slug,
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
  display_id
`;

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const postTable = supabase.schema("private").from(TABLE); // 👈 IMPORTANT

    // 1) slug
    let { data, error } = await postTable.select(COLUMNS).eq("slug", params.slug).maybeSingle();

    // 2) display_id fallback
    if (!data && !error) {
      const resp = await postTable.select(COLUMNS).eq("display_id", params.slug).maybeSingle();
      data = resp.data; error = resp.error;
    }

    // 3) numeric id fallback
    if (!data && !error && /^\d+$/.test(params.slug)) {
      const resp = await postTable.select(COLUMNS).eq("id", Number(params.slug)).maybeSingle();
      data = resp.data; error = resp.error;
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const cfg = (data as any).config ?? {};
    const mapped = {
      post_id: String(data.id),
      slug: data.slug,
      title: data.title,
      secondary_title: data.secondary_title,
      cover_image_url: data.cover_image_url,
      author_name: data.contributor_name ?? data.author ?? "LIFTD+",
      author_photo: null as string | null,
      like_count: 0,
      topic_tags: "",
      format_tags: "",
      audience_tags: "",
      user_liked: false,
      user_archived: false,
      content_type: (cfg.content_type as "text" | "image") ?? "text",
      content: data.markdown ?? "",
      images: Array.isArray(cfg.images) ? cfg.images : [],
      read_time_minutes:
        typeof cfg.read_time_minutes === "number" ? cfg.read_time_minutes : undefined,
      post_template_id: data.post_template_id,
      source: data.source,
      post_status: data.post_status,
      created_at: data.created_at,
      published_at: data.published_at,
      display_id: data.display_id ?? null,
      config: cfg,
    };

    return NextResponse.json({ post: mapped }, { status: 200 });
  } catch (e) {
    console.error("Route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// We query the real columns that exist in your `post` table,
// then map them to the UI shape your components expect.
const TABLE = "post";

export const dynamic = "force-dynamic"; // ensure no caching

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();

    // 1) Select ONLY real columns from your `post` table
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
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
        published_at
        `
      )
      .eq("slug", params.slug)
      .single();

    // 2) Handle not found / errors cleanly
    if (error || !data) {
      // PGRST116 = no rows; also handle null data
      if ((error as any)?.code === "PGRST116") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // 3) Map DB row -> UI shape expected by PostContent/Card/etc.
    //    Safely pull optional bits from `config` if present.
    const cfg = (data as any).config ?? {};
    const mapped = {
      // core identity
      post_id: String(data.id),
      slug: data.slug,

      // presentation
      title: data.title,
      secondary_title: data.secondary_title,
      cover_image_url: data.cover_image_url,

      // author-ish fields the UI expects
      author_name: data.contributor_name ?? "LIFTD+",
      author_photo: null as string | null,

      // tags / counts (you can wire real values later)
      like_count: 0,
      topic_tags: "",
      format_tags: "",
      audience_tags: "",

      // user interaction flags (defaults)
      user_liked: false,
      user_archived: false,

      // content — prefer markdown; allow config overrides if you add them later
      content_type: (cfg.content_type as "text" | "image") ?? "text",
      content: data.markdown ?? "",
      images: Array.isArray(cfg.images) ? cfg.images : [],

      // extras
      read_time_minutes:
        typeof cfg.read_time_minutes === "number" ? cfg.read_time_minutes : undefined,

      // pass through raw fields you might want later
      post_template_id: data.post_template_id,
      source: data.source,
      post_status: data.post_status,
      created_at: data.created_at,
      published_at: data.published_at,
      config: cfg,
    };

    return NextResponse.json({ post: mapped }, { status: 200 });
  } catch (e) {
    console.error("Route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

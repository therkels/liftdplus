import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const TABLE = "post";
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

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const postTable = supabase.schema("private").from(TABLE);

    // 1) Try exact slug match (text → safe)
    let { data, error } = await postTable
      .select(COLUMNS)
      .eq("slug", params.slug)
      .maybeSingle();

    // Only try numeric fallbacks if the param is all digits
    const isNumeric = /^\d+$/.test(params.slug);

    // 2) Fallback: display_id match (INT) — only if numeric
    if (!data && !error && isNumeric) {
      const r = await postTable
        .select(COLUMNS)
        .eq("display_id", Number(params.slug))
        .maybeSingle();
      data = r.data;
      error = r.error;
    }

    // 3) Fallback: id match (INT) — only if numeric
    if (!data && !error && isNumeric) {
      const r = await postTable
        .select(COLUMNS)
        .eq("id", Number(params.slug))
        .maybeSingle();
      data = r.data;
      error = r.error;
    }

    // Return detailed error info so we can see what's wrong if it fails
    if (error || !data) {
      const code = (error as any)?.code ?? "UNKNOWN";
      const message = (error as any)?.message ?? (data ? "" : "No row");
      const details = (error as any)?.details ?? null;
      const hint = (error as any)?.hint ?? null;
      const status = code === "PGRST116" || message === "No row" ? 404 : 500;
      return NextResponse.json(
        { error: "Supabase error", code, message, details, hint },
        { status }
      );
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
  } catch (e: any) {
    return NextResponse.json(
      { error: "Route exception", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

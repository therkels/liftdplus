// src/app/api/v0/post/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// If your table is not named "posts" or the column isn't "slug",
// change the names below accordingly.
const TABLE = "posts";
const COLUMNS = `
  post_id,
  slug,
  title,
  secondary_title,
  cover_image_url,
  author_name,
  author_photo,
  like_count,
  topic_tags,
  format_tags,
  audience_tags,
  user_liked,
  user_archived,
  content_type,
  content,
  images,
  read_time_minutes
`;

export const dynamic = "force-dynamic"; // ensure no caching

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();

    // fetch the post by slug
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq("slug", params.slug)
      .single();

    if (error) {
      // If row not found, return 404
      if (error.code === "PGRST116" || error.details?.includes("Results contain 0 rows")) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (e) {
    console.error("Route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

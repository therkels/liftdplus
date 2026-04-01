import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function extractSlug(properties: unknown): string | null {
  if (!properties || typeof properties !== "object") return null;
  const slug = (properties as { slug?: unknown }).slug;
  return typeof slug === "string" && slug.length > 0 ? slug : null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ slugs: [] as string[] });
    }

    const { data, error } = await supabaseAdmin
      .from("user_events")
      .select("properties")
      .eq("user_id", user.id)
      .eq("event_name", "article_viewed");

    if (error) {
      console.error("[read-articles]", error.message);
      return NextResponse.json({ slugs: [] as string[] });
    }

    const slugs = [
      ...new Set(
        (data ?? [])
          .map((row) => extractSlug(row.properties))
          .filter((s): s is string => s !== null)
      ),
    ];

    return NextResponse.json({ slugs });
  } catch (e) {
    console.error("[read-articles]", e);
    return NextResponse.json({ slugs: [] as string[] });
  }
}

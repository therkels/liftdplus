import { createClient } from "@/utils/supabase/server";

export type RelatedGuide = {
  slug: string;
  title: string;
  secondary_title: string | null;
};

export async function getRelatedGuides(
  currentSlug: string,
  postId: string,
  limit = 3
): Promise<RelatedGuide[]> {
  const supabase = await createClient();

  const { data: tagRows } = await supabase
    .from("post_tag")
    .select("tag_id")
    .eq("post_id", postId);

  const tagIds = tagRows?.map((row) => row.tag_id) ?? [];
  let relatedPostIds: string[] = [];

  if (tagIds.length > 0) {
    const { data: sharedTagPosts } = await supabase
      .from("post_tag")
      .select("post_id")
      .in("tag_id", tagIds)
      .neq("post_id", postId);

    relatedPostIds = [
      ...new Set((sharedTagPosts ?? []).map((row) => row.post_id)),
    ].slice(0, limit);
  }

  let query = supabase
    .from("post")
    .select("slug, title, secondary_title")
    .eq("post_status", "published")
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (relatedPostIds.length > 0) {
    query = query.in("id", relatedPostIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.filter(
    (row): row is RelatedGuide =>
      typeof row.slug === "string" && row.slug.length > 0
  );
}

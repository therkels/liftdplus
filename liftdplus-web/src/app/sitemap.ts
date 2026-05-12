import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BASE_URL = "https://liftdplus.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabaseAdmin
    .from("post")
    .select("slug, published_at")
    .eq("post_status", "published");

  if (error) {
    console.error("[sitemap]", error.message);
  }

  const slugs =
    data?.filter(
      (row): row is { slug: string; published_at: string | null } =>
        typeof row.slug === "string" && row.slug.trim().length > 0
    ) ?? [];

  const posts: MetadataRoute.Sitemap = slugs.map((row) => ({
    url: `${BASE_URL}/post/${encodeURIComponent(row.slug)}`,
    lastModified: row.published_at
      ? new Date(row.published_at)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
    },
    ...posts,
  ];
}

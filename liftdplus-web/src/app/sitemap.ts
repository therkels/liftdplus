import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BASE_URL = "https://liftdplus.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabaseAdmin
    .from("post")
    .select("slug, published_at")
    .eq("post_status", "published");

  if (error || !data) {
    return [
      { url: `${BASE_URL}/`, lastModified: new Date(), priority: 1 },
      { url: `${BASE_URL}/explore`, lastModified: new Date() },
      { url: `${BASE_URL}/resources`, lastModified: new Date() },
    ];
  }

  const posts: MetadataRoute.Sitemap = data.map((row) => ({
    url: `${BASE_URL}/resources/${encodeURIComponent(row.slug)}`,
    lastModified: row.published_at ? new Date(row.published_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: `${BASE_URL}/`, lastModified: new Date(), priority: 1 },
    { url: `${BASE_URL}/explore`, lastModified: new Date() },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), priority: 0.9 },
    ...posts,
  ];
}

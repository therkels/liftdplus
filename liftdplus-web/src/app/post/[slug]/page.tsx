// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPost(slug: string) {
  // 1) Try PRODUCTION first (has the complete data), then Preview
  const urls = [
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(slug)}`, // PROD
    `/api/v0/post/${encodeURIComponent(slug)}`,                          // PREVIEW
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const json = await res.json().catch(() => null);
      if (!json?.post) continue;

      const p = json.post;

      // Normalize/collect potential author photo fields
      const author_photo =
        p.author_photo ??
        p.author_photo_url ??
        p.author?.photo ??
        p.author?.photo_url ??
        null;

      // If this source doesn't include an author photo, try next URL
      if (!author_photo) continue;

      return { ...p, author_photo };
    } catch {
      // try the next URL
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Normalize carousel images: [cover, ...config.images]
  const cfgImages =
    post?.config && Array.isArray(post.config.images) ? post.config.images : [];

  const normalized = {
    ...post,
    images: [
      ...(post?.cover_image_url ? [post.cover_image_url] : []),
      ...cfgImages,
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

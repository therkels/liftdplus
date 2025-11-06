// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const urls = [
    `/api/v0/post/${encodeURIComponent(slug)}`,
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(slug)}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      if (!json?.post) continue;

      const p = json.post;

      // Ensure author_photo is present regardless of backend shape
      const author_photo =
        p.author_photo ??
        p.author_photo_url ??
        p.author?.photo ??
        p.author?.photo_url ??
        null;

      return { ...p, author_photo };
    } catch {
      // try next URL
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const cfgImages =
    post?.config && Array.isArray(post.config.images) ? post.config.images : [];

  const normalized = {
    ...post,
    // Slide 1 should be cover, followed by config.images
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

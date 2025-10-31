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
      if (json?.post) return json.post;
    } catch {}
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // 👇 accept images from either top-level or config
  const bodyImages =
    Array.isArray(post.images)
      ? post.images
      : Array.isArray(post?.config?.images)
      ? post.config.images
      : [];

  // 👇 put cover first (slide 1), then the rest (avoid dupes)
  const allImages = [
    post.cover_image_url,
    ...bodyImages.filter((u: string) => u && u !== post.cover_image_url),
  ];

  const normalized = {
    ...post,
    images: allImages,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

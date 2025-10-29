// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const urls = [
    // same deployment (Preview or Prod)
    `/api/v0/post/${encodeURIComponent(slug)}`,
    // hard fallback to Production API
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(slug)}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      if (json?.post) return json.post;
    } catch {
      // try next URL
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // ---- normalize for carousels ----
  const imagesFromConfig =
    post?.config && Array.isArray(post.config.images) ? post.config.images : [];

  const normalized = {
    ...post,
    // ensure PostContentCarousel receives images
    images: imagesFromConfig,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

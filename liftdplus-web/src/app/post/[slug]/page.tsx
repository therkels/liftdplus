// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

// Try to get the post JSON via API route (works in both Preview and Production)
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
    } catch {
      // try next URL
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // ✅ Normalize for carousel posts (config.images) and fallback to markdown
  const images =
    Array.isArray(post.images)
      ? post.images
      : Array.isArray(post?.config?.images)
        ? post.config.images
        : [];

  const safePost = {
    ...post,
    slug: post.slug ?? params.slug, // ensure slug always exists
    images,                         // ensure carousels render correctly
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={safePost as any} />
      </div>
    </div>
  );
}

// liftdplus-web/src/app/post/[slug]/page.tsx
import PostContent from "@/components/site_core/PostContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const urls = [
    // 1) same-deployment (Preview or Prod)
    `/api/v0/post/${encodeURIComponent(slug)}`,
    // 2) hard fallback to Production (in case Preview API route isn't wired)
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(slug)}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      if (json?.post) return json.post;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  const safePost = { ...post, slug: post.slug || params.slug };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={safePost as any} />
      </div>
    </div>
  );
}

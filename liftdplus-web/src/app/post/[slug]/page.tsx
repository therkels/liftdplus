// src/app/post/[slug]/page.tsx
import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Close Header */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="text-sm font-medium hover:opacity-80"
            aria-label="Close and go back"
          >
            × Close
          </Link>
        </div>
      </div>

      {/* Actual Content Renderer (supports carousels, text, etc.) */}
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={post as any} />
      </div>
    </div>
  );
}

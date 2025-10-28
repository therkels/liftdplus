import PostContent from "@/components/site_core/PostContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Fetch the post from the API route (which we just verified works)
async function getPost(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://app.liftdplus.com";
  const url = `${base}/api/v0/post/${encodeURIComponent(slug)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  return json?.post ?? null;
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Ensure slug exists on the object for components that expect it
  const safePost = { ...post, slug: post.slug || params.slug };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={safePost as any} />
      </div>
    </div>
  );
}

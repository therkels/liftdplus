// /src/app/post/[slug]/page.tsx
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

  // Prefer root-level images if your API already returns them;
  // otherwise fall back to config.images. Never synthesize the cover here.
  const images =
    Array.isArray(post.images) && post.images.length > 0
      ? post.images
      : Array.isArray(post?.config?.images)
      ? post.config.images
      : [];

  // Preserve author fields; map common alternates just in case.
  const normalized = {
    ...post,
    images,
    author_name:
      post.author_name ??
      post.author?.username ??
      post.username ??
      "LIFTD+",
    author_photo:
      post.author_photo ??
      post.author?.profile_icon_url ??
      post.profile_icon_url ??
      null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const urls = [
    `/api/v0/post/${encodeURIComponent(slug)}`,                // same env (preview/prod)
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(slug)}`, // hard fallback
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

  // ------- Normalize for detail page components -------
  // images: cover first, then any additional slides from config.images
  const cfgImages = Array.isArray(post?.config?.images) ? post.config.images : [];
  const images = [
    ...(post?.cover_image_url ? [post.cover_image_url] : []),
    ...cfgImages,
  ];

  // unify author fields so PostMetadata always has what it needs
  const author_photo =
    post?.contributor_photo ??
    post?.author_photo ??
    post?.author?.photo ??
    post?.author?.avatar_url ??
    "/liftd-icon.svg";

  const author_name =
    post?.contributor_name ??
    post?.author_name ??
    post?.source ??
    "LIFTD+";

  const normalized = {
    ...post,
    images,
    author_photo,
    author_name,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

// src/app/post/[slug]/page.tsx
import { redirect } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const urls = [
    `/api/v0/post/${slug}`, // same-origin
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/v0/post/${slug}`
      : null,
  ].filter(Boolean) as string[];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.post) return json.post;
    } catch {
      // try next url
    }
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) redirect("/explore");

  // IMPORTANT: do NOT overwrite images/author_photo here.
  const normalized = post;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

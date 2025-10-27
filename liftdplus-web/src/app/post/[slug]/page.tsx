

import { createClient } from "@/utils/supabase/server";
import PostContent from "@/components/site_core/PostContent";

export const dynamic = "force-dynamic";

type DbPost = Record<string, unknown>;

function toSlug(title: unknown): string | null {
  if (typeof title !== "string") return null;
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function fetchPostBySlug(slug: string): Promise<DbPost | null> {
  const supabase = await createClient();

  // ✅ Use your actual Supabase table name ("post")
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }

  // If no exact slug found, try matching a slug generated from title
  if (!data) {
    const { data: allPosts } = await supabase.from("post").select("*");
    const match = allPosts?.find((p: any) => toSlug(p.title) === slug);
    return match ?? null;
  }

  return data ?? null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 md:px-0 py-10">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="text-gray-600">
          This link might be old or the post is unpublished.
        </p>
      </div>
    );
  }

  // Ensure every post object has a slug (some components expect it)
  const safePost = {
    ...post,
    slug:
      (post as any).slug ||
      toSlug((post as any).title) ||
      "untitled-post",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={safePost as any} />
      </div>
    </div>
  );
}

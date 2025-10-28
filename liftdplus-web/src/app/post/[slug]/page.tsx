/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import PostContent from "@/components/site_core/PostContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type DbPost = {
  id: number | string;
  title: string | null;
  secondary_title?: string | null;
  cover_image_url?: string | null;
  post_template_id?: string | null;
  author?: string | null;
  contributor_name?: string | null;
  source?: string | null;
  post_status?: string | null;
  markdown?: string | null;
  config?: any;
  created_at?: string | null;
  published_at?: string | null;
  display_id?: string | null;
  slug?: string | null;
};

const COLUMNS = `
  id,
  title,
  secondary_title,
  cover_image_url,
  post_template_id,
  author,
  contributor_name,
  source,
  post_status,
  markdown,
  config,
  created_at,
  published_at,
  display_id,
  slug
`;

function toSlug(title: unknown): string | null {
  if (typeof title !== "string") return null;
  return title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchPostByParam(param: string): Promise<DbPost | null> {
  const supabase = await createClient();

  // 1) Try by slug (most common)
  {
    const { data, error } = await supabase.from("post").select(COLUMNS).eq("slug", param).maybeSingle();
    if (error) console.error("fetch by slug error:", error);
    if (data) return data;
  }

  // 2) Try by display_id (many apps link this instead of slug)
  {
    const { data, error } = await supabase.from("post").select(COLUMNS).eq("display_id", param).maybeSingle();
    if (error) console.error("fetch by display_id error:", error);
    if (data) return data;
  }

  // 3) Try by numeric id (if someone linked /post/17)
  if (/^\d+$/.test(param)) {
    const numericId = Number(param);
    const { data, error } = await supabase.from("post").select(COLUMNS).eq("id", numericId).maybeSingle();
    if (error) console.error("fetch by numeric id error:", error);
    if (data) return data;
  }

  // 4) Lightweight title-derived slug fallback
  {
    const { data: minimal, error } = await supabase.from("post").select("id, title, slug, display_id");
    if (error) {
      console.error("minimal fetch error:", error);
      return null;
    }
    const match = minimal?.find((p: any) => {
      if (p?.slug === param) return true;
      if (p?.display_id === param) return true;
      const computed = toSlug(p?.title ?? null);
      return computed === param;
    });
    if (match?.id != null) {
      const { data, error: fullErr } = await supabase.from("post").select(COLUMNS).eq("id", match.id).maybeSingle();
      if (fullErr) console.error("full fetch after fallback error:", fullErr);
      if (data) return data;
    }
  }

  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await fetchPostByParam(params.slug);
  const title = (post?.title ?? "LIFTD+") + (post?.secondary_title ? ` — ${post?.secondary_title}` : "");
  const description = post?.secondary_title ?? "Personalized, stigma-free cannabis education from LIFTD+.";
  const ogImage = post?.cover_image_url ?? "/liftd-og-default.png";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage }], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await fetchPostByParam(params.slug);
  if (!post) notFound();

  const normalized = {
    ...post,
    slug: post.slug ?? post.display_id ?? toSlug(post.title) ?? "untitled-post",
    content: post.markdown ?? null,
    author_name: post.contributor_name ?? post.author ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import PostContent from "@/components/site_core/PostContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type DbPost = {
  post_id: string;
  slug: string | null;
  title: string | null;
  secondary_title?: string | null;
  cover_image_url?: string | null;
  author_name?: string | null;
  author_photo?: string | null;
  like_count?: number | null;
  topic_tags?: string[] | null;
  format_tags?: string[] | null;
  audience_tags?: string[] | null;
  user_liked?: boolean | null;
  user_archived?: boolean | null;
  content_type?: string | null;
  content?: any;
  images?: any;
  read_time_minutes?: number | null;
  published_at?: string | null;
  is_published?: boolean | null;
};

const COLUMNS = `
  post_id,
  slug,
  title,
  secondary_title,
  cover_image_url,
  author_name,
  author_photo,
  like_count,
  topic_tags,
  format_tags,
  audience_tags,
  user_liked,
  user_archived,
  content_type,
  content,
  images,
  read_time_minutes,
  published_at,
  is_published
`;

function toSlug(title: unknown): string | null {
  if (typeof title !== "string") return null;
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Fetch a post by its stored slug. If that misses, try a lightweight
 * fallback: pull only (post_id, title, slug), compute slugs from titles,
 * and match in-memory — without doing a full "*" table scan.
 */
async function fetchPostBySlug(slug: string): Promise<DbPost | null> {
  const supabase = await createClient();

  // 1) Direct match on stored slug
  const { data: direct, error: directErr } = await supabase
    .from("post")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (directErr) {
    console.error("Error fetching post by slug:", directErr);
  }
  if (direct) return direct;

  // 2) Lightweight fallback: fetch minimal fields, compute slug from title
  const { data: minimal, error: miniErr } = await supabase
    .from("post")
    .select("post_id, title, slug");

  if (miniErr) {
    console.error("Error in minimal fallback fetch:", miniErr);
    return null;
  }

  const match = minimal?.find((p: any) => {
    if (p?.slug === slug) return true;
    const computed = toSlug(p?.title);
    return computed === slug;
  });

  if (!match?.post_id) return null;

  // 3) Fetch full record for the matched post_id
  const { data: full, error: fullErr } = await supabase
    .from("post")
    .select(COLUMNS)
    .eq("post_id", match.post_id)
    .maybeSingle();

  if (fullErr) {
    console.error("Error fetching full post after minimal match:", fullErr);
    return null;
  }

  return full ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await fetchPostBySlug(params.slug);

  const title =
    (post?.title ?? "LIFTD+") + (post?.secondary_title ? ` — ${post.secondary_title}` : "");
  const description =
    post?.secondary_title ??
    "Personalized, stigma-free cannabis education from LIFTD+.";
  const ogImage = post?.cover_image_url ?? "/liftd-og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    // Proper 404 for broken/old links
    notFound();
  }

  // Ensure a slug exists for downstream components
  const safePost: DbPost & { slug: string } = {
    ...(post as DbPost),
    slug: post.slug ?? toSlug(post.title) ?? "untitled-post",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={safePost as any} />
      </div>
    </div>
  );
}

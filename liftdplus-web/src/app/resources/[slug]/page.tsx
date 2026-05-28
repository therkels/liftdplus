import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";
import BackButton from "@/components/BackButton";
import { ArticleReadTracker } from "@/components/ArticleReadTracker";
import { ArticleViewTracker } from "@/components/ArticleViewTracker";
import { createClient } from "@/utils/supabase/server";
import { CHECKLIST_ITEMS } from "@/types/checklist";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  console.log("🔍 getPost called with slug:", slug);

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("post")
    .select(`
      id, title, secondary_title, cover_image_url, author,
      contributor_name, post_template_id, markdown, config,
      created_at, published_at, display_id, slug, seo_title, meta_description
    `)
    .eq("slug", slug)
    .maybeSingle();

  console.log("📊 Supabase response:", { error, rowExists: !!row });
  if (row) console.log("✅ Found post:", row.title);

  if (error || !row) {
    console.error("❌ Error fetching post:", error);
    return null;
  }

  const cfg = row.config && typeof row.config === "object" ? row.config : null;
  const isCarousel = row.post_template_id === "carousel_block";
  const images = Array.isArray((cfg as any)?.images) ? (cfg as any).images : [];

  // Skip author photo lookup for now — just use contributor name
  const author_name: string | null = row.contributor_name ?? null;
  const author_photo: string | null = null;

  return {
    id: row.id,
    title: row.title,
    secondary_title: row.secondary_title,
    cover_image_url: row.cover_image_url ?? null,
    author_name,
    author_photo,
    post_template_id: row.post_template_id,
    content_type: isCarousel ? "image" : "text",
    content: isCarousel ? null : (row.markdown ?? "").replace(/\/post\//g, "/resources/"),
    images,
    created_at: row.created_at,
    published_at: row.published_at,
    display_id: row.display_id ?? null,
    slug: row.slug ?? null,
    seo_title: row.seo_title ?? null,
    meta_description: row.meta_description ?? null,
    config: cfg ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Article Not Found | LIFTD+",
    };
  }

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.secondary_title || undefined;
  const url = `https://liftdplus.com/resources/${post.slug}`;
  const image = post.cover_image_url || "https://liftdplus.com/images/og-hero-updated.jpg";

  return {
    title: `${title} | LIFTD+`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "LIFTD+",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { source?: string };
}) {
  const post = await getPost(params.slug);

  if (!post) notFound();

  const checklistItem = CHECKLIST_ITEMS.find(
    (item) =>
      item.slug === params.slug ||
      (item.goalSlugMap && Object.values(item.goalSlugMap).includes(params.slug))
  );

  const cfgImages =
    post?.config && Array.isArray(post.config.images) ? post.config.images : [];

  const normalized = {
    ...post,
    images: [...(post?.cover_image_url ? [post.cover_image_url] : []), ...cfgImages],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleReadTracker
        slug={params.slug}
        checklistItemId={checklistItem?.id}
      />
      <ArticleViewTracker
        slug={params.slug}
        postId={post.id}
        source={searchParams?.source ?? "direct"}
      />
      <div className="container mx-auto px-4 md:px-0 py-6">
        <BackButton />
        <PostContent post={{ ...normalized, author_photo: null } as any} showShare={false} />
      </div>
    </div>
  );
}

// src/app/post/[slug]/page.tsx
import { notFound } from "next/navigation";
import PostContent from "@/components/site_core/PostContent";
import { ArticleReadTracker } from "@/components/ArticleReadTracker";
import { ArticleViewTracker } from "@/components/ArticleViewTracker";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { CHECKLIST_ITEMS } from "@/types/checklist";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .schema("private")
    .from("post")
    .select(`
      id, title, secondary_title, cover_image_url, author,
      contributor_name, post_template_id, markdown, config,
      created_at, published_at, display_id, slug
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) return null;

  const cfg = row.config && typeof row.config === "object" ? row.config : null;
  const isCarousel = row.post_template_id === "carousel_block";
  const images = Array.isArray((cfg as any)?.images) ? (cfg as any).images : [];

  let author_name: string | null = row.contributor_name ?? null;
  let author_photo: string | null = null;

  if (row.author) {
    const { data: user } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id, username, profile_icon_url")
      .eq("id", row.author)
      .maybeSingle();

    if (user) {
      author_name = author_name ?? user.username ?? null;
      author_photo =
        typeof user.profile_icon_url === "string" &&
        /^https?:\/\//i.test(user.profile_icon_url)
          ? user.profile_icon_url
          : null;
    }
  }

  return {
    id: row.id,
    title: row.title,
    secondary_title: row.secondary_title,
    cover_image_url: row.cover_image_url ?? null,
    author_name,
    author_photo,
    post_template_id: row.post_template_id,
    content_type: isCarousel ? "image" : "text",
    content: isCarousel ? null : row.markdown ?? null,
    images,
    created_at: row.created_at,
    published_at: row.published_at,
    display_id: row.display_id ?? null,
    slug: row.slug ?? null,
    config: cfg ?? null,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const checklistItem = CHECKLIST_ITEMS.find(
    (item) =>
      item.slug === params.slug ||
      (item.goalSlugMap &&
        Object.values(item.goalSlugMap).includes(params.slug))
  );

  // Normalize carousel images: [cover, ...config.images]
  const cfgImages =
    post?.config && Array.isArray(post.config.images) ? post.config.images : [];

  const normalized = {
    ...post,
    images: [
      ...(post?.cover_image_url ? [post.cover_image_url] : []),
      ...cfgImages,
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleReadTracker
        slug={params.slug}
        checklistItemId={checklistItem?.id}
      />
      <ArticleViewTracker slug={params.slug} postId={post.id} />
      <div className="container mx-auto px-4 md:px-0 py-6">
        <PostContent post={normalized as any} />
      </div>
    </div>
  );
}

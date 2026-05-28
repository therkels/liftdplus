import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PostTag = {
  tag_id: string;
};

type PostRow = {
  id: string;
  title: string;
  secondary_title: string | null;
  cover_image_url: string | null;
  markdown: string | null;
  post_status: string;
  published_at: string | null;
  slug: string;
  post_template_id: string | null;
};

type PublishedPost = PostRow & {
  post_tag: PostTag[];
};

type ArticleWithReadTime = PublishedPost & {
  readTime: number;
};

/**
 * Calculate read time from markdown content
 * Based on 200 words per minute (standard reading speed)
 */
function calculateReadTime(markdown: string): number {
  if (!markdown) return 1;

  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*`_~[\]()]/g, "")
    .replace(/\n+/g, " ");

  const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
  const readTimeMinutes = Math.ceil(wordCount / 200);

  return Math.max(1, readTimeMinutes);
}

/**
 * Fetch all published articles with read time
 * Supports search and category filtering
 */
export async function getPublishedArticles(
  tagFilter?: string,
  searchQuery?: string,
  limit = 12,
  offset = 0
): Promise<ArticleWithReadTime[]> {
  try {
    let query = supabase
      .from("post")
      .select(
        "id, title, secondary_title, cover_image_url, markdown, post_status, published_at, slug, post_template_id"
      )
      .eq("post_status", "published")
      .order("published_at", { ascending: false });

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,secondary_title.ilike.%${searchQuery}%`
      );
    }

    // Filter by tag in Supabase before pagination
    if (tagFilter) {
      const { data: tagRows, error: tagError } = await supabase
        .from("post_tag")
        .select("post_id")
        .eq("tag_id", tagFilter);

      if (tagError) {
        console.error("Error fetching post_tag for filter:", tagError);
        return [];
      }

      const matchingPostIds = (tagRows || []).map((row) => row.post_id);
      if (matchingPostIds.length === 0) {
        return [];
      }

      query = query.in("id", matchingPostIds);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error || !data) {
      console.error("Error fetching articles:", error);
      return [];
    }

    const postIds = data.map((post) => post.id);
    let postTags: { post_id: string; tag_id: string }[] = [];

    if (postIds.length > 0) {
      const { data: tagRows, error: tagError } = await supabase
        .from("post_tag")
        .select("post_id, tag_id")
        .in("post_id", postIds);

      if (tagError) {
        console.error("Error fetching post_tag:", tagError);
      } else {
        postTags = tagRows || [];
      }
    }

    const articlesWithTags: PublishedPost[] = (data as PostRow[]).map((article) => ({
      ...article,
      post_tag: postTags
        .filter((pt) => pt.post_id === article.id)
        .map((pt) => ({ tag_id: pt.tag_id })),
    }));

    return articlesWithTags.map((post) => ({
      ...post,
      readTime: calculateReadTime(post.markdown || ""),
    }));
  } catch (err) {
    console.error("getPublishedArticles error:", err);
    return [];
  }
}

/**
 * Fetch a single article by slug
 */
export async function getArticleBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from("post")
      .select(
        `
        id,
        title,
        secondary_title,
        cover_image_url,
        markdown,
        published_at,
        slug,
        post_template_id,
        post_tag (
          tag_id
        )
      `
      )
      .eq("post_status", "published")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching article:", error);
      return null;
    }

    const readTime = calculateReadTime(data.markdown || "");

    return {
      ...data,
      readTime,
    };
  } catch (err) {
    console.error("getArticleBySlug error:", err);
    return null;
  }
}

/**
 * Fetch all tags (for filtering/display)
 */
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from("tag")
      .select("id, display_name, category")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("getAllTags error:", err);
    return [];
  }
}

/**
 * Fetch a specific tag by ID
 */
export async function getTagById(tagId: string) {
  try {
    const { data, error } = await supabase
      .from("tag")
      .select("id, display_name, category")
      .eq("id", tagId)
      .single();

    if (error) {
      console.error("Error fetching tag:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("getTagById error:", err);
    return null;
  }
}

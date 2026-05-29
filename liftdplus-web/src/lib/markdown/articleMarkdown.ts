import { supabaseAdmin } from '@/utils/supabase/admin';

export type ParsedRelatedArticle = {
  title: string;
  slug: string;
};

/** Fetch related articles by topic from Supabase (not markdown parsing) */
export async function getRelatedArticlesByTopic(
  currentSlug: string,
  topic: string,
  limit: number = 3
): Promise<ParsedRelatedArticle[]> {
  try {
    const { data: relatedPosts } = await supabaseAdmin
      .schema('public')
      .from('post')
      .select(`id, title, slug, post_tag!inner(tag_id, tag(display_name))`)
      .eq('post_status', 'published')
      .eq('post_tag.tag.display_name', topic)
      .neq('slug', currentSlug)
      .limit(limit);

    if (!relatedPosts) return [];

    return relatedPosts.map((post: any) => ({
      title: post.title,
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

/** Simple cleanup: remove "### More to Explore" section from markdown */
export function removeMoreToExploreSection(markdown: string): string {
  return markdown
    .replace(/#{2,3}\s*More to Explore\s*\n+([\s\S]*?)(?=\n#{1,3}\s|\n---\n|Ready for more|$)/i, '')
    .replace(/#{2,3}\s*Ready for more[\s\S]*$/i, '')
    .trim();
}

export function prepareArticleMarkdown(markdown: string) {
  const cleanContent = removeMoreToExploreSection(markdown);
  return { cleanContent };
}

'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import type { ParsedRelatedArticle } from '@/lib/markdown/articleMarkdownCleanup';

export async function getRelatedArticlesByTopic(
  currentSlug: string,
  topic: string,
  limit: number = 3
): Promise<ParsedRelatedArticle[]> {
  try {
    const { data: tagRow, error: tagError } = await supabaseAdmin
      .schema('public')
      .from('tag')
      .select('id')
      .eq('display_name', topic)
      .maybeSingle();

    if (tagError || !tagRow?.id) {
      if (tagError) {
        console.error('Error fetching tag:', tagError);
      }
      return [];
    }

    const { data: postTagRows, error: postTagError } = await supabaseAdmin
      .schema('public')
      .from('post_tag')
      .select('post_id')
      .eq('tag_id', tagRow.id);

    if (postTagError || !postTagRows?.length) {
      if (postTagError) {
        console.error('Error fetching post_tag:', postTagError);
      }
      return [];
    }

    const postIds = [...new Set(postTagRows.map((row) => row.post_id))];

    const { data: relatedPosts, error: postsError } = await supabaseAdmin
      .schema('public')
      .from('post')
      .select('id, title, slug')
      .eq('post_status', 'published')
      .in('id', postIds)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (postsError) {
      console.error('Error fetching related articles:', postsError);
      return [];
    }

    if (!relatedPosts) return [];

    return relatedPosts.map((post: { title: string; slug: string }) => ({
      title: post.title,
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

DROP FUNCTION IF EXISTS private.get_posts(text[], text[], text[], text);
DROP FUNCTION IF EXISTS public.get_posts(text[], text[], text[], text);
CREATE OR REPLACE FUNCTION private.get_posts(audience_filter text[] DEFAULT NULL, category_filter text[] DEFAULT NULL, format_filter text[] DEFAULT NULL, sort_by text default null)
  RETURNS TABLE (
    posts json
  )
  language sql
  as $$
  WITH tag_info AS (
    SELECT
      ptag.post_id,
      tag.id as tag_id,
      tag.display_name,
      tag.category
    FROM private.post_tag as ptag
    LEFT JOIN private.tag as tag ON ptag.tag_id = tag.id
  ), post_info AS(
    SELECT
      post.id as post_id,
      post.cover_image_url,
      post.title,
      post.secondary_title,
      post.published_at,
      users.username as author_name,
      users.profile_icon_url as author_photo,
      COUNT(distinct likes.user_id) as like_count,
      ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'topic' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'topic') AS topic_tag_ids,
      ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'format' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'format') AS format_tag_ids,
      ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'audience' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'audience') AS audience_tag_ids,
      STRING_AGG(DISTINCT CASE WHEN tinfo.category = 'topic' THEN tinfo.display_name END, ', ') AS topic_tags,
      STRING_AGG(DISTINCT CASE WHEN tinfo.category = 'format' THEN tinfo.display_name END, ', ') AS format_tags,
      STRING_AGG(DISTINCT CASE WHEN tinfo.category = 'audience' THEN tinfo.display_name END, ', ') AS audience_tags
    FROM
      private.post as post
      LEFT JOIN private.likes as likes ON post.id = likes.post_id
      LEFT JOIN tag_info as tinfo on tinfo.post_id=post.id
      LEFT JOIN private.users as users on users.id = post.author
    GROUP BY
      post.id, post.cover_image_url, post.title, post.secondary_title, users.username, users.profile_icon_url
  ), filtered_posts AS (
    SELECT *
    FROM post_info pi
    WHERE 
      (
        $1 is NOT null AND
        pi.audience_tag_ids::text[] && $1
      )
      or
      (
        $2 is NOT null AND
        pi.topic_tag_ids::text[] && $2
      )
      or
      (
        $3 is NOT null AND
        pi.format_tag_ids::text[] && $3
      )
    ORDER BY
      CASE WHEN $4 = 'popular' THEN pi.like_count END DESC,
      CASE WHEN $4 = 'recent' THEN pi.published_at END DESC,
      CASE WHEN $4 = 'oldest' THEN pi.published_at END ASC
  )
SELECT
  COALESCE(json_agg(row_to_json(fp)), '[]') AS posts
FROM filtered_posts fp
$$;


CREATE OR REPLACE FUNCTION public.get_posts(audience_filter text[] DEFAULT NULL, category_filter text[] DEFAULT NULL, format_filter text[] DEFAULT NULL, sort_by text default null)
  RETURNS TABLE (
    posts json
  ) as $$
BEGIN
  RETURN QUERY SELECT * FROM private.get_posts(audience_filter, category_filter, format_filter, sort_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
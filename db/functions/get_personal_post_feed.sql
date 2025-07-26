DROP FUNCTION IF EXISTS private.get_user_feed(VARCHAR);
DROP FUNCTION IF EXISTS public.get_user_feed(VARCHAR);
CREATE OR REPLACE FUNCTION private.get_user_feed(user_id VARCHAR)
  RETURNS TABLE (
    topic_id varchar,
    topic_display varchar,
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
  ),
  post_info AS (
    SELECT
      post.id as post_id,
      post.cover_image_url,
      post.title,
      post.secondary_title,
      users.username as author_name,
      users.profile_icon_url as author_photo,
      COUNT(distinct likes.user_id) as like_count,
      ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'topic' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'topic') AS topic_tag_ids,
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
  ),
  user_preferred_topics AS (
    SELECT tag_id, tag.display_name
    FROM private.preferences
    JOIN private.tag ON preferences.tag_id = tag.id
    WHERE tag.category = 'topic' and preferences.user_id = $1
  ),
  returned_posts as (
    SELECT p.*
    FROM post_info as p
    left join user_preferred_topics upt on upt.tag_id = ANY(p.topic_tag_ids)
  )

SELECT
  t.tag_id AS topic_id,
  t.display_name as display_name,
  COALESCE(json_agg(row_to_json(p)), '[]') AS posts
FROM user_preferred_topics t
LEFT JOIN returned_posts p ON t.tag_id = ANY(p.topic_tag_ids)
where
  t.tag_id = ANY(p.topic_tag_ids)
GROUP BY t.tag_id, t.display_name;
$$;


CREATE OR REPLACE FUNCTION public.get_user_feed(user_id text)
  RETURNS TABLE (
    topic_id varchar,
    topic_display varchar,
    posts json
  ) as $$
BEGIN
  RETURN QUERY SELECT * FROM private.get_user_feed(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

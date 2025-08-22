DROP FUNCTION IF EXISTS private.get_post(text, text);
DROP FUNCTION IF EXISTS public.get_post(text, text);
CREATE OR REPLACE FUNCTION private.get_post(post_id text, user_id text)
  RETURNS TABLE (
    id int4,
    title varchar,
    secondary_title varchar,
    cover_image_url varchar,
    published_at timestamp,
    markdown text,
    config jsonb,
    author_name varchar,
    author_photo varchar,
    like_count int4,
    user_liked boolean,
    user_archived boolean,
    topic_tags text[],
    format_tags text[],
    audience_tags text[]
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
  )
SELECT
  post.id as post_id,
  post.title,
  post.secondary_title,
  post.cover_image_url,
  post.published_at,
  post.markdown,
  post.config,
  users.username as author_name,
  users.profile_icon_url as author_photo,
  COUNT(distinct likes.user_id) as like_count,
  (COUNT(distinct likes.user_id) filter (where likes.user_id = $2::uuid)>0) as user_liked,
  (COUNT(distinct archives.user_id) filter (where archives.user_id = $2::uuid)>0) as user_archived,
  -- ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'topic' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'topic') AS topic_tag_ids,
  -- ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'format' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'format') AS format_tag_ids,
  -- ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'audience' THEN tinfo.tag_id END) FILTER (WHERE tinfo.category = 'audience') AS audience_tag_ids,
  ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'topic' THEN tinfo.display_name END) FILTER (WHERE tinfo.category = 'topic') AS topic_tags,
  ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'format' THEN tinfo.display_name END) FILTER (WHERE tinfo.category = 'format') AS format_tags,
  ARRAY_AGG(DISTINCT CASE WHEN tinfo.category = 'audience' THEN tinfo.display_name END) FILTER (WHERE tinfo.category = 'audience') AS audience_tags
FROM
  private.post as post
  LEFT JOIN private.likes as likes ON post.id = likes.post_id
  LEFT JOIN tag_info as tinfo on tinfo.post_id=post.id
  LEFT JOIN private.users as users on users.id = post.author
  LEFT JOIN private.archives as archives on archives.post_id = post.id
WHERE post.id = $1::int4
GROUP BY
  post.id, post.cover_image_url, post.title, post.secondary_title, users.username, users.profile_icon_url
$$;


CREATE OR REPLACE FUNCTION public.get_post(post_id text, user_id text)
  RETURNS TABLE (
    id int4,
    title varchar,
    secondary_title varchar,
    cover_image_url varchar,
    published_at timestamp,
    markdown text,
    config jsonb,
    author_name varchar,
    author_photo varchar,
    like_count int4,
    user_liked boolean,
    user_archived boolean,
    topic_tags text[],
    format_tags text[],
    audience_tags text[]
  ) as $$
BEGIN
  RETURN QUERY SELECT * FROM private.get_post(post_id, user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Functions for managing user preferences through the API

-- Function to get user preferences with tag details
DROP FUNCTION IF EXISTS public.get_user_preferences(uuid);
CREATE OR REPLACE FUNCTION public.get_user_preferences(user_id uuid)
RETURNS TABLE (
    tag_id varchar,
    tag json
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.tag_id,
        json_build_object(
            'id', t.id,
            'display_name', t.display_name,
            'category', t.category
        ) as tag
    FROM private.preferences p
    JOIN private.tag t ON p.tag_id = t.id
    WHERE p.user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tags by display names
DROP FUNCTION IF EXISTS public.get_tags_by_names(text[], text);
CREATE OR REPLACE FUNCTION public.get_tags_by_names(tag_names text[], tag_category text)
RETURNS TABLE (
    id varchar,
    display_name varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.display_name
    FROM private.tag t
    WHERE t.display_name = ANY($1)
    AND t.category = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences (delete old ones and insert new ones)
DROP FUNCTION IF EXISTS public.update_user_preferences(uuid, text[]);
CREATE OR REPLACE FUNCTION public.update_user_preferences(p_user_id uuid, p_tag_ids text[])
RETURNS void AS $$
BEGIN
    -- Delete existing preferences
    DELETE FROM private.preferences WHERE user_id = p_user_id;
    
    -- Insert new preferences
    IF array_length(p_tag_ids, 1) > 0 THEN
        INSERT INTO private.preferences (user_id, tag_id)
        SELECT p_user_id, unnest(p_tag_ids);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all tags
DROP FUNCTION IF EXISTS public.get_all_tags();
CREATE OR REPLACE FUNCTION public.get_all_tags()
RETURNS TABLE (
    id varchar,
    display_name varchar,
    descr text,
    category varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.display_name, t.descr, t.category
    FROM private.tag t
    ORDER BY t.category, t.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all published posts with their tags
DROP FUNCTION IF EXISTS public.get_all_published_posts();
CREATE OR REPLACE FUNCTION public.get_all_published_posts()
RETURNS TABLE (
    id int4,
    title varchar,
    secondary_title varchar,
    cover_image_url varchar,
    post_status varchar,
    topic_tags text,
    format_tags text,
    audience_tags text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        post.id,
        post.title,
        post.secondary_title,
        post.cover_image_url,
        post.post_status,
        STRING_AGG(DISTINCT CASE WHEN tag.category = 'topic' THEN tag.display_name END, ', ') AS topic_tags,
        STRING_AGG(DISTINCT CASE WHEN tag.category = 'format' THEN tag.display_name END, ', ') AS format_tags,
        STRING_AGG(DISTINCT CASE WHEN tag.category = 'audience' THEN tag.display_name END, ', ') AS audience_tags
    FROM private.post post
    LEFT JOIN private.post_tag ptag ON post.id = ptag.post_id
    LEFT JOIN private.tag tag ON ptag.tag_id = tag.id
    WHERE post.post_status = 'published'
    GROUP BY post.id, post.title, post.secondary_title, post.cover_image_url, post.post_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

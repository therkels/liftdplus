DROP FUNCTION IF EXISTS private.remove_post_archive(text, text);
DROP FUNCTION IF EXISTS public.remove_post_archive(text, text);

CREATE OR REPLACE FUNCTION private.remove_post_archive(post_id text, user_id text)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM private.archives
  WHERE
    post_id = $1::int
    and user_id = $2::uuid
$$;

CREATE OR REPLACE FUNCTION public.remove_post_archive(post_id text, user_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM private.remove_post_archive(post_id, user_id);
END;
$$;
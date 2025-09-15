-- Database functions for managing post likes
-- These functions are called by the API routes to handle like/unlike operations
-- Simplified to match the clean archive system pattern

-- Function to like a post
DROP FUNCTION IF EXISTS public.like_post(int, text);
DROP FUNCTION IF EXISTS public.like_post(text, text);
CREATE OR REPLACE FUNCTION public.like_post(post_id text, user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO private.likes (user_id, post_id) 
  VALUES ($2::uuid, $1::int)
  ON CONFLICT (user_id, post_id) DO NOTHING;
$$;

-- Function to unlike a post (remove like)
DROP FUNCTION IF EXISTS public.remove_post_like(int, text);
DROP FUNCTION IF EXISTS public.remove_post_like(text, text);
CREATE OR REPLACE FUNCTION public.remove_post_like(post_id text, user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM private.likes 
  WHERE user_id = $2::uuid AND post_id = $1::int;
$$;
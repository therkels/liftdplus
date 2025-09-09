DROP FUNCTION IF EXISTS private.delete_user(text);
DROP FUNCTION IF EXISTS public.delete_user(text);
CREATE OR REPLACE FUNCTION private.delete_user(user_id text)
  RETURNS  void
  language sql
  as $$
  DELETE FROM private.users
  WHERE id = $1::uuid;
$$;


CREATE OR REPLACE FUNCTION public.delete_user(user_id text)
  RETURNS void
  as $$
BEGIN
  PERFORM private.delete_user(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
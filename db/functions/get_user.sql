DROP FUNCTION IF EXISTS private.get_user(uuid);
DROP FUNCTION IF EXISTS public.get_user(uuid);
CREATE OR REPLACE FUNCTION private.get_user(user_id uuid)
  RETURNS TABLE(
    id uuid,
    username varchar,
    user_type_id varchar,
    profile_icon_url varchar,
    user_role varchar
  )
  language sql
  as $$
  SELECT *
  FROM private.users users
  WHERE $1 = users.id
$$;


CREATE OR REPLACE FUNCTION public.get_user(user_id uuid)
    RETURNS TABLE(
    id uuid,
    username varchar,
    user_type_id varchar,
    profile_icon_url varchar,
    user_role varchar
  )
  as $$
BEGIN
  RETURN QUERY SELECT * FROM private.get_user(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS private.get_user(uuid);
DROP FUNCTION IF EXISTS public.get_user(uuid);

CREATE OR REPLACE FUNCTION private.get_user(user_id uuid)
  RETURNS TABLE(
    id uuid,
    username varchar,
    user_type_id varchar,
    profile_icon_url varchar,
    user_role varchar,
    has_seen_checklist boolean
  )
language sql
  as $$
  SELECT id, username, user_type_id, profile_icon_url, user_role, has_seen_checklist
  FROM private.users
  WHERE $1 = id
$$;

CREATE OR REPLACE FUNCTION public.get_user(user_id uuid)
  RETURNS TABLE(
    id uuid,
    username varchar,
    user_type_id varchar,
    profile_icon_url varchar,
    user_role varchar,
    has_seen_checklist boolean
  )
  as $$
BEGIN
  RETURN QUERY SELECT * FROM private.get_user(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

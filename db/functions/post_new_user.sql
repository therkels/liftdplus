DROP FUNCTION IF EXISTS private.create_user(uuid, varchar);
DROP FUNCTION IF EXISTS public.create_user(uuid, varchar);
CREATE OR REPLACE FUNCTION private.create_user(user_id uuid, username varchar)
  RETURNS void
  language sql
  as $$
  INSERT INTO private.users (
    id, 
    username, 
    user_type_id
) VALUES (
    $1,
    $2,
    'viewer'
);
$$;


CREATE OR REPLACE FUNCTION public.create_user(user_id uuid, username varchar)
  RETURNS void
  as $$
BEGIN
  PERFORM private.create_user(user_id, username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

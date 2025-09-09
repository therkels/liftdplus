import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { user: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "not Authenticated" }, 400);
  }
  const param_list = params.user || [];
  if (param_list.length === 0) {
    const formData = await request.formData();
    const user_name = formData.get("user_name");
    const param_list = params.user || [];
    if (param_list.length === 1) {
      return updateUserName(supabase, user.id, user_name as string);
    }
  }
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return deleteUser(supabase, user.id);
}

async function updateUserName(
  supabase: unknown,
  user_id: string,
  user_name: string
) {
  const { data, error } = await supabase.rpc("get_user", {
    user_id: user_id,
    user_name: user_name,
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse(data);
}

async function deleteUser(supabase: unknown, user_id: string) {
  const { data, error } = await supabase.rpc("delete_user", {
    user_id: user_id,
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse(data);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { user: string[] } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  const param_list = params.user || [];

  // Handle username change: POST /api/v0/user/username
  if (param_list.length === 1 && param_list[0] === "username") {
    const formData = await request.formData();
    const new_username = formData.get("username");

    if (!new_username || typeof new_username !== "string") {
      return jsonResponse({ error: "Username is required" }, 400);
    }

    if (new_username.trim().length === 0) {
      return jsonResponse({ error: "Username cannot be empty" }, 400);
    }

    return updateUserName(supabase, user.id, new_username.trim());
  }

  return jsonResponse({ error: "Invalid endpoint" }, 404);
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
  supabase: Awaited<ReturnType<typeof createClient>>,
  user_id: string,
  new_username: string
) {
  const { data, error } = await supabase.rpc("update_username", {
    user_id: user_id,
    username: new_username,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    message: "Username updated successfully",
    data: data,
  });
}

async function deleteUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user_id: string
) {
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

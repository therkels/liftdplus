import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "not Authenticated" }, 400);
  }

  await supabase.from("event_logs").insert([
    {
      event_type: "get_liked_info",
      details: {},
      user_id: user.id,
    },
  ]);
  return getLikedInfo(supabase, user.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { posts: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "not Authenticated" }, 400);
  }

  const param_list = params.posts || [];
}

async function getLikedInfo(supabase: SupabaseClient, user_id: string) {
  const { data, error } = await supabase.rpc("get_liked_posts", {
    p_user_id: user_id,
  });
  if (error) {
    console.error("Database error in get_liked_posts:", error);
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

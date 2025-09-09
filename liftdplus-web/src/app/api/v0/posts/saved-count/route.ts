import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "not Authenticated" }, 400);
  }

  await supabase.from("event_logs").insert([
    {
      event_type: "get_unique_saved_posts_count",
      details: {},
      user_id: user.id,
    },
  ]);

  return getUniqueSavedPostsCount(supabase, user.id);
}

async function getUniqueSavedPostsCount(supabase: any, user_id: string) {
  const { data, error } = await supabase.rpc("get_unique_saved_posts_count", {
    p_user_id: user_id,
  });
  console.log("get_unique_saved_posts_count result:", { data, error });
  if (error) {
    console.error("Database error in get_unique_saved_posts_count:", error);
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ count: data });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

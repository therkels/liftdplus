import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: { archives: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "not Authenticated" }, 400);
  }

  const param_list = params.archives || [];
  if (param_list.length === 0) {
    await supabase.from("event_logs").insert([
      {
        event_type: "get_archive_info",
        details: {},
        user_id: user.id,
      },
    ]);
    return getArchiveInfo(supabase, user.id);
  } else if (param_list.length === 1) {
    await supabase.from("event_logs").insert([
      {
        event_type: "get_archived_posts",
        details: { category_display: param_list[0] },
        user_id: user.id,
      },
    ]);
    return getArchivedPosts(supabase, user.id, param_list[0]);
  }

  return jsonResponse({ message: "archive route" });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { posts: string } }
) {
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

  const param_list = params.posts || [];
}

async function getArchiveInfo(supabase: SupabaseClient, user_id: string) {
  const { data, error } = await supabase.rpc("get_archive_info", {
    user_id: user_id,
  });
  console.log(error);
  return jsonResponse(data);
}
async function getArchivedPosts(
  supabase: SupabaseClient,
  user_id: string,
  category_display: string
) {
  const { data, error } = await supabase.rpc("get_posts_by_archive", {
    user_id: user_id,
    category_display: category_display,
  });
  console.log(error);
  return jsonResponse(data);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

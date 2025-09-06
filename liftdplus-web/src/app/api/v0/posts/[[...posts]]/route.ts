import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
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
  const url = new URL(request.url);

  //case 1: Get all posts
  if (param_list.length === 0) {
    await supabase.from('event_logs').insert([
      {
          event_type: 'get_all_posts',
          details: {},
          user_id: user.id
      }
    ]);
    return getAllPosts(supabase, user.id, url);
  }
  //get by post
  else if (param_list.length === 1) {
    await supabase.from('event_logs').insert([
      {
          event_type: 'get_post_by_id',
          details: {post_id: param_list[0]},
          user_id: user.id
      }
    ]);
    return getPostByID(supabase, param_list[0], user.id);
  }
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
  const url = new URL(request.url);

  if (param_list.length === 2) {
    if (param_list[1] == "archive") {
      await supabase.from('event_logs').insert([
        {
            event_type: 'archive_post',
            details: {post_id: param_list[0]},
            user_id: user.id
        }
      ]);
      // Auto-archive: determine category from post's topic tag and user preferences
      return autoArchivePost(supabase, param_list[0], user.id);
    } else if (param_list[1] == "like") {
      await supabase.from('event_logs').insert([
        {
            event_type: 'like_post',
            details: {post_id: param_list[0]},
            user_id: user.id
        }
      ]);
      return putLikePost(supabase, param_list[0], user.id);
    }
  }
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
  const url = new URL(request.url);
  if (param_list.length === 2) {
    if (param_list[1] == "archive") {
      await supabase.from('event_logs').insert([
        {
            event_type: 'delete_archived_post',
            details: {post_id: param_list[0]},
            user_id: user.id
        }
      ]);
      return deleteArchivedPost(supabase, param_list[0], user.id);
    } else if (param_list[1] == "like") {
      await supabase.from('event_logs').insert([
        {
            event_type: 'delete_liked_post',
            details: {post_id: param_list[0]},
            user_id: user.id
        }
      ]);
      return deleteLikePost(supabase, param_list[0], user.id);
    }
  }
}

async function getAllPosts(supabase: any, user_id: string, url: URL) {
  const { data, error } = await supabase.rpc("get_posts_with_user_data", {
    user_id: user_id,
    category_filter: url.searchParams.getAll("category"),
    audience_filter: url.searchParams.getAll("audience"),
    format_filter: url.searchParams.getAll("format"),
    sort_by: url.searchParams.get("sort_by") || "popular",
  });
  console.log("get_posts_with_user_data error:", error);
  console.log("get_posts_with_user_data data:", data);
  return jsonResponse(data);
}
async function getPostByID(supabase: any, post_id: string, user_id: string) {
  const { data, error } = await supabase.rpc("get_post", {
    post_id: post_id,
    user_id: user_id,
  });
  return jsonResponse(data);
}

async function putArchivedPost(
  supabase: any,
  post_id: string,
  user_id: string,
  category: string
) {
  const { data, error } = await supabase.rpc("archive_post", {
    post_id: post_id,
    user_id: user_id,
    category: category,
  });

  // Log and handle errors properly
  if (error) {
    console.error("Archive post error:", error);
    return jsonResponse({ error: error.message || error }, 500);
  }

  console.log("Archive post success:", { post_id, user_id, category });
  return jsonResponse({ success: true, data });
}

async function autoArchivePost(
  supabase: any,
  post_id: string,
  user_id: string
) {
  const { data, error } = await supabase.rpc("auto_archive_post", {
    post_id: post_id,
    user_id: user_id,
  });

  // Log and handle errors properly
  if (error) {
    console.error("Auto archive post error:", error);
    return jsonResponse({ error: error.message || error }, 500);
  }

  console.log("Auto archive post success:", { post_id, user_id });
  return jsonResponse({ success: true, data });
}

async function putLikePost(supabase: any, post_id: string, user_id: string) {
  const { data, error } = await supabase.rpc("like_post", {
    post_id: post_id,
    user_id: user_id,
  });
  return jsonResponse(data);
}

async function deleteArchivedPost(
  supabase: any,
  post_id: string,
  user_id: string
) {
  const { data, error } = await supabase.rpc("remove_post_archive", {
    post_id: post_id,
    user_id: user_id,
  });

  // Log and handle errors properly
  if (error) {
    console.error("Unarchive post error:", error);
    return jsonResponse({ error: error.message || error }, 500);
  }

  console.log("Unarchive post success:", { post_id, user_id });
  return jsonResponse({ success: true, data });
}

async function deleteLikePost(supabase: any, post_id: string, user_id: string) {
  const { data, error } = await supabase.rpc("remove_post_like", {
    post_id: post_id,
    user_id: user_id,
  });
  return jsonResponse(data);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

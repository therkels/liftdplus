import { createClient } from "@/utils/supabase/server";

type TopicRow = {
  topic_id: string;
  topic_display: string;
  // posts can be any shape coming from the RPC; treat as unknown and narrow
  posts?: unknown[];
};

function toSlug(title: unknown): string | null {
  if (typeof title !== "string") return null;
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("Feed API: No authenticated user");
    return new Response(JSON.stringify({ error: "Not authenticated." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await supabase.from("event_logs").insert([
    { event_type: "get_feed", details: {}, user_id: user.id },
  ]);
  console.log("Feed API: Authenticated user:", user.id);

  // Optional debug (keep or remove)
  const { data: preferences, error: prefError } = await supabase.rpc(
    "get_user_preferences",
    { user_id: user.id }
  );
  console.log("Feed API: User preferences:", preferences);
  console.log("Feed API: Preferences error:", prefError);

  // Build the feed
  const { data, error } = await supabase.rpc("get_user_feed", {
    user_id: user.id,
  });

  console.log("Feed API: get_user_feed result:", data);
  console.log("Feed API: get_user_feed error:", error);

  if (error) {
    console.error("Feed API: Database error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Feed API: Returning feed with", data?.length || 0, "topics");

  // Ensure each post has a slug (without using `any`)
  const transformedData =
    (data as TopicRow[] | null)?.map((topic) => ({
      topic_id: topic.topic_id,
      topic_display: topic.topic_display,
      posts: Array.isArray(topic.posts)
        ? topic.posts.map((raw) => {
            // Treat each post as a loose record and safely read fields
            const post = raw as Record<string, unknown>;
            const slug =
              (typeof post.slug === "string" && post.slug) ||
              (typeof post.post_slug === "string" && post.post_slug) ||
              toSlug(post.title);

            return { ...post, slug };
          })
        : [],
    })) ?? [];

  return new Response(JSON.stringify({ topics: transformedData }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Use RPC to get tags from private schema
  const { data: tags, error } = await supabase.rpc("get_all_tags");

  if (error) {
    console.error("Error fetching tags:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tagsByCategory = {
    topic:
      tags?.filter((t: { category: string }) => t.category === "topic") || [],
    format:
      tags?.filter((t: { category: string }) => t.category === "format") || [],
    audience:
      tags?.filter((t: { category: string }) => t.category === "audience") ||
      [],
  };

  return new Response(
    JSON.stringify({
      tags: tags || [],
      by_category: tagsByCategory,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

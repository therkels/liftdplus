/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const COLUMNS = `
  id,
  title,
  secondary_title,
  cover_image_url,
  post_template_id,
  author,
  contributor_name,
  source,
  post_status,
  markdown,
  config,
  created_at,
  published_at,
  display_id,
  slug
`;

async function fetchPost(param: string) {
  const supabase = await createClient();

  // slug
  {
    const { data } = await supabase.from("post").select(COLUMNS).eq("slug", param).maybeSingle();
    if (data) return data;
  }
  // display_id
  {
    const { data } = await supabase.from("post").select(COLUMNS).eq("display_id", param).maybeSingle();
    if (data) return data;
  }
  // numeric id
  if (/^\d+$/.test(param)) {
    const { data } = await supabase.from("post").select(COLUMNS).eq("id", Number(param)).maybeSingle();
    if (data) return data;
  }
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  if (!post) notFound();

  return (
    <div style={{ padding: 24 }}>
      <h1>{post.title ?? "Untitled"}</h1>
      {post.secondary_title && <p>{post.secondary_title}</p>}
      <pre style={{ marginTop: 16, background: "#f6f6f6", padding: 12 }}>
        {JSON.stringify({ id: post.id, slug: post.slug, display_id: post.display_id }, null, 2)}
      </pre>
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export default async function PostPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("post")
    .select("*")
    .eq("slug", params.slug)
    .eq("post_status", "publish")
    .single();

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      {post.cover_image_url && (
        <div className="relative w-full h-64 mb-6">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      {post.secondary_title && (
        <h2 className="text-lg text-gray-600 mb-4">{post.secondary_title}</h2>
      )}

      <p className="text-sm text-gray-500 mb-6">
        {post.author_name} • {post.read_time_minutes ?? 5} min read
      </p>

      <article className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content_html || "" }} />
      </article>
    </main>
  );
}

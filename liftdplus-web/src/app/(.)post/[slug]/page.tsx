"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostModal from "@/components/site_core/PostModal";
import PostContent from "@/components/site_core/PostContent";

type Post = any;

async function fetchPost(slug: string) {
  const res = await fetch(`/api/v0/post/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("failed");
  const json = await res.json();
  if (!json?.post) throw new Error("no post");
  return json.post as Post;
}

export default function ModalPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPost(params.slug)
      .then(setPost)
      .catch(() => {
        // If it fails (e.g., auth), just go back so users aren’t stuck
        router.back();
      });
  }, [params.slug, router]);

  return (
    <PostModal
      isOpen={true}
      onClose={() => {
        router.back(); // reveals Explore/Discover/Favorites underneath
      }}
    >
      {post ? <PostContent post={post as any} /> : <div className="p-6">Loading…</div>}
    </PostModal>
  );
}

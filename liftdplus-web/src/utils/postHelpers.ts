"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/** Minimal shape a card has on the Explore page */
type MinimalPost = {
  slug?: string | null;
  display_id?: string | number | null;
  post_id?: string | number | null;
  id?: string | number | null;
};

/** Full shape returned by the API used by PostContent / PostModal */
export type FullPost = {
  post_id: string;
  cover_image_url: string | null;
  title: string;
  secondary_title: string | null;
  author_name: string | null;
  author_photo?: string | null;
  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  content_type: "text" | "image";
  content?: string | null;
  images?: string[];
  slug?: string | null;
  display_id?: number | null;
  // allow passthrough fields without TS whining
  [key: string]: any;
};

/** Fetch the full post, preferring slug; falls back to numeric ids. */
export async function fetchFullPost(input: MinimalPost): Promise<FullPost> {
  const key =
    (input.slug ??
      input.display_id ??
      input.post_id ??
      input.id ??
      "") as string | number;

  if (key === "" || key === null || key === undefined) {
    throw new Error("No key available to fetch post");
  }

  // Always call the SINGULAR route
  const url = `/api/v0/post/${encodeURIComponent(String(key))}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch post");
  const json = (await res.json().catch(() => null)) as { post?: FullPost } | null;
  if (!json?.post) throw new Error("Post missing from API response");
  return json.post;
}

/** Simple modal controller used by cards to open a post */
export function usePostModal() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FullPost | null>(null);

  const openPostModal = useCallback(async (cardPost: MinimalPost) => {
    const full = await fetchFullPost(cardPost);
    setSelectedPost(full);
    setIsModalOpen(true);
    // if (full?.slug) {
    //  router.push(`/post/${full.slug}`, { scroll: false });
  //  }
  }, [router]);

  const closePostModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPost(null);
    router.back();
  }, [router]);

  return { selectedPost, isModalOpen, openPostModal, closePostModal };
}

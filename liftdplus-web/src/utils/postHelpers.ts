"use client";

import { useCallback, useState } from "react";

/** Minimal shape a card has on Explore / Discover */
type MinimalPost = {
  slug?: string | null;
  display_id?: string | number | null;
  post_id?: string | number | null;
  id?: string | number | null;
  // allow passthrough fields
  [key: string]: any;
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

  const urls = [
    `/api/v0/post/${encodeURIComponent(String(key))}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const json = (await res.json().catch(() => null)) as
        | { post?: FullPost }
        | null;

      if (json?.post) return json.post;
    } catch {
      // try next URL
    }
  }

  throw new Error("Failed to fetch post");
}

/** Modal controller: Card + Modal share the *same object* reference. */
export function usePostModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FullPost | null>(null);

  const openPostModal = useCallback(async (cardPost: MinimalPost) => {
    // 1) Open immediately using the card object (same reference as Card)
    setSelectedPost(cardPost as FullPost);
    setIsModalOpen(true);

    try {
      // 2) Fetch full data and merge it into the SAME object
      const full = await fetchFullPost(cardPost);

      const merged = {
        ...cardPost,
        ...full,
        // preserve live interaction state from the card object
        user_liked: (cardPost as any).user_liked,
        user_archived: (cardPost as any).user_archived,
        like_count: (cardPost as any).like_count,
      } as FullPost;

      setSelectedPost({ ...merged });
    } catch (err) {
      console.error("[usePostModal] failed to load full post", err);
    }
  }, []);

  const closePostModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPost(null);
  }, []);

  return { selectedPost, isModalOpen, openPostModal, closePostModal };
}

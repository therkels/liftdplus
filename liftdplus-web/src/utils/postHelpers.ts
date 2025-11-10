"use client";

import { useCallback, useState } from "react";

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
  // Prefer slug; otherwise try display_id; then post_id/id
  const key =
    (input.slug ??
      input.display_id ??
      input.post_id ??
      input.id ??
      "") as string | number;

  if (key === "" || key === null || key === undefined) {
    throw new Error("No key available to fetch post");
  }

  // Always call the SINGULAR route (works in your app)
  const urls = [
    `/api/v0/post/${encodeURIComponent(String(key))}`, // same env
    `https://app.liftdplus.com/api/v0/post/${encodeURIComponent(String(key))}`, // hard fallback to prod
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

/** Simple modal controller used by cards to open a post */
export function usePostModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FullPost | null>(null);

  const openPostModal = useCallback(async (cardPost: MinimalPost) => {
    const full = await fetchFullPost(cardPost);
    setSelectedPost(full);
    setIsModalOpen(true);
  }, []);

  const closePostModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return { selectedPost, isModalOpen, openPostModal, closePostModal };
}

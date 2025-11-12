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

  const url = `/api/v0/post/${encodeURIComponent(String(key))}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch post");
  const json = (await res.json().catch(() => null)) as { post?: FullPost } | null;
  if (!json?.post) throw new Error("Post missing from API response");
  return json.post;
}

/** Controller used by cards to open a post */
export function usePostModal() {
  const router = useRouter();

  // Keep these so existing pages that read them don't break,
  // but we won't actually open the old state-driven modal anymore.
  const [isModalOpen] = useState(false);
  const [selectedPost] = useState<FullPost | null>(null);

  const openPostModal = useCallback(
    async (cardPost: MinimalPost) => {
      // If we already have a slug, just push it.
      if (cardPost.slug) {
        router.push(`/post/${cardPost.slug}`, { scroll: false });
        return;
      }
      // Otherwise fetch to discover a usable key (slug/id) then push.
      const full = await fetchFullPost(cardPost);
      const key = full.slug ?? full.display_id ?? full.post_id ?? full.id;
      router.push(`/post/${encodeURIComponent(String(key))}`, { scroll: false });
    },
    [router]
  );

  const closePostModal = useCallback(() => {
    router.back(); // reveal the listing underneath
  }, [router]);

  return { selectedPost, isModalOpen, openPostModal, closePostModal };
}

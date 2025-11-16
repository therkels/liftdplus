// src/hooks/usePostInteractions.ts
"use client";

import { useState, useCallback } from "react";
import { PostData } from "@/components/site_core/PostContent";
import { Post } from "@/utils/postTransformers";
import {
  likePost,
  unlikePost,
  archivePost,
  unarchivePost,
} from "@/utils/postActions";
import { useToast } from "@/contexts/ToastContext";
import { pageCache } from "@/utils/cache/PageCache";

type PostLike = Post | PostData;

function getNumericPostId(post: PostLike): number | null {
  const rawId =
    (post as any).id ??
    (post as any).post_id ??
    (post as any).display_id ??
    null;

  const id =
    typeof rawId === "number"
      ? rawId
      : rawId !== null
      ? Number(rawId)
      : NaN;

  if (!id || Number.isNaN(id)) {
    console.error("[usePostInteractions] Invalid post id", { post, rawId });
    return null;
  }
  return id;
}

export function usePostInteractions(post: PostLike) {
  const [isLiked, setIsLiked] = useState(post?.user_liked || false);
  const [isArchived, setIsArchived] = useState(post?.user_archived || false);
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleLike = useCallback(async () => {
    if (isLoading) return;

    const id = getNumericPostId(post);
    if (id === null) return;

    const newLikedState = !isLiked;
    const nextCount = newLikedState
      ? likeCount + 1
      : Math.max(0, likeCount - 1);

    setIsLoading(true);

    // optimistic
    setIsLiked(newLikedState);
    setLikeCount(nextCount);

    try {
      const success = newLikedState ? await likePost(id) : await unlikePost(id);

      if (!success) {
        setIsLiked(!newLikedState);
        setLikeCount(likeCount);
        throw new Error("Failed to update like status");
      } else {
        (post as any).user_liked = newLikedState;
        (post as any).like_count = nextCount;
        pageCache.invalidate("search:");
        pageCache.invalidate("feed:");
        pageCache.invalidate("favorites:");
      }
    } catch (error) {
      console.error("Error handling like:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isLoading, likeCount, post]);

  const handleArchive = useCallback(async () => {
    if (isLoading) return;

    const id = getNumericPostId(post);
    if (id === null) return;

    setIsLoading(true);
    const newArchivedState = !isArchived;

    // 🔑 derive the topic/category name for this post
    // Card posts have `topic_tags` as a display string like "Hormonal Changes"
    const topicTag =
      ("topic_tags" in (post as any) && (post as any).topic_tags) ||
      (post as any).category ||
      (post as any).tags?.[0] ||
      "favorites";

    const coverImage =
      (post as any).cover_image_url || null;

    // Optimistic update
    setIsArchived(newArchivedState);

    try {
      const success = newArchivedState
        ? await archivePost(id, topicTag, coverImage) // ✅ pass category + cover image
        : await unarchivePost(id);

      if (!success) {
        setIsArchived(!newArchivedState);
        if (newArchivedState) {
          showError("Failed to save post");
        }
        throw new Error("Failed to update archive status");
      } else {
        (post as any).user_archived = newArchivedState;

        pageCache.invalidate("search:");
        pageCache.invalidate("feed:");
        pageCache.invalidate("favorites:");

        if (newArchivedState) {
          showSuccess(`Saved to ${topicTag}`);
        }
      }
    } catch (error) {
      console.error("Error handling archive:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isArchived, isLoading, post, showError, showSuccess]);

  return {
    isLiked,
    isArchived,
    likeCount,
    isLoading,
    handleLike,
    handleArchive,
  };
}

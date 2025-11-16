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

// Helper: safely extract a numeric post ID from either shape
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

    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(nextCount);

    try {
      const success = newLikedState ? await likePost(id) : await unlikePost(id);

      if (!success) {
        // Revert on failure
        setIsLiked(!newLikedState);
        setLikeCount(likeCount);
        console.error("[usePostInteractions] like/unlike failed for post", id);
        showError("We couldn't update your like. Please try again.");
        return;
      }

      // ✅ Keep the underlying post object in sync
      (post as any).user_liked = newLikedState;
      (post as any).like_count = nextCount;

      // ✅ Invalidate caches so other screens refetch
      pageCache.invalidate("search:");
      pageCache.invalidate("feed:");
      pageCache.invalidate("favorites:");
    } catch (error) {
      console.error("Error handling like:", error);
      showError("We couldn't update your like. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isLoading, likeCount, post, showError]);

  const handleArchive = useCallback(async () => {
    if (isLoading) return;

    const id = getNumericPostId(post);
    if (id === null) return;

    setIsLoading(true);
    const newArchivedState = !isArchived;

    // Derive a human-friendly category name for the toast
    const topicTag =
      ("topic_tags" in (post as any) && (post as any).topic_tags) ||
      (post as any).category ||
      (post as any).tags?.[0] ||
      "favorites";

    // Optimistic update
    setIsArchived(newArchivedState);

    try {
      const success = newArchivedState
        ? await archivePost(id) // 🔹 only pass id (matches postActions.ts)
        : await unarchivePost(id);

      if (!success) {
        // Revert on failure
        setIsArchived(!newArchivedState);
        if (newArchivedState) {
          showError("Failed to save post");
        }
        throw new Error("Failed to update archive status");
      }

      // ✅ Sync underlying object
      (post as any).user_archived = newArchivedState;

      // ✅ Invalidate caches so Favorites etc. update
      pageCache.invalidate("search:");
      pageCache.invalidate("feed:");
      pageCache.invalidate("favorites:");

      if (newArchivedState) {
        showSuccess(`Saved to ${topicTag}`);
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

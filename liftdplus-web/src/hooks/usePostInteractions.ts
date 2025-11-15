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

// Union type to support both Post and PostData
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
        throw new Error("Failed to update like status");
      } else {
        // ✅ Keep the underlying post object in sync
        (post as any).user_liked = newLikedState;
        (post as any).like_count = nextCount;

        console.log(
          "[usePostInteractions] after like",
          { id: getNumericPostId(post), newLikedState, nextCount },
          { post_user_liked: (post as any).user_liked, post_like_count: (post as any).like_count }
        );

        // Invalidate caches so other screens refetch fresh data if needed
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

    // Optimistic update
    setIsArchived(newArchivedState);

    try {
      const success = newArchivedState
        ? await archivePost(id)
        : await unarchivePost(id);

      if (!success) {
        // Revert on failure
        setIsArchived(!newArchivedState);
        if (newArchivedState) {
          showError("Failed to save post");
        }
        throw new Error("Failed to update archive status");
      } else {
        // ✅ Keep the underlying post object in sync
        (post as any).user_archived = newArchivedState;

        pageCache.invalidate("search:");
        pageCache.invalidate("feed:");
        pageCache.invalidate("favorites:");

        if (newArchivedState) {
          const postTopicTag =
            ("topic_tags" in post ? (post as any).topic_tags : post?.tags?.[0]) ||
            "favorites";
          showSuccess(`Saved to ${postTopicTag}`);
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

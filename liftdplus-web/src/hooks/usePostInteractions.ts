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

export function usePostInteractions(post: PostLike) {
  const [isLiked, setIsLiked] = useState(post?.user_liked || false);
  const [isArchived, setIsArchived] = useState(post?.user_archived || false);
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleLike = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newLikedState = !isLiked;

    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      const success = newLikedState
        ? await likePost(post?.post_id || "")
        : await unlikePost(post?.post_id || "");

      if (!success) {
        // Revert on failure
        setIsLiked(!newLikedState);
        setLikeCount((prev) => (newLikedState ? prev - 1 : prev + 1));
        throw new Error("Failed to update like status");
      } else {
        // Invalidate cache on successful like/unlike
        pageCache.invalidate("search:");
        pageCache.invalidate("feed:");
        pageCache.invalidate("favorites:");
      }
    } catch (error) {
      console.error("Error handling like:", error);
      // State already reverted above
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isLoading, post?.post_id]);

  const handleArchive = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newArchivedState = !isArchived;

    // Optimistic update
    setIsArchived(newArchivedState);

    try {
      const success = newArchivedState
        ? await archivePost(post?.post_id || "")
        : await unarchivePost(post?.post_id || "");

      if (!success) {
        // Revert on failure
        setIsArchived(!newArchivedState);
        if (newArchivedState) {
          showError("Failed to save post");
        }
        throw new Error("Failed to update archive status");
      } else {
        // Invalidate cache on successful archive/unarchive
        pageCache.invalidate("search:");
        pageCache.invalidate("feed:");
        pageCache.invalidate("favorites:");

        // Show success message only when saving (not removing)
        if (newArchivedState) {
          // Determine which category the post was saved to based on its tags
          // Handle both Post (with topic_tags) and PostData (with tags array)
          const postTopicTag =
            ("topic_tags" in post ? post.topic_tags : post?.tags?.[0]) ||
            "favorites";
          showSuccess(`Saved to ${postTopicTag}`);
        }
      }
    } catch (error) {
      console.error("Error handling archive:", error);
      // State already reverted above
    } finally {
      setIsLoading(false);
    }
  }, [isArchived, isLoading, post?.post_id]);

  return {
    isLiked,
    isArchived,
    likeCount,
    isLoading,
    handleLike,
    handleArchive,
  };
}

import { useState, useCallback } from "react";
import { Post } from "@/utils/postTransformers";
import {
  likePost,
  unlikePost,
  archivePost,
  unarchivePost,
} from "@/utils/postActions";
import { useToast } from "@/contexts/ToastContext";

export function usePostInteractions(post: Post) {
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
        // Show success message only when saving (not removing)
        if (newArchivedState) {
          // Determine which category the post was saved to based on its topic tags
          const postTopicTag = post?.topic_tags || "favorites";
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

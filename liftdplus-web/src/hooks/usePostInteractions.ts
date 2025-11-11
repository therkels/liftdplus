"use client";

import { useState, useCallback } from "react";
import { PostData } from "@/components/site_core/PostContent";
import { Post } from "@/utils/postTransformers";
import { likePost, unlikePost, archivePost, unarchivePost } from "@/utils/postActions";
import { useToast } from "@/contexts/ToastContext";
import { pageCache } from "@/utils/cache/PageCache";

// Union type to support both Post and PostData
type PostLike = Post | PostData;

export function usePostInteractions(post: PostLike) {
  const [isLiked, setIsLiked] = useState<boolean>(Boolean((post as any)?.user_liked));
  const [isArchived, setIsArchived] = useState<boolean>(Boolean((post as any)?.user_archived));
  const [likeCount, setLikeCount] = useState<number>(Number((post as any)?.like_count || 0));
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // helper to resolve an ID from various post shapes
  const resolveId = () =>
    (post as any)?.post_id ?? (post as any)?.id ?? (post as any)?.display_id;

  const invalidateCaches = () => {
    pageCache.invalidate("search:");
    pageCache.invalidate("feed:");
    pageCache.invalidate("favorites:");
  };

  const handleLike = useCallback(async () => {
    if (isLoading) return;

    const idCandidate = resolveId();
    console.log("❤️ Like click payload", {
  rawPost: post,
  resolvedId: resolveId(),
  post_id: (post as any)?.post_id,
  id: (post as any)?.id,
  display_id: (post as any)?.display_id,
});
    if (!idCandidate) {
      console.warn("❤️ No post id found on post:", post);
      return;
    }

    setIsLoading(true);
    const nextLiked = !isLiked;

    // optimistic update
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const ok = nextLiked ? await likePost(idCandidate) : await unlikePost(idCandidate);
      if (!ok) {
        // revert
        setIsLiked(!nextLiked);
        setLikeCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
        throw new Error("Failed to update like");
      }
      invalidateCaches();
    } catch (e) {
      console.error("Error handling like:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isLoading, post]);

  const handleArchive = useCallback(async () => {
    if (isLoading) return;

    const idCandidate = resolveId();
    console.log("📦 Archive click payload", {
  rawPost: post,
  resolvedId: resolveId(),
  post_id: (post as any)?.post_id,
  id: (post as any)?.id,
  display_id: (post as any)?.display_id,
});
    if (!idCandidate) {
      console.warn("📦 No post id found on post (archive):", post);
      return;
    }

    setIsLoading(true);
    const nextArchived = !isArchived;

    // optimistic update
    setIsArchived(nextArchived);

    try {
      const ok = nextArchived ? await archivePost(idCandidate) : await unarchivePost(idCandidate);
      if (!ok) {
        // revert
        setIsArchived(!nextArchived);
        if (nextArchived) showError("Failed to save post");
        throw new Error("Failed to update archive");
      }

      invalidateCaches();

      if (nextArchived) {
        const postTopicTag =
          ("topic_tags" in (post as any) ? (post as any).topic_tags : (post as any)?.tags?.[0]) ||
          "favorites";
        showSuccess(`Saved to ${postTopicTag}`);
      }
    } catch (e) {
      console.error("Error handling archive:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isArchived, isLoading, post, showError, showSuccess]);

  return { isLiked, isArchived, likeCount, isLoading, handleLike, handleArchive };
}

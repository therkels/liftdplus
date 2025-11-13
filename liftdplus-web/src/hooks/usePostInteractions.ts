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
  const [isLiked, setIsLiked] = useState<boolean>(
    Boolean((post as any)?.user_liked)
  );
  const [isArchived, setIsArchived] = useState<boolean>(
    Boolean((post as any)?.user_archived)
  );
  const [likeCount, setLikeCount] = useState<number>(
    Number((post as any)?.like_count || 0)
  );
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Helper to resolve an ID from various post shapes
  const resolveId = useCallback(
    () =>
      (post as any)?.post_id ??
      (post as any)?.id ??
      (post as any)?.display_id ??
      (post as any)?.postId, // fallback
    [post]
  );

  const invalidateCaches = useCallback(() => {
    pageCache.invalidate("search:");
    pageCache.invalidate("feed:");
    pageCache.invalidate("favorites:");
  }, []);

  const handleLike = useCallback(
    async () => {
      if (isLoading) return;

      // STEP 1 — resolve ID safely
      const rawId = resolveId();
      const id = Number(rawId);

      console.log("❤️ handleLike resolved ID check", {
        rawId,
        id,
        post,
      });

      if (!id || Number.isNaN(id)) {
        console.error("❌ Invalid post id in handleLike:", { rawId, post });
        return;
      }

      setIsLoading(true);

      // STEP 2 — compute new liked state
      const nextLiked = !isLiked;

      // STEP 3 — optimistic UI update
      setIsLiked(nextLiked);
      setLikeCount((prev) =>
        nextLiked ? prev + 1 : Math.max(0, prev - 1)
      );

      try {
        // STEP 4 — call API with guaranteed numeric ID
        const ok = nextLiked ? await likePost(id) : await unlikePost(id);

        if (!ok) {
          // revert UI if backend fails
          setIsLiked(!nextLiked);
          setLikeCount((prev) =>
            !nextLiked ? prev + 1 : Math.max(0, prev - 1)
          );
          throw new Error("Failed to update like status");
        }

        // STEP 5 — refresh cached feed/cards
        invalidateCaches();
      } catch (e) {
        console.error("Error handling like:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [isLiked, isLoading, resolveId, invalidateCaches, post]
  );

  const handleArchive = useCallback(
    async () => {
      if (isLoading) return;

      const idCandidate = resolveId();

      console.log("📦 Archive click payload", {
        rawPost: post,
        resolvedId: idCandidate,
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
        const ok = nextArchived
          ? await archivePost(idCandidate)
          : await unarchivePost(idCandidate);

        if (!ok) {
          // revert
          setIsArchived(!nextArchived);
          if (nextArchived) showError("Failed to save post");
          throw new Error("Failed to update archive");
        }

        invalidateCaches();

        if (nextArchived) {
          const postTopicTag =
            ("topic_tags" in (post as any)
              ? (post as any).topic_tags
              : (post as any)?.tags?.[0]) || "favorites";

          showSuccess(`Saved to ${postTopicTag}`);
        }
      } catch (e) {
        console.error("Error handling archive:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [isArchived, isLoading, resolveId, post, showError, showSuccess, invalidateCaches]
  );

  return { isLiked, isArchived, likeCount, isLoading, handleLike, handleArchive };
}

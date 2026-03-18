"use client";
import { useEffect } from "react";

interface ArticleViewTrackerProps {
  slug: string;
  postId: number;
}

export function ArticleViewTracker({ slug, postId }: ArticleViewTrackerProps) {
  useEffect(() => {
    fetch("/api/v0/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "article_viewed",
        properties: { slug, post_id: postId },
      }),
    }).catch(() => {});
  }, [slug, postId]);

  return null;
}

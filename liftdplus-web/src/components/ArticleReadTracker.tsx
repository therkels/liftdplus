"use client";

import { useEffect } from "react";
import { trackEvent } from "@/utils/analytics";

interface ArticleReadTrackerProps {
  slug: string;
}

export function ArticleReadTracker({ slug }: ArticleReadTrackerProps) {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of milestones) {
        if (pct >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackEvent("article_read", {
            slug,
            depth_percent: milestone,
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}

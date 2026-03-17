"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/analytics";
import { useChecklist, type ChecklistItemId } from "@/hooks/useChecklist";

interface ArticleReadTrackerProps {
  slug: string;
  checklistItemId?: ChecklistItemId;
}

export function ArticleReadTracker({
  slug,
  checklistItemId,
}: ArticleReadTrackerProps) {
  const { markComplete } = useChecklist();
  const startTime = useRef<number>(Date.now());
  const milestoneReached = useRef<Set<number>>(new Set());
  const qualifiedReadFired = useRef(false);
  const hasReached75 = useRef(false);
  const hasReached60s = useRef(false);

  useEffect(() => {
    startTime.current = Date.now();
    const milestones = [25, 50, 75, 100];

    function checkQualifiedRead() {
      if (process.env.NODE_ENV === "development") {
        console.log("[ArticleReadTracker] checkQualifiedRead called", {
          qualifiedReadFired: qualifiedReadFired.current,
          hasReached75: hasReached75.current,
          hasReached60s: hasReached60s.current,
          checklistItemId,
        });
      }
      if (qualifiedReadFired.current) return;
      if (hasReached75.current && hasReached60s.current) {
        qualifiedReadFired.current = true;
        trackEvent("article_read", {
          slug,
          depth_percent: 75,
          qualified_read: true,
        });
        if (checklistItemId) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[ArticleReadTracker] calling markComplete with",
              checklistItemId
            );
          }
          void markComplete(checklistItemId);
        }
      }
    }

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of milestones) {
        if (pct >= milestone && !milestoneReached.current.has(milestone)) {
          milestoneReached.current.add(milestone);
          trackEvent("article_read", {
            slug,
            depth_percent: milestone,
            qualified_read: false,
          });
          if (milestone === 75) {
            hasReached75.current = true;
            checkQualifiedRead();
          }
        }
      }
    }

    // Check time threshold every 5 seconds
    const timer = setInterval(() => {
      const secondsOnPage = Math.round((Date.now() - startTime.current) / 1000);
      if (secondsOnPage >= 60 && !hasReached60s.current) {
        hasReached60s.current = true;
        checkQualifiedRead();
      }
    }, 5000);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, [slug, checklistItemId, markComplete]);

  return null;
}

"use client";

import { useEffect, useState } from "react";

export function useReadArticles(): {
  readSlugs: Set<string>;
  loading: boolean;
} {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/v0/user/read-articles", {
          credentials: "same-origin",
        });
        if (!res.ok) {
          if (!cancelled) {
            setReadSlugs(new Set());
            setLoading(false);
          }
          return;
        }
        const data = (await res.json()) as { slugs?: string[] };
        const list = Array.isArray(data.slugs) ? data.slugs : [];
        if (!cancelled) {
          setReadSlugs(new Set(list));
        }
      } catch {
        if (!cancelled) setReadSlugs(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { readSlugs, loading };
}

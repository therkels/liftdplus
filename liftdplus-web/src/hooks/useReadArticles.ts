"use client";
import { useEffect, useState, useCallback } from "react";

export function useReadArticles(): {
  readSlugs: Set<string>;
  loading: boolean;
  refresh: () => void;
} {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v0/user/read-articles", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) { setReadSlugs(new Set()); setLoading(false); return; }
      const data = (await res.json()) as { slugs?: string[] };
      const list = Array.isArray(data.slugs) ? data.slugs : [];
      setReadSlugs(new Set(list));
    } catch {
      setReadSlugs(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Re-fetch whenever the tab becomes visible again (user returns from reading)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  return { readSlugs, loading, refresh: load };
}

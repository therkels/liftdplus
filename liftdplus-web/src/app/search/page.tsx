"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import Card from "@/components/site_core/Card";
import { buildPostsQueryParams, getSortDisplayName } from "@/utils/tagMapper";
import { Post } from "@/utils/postTransformers";
import { pageCache } from "@/utils/cache/PageCache";

/** Prod-first fetch to avoid preview-origin auth/cors cache weirdness */
async function fetchJSONFromProdFirst(url: string) {
  const urls = [
    `https://app.liftdplus.com${url}`, // prod first
    url,                               // same-origin fallback
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      /* try next */
    }
  }
  return null;
}

type CurrentFilters = {
  sortBy: string;
  audience: string[];
  category: string[];
};

export default function Search() {
  const router = useRouter();

  // auth
  const [user, setUser] = useState<{
    id: string;
    user_metadata?: { avatar_url?: string };
  } | null>(null);

  // ui/state
  const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({
    sortBy: "popular",
    audience: [],
    category: [],
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Auth bootstrap (no risky modules here) */
  useEffect(() => {
    let subscription: { unsubscribe?: () => void } | null = null;

    (async () => {
      const supabase = await createClient();

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        pageCache.invalidate("search:");
      });
      subscription = authSub;
    })();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  /** Load posts with very defensive parsing */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const cacheKey = `search:${JSON.stringify(currentFilters)}:${user.id}`;
        const cached = pageCache.get(cacheKey) as Post[] | null;
        if (cached) {
          setPosts(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const qs = buildPostsQueryParams(currentFilters);
        const data = await fetchJSONFromProdFirst(`/api/v0/posts?${qs}`);

        if (!data) {
          setPosts([]);
          setError("No data returned from server.");
          setLoading(false);
          return;
        }

        // Accept several shapes: [], {posts:[...]}, {topics:[{posts:[]}]}
        let raw: unknown[] = [];
        if (Array.isArray(data)) {
          raw = data;
        } else if (Array.isArray((data as any)?.posts)) {
          raw = (data as any).posts;
        } else if (Array.isArray((data as any)?.topics)) {
          raw = (data as any).topics.flatMap((t: any) => Array.isArray(t?.posts) ? t.posts : []);
        } else {
          // unexpected shape – don’t crash UI
          console.warn("Unexpected /posts shape:", data);
          raw = [];
        }

        const normalized = (raw as Record<string, unknown>[])
          .map((p, i) => ({
            ...(p as any),
            post_id:
              (p as any)?.id?.toString?.() ||
              (p as any)?.post_id?.toString?.() ||
              String(i),
            user_liked: Boolean((p as any)?.user_liked),
            user_archived: Boolean((p as any)?.user_archived),
          })) as Post[];

        pageCache.set(cacheKey, normalized);
        setPosts(normalized);
      } catch (e: any) {
        console.error("Search load error:", e);
        setError(e?.message || "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, currentFilters]);

  /** Not signed in -> gentle prompt */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to search and discover content.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-foreground font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  /** UI */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (kept simple; no icon packages) */}
      <div className="bg-[#f9fafb] border-b border-gray-200 px-4 md:px-0 py-4">
        <div className="flex items-center justify-between">
          <h1
            style={{
              width: "262px",
              height: "34px",
              fontWeight: 700,
              fontStyle: "normal",
              fontSize: "40px",
              letterSpacing: "0.3%",
              verticalAlign: "middle",
              textTransform: "capitalize",
              color: "var(--foreground)",
            }}
          >
            Search
          </h1>

          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Go to profile"
          >
            <img
              src={user?.user_metadata?.avatar_url || "/man.jpg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* Filter summary (read-only for now to avoid modal import) */}
      <div className="bg-[#f9fafb] px-4 md:px-0 py-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Current filters:</span>
          <div className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent">
            {getSortDisplayName(currentFilters.sortBy)}
          </div>
          {currentFilters.audience.map((a) => (
            <div key={a} className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent">
              {a}
            </div>
          ))}
          {currentFilters.category.map((c) => (
            <div key={c} className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent">
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 md:px-0 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button onClick={() => location.reload()} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 py-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-4 bg-gray-300 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="px-4 py-4">
          {posts.length > 0 ? (
            posts.map((content, index) => {
              const key = `search-post-${(content as any).post_id || index}`;
              const slug =
                (content as any).slug ??
                (typeof (content as any).title === "string"
                  ? (content as any).title
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  : null);

              // If we have a slug, link to the canonical /post/[slug]
              return slug ? (
                <Link key={key} href={`/post/${slug}`} className="block">
                  <Card
                    post={{ ...(content as any), slug } as any}
                    readTime={(content as any).secondary_title || "5 min read"}
                    layout="horizontal"
                  />
                </Link>
              ) : (
                // No modal path here (to avoid extra imports); still render the card
                <Card
                  key={key}
                  post={content}
                  readTime={(content as any).secondary_title || "5 min read"}
                  layout="horizontal"
                />
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No posts found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import PostModal from "@/components/site_core/PostModal";
import PostContent from "@/components/site_core/PostContent";
import Card from "@/components/site_core/Card";
import FilterContent from "@/components/site_core/FilterContent";
import { HiOutlineAdjustments } from "react-icons/hi";
import { buildPostsQueryParams, getSortDisplayName } from "@/utils/tagMapper";
import { Post } from "@/utils/postTransformers";
import { pageCache } from "@/utils/cache/PageCache";
import { usePostModal } from "@/utils/postHelpers";

/* ------------------------ prod-first fetch with fallback ------------------------ */
async function fetchJSONFromProdFirst(paths: string[]) {
  // Try each path against prod first, then same-origin
  for (const path of paths) {
    const urls = [
      `https://app.liftdplus.com${path}`, // prod
      path, // same-origin (works on preview or prod)
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        return await res.json();
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

/* ----------------------- tolerant post extraction helper ----------------------- */
function extractPostsFromUnknown(payload: any): any[] {
  if (!payload) return [];

  // Direct array
  if (Array.isArray(payload)) return payload;

  // { posts: [...] }
  if (Array.isArray(payload?.posts)) return payload.posts;

  // { data: [...] } (some APIs use data)
  if (Array.isArray(payload?.data)) return payload.data;

  // { topics: [{ posts: [...] }, ...] }
  if (Array.isArray(payload?.topics)) {
    return payload.topics.flatMap((t: any) => Array.isArray(t?.posts) ? t.posts : []);
  }

  // Deeply nested common edge cases
  // e.g. { result: { posts: [...] } }
  if (Array.isArray(payload?.result?.posts)) return payload.result.posts;

  // If nothing matches, return empty
  return [];
}

/* ---------------------------------- Types ---------------------------------- */
type CurrentFilters = {
  sortBy: string;
  audience: string[];
  category: string[];
};

/* --------------------------------- Page ---------------------------------- */
export default function Search() {
  const router = useRouter();

  // auth
  const [user, setUser] = useState<{
    id: string;
    user_metadata?: { avatar_url?: string };
  } | null>(null);

  // filters + data
  const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({
    sortBy: "popular",
    audience: [],
    category: [],
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // post modal (shared helper fetches full content safely)
  const { selectedPost, isModalOpen, openPostModal, closePostModal } = usePostModal();

  /* ------------------------------ Auth bootstrap ------------------------------ */
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      const supabase = await createClient();

      // 1) initial user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      // 2) live updates with safe cleanup
      const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        pageCache.invalidate("search:");
      });
      subscription = authSub;
    };

    initAuth();
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  /* ------------------------------ Load posts ------------------------------ */
  useEffect(() => {
    if (!user) return; // wait until we know the user

    const loadPosts = async () => {
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

        const queryParams = buildPostsQueryParams(currentFilters);

        // Try /posts first, then fallback to /feed (flatten topics → posts)
        const data = await fetchJSONFromProdFirst([
          `/api/v0/posts?${queryParams}`,
          `/api/v0/feed`,
        ]);

        const extracted = extractPostsFromUnknown(data);

        // Debug once so we can see what's coming back in prod
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.debug("Search API debug", {
            queryParams,
            returnedType: data === null ? "null" : Array.isArray(data) ? "array" : typeof data,
            extractedCount: extracted.length,
            sample: extracted[0] ?? null,
          });
        }

        // Normalize for <Card />
        const normalized = (extracted as Record<string, unknown>[])
          .map((post, index) => ({
            ...(post as any),
            post_id:
              (post as any).id?.toString?.() ||
              (post as any).post_id?.toString?.() ||
              String(index),
            user_liked: Boolean((post as any).user_liked),
            user_archived: Boolean((post as any).user_archived),
          })) as Post[];

        pageCache.set(cacheKey, normalized);
        setPosts(normalized);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [user, currentFilters]);

  /* --------------------------- Filter change handler --------------------------- */
  const handleFiltersUpdate = (newFilters: Record<string, unknown>) => {
    pageCache.invalidate("search:");
    setCurrentFilters((prev) => ({
      ...prev,
      ...(newFilters as CurrentFilters),
    }));
  };

  /* --------------------------- Not signed-in fallback -------------------------- */
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

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HiOutlineAdjustments className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filters</span>
            </button>

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
      </div>

      {/* Filter Summary */}
      <div className="bg-[#f9fafb] px-4 md:px-0 py-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Current filters:</span>

          {/* Sort */}
          <div className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent">
            {getSortDisplayName(currentFilters.sortBy)}
          </div>

          {/* Audience */}
          {currentFilters.audience.map((a) => (
            <div
              key={a}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent"
            >
              {a}
            </div>
          ))}

          {/* Category */}
          {currentFilters.category.map((c) => (
            <div
              key={c}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent"
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 md:px-0 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
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

              return slug ? (
                <Link key={key} href={`/post/${slug}`} className="block">
                  <Card
                    post={{ ...(content as any), slug } as any}
                    readTime={(content as any).secondary_title || "5 min read"}
                    layout="horizontal"
                  />
                </Link>
              ) : (
                <Card
                  key={key}
                  post={content}
                  readTime={(content as any).secondary_title || "5 min read"}
                  layout="horizontal"
                  onClick={() => openPostModal(content)}
                />
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No posts found.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try different filters—or check the console “Search API debug”
                line to confirm the API response shape.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <PostModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <FilterContent
          currentFilters={currentFilters}
          onFiltersUpdate={handleFiltersUpdate}
        />
      </PostModal>

      {/* Post Modal */}
      <PostModal isOpen={isModalOpen} onClose={closePostModal}>
        {selectedPost && <PostContent post={selectedPost as any} />}
      </PostModal>
    </div>
  );
}

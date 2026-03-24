"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import PostModal from "@/components/site_core/PostModal";
import PostContent from "@/components/site_core/PostContent";
import Card from "@/components/site_core/Card";
import FilterContent from "@/components/site_core/FilterContent";
import { HiOutlineAdjustments } from "react-icons/hi";
import { buildPostsQueryParams, getSortDisplayName } from "@/utils/tagMapper";
import type { Post } from "@/utils/postTransformers";
import { pageCache } from "@/utils/cache/PageCache";
import { usePostModal } from "@/utils/postHelpers";

/* ------------------------ prod-first fetch helper ------------------------ */
async function fetchJSONFromProdFirst(url: string) {
  const urls = [
    `https://app.liftdplus.com${url}`, // prod
    url, // same-origin (works on preview or prod too)
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      // try the next one
    }
  }
  return null;
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
    sortBy: "Most Popular",
    audience: [],
    category: [],
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // post modal
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

      // 2) live updates with proper cleanup
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
        // cache key ties to user & filters
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
        const data = await fetchJSONFromProdFirst(`/api/v0/posts?${queryParams}`);
        if (!data) throw new Error("Failed to fetch posts");

        // ---- SMART NORMALIZATION ----
        // Accept any of these shapes:
        // A) [{ posts: [...] }]                 <-- current API
        // B) { posts: [...] }
        // C) { topics: [{ posts: [...] }, ...] }
        // D) [ ...flatPosts ]
        let postsData: unknown[] = [];

        if (Array.isArray(data)) {
          if (
            data.length > 0 &&
            data.every((x) => x && typeof x === "object" && "posts" in (x as any))
          ) {
            postsData = (data as any[]).flatMap((x: any) => x.posts || []);
          } else {
            postsData = data;
          }
        } else if (data && typeof data === "object") {
          if (Array.isArray((data as any).posts)) {
            postsData = (data as any).posts;
          } else if (Array.isArray((data as any).topics)) {
            postsData = (data as any).topics.flatMap(
              (t: { posts?: unknown[] }) => t.posts || []
            );
          }
        }

        // Normalize shape expected by <Card />
        const normalized = (postsData as Record<string, unknown>[])
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
        <div className="max-w-3xl mx-auto">
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
      </div>
    );
  }

  const hasActiveFilters =
    currentFilters.sortBy !== "Most Popular" ||
    currentFilters.audience.length > 0 ||
    currentFilters.category.length > 0;

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
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
          {hasActiveFilters ? (
            <>
              <span className="text-sm text-gray-600">Current filters:</span>

              {currentFilters.sortBy !== "Most Popular" && (
                <div className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent">
                  {getSortDisplayName(currentFilters.sortBy)}
                </div>
              )}

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
            </>
          ) : (
            <span className="text-sm text-gray-500">No filters applied</span>
          )}
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

    // IMPORTANT: use a *single* object so the same reference is shared
    // between the card and the modal.
    const enrichedPost = content as any;
    if (slug) {
      enrichedPost.slug = slug;
    }

    return (
      <Card
        key={key}
        post={enrichedPost}
        readTime={enrichedPost.secondary_title || "5 min read"}
        layout="horizontal"
        onClick={() => openPostModal(enrichedPost)}
      />
    );
  })
) : (

            <div className="text-center py-8">
              <p className="text-gray-600">No posts found matching your filters.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* --------- Modals (mount only when open to avoid portal conflicts) --------- */}

      {/* Filter Modal — mount only when open */}
      {isFilterModalOpen && (
        <PostModal
          isOpen
          onClose={() => setIsFilterModalOpen(false)}
          key="filter-modal"
        >
          <FilterContent
            currentFilters={currentFilters}
            onFiltersUpdate={(nf) => {
              pageCache.invalidate("search:");
              setCurrentFilters((prev) => ({ ...prev, ...(nf as any) }));
              setIsFilterModalOpen(false);
            }}
          />
        </PostModal>
      )}

      {/* Post Modal — mount only when open */}
      {isModalOpen && (
        <PostModal
          isOpen
          onClose={closePostModal}
          showClose
          key="post-modal"
        >
          {selectedPost && <PostContent post={selectedPost as any} />}
        </PostModal>
      )}
      </div>
    </div>
  );
}

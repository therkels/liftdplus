"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { buildPostsQueryParams, getSortDisplayName } from "@/utils/tagMapper";
import { usePostModal } from "@/utils/postHelpers";
import Card from "@/components/site_core/Card";
import PostModal from "@/components/site_core/PostModal";
import PostContent from "@/components/site_core/PostContent";
import FilterContent from "@/components/site_core/FilterContent";
import { HiOutlineAdjustments } from "react-icons/hi";
import { Post } from "@/utils/postTransformers";
import { pageCache } from "@/utils/cache/PageCache";

export default function Search() {
  const router = useRouter();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const {
    selectedPost,
    isModalOpen: isPostModalOpen,
    openPostModal,
    closePostModal,
  } = usePostModal();
  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "popular",
    audience: [] as string[],
    category: [] as string[],
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    user_metadata?: { avatar_url?: string };
  } | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  // Load posts from API
  useEffect(() => {
    if (!user) return;

    const loadPosts = async () => {
      try {
        // Create cache key based on filters and user
        const cacheKey = `search:${JSON.stringify(currentFilters)}:${user?.id}`;

        // Check cache first
        const cachedPosts = pageCache.get(cacheKey) as Post[] | null;
        if (cachedPosts) {
          setPosts(cachedPosts);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const queryParams = buildPostsQueryParams(currentFilters);
        const response = await fetch(`/api/v0/posts?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats
        let postsData: unknown[] = [];
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].posts &&
          Array.isArray(data[0].posts)
        ) {
          // Extract posts from nested structure: [{posts: [...]}]
          postsData = data[0].posts;
        } else if (Array.isArray(data)) {
          // Direct array of posts
          postsData = data;
        } else if (data.posts && Array.isArray(data.posts)) {
          postsData = data.posts;
        } else if (data.topics && Array.isArray(data.topics)) {
          // If it's topic format, flatten the posts
          postsData = data.topics.flatMap(
            (topic: { posts?: unknown[] }) => topic.posts || []
          );
        }

        // Transform posts to ensure they have proper structure
        const transformedPosts = (postsData as Record<string, unknown>[]).map(
          (post, index) => ({
            ...post,
            post_id:
              post.id?.toString() ||
              post.post_id?.toString() ||
              index.toString(),
            user_liked: Boolean(post.user_liked),
            user_archived: Boolean(post.user_archived),
          })
        ) as Post[];

        // Cache the transformed posts before setting state
        pageCache.set(cacheKey, transformedPosts);
        setPosts(transformedPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [user, currentFilters]);

  const handleFiltersUpdate = (newFilters: Record<string, unknown>) => {
    // Invalidate search cache when filters change
    pageCache.invalidate("search:");
    setCurrentFilters(
      newFilters as {
        sortBy: string;
        audience: string[];
        category: string[];
      }
    );
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to search and discover content.
          </p>
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
              lineHeight: "46px",
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>Sorted by: {getSortDisplayName(currentFilters.sortBy)}</span>
          {currentFilters.audience.length > 0 && (
            <span>• Audience: {currentFilters.audience.join(", ")}</span>
          )}
          {currentFilters.category.length > 0 && (
            <span>• Topics: {currentFilters.category.join(", ")}</span>
          )}
          <span>• {posts.length} posts</span>
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
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Cards */}
      {!loading && !error && (
        <div className="px-4 py-4 space-y-3">
          {posts.length > 0 ? (
            posts.map((content, index) => (
              <Card
                key={`search-post-${content.post_id || index}`}
                post={content}
                readTime={content.secondary_title || "5 min read"}
                layout="horizontal"
                onClick={() => openPostModal(content)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No posts found matching your filters.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <PostModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <FilterContent
          currentFilters={currentFilters}
          onFiltersUpdate={handleFiltersUpdate}
        />
      </PostModal>

      <PostModal isOpen={isPostModalOpen} onClose={closePostModal}>
        {selectedPost && <PostContent post={selectedPost} />}
      </PostModal>
    </div>
  );
}

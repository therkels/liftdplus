"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { buildPostsQueryParams, getSortDisplayName } from "@/utils/tagMapper";
import { usePostModal } from "@/utils/postHelpers";
import Card from "@/components/site_core/Card";
import PostModal from "@/components/site_core/PostModal";
import PostContent, { PostData } from "@/components/site_core/PostContent";
import FilterContent from "@/components/site_core/FilterContent";
import { HiOutlineAdjustments } from "react-icons/hi";
import {
  Post,
  transformPost,
  transformPostForModal,
} from "@/utils/postTransformers";

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
  const [user, setUser] = useState<any>(null);

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
    const loadPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the helper to build query parameters with proper tag ID mapping
        const params = buildPostsQueryParams(currentFilters);

        const apiUrl = `/api/v0/posts?${params.toString()}`;
        console.log("Search API call:", apiUrl);
        console.log("Original filters:", currentFilters);

        const response = await fetch(apiUrl);
        console.log("Posts API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Posts API error:", errorText);
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Posts API result:", result);

        // The posts API returns an array with one object containing posts
        const postsData = (result && result[0] && result[0].posts) || [];
        console.log("Extracted posts data:", postsData);

        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        console.error("Error loading posts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load posts"
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [user, currentFilters]);

  const handleFiltersUpdate = (newFilters: any) => {
    setCurrentFilters(newFilters);
  };

  const removeFilter = (type: string, value: string) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [type]: Array.isArray(prev[type as keyof typeof prev])
        ? (prev[type as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          )
        : prev[type as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
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
            Discover
          </h1>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={user?.user_metadata?.avatar_url || "/man.jpg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#f9fafb] px-4 md:px-0 py-6">
        <div className="text-center">
          <p
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Explore More Topics
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--subtext)" }}>
            Use the filter options to narrow your search.
          </p>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full transition-colors"
            style={{
              backgroundColor: "var(--background-light)",
              color: "var(--4c5a58)",
              width: "283px",
              height: "42px",
            }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="6" y1="12" x2="18" y2="12"></line>
              <line x1="9" y1="18" x2="15" y2="18"></line>
            </svg>
            <span className="text-sm">Filter & Sort By</span>
          </button>
        </div>
      </div>

      {/* Current Filters Section */}
      {(currentFilters.sortBy ||
        currentFilters.audience.length > 0 ||
        currentFilters.category.length > 0) && (
        <div className="bg-[#f9fafb] px-4  py-4">
          <h3
            className="text-sm font-medium mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Current Filters
          </h3>
          <div className="flex flex-wrap gap-2 justify-start">
            {/* Sort By Filter */}
            {currentFilters.sortBy && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {getSortDisplayName(currentFilters.sortBy)}
              </span>
            )}

            {/* Audience Filters */}
            {currentFilters.audience.map((filter) => (
              <span
                key={`audience-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
              </span>
            ))}

            {/* Category Filters */}
            {currentFilters.category.map((filter) => (
              <span
                key={`category-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="bg-[#f9fafb] px-4 py-3">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {loading ? "Loading..." : `${posts.length} Results`}
        </h3>
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
            posts.map((content) => (
              <Card
                key={content.post_id}
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "",
    audience: [] as string[],
    category: [] as string[],
    format: [] as string[],
  });

  // Fetch posts from API
  const fetchPosts = async (filters = currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();

      if (filters.audience.length > 0) {
        params.append("audience", filters.audience.join(","));
      }
      if (filters.category.length > 0) {
        params.append("category", filters.category.join(","));
      }
      if (filters.format.length > 0) {
        params.append("format", filters.format.join(","));
      }
      if (filters.sortBy) {
        params.append("sort", filters.sortBy);
      }

      const url = `/api/v0/posts${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle different API response formats
      let postsArray = [];
      if (Array.isArray(data)) {
        // If data is an array, check if it contains objects with posts property
        if (data.length > 0 && data[0].posts !== undefined) {
          postsArray = data[0].posts || [];
        } else {
          // Direct array of posts
          postsArray = data;
        }
      } else {
        // Object with posts property
        postsArray = data.posts || [];
      }

      console.log("Parsed posts array:", postsArray);
      console.log("Posts array length:", postsArray.length);

      setPosts(postsArray);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchPosts(currentFilters);
  }, [currentFilters]);

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

  const handlePostClick = async (post: Post) => {
    try {
      setLoadingPost(true);
      setIsPostModalOpen(true);

      // Set a loading state first
      const loadingPostData: Post = {
        ...post,
        author_name: "Loading...",
        content: "Loading content...",
      };

      setSelectedPost(transformPostForModal(loadingPostData));

      // Fetch the full post data
      const response = await fetch(`/api/v0/posts/${post.post_id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const fullPostData = await response.json();

      if (fullPostData.error) {
        throw new Error(fullPostData.error);
      }

      // Transform the database response to Post format
      const fullPost: Post = {
        post_id: fullPostData.id?.toString() || post.post_id,
        cover_image_url: fullPostData.cover_image_url || post.cover_image_url,
        title: fullPostData.title || post.title,
        secondary_title: fullPostData.secondary_title || post.secondary_title,
        author_name: fullPostData.author_name || "Unknown Author",
        author_photo: fullPostData.author_photo,
        like_count: fullPostData.like_count || 0,
        topic_tag_ids: fullPostData.topic_tags || [],
        topic_tags: Array.isArray(fullPostData.topic_tags)
          ? fullPostData.topic_tags.join(", ")
          : "",
        format_tags: Array.isArray(fullPostData.format_tags)
          ? fullPostData.format_tags.join(", ")
          : "",
        audience_tags: Array.isArray(fullPostData.audience_tags)
          ? fullPostData.audience_tags.join(", ")
          : "",
        content_type: "text",
        content: fullPostData.markdown || "No content available",
      };

      // Update with the full post data
      setSelectedPost(transformPostForModal(fullPost));
    } catch (error) {
      console.error("Error fetching post:", error);

      // Show error in the modal
      const errorPost: Post = {
        ...post,
        author_name: "Error",
        content: `# Error Loading Post\n\nSorry, we couldn't load this post content. Please try again later.\n\n**Error:** ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };

      setSelectedPost(transformPostForModal(errorPost));
    } finally {
      setLoadingPost(false);
    }
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
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
              src="/man.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white px-4 py-6">
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
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full transition-colors mb-3"
            style={{
              backgroundColor: "var(--background-light)",
              color: "var(--foreground)",
              width: "283px",
              height: "42px",
            }}
          >
            <span className="text-sm">Edit Interests</span>
          </button>
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
        currentFilters.category.length > 0 ||
        currentFilters.format.length > 0) && (
        <div className="bg-white px-4 py-4">
          <h3
            className="text-sm font-medium mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Current Filters
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Sort By Filter */}
            {currentFilters.sortBy && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {currentFilters.sortBy}
                <button
                  onClick={() => removeFilter("sortBy", currentFilters.sortBy)}
                  className="ml-2 text-slate-600 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            )}

            {/* Audience Filters */}
            {currentFilters.audience.map((filter) => (
              <span
                key={`audience-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
                <button
                  onClick={() => removeFilter("audience", filter)}
                  className="ml-2 text-slate-600 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            ))}

            {/* Category Filters */}
            {currentFilters.category.map((filter) => (
              <span
                key={`category-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
                <button
                  onClick={() => removeFilter("category", filter)}
                  className="ml-2 text-slate-600 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            ))}

            {/* Format Filters */}
            {currentFilters.format.map((filter) => (
              <span
                key={`format-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
                <button
                  onClick={() => removeFilter("format", filter)}
                  className="ml-2 text-slate-600 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="bg-white px-4 py-3">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {loading ? "Loading..." : `${posts.length} Results`}
        </h3>
      </div>

      {/* Content Cards */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-red-800 font-semibold mb-2">
                Unable to load posts
              </h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchPosts()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : posts.length > 0 ? (
          // Posts list
          posts.map((content) => (
            <Card
              key={content.post_id}
              {...transformPost(content)}
              readTime={content.secondary_title}
              layout="horizontal"
              onClick={() => handlePostClick(content)}
            />
          ))
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              {/* Search icon */}
              <div className="mb-6">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Message */}
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                No posts found
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--subtext)" }}>
                Try adjusting your filters or explore different topics to
                discover new content.
              </p>

              {/* Clear filters button if filters are active */}
              {(currentFilters.sortBy ||
                currentFilters.audience.length > 0 ||
                currentFilters.category.length > 0 ||
                currentFilters.format.length > 0) && (
                <button
                  onClick={() => {
                    setCurrentFilters({
                      sortBy: "",
                      audience: [],
                      category: [],
                      format: [],
                    });
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: "var(--background-light)",
                    color: "var(--foreground)",
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
        {loadingPost && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading post content...</span>
          </div>
        )}
      </PostModal>
    </div>
  );
}

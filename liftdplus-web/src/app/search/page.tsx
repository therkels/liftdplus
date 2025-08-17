"use client";

import { useState } from "react";
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
  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "",
    audience: ["BIPOC"],
    category: ["Stress & Anxiety", "Sleep & Rest"],
    format: [],
  });

  // Mock data for the content cards
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

  const handlePostClick = (post: Post) => {
    const transformed = transformPostForModal(post);
    setSelectedPost(transformed);
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  const discoverContent: Post[] = [
    {
      post_id: "1",
      cover_image_url: "/dandelion.jpg",
      title: "3 Reasons You Should Slow Down Today",
      secondary_title: "5 minute read",
      author_name: "Maya Johnson",
      author_photo: "/woman.jpg",
      like_count: 42,
      topic_tag_ids: ["1", "2"],
      topic_tags: "Wellness",
      format_tags: "Article",
      audience_tags: "BIPOC",
      content_type: "text",
      content:
        "# 3 Reasons You Should Slow Down Today\n\nIn our fast-paced world, taking time to slow down is more important than ever...",
    },
    {
      post_id: "2",
      cover_image_url: "/dino.jpg",
      title: "Staying Soft in the Chaos: A Cannamom's Birthday Story",
      secondary_title: "5 minute read",
      author_name: "Maya Johnson",
      author_photo: "/woman.jpg",
      like_count: 28,
      topic_tag_ids: ["3"],
      topic_tags: "Personal Stories",
      format_tags: "Story",
      audience_tags: "Parents",
      content_type: "text",
      content:
        "# Staying Soft in the Chaos\n\nBeing a parent means finding moments of peace in the beautiful chaos...",
    },
    {
      post_id: "3",
      cover_image_url: "/man.jpg",
      title: "Cannamom Approved: City Park Limeade",
      secondary_title: "2 minute read",
      author_name: "Maya Johnson",
      author_photo: "/woman.jpg",
      like_count: 15,
      topic_tag_ids: ["4"],
      topic_tags: "Recipes",
      format_tags: "Recipe",
      audience_tags: "All",
      content_type: "text",
      content:
        "# City Park Limeade Recipe\n\nThis refreshing limeade is perfect for those summer days...",
    },
    {
      post_id: "4",
      cover_image_url: "/woman.jpg",
      title: "Finding Peace in the Everyday Moments",
      secondary_title: "4 minute read",
      author_name: "Maya Johnson",
      author_photo: "/woman.jpg",
      like_count: 67,
      topic_tag_ids: ["5", "6"],
      topic_tags: "Mindfulness",
      format_tags: "Guide",
      audience_tags: "All",
      content_type: "text",
      content:
        "# Finding Peace in the Everyday Moments\n\nMindfulness doesn't require a meditation cushion...",
    },
    {
      post_id: "5",
      cover_image_url: "/dandelion.jpg",
      title: "The Art of Mindful Living",
      secondary_title: "6 minute read",
      author_name: "Maya Johnson",
      author_photo: "/woman.jpg",
      like_count: 89,
      topic_tag_ids: ["7", "8"],
      topic_tags: "Mindfulness",
      format_tags: "Article",
      audience_tags: "All",
      content_type: "text",
      content:
        "# The Art of Mindful Living\n\nMindful living is about being present in each moment...",
    },
  ];

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

            {/* Format Filters */}
            {currentFilters.format.map((filter) => (
              <span
                key={`format-${filter}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900"
              >
                {filter}
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
          {discoverContent.length} Results
        </h3>
      </div>

      {/* Content Cards */}
      <div className="px-4 py-4 space-y-3">
        {discoverContent.map((content) => (
          <Card
            key={content.post_id}
            {...transformPost(content)}
            readTime={content.secondary_title}
            layout="horizontal"
            onClick={() => handlePostClick(content)}
          />
        ))}
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
      </PostModal>
    </div>
  );
}

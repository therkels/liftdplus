"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiX } from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";
import PostModal from "@/components/site_core/PostModal";
import PostContent, { PostData } from "@/components/site_core/PostContent";
import Card from "@/components/site_core/Card";
import {
  Post,
  transformPost,
  transformPostForModal,
} from "@/utils/postTransformers";

interface FavoriteCategory {
  id: string;
  name: string;
  postCount: number;
  posts: Post[];
}

export default function Favorites() {
  const [selectedCategory, setSelectedCategory] =
    useState<FavoriteCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status and load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = await createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Mock posts data
  const mockPosts: Post[] = [
    {
      post_id: "1",
      cover_image_url: "/dandelion.jpg",
      title: "Better Sleep Habits",
      secondary_title: "A guide to restful nights",
      author_name: "Maya Johnson",
      author_photo: null,
      like_count: 42,
      topic_tag_ids: ["sleep"],
      topic_tags: "Sleep & Rest",
      format_tags: "Guide",
      audience_tags: "Beginner",
      content_type: "text",
      content: "# Better Sleep Habits\n\nThis is a guide to better sleep...",
    },
    {
      post_id: "2",
      cover_image_url: "/dandelion.jpg",
      title: "Managing Daily Stress",
      secondary_title: "Practical stress relief techniques",
      author_name: "Alex Chen",
      author_photo: null,
      like_count: 89,
      topic_tag_ids: ["stress"],
      topic_tags: "Stress & Anxiety",
      format_tags: "Tips",
      audience_tags: "Intermediate",
      content_type: "text",
      content: "# Managing Daily Stress\n\nStress management strategies...",
    },
    {
      post_id: "3",
      cover_image_url: "/dandelion.jpg",
      title: "Intimacy and Connection",
      secondary_title: "Building stronger relationships",
      author_name: "Sarah Wilson",
      author_photo: null,
      like_count: 156,
      topic_tag_ids: ["intimacy"],
      topic_tags: "Intimacy & Libido",
      format_tags: "Article",
      audience_tags: "All Levels",
      content_type: "text",
      content:
        "# Intimacy and Connection\n\nBuilding meaningful connections...",
    },
  ];

  // Mock categories with different post counts
  const categories: FavoriteCategory[] = [
    {
      id: "liked-posts",
      name: "Liked Posts",
      postCount: 36,
      posts: mockPosts,
    },
    {
      id: "sleep-rest",
      name: "Sleep & Rest",
      postCount: 24,
      posts: mockPosts.filter((p) => p.topic_tags === "Sleep & Rest"),
    },
    {
      id: "stress-anxiety",
      name: "Stress & Anxiety",
      postCount: 18,
      posts: mockPosts.filter((p) => p.topic_tags === "Stress & Anxiety"),
    },
    {
      id: "intimacy-libido",
      name: "Intimacy & Libido",
      postCount: 12,
      posts: mockPosts.filter((p) => p.topic_tags === "Intimacy & Libido"),
    },
    {
      id: "hormonal-changes",
      name: "Hormonal Changes",
      postCount: 15,
      posts: mockPosts,
    },
    {
      id: "pain-relief",
      name: "Pain Relief",
      postCount: 8,
      posts: mockPosts,
    },
    {
      id: "focus-creativity",
      name: "Focus & Creativity",
      postCount: 10,
      posts: mockPosts,
    },
  ];

  const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);

  const handleCategoryClick = (category: FavoriteCategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(transformPostForModal(post));
    setIsPostModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to view your favorites.
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
            Favorites
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

      {/* Profile Section */}
      <div className="bg-[#f9fafb] px-4 md:px-0 py-6">
        <div className="flex flex-col items-center md:items-start">



          <span className="text-sm text-gray-600 mt-2">
            {totalPosts} Saved Posts
          </span>
        </div>
      </div>

      {/* Favorites Content */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative h-32">
                <Image
                  src="/dandelion.jpg"
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 bg-white text-left">
                <div className="text-gray-500 text-xs mb-1">
                  {category.postCount} Posts
                </div>
                <div
                  className="font-semibold text-sm"
                  style={{ color: "var(--accent-light)" }}
                >
                  {category.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeCategoryModal}
          />
          <div className="relative bg-white w-full h-full flex flex-col">
            <button
              onClick={closeCategoryModal}
              className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-lg"
              aria-label="Close modal"
            >
              <HiX className="w-5 h-5 text-gray-600" />
            </button>

            <div className="p-6 border-b">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCategory.name}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedCategory.postCount} posts
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.posts.map((post) => (
                  <Card
                    key={post.post_id}
                    {...transformPost(post)}
                    onClick={() => handlePostClick(post)}
                    compact={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      <PostModal isOpen={isPostModalOpen} onClose={closePostModal}>
        {selectedPost && <PostContent post={selectedPost} />}
      </PostModal>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { HiX } from "react-icons/hi";
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

  const user = {
    name: "Jay Johnson",
    profileImage: null,
  };

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

  return (
    <div className="container mx-auto px-4 md:px-0 pt-6 max-w-2xl">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 mb-4"
          style={{ borderColor: "var(--accent-light)" }}
        >
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.name}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <Image
              src="/man.jpg"
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
      </div>

      {/* Favorites Card */}
      <div
        className="rounded-2xl shadow-lg p-6"
        style={{ backgroundColor: "var(--background-light)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Favorites</h1>
          <span className="text-sm text-gray-600">
            {totalPosts} Saved Posts
          </span>
        </div>

        {/* Category Grid */}
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
              <div className="grid grid-cols-2 gap-4">
                {selectedCategory.posts.map((post) => (
                  <Card
                    key={post.post_id}
                    {...transformPost(post)}
                    onClick={() => handlePostClick(post)}
                    compact={true}
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

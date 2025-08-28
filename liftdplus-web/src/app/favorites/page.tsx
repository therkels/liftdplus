"use client";

import { useState, useEffect } from "react";
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

interface FavoriteItem {
  post_id: string;
  post: {
    id: string;
    title: string;
    secondary_title: string;
    cover_image_url: string;
  };
}

interface User {
  id: string;
  username: string;
  profile_icon_url?: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  // Fetch user data and favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data and favorites in parallel
        const [userResponse, favoritesResponse] = await Promise.all([
          fetch("/api/v0/user"),
          fetch("/api/v0/favorites"),
        ]);

        if (!userResponse.ok || !favoritesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [userData, favoritesData] = await Promise.all([
          userResponse.json(),
          favoritesResponse.json(),
        ]);

        if (userData.error) {
          throw new Error(userData.error);
        }
        if (favoritesData.error) {
          throw new Error(favoritesData.error);
        }

        setUser(userData);
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePostClick = async (favoriteItem: FavoriteItem) => {
    try {
      setLoadingPost(true);
      setIsPostModalOpen(true);

      // Set a loading state first
      const loadingPost: Post = {
        post_id: favoriteItem.post.id,
        cover_image_url: favoriteItem.post.cover_image_url,
        title: favoriteItem.post.title,
        secondary_title: favoriteItem.post.secondary_title,
        author_name: "Loading...",
        author_photo: null,
        like_count: 0,
        topic_tag_ids: [],
        topic_tags: "",
        format_tags: "",
        audience_tags: "",
        content_type: "text",
        content: "Loading content...",
      };

      setSelectedPost(transformPostForModal(loadingPost));

      // Fetch the full post data
      const response = await fetch(`/api/v0/posts/${favoriteItem.post.id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const fullPostData = await response.json();

      if (fullPostData.error) {
        throw new Error(fullPostData.error);
      }

      // Transform the database response to Post format
      const fullPost: Post = {
        post_id: fullPostData.id?.toString() || favoriteItem.post.id,
        cover_image_url:
          fullPostData.cover_image_url || favoriteItem.post.cover_image_url,
        title: fullPostData.title || favoriteItem.post.title,
        secondary_title:
          fullPostData.secondary_title || favoriteItem.post.secondary_title,
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
        post_id: favoriteItem.post.id,
        cover_image_url: favoriteItem.post.cover_image_url,
        title: favoriteItem.post.title,
        secondary_title: favoriteItem.post.secondary_title,
        author_name: "Error",
        author_photo: null,
        like_count: 0,
        topic_tag_ids: [],
        topic_tags: "",
        format_tags: "",
        audience_tags: "",
        content_type: "text",
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

  const removeFavorite = async (postId: string) => {
    try {
      const response = await fetch("/api/v0/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.post.id !== postId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-6 max-w-2xl">
        {/* Loading Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-4"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>

        {/* Loading Favorites Card */}
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-48 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-6 max-w-2xl">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 font-semibold mb-2">
              Unable to load favorites
            </h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-6 max-w-2xl">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 mb-4"
          style={{ borderColor: "var(--accent-light)" }}
        >
          {user?.profile_icon_url ? (
            <Image
              src={user.profile_icon_url}
              alt={user.username}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <Image
              src="/man.jpg"
              alt={user?.username || "User"}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {user?.username || "User"}
        </h2>
      </div>

      {/* Favorites Card */}
      <div
        className="rounded-2xl shadow-lg p-6"
        style={{ backgroundColor: "var(--background-light)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Favorites</h1>
          <span className="text-sm text-gray-600">
            {favorites.length} Saved Posts
          </span>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-gray-800 font-semibold mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 text-sm">
                Start exploring posts and save your favorites to see them here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex"
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={favorite.post.cover_image_url || "/dandelion.jpg"}
                    alt={favorite.post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4 flex justify-between items-center">
                  <div
                    className="cursor-pointer flex-1"
                    onClick={() => handlePostClick(favorite)}
                  >
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">
                      {favorite.post.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {favorite.post.secondary_title}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFavorite(favorite.post.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
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

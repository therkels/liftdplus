"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HiX } from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";
import PostModal from "@/components/site_core/PostModal";
import PostContent, { PostData } from "@/components/site_core/PostContent";
import Card from "@/components/site_core/Card";
import { Post, transformPostForModal } from "@/utils/postTransformers";
import {
  getArchiveCategories,
  getArchivedPosts,
  getLikedPosts,
  getUniqueSavedPostsCount,
  ArchiveCategory,
} from "@/utils/postActions";
import { pageCache } from "@/utils/cache/PageCache";
import Link from "next/link";

interface FavoriteCategory {
  id: string;
  name: string;
  postCount: number;
  posts: Post[];
  coverImage: string | null;
}

export default function Favorites() {
  const router = useRouter();
  import { usePathname } from "next/navigation";
// ...
const pathname = usePathname();
useEffect(() => {
  // Will print whenever the URL path actually changes
  console.log("[PATHNAME]", pathname);
}, [pathname]);

  const [categories, setCategories] = useState<FavoriteCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<FavoriteCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    user_metadata?: { avatar_url?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniquePostsCount, setUniquePostsCount] = useState(0);

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

  // Load archive categories when user is available
  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    // Create cache key for favorites data
    const cacheKey = `favorites:${user?.id}`;

    // Check cache first
    const cachedData = pageCache.get(cacheKey) as {
      categories: FavoriteCategory[];
      uniqueCount: number;
    } | null;
    if (cachedData) {
      setCategories(cachedData.categories);
      setUniquePostsCount(cachedData.uniqueCount);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);
    setError(null);

    try {
      const [archiveCategories, likedPosts, uniqueCount] = await Promise.all([
        getArchiveCategories(),
        getLikedPosts(),
        getUniqueSavedPostsCount(),
      ]);

      // Define the 6 core interests (excluding "I'm Not Sure Yet" and "Cannabis 101")
      const coreInterests = [
        "Sleep & Rest",
        "Stress & Anxiety",
        "Intimacy & Libido",
        "Hormonal Changes",
        "Pain Relief",
        "Focus & Creativity",
      ];

      // Create a map of existing archive categories for quick lookup
      const archiveCategoryMap = new Map(
        archiveCategories.map((cat: ArchiveCategory) => [cat.category, cat])
      );

      // Create favorite categories for core interests only
      const favoriteCategories: FavoriteCategory[] = coreInterests.map(
        (categoryName) => {
          const existingCategory = archiveCategoryMap.get(categoryName);
          return {
            id: categoryName.toLowerCase().replace(/\s+/g, "-"),
            name: categoryName,
            postCount: existingCategory?.cat_count || 0,
            posts: [], // Will be loaded when category is selected
            coverImage: existingCategory?.cover_image_url || null, // null for empty categories
          };
        }
      );

      // Add liked posts as a special category (always show, even if empty)
      // Use the same thumbnail logic as archive categories - first post's cover image
      const likedCoverImage =
        likedPosts.length > 0
          ? likedPosts[0]?.cover_image_url || "/dandelion.jpg"
          : null;

      favoriteCategories.unshift({
        id: "liked-posts",
        name: "Liked Posts",
        postCount: likedPosts.length,
        posts: likedPosts,
        coverImage: likedCoverImage, // Use first liked post's cover image
      });

      // Cache the favorites data before setting state
      pageCache.set(cacheKey, {
        categories: favoriteCategories,
        uniqueCount: uniqueCount,
      });

      setCategories(favoriteCategories);
      setUniquePostsCount(uniqueCount);
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Failed to load categories. Please try again.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadCategoryPosts = async (category: FavoriteCategory) => {
    // Create cache key for category posts
    const cacheKey = `favorites-posts:${category.id}:${user?.id}`;

    // Check cache first
    const cachedPosts = pageCache.get(cacheKey) as Post[] | null;
    if (cachedPosts) {
      const updatedCategory = { ...category, posts: cachedPosts };
      setSelectedCategory(updatedCategory);
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);

    try {
      let posts: Post[] = [];

      if (category.id === "liked-posts") {
        // Posts are already loaded for liked posts
        posts = category.posts;
      } else {
        // Load archived posts for this category
        posts = await getArchivedPosts(category.name);
      }

      // Cache the posts before setting state
      pageCache.set(cacheKey, posts);

      // Update the category with loaded posts
      const updatedCategory = {
        ...category,
        posts: posts,
      };

      setSelectedCategory(updatedCategory);
    } catch (error) {
      console.error("Error loading category posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCategoryClick = async (category: FavoriteCategory) => {
    setIsCategoryModalOpen(true);
    await loadCategoryPosts(category);
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

  // Optional nicety: revert the browser URL when closing a post modal
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
  }
};


  // Use the accurate unique posts count from the database
  const totalPosts = uniquePostsCount;

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

      {/* Profile Section */}
      <div className="bg-[#f9fafb] px-4 md:px-0 py-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-sm text-gray-600 mt-2">
            {totalPosts} Saved Posts
          </span>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {/* Favorites Content */}
      <div className="px-4 py-4">
        {categoriesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative h-32">
                  {category.coverImage ? (
                    <Image
                      src={category.coverImage}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: "#475a6b" }}
                    />
                  )}
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
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeCategoryModal}
          />
          <div className="relative bg-white w-full h-full flex flex-col">
            <button
              onClick={closeCategoryModal}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-accent hover:bg-accent/90 transition-all duration-200 shadow-lg"
              aria-label="Close modal"
            >
              <HiX className="w-7 h-7 text-foreground" />
            </button>

            <div className="p-6 border-b">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCategory?.name || "Loading..."}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedCategory?.postCount || 0} posts
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </div>
              ) : selectedCategory?.posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No posts in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {selectedCategory?.posts.map((post) => {
                  const safeSlug =
                    post.slug ??
                    (typeof (post as any).title === "string"
                     ? (post as any).title
                     .toLowerCase()
                     .trim()
                     .replace(/\s+/g, "-")
                     .replace(/[^a-z0-9-]/g, "")
                    : String(post.post_id));

  return (
    <Link
      key={post.post_id}
      href={`/post/${safeSlug}`}
      onClick={() => handlePostClick(post)}
      className="block"
    >
      <Card post={post} compact={false} />
    </Link>
  );
})}


                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    {/* Post Modal — only render when open */}
      {isPostModalOpen && selectedPost && (
      <PostModal isOpen onClose={closePostModal}>
        <PostContent post={selectedPost} />
      </PostModal>
    )}
  
    </div>
  );
}

import { useState } from "react";
import { PostData } from "@/components/site_core/PostContent";
import { Post } from "@/utils/postTransformers";

/**
 * Fetches full post content and transforms it for the PostContent modal
 * @param post - The basic post data from search/feed results
 * @returns Promise<PostData> - Full post data with markdown content
 */
export async function fetchFullPostContent(post: Post): Promise<PostData> {
  console.log("Fetching full post content for:", post.post_id);
  
  // Fetch the full post content
  const response = await fetch(`/api/v0/posts/${post.post_id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log("Full post data:", result);
  
  const fullPost = result.post;
  
  if (!fullPost) {
    throw new Error("Post not found");
  }
  
  // Transform the full post data to match PostData interface
  const transformedPost: PostData = {
    post_id: fullPost.id?.toString() || post.post_id,
    cover_image_url: fullPost.cover_image_url || post.cover_image_url,
    title: fullPost.title || post.title,
    secondary_title: fullPost.secondary_title || post.secondary_title,
    author_name: fullPost.author_name || post.author_name,
    author_photo: fullPost.author_photo || post.author_photo,
    like_count: fullPost.like_count || post.like_count,
    tags: [
      ...(Array.isArray(fullPost.topic_tags)
        ? fullPost.topic_tags
        : [fullPost.topic_tags].filter(Boolean)),
      ...(Array.isArray(fullPost.format_tags)
        ? fullPost.format_tags
        : [fullPost.format_tags].filter(Boolean)),
      ...(Array.isArray(fullPost.audience_tags)
        ? fullPost.audience_tags
        : [fullPost.audience_tags].filter(Boolean)),
    ].filter(Boolean),
    content_type: "text",
    content: fullPost.markdown || "", // This is the key field we need!
    images: [],
  };
  
  return transformedPost;
}

/**
 * Handles post click with error handling and modal opening
 * @param post - The post to open
 * @param setSelectedPost - State setter for selected post
 * @param setIsModalOpen - State setter for modal visibility
 */
export async function handlePostClick(
  post: Post,
  setSelectedPost: (post: PostData | null) => void,
  setIsModalOpen: (open: boolean) => void
): Promise<void> {
  try {
    const fullPost = await fetchFullPostContent(post);
    setSelectedPost(fullPost);
    setIsModalOpen(true);
  } catch (error) {
    console.error("Error fetching post content:", error);
    alert("Failed to load post content. Please try again.");
  }
}

/**
 * Custom hook for post modal management
 * @returns Object with modal state and handlers
 */
export function usePostModal() {
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPostModal = async (post: Post) => {
    await handlePostClick(post, setSelectedPost, setIsModalOpen);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return {
    selectedPost,
    isModalOpen,
    openPostModal,
    closePostModal,
  };
}

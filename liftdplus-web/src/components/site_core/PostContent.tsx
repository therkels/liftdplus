"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  post_id: string;
  cover_image_url: string;
  title: string;
  secondary_title: string;
  author_name: string;
  author_photo?: string;
  like_count: number;
  user_liked: boolean;
  user_archived: boolean;
  tags: string[];
  content_type: PostContentType;
  content?: string;             // Markdown (for text posts)
  images?: string[];            // Slides from API (for image posts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;                 // Optional JSONB with { images: string[] }
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // --- Normalize slides (no reordering, no auto-inject cover) ---
  const apiImages = Array.isArray(post.images) ? post.images : [];
  const cfgImages = Array.isArray(post.config?.images) ? post.config.images : [];
  const slides = apiImages.length ? apiImages : (cfgImages.length ? cfgImages : (post.cover_image_url ? [post.cover_image_url] : []));

  if (process.env.NODE_ENV !== "production") {
    console.log("PostContent normalized images:", slides.length, slides);
  }

  return <PostContentCarousel post={{ ...(post as any), images: slides }} />;
};

export default PostContent;

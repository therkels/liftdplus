"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  post_id: string | number;
  title: string;
  secondary_title?: string;
  author_name?: string;
  author_photo?: string;
  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  content_type: PostContentType;
  content?: string | null;           // markdown for text posts
  cover_image_url?: string | null;   // not auto-used by carousel
  images?: string[];                 // preferred source for carousels
  // optional raw config coming from API (we only read config.images if images missing)
  config?: { images?: string[] };
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // Text article
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // Image carousel
  if (post.content_type === "image") {
    // Pass through exactly what we have. If API didn't flatten, fall back to config.images.
    const images =
      Array.isArray(post.images) && post.images.length > 0
        ? post.images
        : Array.isArray(post.config?.images)
        ? (post.config!.images as string[])
        : [];

    return <PostContentCarousel post={{ ...post, images }} />;
  }

  // Fallback (shouldn't happen)
  return <PostContentBase post={post} />;
};

export default PostContent;

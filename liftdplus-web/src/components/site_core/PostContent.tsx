"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  id?: string | number;
  post_id?: string | number;
  title: string;
  secondary_title?: string | null;
  author_name?: string | null;
  author_photo?: string | null;
  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  content_type: PostContentType;
  content?: string | null;
  cover_image_url?: string | null;
  images?: string[];
  config?: any;
}

interface PostContentProps {
  // Some APIs return { post: {...} }, others just {...}
  post: PostData | { post: PostData };
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // If wrapped in "post", unwrap it
  const data = (post as any).post ?? post;

  // Handle text posts
  if (data.content_type === "text") {
    return <PostContentBase post={data} />;
  }

  // Handle image carousels
  if (data.content_type === "image") {
    let images: string[] = [];

    // 1️⃣ Prefer flattened top-level images array
    if (Array.isArray(data.images) && data.images.length > 0) {
      images = data.images;
    }

    // 2️⃣ Otherwise, check for config.images (object or string)
    else if (data.config) {
      try {
        const raw = typeof data.config === "string" ? JSON.parse(data.config) : data.config;
        if (Array.isArray(raw?.images)) {
          images = raw.images;
        }
      } catch (err) {
        console.warn("Error parsing config.images:", err);
      }
    }

    return <PostContentCarousel post={{ ...data, images }} />;
  }

  // Fallback
  return <PostContentBase post={data} />;
};

export default PostContent;

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
  // If text:
  content?: string; // markdown
  // If image carousel:
  images?: string[];
  // Some posts might still carry raw config from Supabase:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // 1) blog/text posts
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // 2) image/carousel posts — use ONLY what’s provided, do NOT auto-prepend cover
  if (post.content_type === "image") {
    const apiImages = Array.isArray((post as any).images)
      ? ((post as any).images as string[])
      : [];

    const cfgImages = Array.isArray((post as any).config?.images)
      ? ((post as any).config.images as string[])
      : [];

    const slides = apiImages.length ? apiImages : cfgImages;

    return <PostContentCarousel post={{ ...(post as any), images: slides }} />;
  }

  // Fallback (shouldn’t hit)
  return null;
};

export default PostContent;

"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  post_id: string | number;
  cover_image_url?: string | null;
  title: string;
  secondary_title?: string | null;
  author_name?: string | null;
  author_photo?: string | null;
  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  content_type: PostContentType;
  content?: string | null;        // markdown for blog posts
  images?: string[];              // we will pass an ordered, ready-to-render array here
  // allow passthrough for legacy shapes
  [key: string]: any;
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // Text/blog posts
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // Image/carousel posts
  if (post.content_type === "image") {
    // Prefer API-flattened images, else fall back to config.images
    const apiImages = Array.isArray((post as any).images) ? ((post as any).images as string[]) : [];
    const cfgImages =
      !apiImages.length && Array.isArray((post as any).config?.images)
        ? ((post as any).config.images as string[])
        : [];

    // Build the exact slide order ONCE (cover first, then the rest)
    const slides: string[] = [
      ...(post.cover_image_url ? [post.cover_image_url] : []),
      ...(apiImages.length ? apiImages : cfgImages),
    ].filter(Boolean) as string[];

    return <PostContentCarousel post={{ ...(post as any), images: slides }} />;
  }

  // Fallback (shouldn't normally hit)
  return <PostContentBase post={post} />;
};

export default PostContent;

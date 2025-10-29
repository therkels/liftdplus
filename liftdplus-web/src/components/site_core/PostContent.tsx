"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  post_id?: string | number;
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
  content?: string | null;        // markdown (for blog posts)
  images?: string[];              // flattened list from API
  config?: { images?: string[] } | null; // raw JSON fallback for carousels
}

interface PostContentProps {
  post: PostData;
}

/** Build the image list for carousels (cover first, then images; no dupes). */
function buildCarouselSlides(post: PostData): string[] {
  const apiImages = Array.isArray(post.images) ? post.images : [];
  const cfgImages =
    !apiImages.length && post.config && Array.isArray(post.config.images)
      ? post.config.images
      : [];

  const slides = [
    ...(post.cover_image_url ? [post.cover_image_url] : []),
    ...(apiImages.length ? apiImages : cfgImages),
  ];

  // de-dupe and drop empties
  return slides.filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i);
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // default: image/carousel
  const slides = buildCarouselSlides(post);
  return <PostContentCarousel post={{ ...post, images: slides }} />;
};

export default PostContent;

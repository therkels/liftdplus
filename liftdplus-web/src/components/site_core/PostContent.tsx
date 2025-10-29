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
  content?: string; // Markdown
  images?: string[];
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // inside PostContent component, where we choose which renderer to use…
if (post.content_type === "image") {
  // 1) Prefer images already normalized on the post
  const apiImages = Array.isArray((post as any).images) ? (post as any).images as string[] : [];

  // 2) Fallback to config.images if someone saved JSON but the API didn’t flatten
  const cfgImages =
    !apiImages.length && Array.isArray((post as any).config?.images)
      ? ((post as any).config.images as string[])
      : [];

  // 3) Build the exact order we want the carousel to show
  const slides: string[] = [
    ...(post.cover_image_url ? [post.cover_image_url] : []), // slide 1 = cover
    ...(apiImages.length ? apiImages : cfgImages),           // slide 2+ from images
  ];

 // 4) Hand the ready-to-render slides to the carousel
return <PostContentCarousel post={{ ...(post as any), images: slides }} />;
}

export default PostContent;

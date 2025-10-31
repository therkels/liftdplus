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
  content?: string;    // Markdown
  images?: string[];   // already in the right order from the page fetch
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  if (post.content_type === "image") {
    // We assume `post.images` ALREADY includes the cover as index 0.
    const slides = Array.isArray(post.images) ? post.images : [];
    return <PostContentCarousel post={{ ...post, images: slides }} />;
  }

  return null;
};

export default PostContent;

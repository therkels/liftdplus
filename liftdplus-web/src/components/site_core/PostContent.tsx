"use client";

import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  id?: number | string;
  post_id?: string;
  title?: string;
  secondary_title?: string;
  author_name?: string;
  author_photo?: string;
  cover_image_url?: string;
  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  content_type: PostContentType;
  content?: string | null;        // Markdown for text posts
  images?: string[] | null;       // For carousels (optional)
  // Allow anything else from the API without narrowing it away
  [key: string]: any;
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // Image carousel (pass the post through untouched)
  if (post.content_type === "image") {
    return <PostContentCarousel post={post} />;
  }

  // Fallback (shouldn't happen)
  return <PostContentBase post={post} />;
};

export default PostContent;

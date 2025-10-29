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
  content?: string;        // Markdown
  images?: string[];       // slides AFTER the cover
  // config is optional but may exist on API object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // Image/carousel post
  const apiImages = Array.isArray(post.images) ? post.images : [];
  // Fallback to config.images if API didn’t flatten them
  const cfgImages =
    !apiImages.length && Array.isArray((post as any)?.config?.images)
      ? ((post as any).config.images as string[])
      : [];

  const imagesWithoutCover = apiImages.length ? apiImages : cfgImages;

  return (
    <PostContentCarousel
      // Hand the carousel ONLY slides after the cover
      post={{ ...post, images: imagesWithoutCover }}
    />
  );
};

export default PostContent;

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
  content?: string;        // markdown (for text posts)
  images?: string[];       // for image posts
  // keep config in case some records still store slides there
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
}

interface PostContentProps {
  post: PostData;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // Text/blog posts
  if (post.content_type === "text") {
    return <PostContentBase post={post} />;
  }

  // Image/carousel posts — build slides safely:
  // 1) prefer `post.images`
  // 2) else `post.config.images`
  // 3) else, if nothing at all, fall back to a single slide using the cover (to avoid blanks)
  if (post.content_type === "image") {
    const apiImages = Array.isArray((post as any).images)
      ? ((post as any).images as string[]).filter(Boolean)
      : [];

    const cfgImages = Array.isArray((post as any).config?.images)
      ? ((post as any).config.images as string[]).filter(Boolean)
      : [];

    let slides = apiImages.length ? apiImages : cfgImages;

    if (!slides.length && post.cover_image_url) {
      slides = [post.cover_image_url]; // only as a last resort; we are NOT auto-prepending
    }

    return <PostContentCarousel post={{ ...(post as any), images: slides }} />;
  }

  return null;
};

export default PostContent;

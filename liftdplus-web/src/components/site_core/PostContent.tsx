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
  config?: any; // may be object or stringified JSON
}

interface PostContentProps {
  // Your API returns { post: {...} }, but other codepaths might pass {...} directly
  post: PostData | { post: PostData };
}

function normalizeConfigImages(cfg: any): string[] {
  if (!cfg) return [];
  try {
    const parsed = typeof cfg === "string" ? JSON.parse(cfg) : cfg;
    const arr = Array.isArray(parsed?.images) ? parsed.images : [];
    return arr
      .filter(Boolean)
      .map((s: unknown) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function PostContent({ post }: PostContentProps) {
  // unwrap if shape is { post: {...} }
  const data: PostData = (post as any)?.post ?? (post as any);

  if (data.content_type === "text") {
    return <PostContentBase post={data} />;
  }

  if (data.content_type === "image") {
    // Prefer top-level images first (your API already provides this)
    let images: string[] = Array.isArray(data.images) ? data.images : [];

    // Trim & sanitize
    images = images
      .filter(Boolean)
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    // Fallback to config.images if top-level empty
    if (!images.length) {
      images = normalizeConfigImages(data.config);
    }

    return <PostContentCarousel post={{ ...data, images }} />;
  }

  // Fallback: render as text
  return <PostContentBase post={data} />;
}

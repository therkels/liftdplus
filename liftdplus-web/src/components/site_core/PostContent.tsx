"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ArticleGuidanceCTA from "@/components/resources/ArticleGuidanceCTA";
import ArticleReadNextFromMarkdown from "@/components/resources/ArticleReadNextFromMarkdown";
import { getRelatedArticlesByTopic } from "@/actions/articleRelated";
import {
  prepareArticleMarkdown,
  type ParsedRelatedArticle,
} from "@/lib/markdown/articleMarkdownCleanup";
import PostContentBase from "./PostContentBase";
import PostContentCarousel from "./PostContentCarousel";

export type PostContentType = "text" | "image";

export interface PostData {
  // minimal fields the card already passes
  post_id: string | number;
  slug?: string;
  display_id?: string | number;

  title: string;
  secondary_title: string;
  cover_image_url?: string;

  author_name?: string;
  author_photo?: string;

  like_count?: number;
  user_liked?: boolean;
  user_archived?: boolean;
  tags?: string[];
  post_tag?: {
    tag_id?: string;
    tag?: { display_name?: string; category?: string };
  }[];

  // what may be missing when the modal opens
  content_type: PostContentType;
  content?: string;          // for text posts
  images?: string[];         // for image/carousel posts

  // backend may send a config blob with images, etc.
  config?: any;
}

/* ---------- helpers ---------- */

function normalizeAuthorPhoto(p: any): string | undefined {
  return (
    p?.author_photo ??
    p?.author_photo_url ??
    p?.author?.photo ??
    p?.author?.photo_url ??
    undefined
  );
}

function normalizeImages(p: any): string[] {
  const cfgImages = Array.isArray(p?.config?.images) ? p.config.images : [];
  const cover = p?.cover_image_url ? [p.cover_image_url] : [];
  // cover should be first slide
  return [...cover, ...cfgImages];
}

async function fetchFullPost(keys: {
  slug?: string;
  display_id?: string | number;
  id?: string | number;
}) {
  // Prefer slug, then display_id, then id
  const key =
    (typeof keys.slug === "string" && keys.slug) ??
    (keys.display_id != null ? String(keys.display_id) : undefined) ??
    (keys.id != null ? String(keys.id) : undefined);

  if (!key) return null;

  const urls = [`/api/v0/post/${encodeURIComponent(key)}`];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      const post = json?.post;
      if (!post) continue;

      return {
        ...post,
        author_photo: normalizeAuthorPhoto(post),
        images: normalizeImages(post),
      };
    } catch {
      // try next URL
    }
  }

  return null;
}

/* ---------- component ---------- */

const PostContent: React.FC<{
  post: PostData;
  showShare?: boolean;
  showGuidanceFooter?: boolean;
}> = ({ post, showShare = true, showGuidanceFooter = false }) => {
  const [fullPost, setFullPost] = useState<PostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ParsedRelatedArticle[]>(
    []
  );

  const needsFetch = useMemo(() => {
    // If text but no content, or image but no images, we need to fetch the full post
    if (post.content_type === "text") return !post.content;
    if (post.content_type === "image")
      return !post.images || post.images.length === 0;
    return false;
  }, [post]);

  useEffect(() => {
    let cancelled = false;

    async function go() {
      setError(null);

      // Case 1: card already has everything – just normalize ON THE SAME OBJECT
      if (!needsFetch) {
        // ✅ Mutate the incoming post object so Card + Modal share the same reference
        const normalized = Object.assign(post as any, {
          author_photo: post.author_photo ?? normalizeAuthorPhoto(post),
          images:
            post.content_type === "image"
              ? post.images && post.images.length > 0
                ? post.images
                : normalizeImages(post)
              : post.images,
        }) as PostData;

        if (!cancelled) setFullPost(normalized);
        return;
      }

      // Case 2: we need to fetch the full post from the API
      const loaded = await fetchFullPost({
        slug: post.slug,
        display_id: post.display_id,
        id: post.post_id,
      });

      if (cancelled) return;

      if (!loaded) {
        setError("Failed to load post content. Please try again.");
        setFullPost(null);
        return;
      }

      // Merge server data into the SAME post object
      // We still prefer the card's user_liked / user_archived / like_count
      const merged = Object.assign(post as any, loaded, {
        author_photo:
          post.author_photo ??
          loaded.author_photo ??
          normalizeAuthorPhoto(loaded),
        images:
          post.content_type === "image"
            ? post.images && post.images.length > 0
              ? post.images
              : normalizeImages(loaded)
            : loaded.images ?? post.images,
        user_liked:
          typeof post.user_liked === "boolean"
            ? post.user_liked
            : loaded.user_liked,
        user_archived:
          typeof post.user_archived === "boolean"
            ? post.user_archived
            : loaded.user_archived,
        like_count:
          typeof post.like_count === "number"
            ? post.like_count
            : loaded.like_count,
      }) as PostData;

      console.log("[PostContent] merge", {
        id: post.post_id,
        card_user_liked: post.user_liked,
        loaded_user_liked: loaded.user_liked,
        merged_user_liked: merged.user_liked,
      });

      if (!cancelled) {
        // merged === post here, but using merged keeps it explicit
        setFullPost(merged);
      }
    }

    go();

    return () => {
      cancelled = true;
    };
  }, [needsFetch, post]);

  useEffect(() => {
    const topicTag = fullPost?.post_tag?.find(
      (pt) => pt.tag?.category === "topic"
    )?.tag?.display_name;

    console.log("Primary topic:", topicTag);

    if (fullPost?.slug && topicTag) {
      getRelatedArticlesByTopic(fullPost.slug, topicTag, 3).then(
        setRelatedArticles
      );
    } else {
      setRelatedArticles([]);
    }
  }, [fullPost?.slug, fullPost?.post_tag]);

  const handleShareClick = useCallback(async () => {
    if (!fullPost) return;

    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";

    const postKey =
      fullPost.slug ??
      (fullPost.display_id != null ? String(fullPost.display_id) : undefined) ??
      (fullPost.post_id != null ? String(fullPost.post_id) : undefined);

    if (!postKey) return;

    const shareUrl = `${baseUrl}/post/${encodeURIComponent(postKey)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: fullPost.title,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard");
      } else {
        window.prompt("Copy this link:", shareUrl);
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  }, [fullPost]);

  const isImage = fullPost?.content_type === "image";

  const cleanContent = useMemo(() => {
    if (!fullPost?.content || isImage) {
      return fullPost?.content ?? "";
    }
    return prepareArticleMarkdown(fullPost.content).cleanContent;
  }, [fullPost?.content, isImage]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!fullPost) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading…
      </div>
    );
  }

  const postWithImages: PostData = isImage
    ? {
        ...fullPost,
        images: fullPost.images ?? [],
      }
    : {
        ...fullPost,
        content: cleanContent,
      };

  return (
    <div className="space-y-4">
      {isImage ? (
        <PostContentCarousel post={postWithImages} />
      ) : (
        <>
          <PostContentBase
            post={postWithImages}
            onShare={showShare ? handleShareClick : undefined}
          />
          <ArticleReadNextFromMarkdown articles={relatedArticles} />
          {showGuidanceFooter && <ArticleGuidanceCTA />}
        </>
      )}
    </div>
  );
};

export default PostContent;

"use client";

import React from "react";
import { PostData } from "./PostContent";
import { useReadArticles } from "@/hooks/useReadArticles";
import { ArticleReadBadge } from "@/components/ArticleReadBadge";

interface PostMetadataProps {
  post: PostData;
  onShare?: () => void; // 👈 NEW
}

const PostMetadata: React.FC<PostMetadataProps> = ({ post, onShare }) => {
  const { readSlugs } = useReadArticles();

  const slug =
    typeof post.slug === "string" && post.slug.length > 0
      ? post.slug
      : null;
  const showReadBadge = slug !== null && readSlugs.has(slug);

  if (!post) {
    return (
      <div className="p-6 md:p-8 border-b border-gray-200 animate-pulse">
        <div className="mb-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-8 border-b border-gray-200">
        {/* Post Title */}
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap items-start gap-2">
            <h1 className="min-w-0 flex-1 text-2xl md:text-3xl font-bold text-gray-800">
              {post.title}
            </h1>
            {showReadBadge && (
              <div className="shrink-0 pt-0.5">
                <ArticleReadBadge />
              </div>
            )}
          </div>
          <p className="text-gray-600">{post.secondary_title}</p>
        </div>

        <div className="flex w-full items-center justify-between">
          {/* Author name - make it clear */}
          <div>
            <p className="text-sm font-bold text-gray-600">by {post.author_name}</p>
          </div>

          {/* Share button only - no Like/Bookmark */}
          <div className="flex items-center space-x-3">
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="rounded-full p-2 transition hover:bg-gray-100"
                title="Share"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostMetadata;

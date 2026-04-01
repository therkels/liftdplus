"use client";

import React from "react";
import Image from "next/image";
import { PostData } from "./PostContent";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { useReadArticles } from "@/hooks/useReadArticles";
import { ArticleReadBadge } from "@/components/ArticleReadBadge";

interface PostMetadataProps {
  post: PostData;
  onShare?: () => void; // 👈 NEW
}

const PostMetadata: React.FC<PostMetadataProps> = ({ post, onShare }) => {
  const {
    isLiked,
    isArchived,
    likeCount,
    isLoading,
    handleLike,
    handleArchive,
  } = usePostInteractions(post);
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full" />
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-1" />
              <div className="h-3 bg-gray-300 rounded w-16" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const handleBookmarkClick = () => {
    handleArchive();
  };

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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 border-2 rounded-full overflow-hidden flex-shrink-0"
              style={{ borderColor: "var(--accent-light)" }}
            >
              {post.author_photo ? (
                <Image
                  src={post.author_photo}
                  alt={post.author_name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <Image
                  src="/woman.jpg"
                  alt={post.author_name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{post.author_name}</p>
              <p className="text-sm text-gray-500">{likeCount} likes</p>
            </div>
          </div>

          {/* Like / Share / Save Buttons - Right Side */}
          <div className="flex items-center space-x-3">
            {/* Share button */}
            {onShare && (
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={onShare}
                aria-label="Share this post"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "var(--accent-light)" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
                  <path d="M16 8l-4-4-4 4" />
                  <path d="M12 4v13" />
                </svg>
              </button>
            )}

            {/* Like button */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleLike}
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--accent-light)" }}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Bookmark button */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleBookmarkClick}
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--accent-light)" }}
                fill={isArchived ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostMetadata;

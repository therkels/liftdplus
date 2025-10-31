// /src/components/site_core/PostMetadata.tsx
"use client";

import React from "react";
import Image from "next/image";
import { PostData } from "./PostContent";
import { usePostInteractions } from "@/hooks/usePostInteractions";

interface PostMetadataProps {
  post: PostData;
}

const PostMetadata: React.FC<PostMetadataProps> = ({ post }) => {
  const { isLiked, isArchived, likeCount, isLoading, handleLike, handleArchive } =
    usePostInteractions(post);

  if (!post) {
    return (
      <div className="p-6 md:p-8 border-b border-gray-200 animate-pulse">
        {/* skeleton */}
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded w-24" />
        </div>
      </div>
    );
  }

  // Avatar source:
  // 1) exact author_photo from API (which should come from users.profile_icon_url)
  // 2) brand fallback only if the author is LIFTD+
  // 3) neutral placeholder otherwise (never that stock /woman.jpg)
  const avatarSrc =
    post.author_photo ||
    (post.author_name === "LIFTD+" ? "/brand/liftdplus-icon.png" : "/avatar-placeholder.png");

  return (
    <div className="p-6 md:p-8 border-b border-gray-200">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{post.title}</h1>
        <p className="text-gray-600">{post.secondary_title}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 border-2 rounded-full overflow-hidden flex-shrink-0"
            style={{ borderColor: "var(--accent-light)" }}
          >
            <Image
              src={avatarSrc}
              alt={post.author_name ?? "Author"}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-800">{post.author_name}</p>
            <p className="text-sm text-gray-500">{likeCount} likes</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={handleLike} disabled={isLoading}>
            <svg className="w-6 h-6" style={{ color: "var(--accent-light)" }} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={handleArchive} disabled={isLoading}>
            <svg className="w-6 h-6" style={{ color: "var(--accent-light)" }} fill={isArchived ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostMetadata;

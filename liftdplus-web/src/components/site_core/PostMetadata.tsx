import Image from "next/image";
import { useState } from "react";

interface PostMetadataProps {
  post: {
    title: string;
    secondary_title: string;
    author_name: string;
    author_photo?: string;
    like_count: number;
    tags: string[];
  };
}

const PostMetadata: React.FC<PostMetadataProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="p-6 md:p-8 border-b border-gray-200">
      {/* Post Title */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {post.title}
        </h1>
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
            <p className="text-sm text-gray-500">{post.like_count} likes</p>
          </div>
        </div>

        {/* Like and Save Buttons - Right Side */}
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsLiked(!isLiked)}
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

          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <svg
              className="w-6 h-6"
              style={{ color: "var(--accent-light)" }}
              fill={isBookmarked ? "currentColor" : "none"}
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
  );
};

export default PostMetadata;

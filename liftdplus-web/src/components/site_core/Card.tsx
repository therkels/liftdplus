import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

interface CardProps {
  image: string;
  title: string;
  secondaryTitle: string;
  authorName: string;
  authorPhoto?: string;
  likes: number;
  tags: string[];
  onClick?: () => void;
  compact?: boolean;
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  secondaryTitle,
  authorName,
  authorPhoto,
  likes,
  tags,
  onClick,
  compact = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  return (
    <div
      className={`flex-shrink-0 ${
        compact ? "w-full" : "w-72"
      } bg-white rounded-lg shadow-lg overflow-hidden ${
        compact ? "m-0" : "m-2"
      } cursor-pointer md:transition-transform md:duration-200 md:hover:scale-105 md:hover:shadow-xl`}
      onClick={onClick}
    >
      <div className={`relative ${compact ? "h-32" : "h-48"} w-full`}>
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <h2
          className={`${
            compact ? "text-lg" : "text-xl"
          } font-bold text-gray-800 mb-1`}
        >
          {title}
        </h2>
        <p className={`text-sm text-gray-600 ${compact ? "mb-2" : "mb-3"}`}>
          {secondaryTitle}
        </p>
        <div
          className={`flex items-center justify-between ${
            compact ? "mb-2" : "mb-3"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 border-2 rounded-full overflow-hidden flex-shrink-0"
              style={{ borderColor: "var(--accent-light)" }}
            >
              {authorPhoto ? (
                <Image
                  src={authorPhoto}
                  alt={authorName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <Image
                  src="/woman.jpg"
                  alt={authorName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <span
              className={`${
                compact ? "text-xs" : "text-sm"
              } font-medium text-gray-700`}
            >
              {authorName}
            </span>
          </div>

          <div
            className={`flex items-center ${
              compact ? "space-x-1" : "space-x-3"
            }`}
          >
            {/* Like Icon */}
            <button
              className="p-1 rounded-full md:hover:bg-gray-100 md:transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <svg
                className="w-7 h-7 md:w-6 md:h-6"
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

            {/* Bookmark Icon */}
            <button
              className="p-1 rounded-full md:hover:bg-gray-100 md:transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
            >
              <svg
                className="w-7 h-7 md:w-6 md:h-6"
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
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Card;

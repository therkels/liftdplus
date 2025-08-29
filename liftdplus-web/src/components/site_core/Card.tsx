import Image from "next/image";
import { useState } from "react";

interface CardProps {
  image: string;
  title: string;
  secondaryTitle?: string;
  authorName: string;
  authorPhoto?: string;
  likes?: number;
  tags: string[];
  onClick?: () => void;
  compact?: boolean;
  readTime?: string;
  layout?: "vertical" | "horizontal";
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  secondaryTitle,
  authorName,
  authorPhoto,
  likes = 0,
  tags,
  onClick,
  compact = false,
  readTime,
  layout = "vertical",
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Horizontal layout for Discover page
  if (layout === "horizontal") {
    return (
      <div
        className="w-full bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
        onClick={onClick}
      >
        <div className="flex h-32">
          {/* Left side - Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover rounded-l-lg"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex flex-col mb-2">
              {readTime && (
                <span className="text-xs text-gray-400 mb-1">{readTime}</span>
              )}
              <h3
                className="text-sm font-bold leading-tight line-clamp-2"
                style={{ color: "#5b8f8d" }}
              >
                {title}
              </h3>
            </div>

            {/* Bottom section with author and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-700">
                  {authorPhoto ? (
                    <Image
                      src={authorPhoto}
                      alt={authorName}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/woman.jpg"
                      alt={authorName}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
                <span className="text-xs text-gray-700 font-medium">
                  {authorName}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                {/* Like button */}
                <button
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                >
                  <svg
                    className="w-5 h-5"
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
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBookmarked(!isBookmarked);
                  }}
                >
                  <svg
                    className="w-5 h-5"
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
        </div>
      </div>
    );
  }

  // Vertical layout (original design)
  return (
    <div
      className={`flex-shrink-0 ${
        compact ? "w-44 md:w-64" : "w-72 md:w-80"
      } bg-white rounded-lg shadow-lg overflow-hidden ${
        compact ? "m-0" : "m-2"
      } cursor-pointer md:transition-transform md:duration-200 md:hover:scale-105 md:hover:shadow-xl`}
      onClick={onClick}
    >
      <div
        className={`relative ${
          compact ? "h-32 md:h-40" : "h-48 md:h-56"
        } w-full`}
      >
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      {/* Read time under image for vertical layout */}
      <div className="px-3 md:px-4 pt-3 text-xs md:text-sm text-subtext">
        {readTime ?? "5 minute read"}
      </div>
      <div
        className={
          compact
            ? "px-3 md:px-4 py-1 md:py-2 flex flex-col justify-between min-h-[7rem] md:min-h-[8rem]"
            : "p-4 md:p-6 flex flex-col justify-between min-h-[8rem] md:min-h-[10rem]"
        }
      >
        <div>
          <h2
            className={`${
              compact
                ? "text-sm md:text-base leading-tight"
                : "text-xl md:text-2xl leading-tight"
            } font-bold line-clamp-2`}
            style={{ color: "#5b8f8d" }}
          >
            {title}
          </h2>
          {secondaryTitle && (
            <div className={`mt-1 flex items-center gap-1`}>
              <span className="text-xs md:text-sm text-gray-600 flex-1 truncate">
                {secondaryTitle}
              </span>
              <span className="text-xs md:text-sm text-subtext flex-shrink-0">
                More
              </span>
            </div>
          )}
        </div>
        <div className={`flex items-center justify-between pt-2`}>
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
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <span
              className={`${
                compact ? "text-[10px] md:text-xs" : "text-xs md:text-sm"
              } font-medium text-gray-700 leading-tight`}
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
                className="w-5 h-5 md:w-4 md:h-4"
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
                className="w-5 h-5 md:w-4 md:h-4"
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
    </div>
  );
};

export default Card;

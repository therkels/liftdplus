import Image from "next/image";
import { useState } from "react";
import { Post } from "@/utils/postTransformers";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import CategorySelectionModal from "./CategorySelectionModal";

interface CardProps {
  post: Post; // Changed from individual fields to full post object
  onClick?: () => void;
  compact?: boolean;
  readTime?: string;
  layout?: "vertical" | "horizontal";
}

const Card: React.FC<CardProps> = ({
  post,
  onClick,
  compact = false,
  readTime,
  layout = "vertical",
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Guard clause to handle undefined post
  if (!post) {
    return (
      <div className="w-72 md:w-80 bg-gray-200 rounded-lg shadow-lg overflow-hidden animate-pulse">
        <div className="h-48 md:h-56 bg-gray-300" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-3 bg-gray-300 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const {
    isLiked,
    isArchived,
    likeCount,
    isLoading,
    handleLike,
    handleArchive,
  } = usePostInteractions(post);

  // Transform post data for display
  const cardData = {
    image: post.cover_image_url,
    title: post.title,
    secondaryTitle: post.secondary_title,
    authorName: post.author_name,
    authorPhoto: post.author_photo,
    likes: likeCount,
    tags: [post.topic_tags, post.format_tags, post.audience_tags].filter(
      Boolean
    ),
    readTime: readTime || `${post.read_time_minutes ?? 5} minute read`,
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived) {
      // If already archived, unarchive directly
      handleArchive(""); // Empty category will trigger unarchive
    } else {
      // Show category selection modal
      setShowCategoryModal(true);
    }
  };

  const handleCategorySelect = (category: string) => {
    handleArchive(category);
    setShowCategoryModal(false);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleLike();
  };

  // Horizontal layout for Discover page
  if (layout === "horizontal") {
    return (
      <>
        <div
          className="w-full bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
          onClick={onClick}
        >
          <div className="flex h-32">
            {/* Left side - Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={cardData.image}
                alt={cardData.title}
                fill
                className="object-cover rounded-l-lg"
              />
            </div>

            {/* Right side - Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex flex-col mb-2">
                {cardData.readTime && (
                  <span className="text-xs text-gray-400 mb-1">
                    {cardData.readTime}
                  </span>
                )}
                <h3
                  className="text-sm font-bold leading-tight line-clamp-2"
                  style={{ color: "#5b8f8d" }}
                >
                  {cardData.title}
                </h3>
              </div>

              {/* Bottom section with author and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-700">
                    {cardData.authorPhoto ? (
                      <Image
                        src={cardData.authorPhoto}
                        alt={cardData.authorName}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/woman.jpg"
                        alt={cardData.authorName}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    {cardData.authorName}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                  {/* Like button */}
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handleLikeClick}
                    disabled={isLoading}
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
                    onClick={handleBookmarkClick}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5"
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
          </div>
        </div>

        <CategorySelectionModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSelectCategory={handleCategorySelect}
          postTitle={cardData.title}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Vertical layout (original design)
  return (
    <>
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
          <Image
            src={cardData.image}
            alt={cardData.title}
            fill
            className="object-cover"
          />
        </div>
        {/* Read time under image for vertical layout */}
        <div className="px-3 md:px-4 pt-3 text-xs md:text-sm text-subtext">
          {cardData.readTime}
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
              {cardData.title}
            </h2>
            {cardData.secondaryTitle && (
              <div className={`mt-1 flex items-center gap-1`}>
                <span className="text-xs md:text-sm text-gray-600 flex-1 truncate">
                  {cardData.secondaryTitle}
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
                {cardData.authorPhoto ? (
                  <Image
                    src={cardData.authorPhoto}
                    alt={cardData.authorName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src="/woman.jpg"
                    alt={cardData.authorName}
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
                {cardData.authorName}
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
                onClick={handleLikeClick}
                disabled={isLoading}
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
                onClick={handleBookmarkClick}
                disabled={isLoading}
              >
                <svg
                  className="w-5 h-5 md:w-4 md:h-4"
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
      </div>

      <CategorySelectionModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
        postTitle={cardData.title}
        isLoading={isLoading}
      />
    </>
  );
};

export default Card;

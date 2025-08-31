"use client";

import React from "react";
import CardSkeleton from "./CardSkeleton";

interface CardScrollerSkeletonProps {
  title?: string;
  cardCount?: number;
  compact?: boolean;
}

const CardScrollerSkeleton: React.FC<CardScrollerSkeletonProps> = ({
  title,
  cardCount = 4,
  compact = true,
}) => {
  return (
    <div className="w-full py-6">
      {/* Title skeleton */}
      {title ? (
        <div className="px-4 mb-4">
          <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
        </div>
      ) : (
        <div className="px-4 mb-4">
          <div className="h-8 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>
      )}

      {/* Cards skeleton */}
      <div className="relative">
        <div className="overflow-x-auto touch-scroll">
          <div className="flex space-x-4 p-4">
            {Array.from({ length: cardCount }, (_, index) => (
              <CardSkeleton key={index} compact={compact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardScrollerSkeleton;

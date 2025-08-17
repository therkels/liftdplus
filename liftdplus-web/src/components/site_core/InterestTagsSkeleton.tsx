"use client";

import React from "react";

interface InterestTagsSkeletonProps {
  className?: string;
}

const InterestTagsSkeleton: React.FC<InterestTagsSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div className={`overflow-x-auto touch-scroll ${className}`}>
      <div className="flex gap-2 pb-2">
        {/* Show 3 skeleton tags to match the expected interests */}
        {[
          { id: 1, width: "w-28" }, // ~112px for "Stress & Anxiety"
          { id: 2, width: "w-24" }, // ~96px for "Sleep & Rest"
          { id: 3, width: "w-20" }, // ~80px for "Pain Relief"
        ].map((item) => (
          <div
            key={item.id}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 bg-gray-300 animate-pulse"
          >
            <div className={`h-4 bg-gray-400 rounded ${item.width}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestTagsSkeleton;

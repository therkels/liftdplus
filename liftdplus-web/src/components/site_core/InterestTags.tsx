"use client";

import React from "react";
import { Interest } from "@/types/interests";

interface InterestTagsProps {
  interests: Interest[];
  className?: string;
}

const InterestTags: React.FC<InterestTagsProps> = ({
  interests,
  className = "",
}) => {
  const activeInterests = interests.filter((interest) => interest.isActive);

  return (
    <div className={`overflow-x-auto touch-scroll ${className}`}>
      <div className="flex gap-2 pb-2">
        {activeInterests.map((interest) => (
          <div
            key={interest.id}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 text-slate-900 bg-accent"
          >
            {interest.displayName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestTags;

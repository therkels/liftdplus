"use client";

import React from "react";

interface CardSkeletonProps {
  compact?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ compact = false }) => {
  return (
    <div
      className={`flex-shrink-0 ${
        compact ? "w-44 md:w-64" : "w-72 md:w-80"
      } bg-white rounded-lg shadow-lg overflow-hidden ${
        compact ? "m-0" : "m-2"
      } animate-pulse`}
    >
      {/* Image skeleton */}
      <div
        className={`relative ${
          compact ? "h-32 md:h-40" : "h-48 md:h-56"
        } w-full bg-gray-300`}
      ></div>

      {/* Read time skeleton */}
      <div className="px-3 pt-3">
        <div className="h-3 bg-gray-300 rounded w-20"></div>
      </div>

      {/* Content skeleton */}
      <div
        className={
          compact
            ? "px-3 py-1 flex flex-col justify-between min-h-[7rem]"
            : "p-4 flex flex-col justify-between min-h-[8rem]"
        }
      >
        <div>
          {/* Title skeleton */}
          <div className="space-y-2 mb-2">
            <div
              className={`h-4 bg-gray-300 rounded ${
                compact ? "w-full" : "w-5/6"
              }`}
            ></div>
            <div
              className={`h-4 bg-gray-300 rounded ${
                compact ? "w-4/5" : "w-3/4"
              }`}
            ></div>
          </div>

          {/* Secondary title skeleton */}
          <div className="mt-1 flex items-center gap-1">
            <div className="h-3 bg-gray-200 rounded flex-1"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
        </div>

        {/* Bottom section skeleton */}
        <div className="flex items-center justify-between pt-2">
          {/* Author info skeleton */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>

          {/* Action buttons skeleton */}
          <div
            className={`flex items-center ${
              compact ? "space-x-1" : "space-x-3"
            }`}
          >
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;

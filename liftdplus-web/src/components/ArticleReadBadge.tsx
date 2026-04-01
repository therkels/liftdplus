"use client";

import React from "react";

/** Subtle pill matching article title teal (#5b8f8d) — quieter than the title */
export function ArticleReadBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        color: "#3d6e6c",
        borderColor: "rgba(91, 143, 141, 0.7)",
        backgroundColor: "rgba(91, 143, 141, 0.25)",
      }}
      aria-label="Read"
    >
      <svg
        className="h-3 w-3 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Read
    </span>
  );
}

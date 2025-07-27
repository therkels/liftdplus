"use client";

import React, { useState } from "react";

interface FilterTabsProps {
  className?: string;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ className = "" }) => {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["All"])
  );

  const filters = [
    "All",
    "Sleep & Rest",
    "Stress & Anxiety",
    "Intimacy & Libido",
    "Hormonal Changes",
    "Pain relief",
    "Focus & Creativity",
  ];

  const handleFilterClick = (filter: string) => {
    if (filter === "All") {
      setActiveFilters(new Set(["All"]));
    } else {
      const newActiveFilters = new Set(activeFilters);
      newActiveFilters.delete("All");

      if (newActiveFilters.has(filter)) {
        newActiveFilters.delete(filter);
        if (newActiveFilters.size === 0) {
          newActiveFilters.add("All");
        }
      } else {
        newActiveFilters.add(filter);
      }

      setActiveFilters(newActiveFilters);
    }
  };

  return (
    <div className={`overflow-x-auto touch-scroll ${className}`}>
      <div className="flex gap-2 pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeFilters.has(filter)
                ? "text-slate-900"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            style={
              activeFilters.has(filter)
                ? { backgroundColor: "var(--accent)" }
                : {}
            }
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;

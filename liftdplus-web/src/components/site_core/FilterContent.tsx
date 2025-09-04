"use client";

import { useState, useEffect } from "react";

interface FilterContentProps {
  currentFilters: {
    sortBy: string;
    audience: string[];
    category: string[];
  };
  onFiltersUpdate: (filters: any) => void;
}

interface FilterState {
  sortBy: string;
  audience: string[];
  category: string[];
}

const FilterContent: React.FC<FilterContentProps> = ({
  currentFilters,
  onFiltersUpdate,
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  // Sync filters when currentFilters prop changes
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleSortByChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFiltersUpdate(newFilters);
  };

  const handleAudienceChange = (value: string) => {
    const newFilters = {
      ...filters,
      audience: filters.audience.includes(value)
        ? filters.audience.filter((item) => item !== value)
        : [...filters.audience, value],
    };
    setFilters(newFilters);
    onFiltersUpdate(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = {
      ...filters,
      category: filters.category.includes(value)
        ? filters.category.filter((item) => item !== value)
        : [...filters.category, value],
    };
    setFilters(newFilters);
    onFiltersUpdate(newFilters);
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2
          className="text-gray-800"
          style={{
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "38px",
          }}
        >
          Filters
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-4 overflow-y-auto max-h">
        {/* Sort By */}
        <div className="pb-6">
          <h3
            className="text-gray-800 mb-4"
            style={{
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "24px",
            }}
          >
            Sort By
          </h3>
          <div className="space-y-3">
            {["Most Popular", "Most Recent", "Oldest"].map((option) => (
              <label
                key={option}
                className="flex items-center justify-between cursor-pointer"
              >
                <span
                  className="text-gray-700"
                  style={{
                    fontSize: "16px",
                    lineHeight: "20px",
                  }}
                >
                  {option}
                </span>
                <input
                  type="radio"
                  name="sortBy"
                  value={option}
                  checked={filters.sortBy === option}
                  onChange={(e) => handleSortByChange(e.target.value)}
                  className="w-4 h-4 border-gray-400 focus:ring-gray-500"
                  style={{ accentColor: "var(--foreground)" }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Separator Line */}
        <hr className="border-gray-200 mb-6" />

        {/* Audience */}
        <div className="pb-6">
          <h3
            className="text-gray-800 mb-4"
            style={{
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "24px",
            }}
          >
            Audience
          </h3>
          <div className="space-y-3">
            {[
              "New to Cannabis",
              "For Women",
              "By and For BIPOC Voices",
              "For Parents",
              "For Ages 50+",
              "Smoke-Free Friendly",
            ].map((option) => (
              <label
                key={option}
                className="flex items-center justify-between cursor-pointer"
              >
                <span
                  className="text-gray-700"
                  style={{
                    fontSize: "16px",
                    lineHeight: "20px",
                  }}
                >
                  {option}
                </span>
                <input
                  type="checkbox"
                  checked={filters.audience.includes(option)}
                  onChange={() => handleAudienceChange(option)}
                  className="w-4 h-4 border-gray-400 rounded focus:ring-gray-500"
                  style={{ accentColor: "var(--foreground)" }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Separator Line */}
        <hr className="border-gray-200 mb-6" />

        {/* Category */}
        <div className="pb-6">
          <h3
            className="text-gray-800 mb-4"
            style={{
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "24px",
            }}
          >
            Category
          </h3>
          <div className="space-y-3">
            {[
              "Sleep & Rest",
              "Stress & Anxiety",
              "Intimacy & Libido",
              "Hormonal Changes",
              "Pain Relief",
              "Focus & Creativity",
            ].map((option) => (
              <label
                key={option}
                className="flex items-center justify-between cursor-pointer"
              >
                <span
                  className="text-gray-700"
                  style={{
                    fontSize: "16px",
                    lineHeight: "20px",
                  }}
                >
                  {option}
                </span>
                <input
                  type="checkbox"
                  checked={filters.category.includes(option)}
                  onChange={() => handleCategoryChange(option)}
                  className="w-4 h-4 border-gray-400 rounded focus:ring-gray-500"
                  style={{ accentColor: "var(--foreground)" }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterContent;

"use client";

import { useState } from "react";

export default function ResourcesHero({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const popularSearches = ["Sleep", "THC vs CBD", "Dosage", "Anxiety", "Gummies"];

  return (
    <section className="bg-[#f4f7f5] px-6 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left side: Text + Search */}
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-[#6b938c]">
              Resources
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[#313a43] lg:text-4xl">
              Explore Cannabis, Without the Overwhelm
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[#4f5a58] lg:text-base">
              Beginner-friendly guides, product education, and wellness-focused resources
              designed to help you feel more informed and more confident.
            </p>

            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="What would you like help understanding?"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full rounded-full border border-[#cdcec7] bg-white px-5 py-3 text-sm placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#6b938c] lg:text-base"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#ccff33] px-5 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 lg:text-sm"
              >
                Search
              </button>
            </div>

            {/* Popular Searches */}
            <div>
              <p className="mb-3 text-xs font-semibold text-[#4f5a58]">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => {
                      setSearchInput(pill);
                      onSearch(pill);
                    }}
                    className="rounded-full border border-[#cdcec7] bg-white px-3 py-1.5 text-xs font-medium text-[#313a43] transition hover:border-[#6b938c] hover:bg-white lg:text-sm"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Hero Image Placeholder */}
          <div className="hidden lg:block">
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#f4f7f5] to-[#cdcec7]">
              {/* Placeholder for hero image — will be replaced with actual image later */}
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-xs font-medium text-[#4f5a58]">Hero image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Card from "@/components/site_core/Card";
import PostModal from "@/components/site_core/PostModal";
import FilterContent from "@/components/site_core/FilterContent";
import { HiOutlineAdjustments, HiOutlineX } from "react-icons/hi";

export default function Search() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "",
    audience: ["BIPOC"],
    category: ["Stress & Anxiety", "Sleep & Rest"],
    format: []
  });

  // Mock data for the content cards
  const handleFiltersUpdate = (newFilters: any) => {
    setCurrentFilters(newFilters);
  };

  const removeFilter = (type: string, value: string) => {
    setCurrentFilters(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type as keyof typeof prev]) 
        ? (prev[type as keyof typeof prev] as string[]).filter(item => item !== value)
        : prev[type as keyof typeof prev]
    }));
  };

  const discoverContent = [
    {
      id: 1,
      image: "/dandelion.jpg",
      title: "3 Reasons You Should Slow Down Today",
      readTime: "5 minute read",
      authorName: "Maya Johnson",
      authorPhoto: "/woman.jpg",
      tags: ["D", "E"]
    },
    {
      id: 2,
      image: "/dino.jpg",
      title: "Staying Soft in the Chaos: A Cannamom's Birthday Story",
      readTime: "5 minute read",
      authorName: "Maya Johnson",
      authorPhoto: "/woman.jpg",
      tags: []
    },
    {
      id: 3,
      image: "/man.jpg",
      title: "Cannamom Approved: City Park Limeade",
      readTime: "2 minute read",
      authorName: "Maya Johnson",
      authorPhoto: "/woman.jpg",
      tags: []
    },
    {
      id: 4,
      image: "/woman.jpg",
      title: "Finding Peace in the Everyday Moments",
      readTime: "4 minute read",
      authorName: "Maya Johnson",
      authorPhoto: "/woman.jpg",
      tags: ["W", "L"]
    },
    {
      id: 5,
      image: "/dandelion.jpg",
      title: "The Art of Mindful Living",
      readTime: "6 minute read",
      authorName: "Maya Johnson",
      authorPhoto: "/woman.jpg",
      tags: ["A", "M"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 
            className="text-gray-800"
            style={{ 
              width: '262px', 
              height: '34px',
              fontWeight: 700,
              fontStyle: 'normal',
              fontSize: '40px',
              lineHeight: '46px',
              letterSpacing: '0.3%',
              verticalAlign: 'middle',
              textTransform: 'capitalize'
            }}
          >
            Discover
          </h1>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="/man.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white px-4 py-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Explore More Topics
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Use the filter options to narrow your search.
          </p>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors border border-gray-300"
            style={{ width: '283px', height: '42px' }}
          >
            <HiOutlineAdjustments className="w-5 h-5" />
            <span>Filter & Sort By</span>
          </button>
        </div>
      </div>

      {/* Current Filters Section */}
      {(currentFilters.sortBy || currentFilters.audience.length > 0 || currentFilters.category.length > 0 || currentFilters.format.length > 0) && (
        <div className="bg-white px-4 py-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Current Filters</h3>
          <div className="flex flex-wrap gap-2">
            {/* Sort By Filter */}
            {currentFilters.sortBy && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {currentFilters.sortBy}
              </span>
            )}
            
            {/* Audience Filters */}
            {currentFilters.audience.map((filter) => (
              <span key={`audience-${filter}`} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {filter}
              </span>
            ))}
            
            {/* Category Filters */}
            {currentFilters.category.map((filter) => (
              <span key={`category-${filter}`} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {filter}
              </span>
            ))}
            
            {/* Format Filters */}
            {currentFilters.format.map((filter) => (
              <span key={`format-${filter}`} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-slate-900">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="bg-white px-4 py-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-800">{discoverContent.length} Results</h3>
      </div>

      {/* Content Cards */}
      <div className="px-4 py-4 space-y-3">
        {discoverContent.map((content) => (
          <Card
            key={content.id}
            image={content.image}
            title={content.title}
            authorName={content.authorName}
            authorPhoto={content.authorPhoto}
            tags={content.tags}
            readTime={content.readTime}
            layout="horizontal"
            onClick={() => console.log(`Clicked on: ${content.title}`)}
          />
        ))}
      </div>

      {/* Filter Modal */}
      <PostModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <FilterContent
          currentFilters={currentFilters}
          onFiltersUpdate={handleFiltersUpdate}
        />
      </PostModal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { Sparkles } from "lucide-react";

import ArticleGrid from "@/components/resources/ArticleGrid";
import CategorySidebar from "@/components/resources/CategorySidebar";
import ResourcesHero from "@/components/resources/ResourcesHero";
import StartHereSection from "@/components/resources/StartHereSection";
import { ResourceArticle } from "@/components/resources/ArticleCard";
import { getPublishedArticles } from "@/lib/supabase/queries/getPublishedArticles";

const TOPIC_TAGS_DISPLAY: Record<string, string> = {
  cannabis_101: "Cannabis 101",
  sleep_rest: "Sleep & Rest",
  stress_anx: "Stress & Anxiety",
  "focus-creativity": "Focus & Creativity",
  intimacy: "Intimacy & Libido",
  "hormonal-changes": "Hormonal Changes",
  "pain-relief": "Pain Relief",
};

export default function ResourcesPage() {
  const [articles, setArticles] = useState<ResourceArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (offsetVal: number) => {
    setIsLoading(true);
    const data = await getPublishedArticles(
      activeCategory || undefined,
      searchQuery,
      12,
      offsetVal
    );

    if (offsetVal === 0) {
      setArticles(data);
    } else {
      setArticles((prev) => [...prev, ...data]);
    }

    setHasMore(data.length === 12);
    setIsLoading(false);

    if (offsetVal === 0) {
      sendGAEvent("event", "resources_filtered", {
        category: activeCategory || "all",
        search: searchQuery || "none",
      });
    }
  };

  useEffect(() => {
    setOffset(0);
    void fetchArticles(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveCategory(null);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setSearchQuery("");

    if (categoryId) {
      sendGAEvent("event", "category_selected", { category: categoryId });
    }
  };

  const handleLoadMore = () => {
    const newOffset = offset + 12;
    setOffset(newOffset);
    void fetchArticles(newOffset);
  };

  const selectedTagDisplay = activeCategory ? TOPIC_TAGS_DISPLAY[activeCategory] : null;

  return (
    <main className="bg-white">
      <ResourcesHero onSearch={handleSearch} />

      <StartHereSection />

      {/* Browse + All Guides + CTA Section */}
      <section className="mt-16 px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-10">
            {/* Sidebar - Taupe background */}
            <div className="h-fit rounded-lg bg-[#f4f7f5] p-6">
              <CategorySidebar
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>

            {/* Main Content - White background */}
            <div className="rounded-lg bg-white p-6 lg:col-span-3">
              <div className="mb-6 lg:mb-8">
                <h2 className="mb-1 text-xl font-bold text-[#313a43] lg:text-2xl">
                  {activeCategory ? selectedTagDisplay || "Filtered Results" : "All Guides"}
                </h2>
                <p className="text-xs text-[#4f5a58] lg:text-sm">
                  {articles.length} article{articles.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ArticleGrid
                articles={articles}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                categoryLabel={selectedTagDisplay || undefined}
                hasMore={hasMore}
              />
            </div>
          </div>

          {/* Bottom CTA - Taupe background, white outline icon, button on right */}
          <div className="mt-12 rounded-lg bg-[#f4f7f5] p-8 lg:mt-16 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left side: Icon + Text */}
              <div className="flex items-start gap-6 lg:items-center">
                {/* Icon circle - white outline */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#6b938c]">
                  <Sparkles className="h-6 w-6 text-white stroke-[1.5]" />
                </div>

                {/* Text content */}
                <div>
                  <h2 className="mb-2 text-lg font-bold text-[#313a43] lg:text-xl">
                    Ready for personalized recommendations?
                  </h2>
                  <p className="text-sm text-[#4f5a58] lg:text-base">
                    Take our quick guide to get product and dosage recommendations tailored to your
                    needs.
                  </p>
                </div>
              </div>

              {/* Right side: Button */}
              <Link
                href="/"
                onClick={() => sendGAEvent("event", "cta_click", { source: "resources_page" })}
                className="inline-block flex-shrink-0 whitespace-nowrap rounded-full bg-[#ccff33] px-6 py-2 text-xs font-semibold text-black transition hover:opacity-90 lg:text-sm"
              >
                Get My Guide →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import ArticleCard, { ResourceArticle } from "./ArticleCard";

export default function ArticleGrid({
  articles,
  isLoading,
  onLoadMore,
  categoryLabel,
  hasMore,
}: {
  articles: ResourceArticle[];
  isLoading: boolean;
  onLoadMore: () => void;
  categoryLabel?: string;
  hasMore: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} categoryLabel={categoryLabel} />
        ))}
      </div>

      {articles.length === 0 && !isLoading && (
        <div className="py-8 text-center lg:py-10">
          <p className="text-sm text-[#4f5a58] lg:text-base">
            No articles found. Try a different search or category.
          </p>
        </div>
      )}

      {articles.length > 0 && hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-full border-2 border-[#6b938c] px-6 py-2 text-xs font-semibold text-[#6b938c] transition hover:bg-[#6b938c] hover:text-white disabled:opacity-50 lg:text-sm"
          >
            {isLoading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import type { ParsedRelatedArticle } from "@/lib/markdown/articleMarkdownCleanup";

export default function ArticleReadNextFromMarkdown({
  articles,
}: {
  articles: ParsedRelatedArticle[];
}) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-[#cdcec7] pt-12">
      <h3 className="mb-6 text-lg font-bold text-[#313a43]">Read Next</h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/resources/${article.slug}`}
            className="block rounded-lg border border-[#cdcec7] bg-white p-4 no-underline transition-colors duration-200 hover:border-[#6b938c]"
          >
            <p className="text-base font-semibold text-[#313a43]">{article.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

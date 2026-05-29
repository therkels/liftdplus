"use client";

import Image from "next/image";
import Link from "next/link";

export type ResourceArticle = {
  id: string;
  title: string;
  cover_image_url?: string | null;
  secondary_title?: string | null;
  readTime: number;
  slug: string;
};

export default function ArticleCard({
  article,
  categoryLabel,
}: {
  article: ResourceArticle;
  categoryLabel?: string;
}) {
  return (
    <Link href={`/resources/${article.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#cdcec7] bg-white shadow-sm transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        {article.cover_image_url && (
          <div className="relative h-36 overflow-hidden bg-[#f4f7f5] lg:h-40">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="flex flex-grow flex-col p-4 lg:p-5">
          <h3 className="mb-3 line-clamp-2 text-lg font-bold text-[#313a43] transition-colors duration-200 group-hover:text-[#5a7d75]">
            {article.title}
          </h3>
          <div className="mb-3 flex items-center gap-4 text-sm text-[#4f5a58]">
            <span>{article.readTime} min read</span>
            {categoryLabel && (
              <>
                <span className="text-[#cdcec7]">•</span>
                <span>{categoryLabel}</span>
              </>
            )}
          </div>
          {article.secondary_title && (
            <p className="line-clamp-2 text-sm leading-relaxed text-[#4f5a58]">
              {article.secondary_title}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

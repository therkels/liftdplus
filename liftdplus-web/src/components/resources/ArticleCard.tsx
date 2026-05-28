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
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#cdcec7] bg-white transition hover:shadow-lg">
        {article.cover_image_url && (
          <div className="relative h-36 overflow-hidden bg-[#f4f7f5] lg:h-40">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Read time badge - BOTTOM LEFT */}
            <div className="absolute bottom-3 left-3 rounded-full bg-[#f4f7f5] px-2.5 py-1.5 text-xs font-semibold text-[#6b938c]">
              {article.readTime} min read
            </div>
          </div>
        )}
        <div className="flex flex-grow flex-col p-4 lg:p-5">
          {categoryLabel && (
            <span className="mb-2 inline-block w-fit rounded-full bg-[#f4f7f5] px-2.5 py-1 text-xs font-semibold text-[#6b938c]">
              {categoryLabel}
            </span>
          )}
          <h3 className="mb-2 line-clamp-2 text-sm font-bold text-[#313a43] transition group-hover:text-[#6b938c] lg:text-base">
            {article.title}
          </h3>
          <p className="mb-3 line-clamp-2 flex-grow text-xs text-[#4f5a58] lg:text-sm">
            {article.secondary_title}
          </p>
        </div>
      </div>
    </Link>
  );
}

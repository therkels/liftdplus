import Link from "next/link";
import { getRelatedGuides } from "@/lib/supabase/queries/getRelatedGuides";

export default async function RelatedGuides({
  slug,
  postId,
}: {
  slug: string;
  postId: string;
}) {
  const guides = await getRelatedGuides(slug, postId, 3);

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-[#cdcec7] pt-10">
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-[#4f5a58]">
        Read Next
      </h2>
      <ul className="space-y-4">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/resources/${guide.slug}`}
              className="block rounded-lg border border-[#cdcec7] bg-white p-4 transition-colors duration-200 hover:border-[#6b938c] hover:text-[#5a7d75] no-underline"
            >
              <span className="text-base font-bold text-[#313a43]">{guide.title}</span>
              {guide.secondary_title && (
                <p className="mt-1 text-sm leading-relaxed text-[#4f5a58]">
                  {guide.secondary_title}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

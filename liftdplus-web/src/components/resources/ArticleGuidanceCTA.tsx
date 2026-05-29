import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ArticleGuidanceCTA() {
  return (
    <section className="mt-16 pt-12">
      <div className="rounded-lg bg-[#f4f7f5] p-8 text-center lg:p-10">
        <h3 className="mb-2 text-xl font-bold text-[#313a43]">
          Ready for more personalized guidance?
        </h3>
        <p className="mb-6 text-[#4f5a58]">
          Answer a few quick questions and get personalized recommendations based on what
          you&apos;re trying to support.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded bg-[#6b938c] px-6 py-3 font-semibold text-white no-underline transition-colors duration-200 hover:bg-[#5a7d75]"
        >
          Get My Personalized Guide
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

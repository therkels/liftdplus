"use client";

import Link from "next/link";
import { ArrowRight, Beaker, Building2, Heart, Leaf } from "lucide-react";

const START_HERE_GUIDES = [
  {
    id: "1",
    title: "New to Cannabis?",
    excerpt: "A beginner's guide to getting started safely and confidently.",
    icon: Leaf,
    slug: "new-to-cannabis",
  },
  {
    id: "2",
    title: "Curious About THC vs CBD?",
    excerpt: "Understand the difference and what each experience can feel like.",
    icon: Beaker,
    slug: "thc-vs-cbd",
  },
  {
    id: "3",
    title: "Nervous About Trying Cannabis?",
    excerpt: "What to expect, how dosage works, and how to stay in control.",
    icon: Heart,
    slug: "nervous-about-cannabis",
  },
  {
    id: "4",
    title: "Visiting a Dispensary for the First Time?",
    excerpt: "What to know before you go so you feel prepared.",
    icon: Building2,
    slug: "first-dispensary-visit",
  },
];

export default function StartHereSection() {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between lg:mb-10">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-[#313a43] lg:text-3xl">Start Here</h2>
          <div className="h-1 w-10 bg-[#ccff33]"></div>
        </div>
        <Link
          href="/resources"
          className="hidden text-xs font-semibold text-[#6b938c] transition hover:text-[#4f5a58] lg:block lg:text-sm"
        >
          View all Start Here →
        </Link>
      </div>

      <p className="mb-8 text-xs text-[#4f5a58] lg:mb-8 lg:text-sm">
        New to cannabis? These guides are a great place to begin.
      </p>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {START_HERE_GUIDES.map((guide) => {
          const IconComponent = guide.icon;
          return (
            <Link
              key={guide.id}
              href={`/resources/${guide.slug}`}
              className="group rounded-lg border border-[#cdcec7] bg-[#f4f7f5] p-5 transition hover:border-[#6b938c] hover:shadow-md lg:p-6"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#6b938c]">
                <IconComponent className="h-6 w-6 text-white stroke-[1.5]" />
              </div>
              <h3 className="mb-2 text-sm font-bold text-[#313a43] lg:text-base">{guide.title}</h3>
              <p className="mb-4 text-xs leading-relaxed text-[#4f5a58] lg:text-sm">
                {guide.excerpt}
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#6b938c] transition-all group-hover:gap-2 lg:text-sm">
                Explore
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

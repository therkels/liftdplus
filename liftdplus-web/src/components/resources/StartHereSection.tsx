"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Beaker, Building2, Leaf, Shield } from "lucide-react";

const START_HERE_GUIDES: {
  id: string;
  title: string;
  excerpt: string;
  icon: LucideIcon;
  slug: string;
}[] = [
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
    slug: "thc-vs-cbd-whats-the-difference",
  },
  {
    id: "3",
    title: "Nervous About Trying Cannabis?",
    excerpt: "What to expect, how dosage works, and how to stay in control.",
    icon: Shield,
    slug: "why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it",
  },
  {
    id: "4",
    title: "Visiting a Dispensary for the First Time?",
    excerpt: "What to know before you go so you feel prepared.",
    icon: Building2,
    slug: "know-the-lingo",
  },
];

export default function StartHereSection() {
  return (
    <section className="-mx-6 bg-[#f9f8f7] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-2xl font-bold text-[#313a43]">Start Here</h2>
          <p className="text-sm text-[#4f5a58]">Great guides to begin with</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {START_HERE_GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.id}
                href={`/resources/${guide.slug}`}
                className="group rounded-lg border border-[#cdcec7] bg-white p-5 transition-colors duration-200 hover:border-[#6b938c] lg:p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6b938c]/15">
                  <Icon className="h-6 w-6 text-[#6b938c] stroke-[1.5]" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#313a43]">{guide.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#4f5a58]">{guide.excerpt}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#6b938c] transition-all duration-200 group-hover:gap-2 lg:text-sm">
                  Explore
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

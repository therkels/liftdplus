"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  Dumbbell,
  Flower2,
  Heart,
  Moon,
  Sparkles,
} from "lucide-react";

const TOPIC_TAGS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "cannabis_101", label: "Cannabis 101", icon: BookOpen },
  { id: "sleep_rest", label: "Sleep & Rest", icon: Moon },
  { id: "stress_anx", label: "Stress & Anxiety", icon: Brain },
  { id: "focus-creativity", label: "Focus & Creativity", icon: Sparkles },
  { id: "intimacy", label: "Intimacy & Libido", icon: Heart },
  { id: "hormonal-changes", label: "Hormonal Changes", icon: Flower2 },
  { id: "pain-relief", label: "Pain Relief", icon: Dumbbell },
];

export default function CategorySidebar({
  activeCategory,
  onCategorySelect,
}: {
  activeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}) {
  return (
    <aside className="w-full lg:w-56">

      {/* MOBILE: horizontal scrolling pill row */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TOPIC_TAGS.map((tag) => {
            const isActive = activeCategory === tag.id;
            const Icon = tag.icon;
            return (
              <button
                key={tag.id}
                onClick={() => onCategorySelect(isActive ? null : tag.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-[#6b938c] text-white"
                    : "bg-[#f4f7f5] text-[#313a43]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 stroke-[1.5] ${
                    isActive ? "text-white" : "text-[#6b938c]"
                  }`}
                  aria-hidden
                />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP: vertical sidebar — unchanged */}
      <div className="hidden lg:block rounded-lg bg-transparent p-0 pb-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#313a43]">
          Browse by Category
        </h3>
        <div className="space-y-1.5">
          {TOPIC_TAGS.map((tag) => {
            const isActive = activeCategory === tag.id;
            const Icon = tag.icon;
            return (
              <button
                key={tag.id}
                onClick={() => onCategorySelect(isActive ? null : tag.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-[#6b938c] text-white"
                    : "bg-transparent text-[#313a43] hover:bg-[#f4f7f5]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 stroke-[1.5] ${
                    isActive ? "text-white" : "text-[#6b938c]"
                  }`}
                  aria-hidden
                />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
}

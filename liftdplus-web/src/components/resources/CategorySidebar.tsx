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
      <div className="rounded-lg bg-[#f4f7f5] p-5 pb-6 lg:bg-transparent lg:p-0 lg:pb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#313a43] lg:text-sm">
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
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition lg:text-sm ${
                  isActive
                    ? "bg-[#6b938c] text-white"
                    : "bg-white text-[#313a43] hover:bg-[#f4f7f5] lg:bg-transparent lg:hover:bg-[#f4f7f5]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 stroke-[1.5] lg:h-5 lg:w-5 ${
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

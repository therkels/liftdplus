"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { CHECKLIST_ITEMS, type ChecklistItemId } from "@/types/checklist";

export interface ChecklistProgress {
  itemId: ChecklistItemId;
  completed: boolean;
  completedAt: string | null;
}

export interface UseChecklistReturn {
  progress: ChecklistProgress[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  isLoading: boolean;
  markComplete: (itemId: ChecklistItemId) => Promise<void>;
  getSlugForItem: (itemId: ChecklistItemId, userGoal?: string) => string;
}

export function useChecklist(userGoal?: string): UseChecklistReturn {
  const [progress, setProgress] = useState<ChecklistProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { data } = await supabase
        .schema("private")
        .from("user_checklist_progress")
        .select("item_id, completed, completed_at")
        .eq("user_id", user.id);

      const loaded: ChecklistProgress[] = CHECKLIST_ITEMS.map((item) => {
        const row = data?.find((r: any) => r.item_id === item.id);
        return {
          itemId: item.id,
          completed: row?.completed ?? false,
          completedAt: row?.completed_at ?? null,
        };
      });
      setProgress(loaded);
      setIsLoading(false);
    }

    loadProgress();
    window.addEventListener("focus", loadProgress);
    return () => window.removeEventListener("focus", loadProgress);
  }, []);
@@
  const markComplete = useCallback(async (itemId: ChecklistItemId) => {
    const res = await fetch("/api/v0/checklist/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    if (!res.ok) return;

    setProgress((prev) =>
      prev.map((p) =>
        p.itemId === itemId
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const getSlugForItem = useCallback(
    (itemId: ChecklistItemId, goal?: string): string => {
      const item = CHECKLIST_ITEMS.find((i) => i.id === itemId);
      if (!item) return "";
      if (item.goalSlugMap && goal && item.goalSlugMap[goal]) {
        return item.goalSlugMap[goal];
      }
      return item.slug;
    },
    []
  );

  const completedCount = progress.filter((p) => p.completed).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const isComplete = completedCount === totalCount;

  return {
    progress,
    completedCount,
    totalCount,
    isComplete,
    isLoading,
    markComplete,
    getSlugForItem,
  };
}


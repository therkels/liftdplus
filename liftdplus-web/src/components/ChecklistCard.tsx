"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useChecklist } from "@/hooks/useChecklist";
import { CHECKLIST_ITEMS, CHECKLIST_COMPLETION_MESSAGE } from "@/types/checklist";

interface ChecklistCardProps {
  userGoal?: string;
  hidden?: boolean;
  onHide?: () => void;
  onCompletionChange?: (isComplete: boolean) => void;
}

const CHECKLIST_HIDDEN_KEY = "checklist_hidden";

export function ChecklistCard({
  userGoal,
  hidden = false,
  onHide,
  onCompletionChange,
}: ChecklistCardProps) {
  const { progress, completedCount, totalCount, isComplete, isLoading } =
    useChecklist(userGoal);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    onCompletionChange?.(isComplete);
  }, [isComplete, onCompletionChange]);

  if (isLoading) return null;

  // If hidden, hide the entire card (completion and in-progress).
  if (hidden) return null;

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Completion state
  if (isComplete) {
    return (
      <div
        style={{
          background: "#1e3530",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            {CHECKLIST_COMPLETION_MESSAGE.headline}
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.5,
            }}
          >
            {CHECKLIST_COMPLETION_MESSAGE.subtext}
          </p>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            try {
              localStorage.setItem(CHECKLIST_HIDDEN_KEY, "true");
            } catch {
              // Ignore; parent state can still hide via onHide.
            }
            onHide?.();
          }}
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Hide
        </a>
        </div>
      </div>
    );
  }

  // In-progress state
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: 16,
        padding: collapsed ? "16px 20px" : "20px 24px",
        marginBottom: 24,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: collapsed ? 0 : 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#4a7a74",
            }}
          >
            Dispensary Ready
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "#b8f000",
              background: "#1e3530",
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {completedCount}/{totalCount}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            fontSize: "0.75rem",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: "#f0f0f0",
              borderRadius: 2,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "#b8f000",
                borderRadius: 2,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Checklist items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CHECKLIST_ITEMS.map((item) => {
              const itemProgress = progress.find((p) => p.itemId === item.id);
              const isItemComplete = itemProgress?.completed ?? false;
              const slug = item.goalSlugMap?.[userGoal ?? ""] ?? item.slug;

              return (
                <Link
                  key={item.id}
                  href={isItemComplete ? "#" : `/post/${slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: isItemComplete ? "#f7faf0" : "#fafafa",
                    border: `1px solid ${isItemComplete ? "#d4ed8a" : "#f0f0f0"}`,
                    textDecoration: "none",
                    pointerEvents: isItemComplete ? "none" : "auto",
                  }}
                >
                  {/* Checkmark or circle */}
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: isItemComplete ? "#b8f000" : "transparent",
                      border: `2px solid ${isItemComplete ? "#b8f000" : "#ccc"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.65rem",
                      color: "#1e3530",
                      fontWeight: 700,
                    }}
                  >
                    {isItemComplete ? "✓" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: isItemComplete ? "#888" : "#313a43",
                      fontWeight: isItemComplete ? 400 : 500,
                      textDecoration: isItemComplete ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </span>
                  {!isItemComplete && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#ccc",
                        fontSize: "0.8rem",
                      }}
                    >
                      →
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Hide the entire checklist card (toggle, persisted in localStorage) */}
      <div style={{ marginTop: collapsed ? 12 : 16, paddingTop: 12 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            try {
              localStorage.setItem(CHECKLIST_HIDDEN_KEY, "true");
            } catch {
              // Ignore; parent state can still hide via onHide.
            }
            onHide?.();
          }}
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Hide
        </a>
      </div>
    </div>
  );
}

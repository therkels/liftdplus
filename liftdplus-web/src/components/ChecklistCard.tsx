"use client";

import { useState } from "react";
import Link from "next/link";
import { useChecklist } from "@/hooks/useChecklist";
import { CHECKLIST_ITEMS, CHECKLIST_COMPLETION_MESSAGE } from "@/types/checklist";

interface ChecklistCardProps {
  userGoal?: string;
}

export function ChecklistCard({ userGoal }: ChecklistCardProps) {
  const { progress, completedCount, totalCount, isComplete, isLoading } =
    useChecklist(userGoal);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading) return null;
  if (dismissed) return null;

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
        <div>
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
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.2rem",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
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
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none",
            border: "none",
            color: "#999",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          {collapsed ? "Show ↓" : "Hide ↑"}
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
    </div>
  );
}

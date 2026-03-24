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
          background: "var(--cream)",
          borderRadius: 16,
          border: "1px solid var(--rule)",
          borderLeft: "4px solid var(--accent-light)",
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            {CHECKLIST_COMPLETION_MESSAGE.headline}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--subtext)",
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
        background: "var(--cream)",
        border: "1px solid var(--rule)",
        borderLeft: "4px solid var(--accent-light)",
        borderRadius: 16,
        padding: collapsed ? "16px 20px" : "20px 24px",
        marginBottom: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--accent-light)",
            }}
          >
            A few things worth knowing first
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--foreground)",
              background: "var(--accent)",
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {completedCount === 0
              ? "Start here — takes ~15 min"
              : `${completedCount} of ${totalCount} done — keep going`}
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
        <p style={{
          fontSize: "0.78rem",
          color: "var(--subtext)",
          marginBottom: 12,
          marginTop: -4,
          lineHeight: 1.5,
        }}>
          The more you explore, the more we can tailor what you see.
        </p>
      )}

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
                background: "var(--accent)",
                borderRadius: 2,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Checklist items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CHECKLIST_ITEMS.map((item) => {
              const itemProgress = progress.find((p) => p.itemId === item.id);
              const isItemComplete = itemProgress?.completed ?? false;
              const slug = item.goalSlugMap?.[userGoal ?? ""] ?? item.slug;

              return (
                <Link
                  key={item.id}
                  href={`/post/${slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 8,
                    background: isItemComplete ? "#f5f6f2" : "#ffffff",
                    textDecoration: "none",
                    boxShadow: isItemComplete
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.08)",
                    border: `1px solid ${isItemComplete ? "var(--rule)" : "transparent"}`,
                    transition: "box-shadow 0.2s ease, background 0.2s ease",
                    opacity: isItemComplete ? 0.7 : 1,
                  }}
                >
                  {/* Checkmark or circle */}
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isItemComplete ? "var(--accent)" : "transparent",
                      border: `2px solid ${isItemComplete ? "var(--accent)" : "#d1d5db"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.65rem",
                      color: "var(--foreground)",
                      fontWeight: 700,
                      transition: "background 0.2s ease, border 0.2s ease",
                    }}
                  >
                    {isItemComplete ? "✓" : ""}
                  </span>
                  {/* Title and read time */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: isItemComplete ? "var(--subtext)" : "var(--foreground)",
                        fontWeight: isItemComplete ? 400 : 500,
                        textDecoration: isItemComplete ? "line-through" : "none",
                        display: "block",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </span>
                    {!isItemComplete && (
                      <span style={{
                        fontSize: "0.72rem",
                        color: "var(--subtext)",
                        display: "block",
                        marginTop: 2,
                      }}>
                        {item.readTime}
                      </span>
                    )}
                  </div>
                  {!isItemComplete && (
                    <span style={{
                      color: "var(--accent-light)",
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}>
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

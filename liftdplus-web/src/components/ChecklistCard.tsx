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
        borderRadius: 16,
        padding: "20px 24px 16px 24px",
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
          {/* Horizontal scrolling checklist cards */}
          <div className="overflow-x-auto touch-scroll -mx-2 px-2">
            <div className="flex space-x-3 pb-3" style={{ width: "max-content", paddingRight: "24px" }}>
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
                      flexDirection: "column",
                      justifyContent: "space-between",
                      width: 160,
                      minHeight: 160,
                      padding: "16px",
                      borderRadius: 12,
                      background: isItemComplete ? "#f0f2ee" : "#ffffff",
                      boxShadow: isItemComplete
                        ? "none"
                        : "0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
                      borderTop: `3px solid ${isItemComplete ? "var(--accent)" : "var(--accent-light)"}`,
                      border: `1px solid ${isItemComplete ? "var(--rule)" : "rgba(107,147,140,0.15)"}`,
                      borderTop: `3px solid ${isItemComplete ? "var(--accent)" : "var(--accent-light)"}`,
                      textDecoration: "none",
                      opacity: isItemComplete ? 0.65 : 1,
                      flexShrink: 0,
                      transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    {/* Middle — title */}
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: isItemComplete ? "var(--subtext)" : "var(--foreground)",
                        fontWeight: isItemComplete ? 400 : 600,
                        lineHeight: 1.4,
                        flex: 1,
                        display: "block",
                      }}
                    >
                      {item.title}
                    </span>
                  {/* Bottom */}
                  <div style={{ marginTop: 8 }}>
                    {isItemComplete ? (
                      <span style={{
                        fontSize: "0.7rem",
                        color: "var(--foreground)",
                        background: "var(--accent)",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontWeight: 600,
                      }}>
                        ✓ Done
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "0.68rem",
                        color: "var(--accent-light)",
                        fontWeight: 600,
                        display: "block",
                        marginTop: 8,
                      }}>
                        {item.readTime} read →
                      </span>
                    )}
                  </div>
                  </Link>
                );
              })}
            </div>
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

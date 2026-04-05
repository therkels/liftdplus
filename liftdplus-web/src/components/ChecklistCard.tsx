"use client";

import { Fragment, useEffect, useState } from "react";
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
      style={
        collapsed
          ? {
              background: "var(--cream)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "16px",
              border: "1px solid var(--rule)",
            }
          : {
              background: "var(--cream)",
              borderRadius: 16,
              padding: "20px 24px 16px 24px",
              marginBottom: 24,
            }
      }
    >
      {/* Header / banner */}
      <div
        style={{
          marginTop: collapsed ? -12 : -20,
          marginLeft: collapsed ? -16 : -24,
          marginRight: collapsed ? -16 : -24,
          marginBottom: collapsed ? 0 : 12,
          padding: collapsed ? "12px 16px 10px" : "16px 24px 14px",
          background: "#1a3a3a",
          borderBottom: "3px solid #4a8b8c",
          borderTopLeftRadius: collapsed ? 12 : 16,
          borderTopRightRadius: collapsed ? 12 : 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              A few things worth knowing first
            </span>
            {completedCount === 0 ? (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#1a3a3a",
                  background: "#c8f135",
                  borderRadius: "999px",
                  padding: "2px 10px",
                  marginLeft: "8px",
                }}
              >
                4 short reads · ~15 min
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#1a3a3a",
                  background: "#c8f135",
                  padding: "2px 8px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {`${completedCount} of ${totalCount} done — keep going`}
              </span>
            )}
          </div>
          {collapsed ? (
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Show
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(CHECKLIST_HIDDEN_KEY, "true");
                  } catch {
                    // Ignore; parent state can still hide via onHide.
                  }
                  onHide?.();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  marginLeft: "8px",
                }}
              >
                Dismiss
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Hide
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#666666",
              marginBottom: 12,
              marginTop: -4,
              lineHeight: 1.5,
            }}
          >
            The more you explore, the more we can tailor what you see.
          </p>

          {!isComplete && (
            <p
              style={{
                fontSize: "0.72rem",
                color: "#666666",
                marginTop: "2px",
                marginBottom: "8px",
              }}
            >
              or{" "}
              <button
                type="button"
                onClick={() => onHide?.()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666666",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  padding: 0,
                }}
              >
                jump straight to content
              </button>
            </p>
          )}

          <div className="checklist-grid">
            {CHECKLIST_ITEMS.map((item, index) => {
              const itemProgress = progress.find((p) => p.itemId === item.id);
              const isItemComplete = itemProgress?.completed ?? false;
              const slug = item.goalSlugMap?.[userGoal ?? ""] ?? item.slug;
              const isLast = index === CHECKLIST_ITEMS.length - 1;
              return (
                <Fragment key={item.id}>
                  <Link
                    href={`/post/${slug}`}
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px 12px",
                    borderRadius: "10px",
                    background: isItemComplete ? "var(--cream)" : "#ffffff",
                    boxShadow:
                      index === 0 && !isItemComplete
                        ? "0 4px 14px rgba(31,78,90,0.14), 0 1px 3px rgba(0,0,0,0.06)"
                        : isItemComplete
                          ? "none"
                          : "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
                    border: `1px solid ${isItemComplete ? "var(--rule)" : "rgba(107,147,140,0.12)"}`,
                    borderTop: "3px solid var(--accent-light)",
                    textDecoration: "none",
                    opacity: isItemComplete ? 0.7 : 1,
                    transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    minHeight: "130px",
                  }}
                >
                  {index === 0 && !isItemComplete && (
                    <span
                      className="checklist-start-label"
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "4px",
                        display: "block",
                      }}
                    >
                      Start here
                    </span>
                  )}

                  <span
                    className="checklist-number"
                    style={{
                      fontSize: "2.8rem",
                      fontWeight: 700,
                      color: "#4a8b8c",
                      opacity: isItemComplete ? 0.3 : 0.35,
                      lineHeight: 1,
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {index + 1}
                  </span>

                  <div className="checklist-body">
                    <span
                      className="checklist-title"
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: isItemComplete ? 500 : 600,
                        color: isItemComplete ? "#666666" : "var(--foreground)",
                        lineHeight: 1.35,
                        flex: 1,
                        display: "block",
                      }}
                    >
                      {item.title}
                    </span>

                    {isItemComplete ? (
                      <span
                        className="checklist-meta"
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--accent-light)",
                          fontWeight: 600,
                          marginTop: "10px",
                          display: "block",
                        }}
                      >
                        ✓ Done
                      </span>
                    ) : (
                      <span
                        className="checklist-meta"
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--accent-light)",
                          fontWeight: 600,
                          marginTop: "10px",
                          display: "block",
                        }}
                      >
                        {item.readTime} read →
                      </span>
                    )}
                  </div>
                  </Link>

                  {!isLast && (
                    <div
                      className="checklist-connector"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--rule)",
                        fontSize: "0.75rem",
                        opacity: 0.5,
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      →
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </>
      )}

      {/* Hide the entire checklist card (expanded only; collapsed uses header Dismiss) */}
      {!collapsed && (
        <div style={{ marginTop: 16, paddingTop: 12 }}>
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
              color: "#767676",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Hide
          </a>
        </div>
      )}
    </div>
  );
}

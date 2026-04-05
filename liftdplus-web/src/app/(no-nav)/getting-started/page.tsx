"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { CHECKLIST_ITEMS } from "@/types/checklist";

export default function GettingStartedPage() {
  const router = useRouter();
  const [userGoal, setUserGoal] = useState<string>("sleep");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user's primary goal from preferences
      const { data: prefs } = await supabase
        .from("private.preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefs?.topics?.[0]) {
        setUserGoal(prefs.topics[0].toLowerCase());
      }

      // Mark has_seen_checklist so this page never shows again
      await supabase
        .from("private.users")
        .update({ has_seen_checklist: true })
        .eq("id", user.id);

      setIsLoading(false);
    }
    init();
  }, [router]);

  if (isLoading) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9f8f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>
        {/* Header / banner */}
        <div
          style={{
            background: "#1a3a3a",
            borderBottom: "3px solid #4a8b8c",
            borderRadius: "12px 12px 0 0",
            padding: "20px 20px 18px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#c8f135",
                margin: 0,
              }}
            >
              Your starting point
            </p>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#1a3a3a",
                background: "#c8f135",
                padding: "4px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              5 steps
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Here's how to get ready.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.75)",
              marginBottom: 0,
              lineHeight: 1.6,
            }}
          >
            Five things to understand before your first dispensary visit. Read
            each one and you'll know exactly what you're looking for.
          </p>
        </div>

        {/* Checklist items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {CHECKLIST_ITEMS.map((item, index) => {
            const slug = item.goalSlugMap?.[userGoal ?? ""] ?? item.slug;
            return (
              <Link
                key={item.id}
                href={`/post/${slug}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "16px 20px",
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  textDecoration: "none",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                <span
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#4a8b8c",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#1a3a3a",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#777",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#ccc",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                    alignSelf: "center",
                  }}
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>

        {/* Skip link */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/explore"
            style={{
              fontSize: "0.85rem",
              color: "#999",
              textDecoration: "underline",
            }}
          >
            Skip for now — take me to the feed
          </Link>
        </div>
      </div>
    </div>
  );
}


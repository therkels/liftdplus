"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";

const OPTIONS = [
  "How to avoid feeling mentally foggy",
  "How to avoid anxiety or feeling overwhelmed",
  "How to find the right dosage",
  "What to expect from different products",
  "I'm mostly exploring and learning",
] as const;

const TOPIC_TO_GOAL: Record<string, string> = {
  Sleep: "sleep",
  "Stress and anxiety": "stress",
  "Focus and productivity": "focus",
  "Pain and recovery": "pain",
  "Intimacy & Libido": "intimacy",
  "Hormonal Changes": "hormonal",
  "I'm not sure yet": "stress",
};

const EXPERIENCE_TO_ID: Record<string, string> = {
  "I've never tried cannabis": "never",
  "I've tried it a few times": "beginner",
  "I use it occasionally": "occasional",
  "I use it regularly": "regular",
  "I used to use cannabis but stopped": "never",
};

function readLegacyJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function LegacyOnboardingQ4Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    sendGAEvent("event", "onboarding_legacy_q4_viewed", {});
  }, []);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "legacy_q4" });
  }, []);

  const select = (option: string) => {
    setSelected(option);
    trackEvent("onboarding_answer_selected", { step: "legacy_q4", answer: option });
  };

  const handleContinue = async () => {
    if (!selected || saving) return;
    setSaveError(null);
    setSaving(true);

    const q1 = readLegacyJson<{ topics?: string[] }>("liftd_legacy_q1");
    const q2 = readLegacyJson<{ experienceLevel?: string }>("liftd_legacy_q2");
    const q3 = readLegacyJson<{ purchaseBehavior?: string }>("liftd_legacy_q3");
    const learningGoal = selected;

    const firstTopic = q1?.topics?.[0] ?? "";
    const experienceLabel = q2?.experienceLevel ?? "";

    const primary_goal_id = TOPIC_TO_GOAL[firstTopic] ?? "stress";
    const secondary_goal_id = TOPIC_TO_GOAL[q1?.topics?.[1] ?? ""] ?? null;
    const tertiary_goal_id = TOPIC_TO_GOAL[q1?.topics?.[2] ?? ""] ?? null;
    const experience_level_id = EXPERIENCE_TO_ID[experienceLabel] ?? "never";

    try {
      const res = await fetch("/api/v0/user/onboarding-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_goal_id, experience_level_id, secondary_goal_id, tertiary_goal_id }),
      });

      if (!res.ok) {
        setSaveError("Something went wrong. Please try again.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("liftd_legacy_q1");
        localStorage.removeItem("liftd_legacy_q2");
        localStorage.removeItem("liftd_legacy_q3");
      }

      sendGAEvent("event", "onboarding_legacy_q4_completed", {
        learningGoal,
        purchaseBehavior: q3?.purchaseBehavior ?? "",
        primary_goal_id,
        experience_level_id,
      });

      trackEvent("legacy_onboarding_completed", {
        primary_goal_id,
        experience_level_id,
      });

      router.push("/explore");
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canContinue = selected !== null && !saving;

  return (
    <div
      className="relative m-0 min-h-screen h-screen w-[100vw] overflow-auto p-0"
      style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}
    >
      {/* Full-screen background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/satria-perkasa-gIuRClqbqzQ-unsplash.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "40% 30%" }}
          priority
          sizes="100vw"
        />
      </div>

      {/* Blur overlay */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,20,30,0.15) 0%, rgba(10,20,30,0.65) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-[3] min-h-screen flex flex-col items-center justify-center w-full"
        style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "540px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* Top nav row: Back + Progress dots */}
          <div className="w-full flex items-center justify-between mb-6">
            <div
              role="button"
              tabIndex={saving ? -1 : 0}
              onClick={() => !saving && router.push("/onboarding/legacy/q3")}
              onKeyDown={(e) => e.key === "Enter" && !saving && router.push("/onboarding/legacy/q3")}
              className="inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                color: saving ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)",
                fontSize: "14px",
                fontWeight: 500,
                minHeight: "44px",
                padding: "0 8px",
                pointerEvents: saving ? "none" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.color = "rgba(255,255,255,0.95)";
              }}
              onMouseLeave={(e) => {
                if (!saving) e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }}
            >
              ← Back
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "rgba(204,255,51,0.4)",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "rgba(204,255,51,0.4)",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "rgba(204,255,51,0.4)",
                }}
              />
              <div
                style={{
                  width: "24px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "#ccff33",
                }}
              />
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="brightness-0 invert">
              <Image
                src="/liftd-icon.svg"
                alt="LIFTD+"
                width={52}
                height={52}
                className="w-[52px] h-[52px]"
              />
            </div>
          </div>

          {/* Question header */}
          <div className="text-center mt-2 mb-6">
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#ccff33" }}
            >
              QUESTION 4 OF 4
            </p>
            <h1 className="text-[22px] font-bold text-white leading-snug">
              What do you most want to avoid?
            </h1>
          </div>

          {/* Options list */}
          <div className="flex flex-col gap-2 mb-4 w-full">
            {OPTIONS.map((option) => {
              const isSelected = selected === option;
              return (
                <div
                  key={option}
                  role="button"
                  tabIndex={saving ? -1 : 0}
                  onClick={() => !saving && select(option)}
                  onKeyDown={(e) => {
                    if (saving) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(option);
                    }
                  }}
                  className="rounded-xl cursor-pointer"
                  style={{
                    background: isSelected
                      ? "rgba(204,255,51,0.13)"
                      : "rgba(255,255,255,0.18)",
                    border: "1px solid",
                    borderColor: isSelected ? "#ccff33" : "rgba(255,255,255,0.14)",
                    color: isSelected ? "#ffffff" : "rgba(255,255,255,0.75)",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "15px",
                    fontWeight: isSelected ? 600 : undefined,
                    borderRadius: "12px",
                    opacity: saving ? 0.6 : 1,
                    pointerEvents: saving ? "none" : undefined,
                  }}
                >
                  <span>{option}</span>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                      background: isSelected ? "#ccff33" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isSelected ? "0 0 8px rgba(204,255,51,0.35)" : undefined,
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 13 13"
                        fill="none"
                        style={{ width: "13px", height: "13px" }}
                      >
                        <path
                          d="M2 6.5l3.5 3.5 5.5-6"
                          stroke="#1a2530"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {saveError && (
            <p className="text-center text-sm mb-3" style={{ color: "#ff6b6b" }}>
              {saveError}
            </p>
          )}

          {/* Continue button */}
          <div
            role="button"
            tabIndex={canContinue ? 0 : -1}
            onClick={canContinue ? handleContinue : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) handleContinue();
            }}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
              transition: "all 0.2s ease",
              backgroundColor:
                selected && !saving ? "#ccff33" : "rgba(255,255,255,0.12)",
              color: selected && !saving ? "#1a2530" : "rgba(255,255,255,0.3)",
              boxShadow: selected && !saving ? "0 0 28px rgba(204,255,51,0.3)" : "none",
              cursor: selected && !saving ? "pointer" : "not-allowed",
            }}
          >
            {saving ? "Saving…" : "Continue →"}
          </div>
        </div>
      </div>
    </div>
  );
}

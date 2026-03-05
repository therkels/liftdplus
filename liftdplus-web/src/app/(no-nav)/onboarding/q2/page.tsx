"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

const OPTIONS = [
  "I've never tried cannabis",
  "I've tried it a few times",
  "I use it occasionally",
  "I use it regularly",
  "I used to use cannabis but stopped",
] as const;

const STORAGE_KEY = "liftd_onboarding_q2";

export default function OnboardingQ2Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    sendGAEvent("event", "onboarding_q2_viewed", {});
  }, []);

  const select = (option: string) => {
    setSelected(option);
  };

  const handleContinue = () => {
    if (!selected) return;
    sendGAEvent("event", "onboarding_q2_completed", { experienceLevel: selected });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ experienceLevel: selected }));
    }
    router.push("/onboarding/q3");
  };

  const canContinue = selected !== null;

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
              tabIndex={0}
              onClick={() => router.push("/onboarding/q1")}
              onKeyDown={(e) => e.key === "Enter" && router.push("/onboarding/q1")}
              className="inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "14px",
                fontWeight: 500,
                minHeight: "44px",
                padding: "0 8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
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
                  width: "24px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "#ccff33",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.2)",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.2)",
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
              QUESTION 2 OF 4
            </p>
            <h1 className="text-[22px] font-bold text-white leading-snug">
              What&apos;s your experience with cannabis?
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
                  tabIndex={0}
                  onClick={() => select(option)}
                  onKeyDown={(e) => {
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
              backgroundColor: canContinue ? "#ccff33" : "rgba(255,255,255,0.12)",
              color: canContinue ? "#1a2530" : "rgba(255,255,255,0.3)",
              boxShadow: canContinue ? "0 0 28px rgba(204,255,51,0.3)" : "none",
              cursor: canContinue ? "pointer" : "not-allowed",
            }}
          >
            Continue →
          </div>
        </div>
      </div>
    </div>
  );
}

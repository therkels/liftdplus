"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";

const DISCLAIMER_KEY = "liftd_disclaimer";

export default function DisclaimerPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    sendGAEvent("event", "disclaimer_viewed", {});
  }, []);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "disclaimer" });
  }, []);

  const handleContinue = () => {
    if (!checked) return;
    sendGAEvent("event", "disclaimer_continued", {});
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCLAIMER_KEY, JSON.stringify({ disclaimerAccepted: true }));
    }
    router.push("/onboarding/q1");
  };

  return (
    <div className="relative m-0 min-h-screen h-screen w-[100vw] overflow-auto p-0" style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}>
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

      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(175deg, rgba(8,16,26,0.45) 0%, rgba(8,16,26,0.65) 40%, rgba(6,12,22,0.92) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] min-h-screen flex flex-col items-center justify-center w-full text-[16px]">
        <div className="flex flex-col" style={{ width: "100%", maxWidth: "540px", margin: "0 auto", padding: "40px 24px" }}>
          {/* Icon */}
          <div className="flex justify-center">
            <div className="brightness-0 invert">
              <Image
                src="/liftd-icon.svg"
                alt="LIFTD+"
                width={52}
                height={52}
                className="w-[52px] h-[52px] lg:w-[60px] lg:h-[60px]"
              />
            </div>
          </div>

          {/* Label */}
          <p
            className="mt-4 text-[10px] uppercase tracking-widest text-center"
            style={{ color: "#ccff33" }}
          >
            BEFORE WE BEGIN
          </p>

          {/* Card */}
          <div
            className="mt-6 w-full rounded-2xl border py-6 px-[26px] lg:px-10 lg:py-8"
            style={{
              background: "rgba(255,255,255,0.18)",
              borderColor: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              width: "100%",
              minWidth: "300px",
              boxSizing: "border-box",
            }}
          >
            <h2 className="text-xl font-bold text-white lg:text-2xl mb-4">
              Important Information
            </h2>

            <p className="text-sm lg:text-base text-white/70 leading-relaxed mb-0">
              LIFTD+ is an educational platform for understanding cannabis — not medical advice, treatment, or professional guidance. If you have health or medication questions, consult a qualified healthcare professional. Nothing here is intended to diagnose, treat, cure, or prevent any medical condition.
            </p>
            <div className="border-t border-white/[0.08] mt-6 mb-4" />

            {/* Checkbox row */}
            <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3 bg-white/[0.08] hover:bg-white/[0.06] transition-colors duration-150">
              <span className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="absolute opacity-0 w-7 h-7 cursor-pointer inset-0"
                  aria-label="I confirm I'm 21 or older and understand LIFTD+ provides educational information, not medical advice"
                />
                <span
                  className={`w-7 h-7 min-w-[28px] rounded-md flex items-center justify-center ${
                    checked
                      ? ""
                      : "bg-white/20 border border-white/30"
                  }`}
                  style={
                    checked
                      ? {
                          backgroundColor: "#ccff33",
                          boxShadow: "0 0 12px rgba(204,255,51,0.32)",
                        }
                      : undefined
                  }
                >
                  {checked && (
                    <svg
                      width="14"
                      height="11"
                      viewBox="0 0 14 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#1a2530]"
                    >
                      <path
                        d="M1 5.5L5 9.5L13 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm text-white/80 leading-snug">
                I confirm I&apos;m <span className="font-semibold text-white">21 or older</span> and understand LIFTD+ provides <span className="font-semibold text-white">educational information</span>, not medical advice
              </span>
            </label>
          </div>

          {/* Continue */}
          <div
            role="button"
            tabIndex={0}
            onClick={checked ? handleContinue : undefined}
            onKeyDown={(e) => e.key === "Enter" && checked && handleContinue()}
            className="mt-6"
            style={{
              backgroundColor: checked ? "#ccff33" : "rgba(255,255,255,0.12)",
              color: checked ? "#1a2530" : "rgba(255,255,255,0.3)",
              boxShadow: checked ? "0 0 28px rgba(204,255,51,0.3)" : "none",
              cursor: checked ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              fontWeight: "700",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            Continue →
          </div>
        </div>
      </div>
    </div>
  );
}

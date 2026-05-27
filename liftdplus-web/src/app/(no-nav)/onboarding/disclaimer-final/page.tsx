"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";

const DISCLAIMER_KEY = "liftd_disclaimer";

export default function DisclaimerFinalPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    sendGAEvent("event", "onboarding_disclaimer_final_viewed", {});
  }, []);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "disclaimer_final" });
  }, []);

  const handleContinue = () => {
    if (!checked) return;
    sendGAEvent("event", "onboarding_disclaimer_accepted", {});
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCLAIMER_KEY, JSON.stringify({ disclaimerAccepted: true }));
    }
    router.push("/getting-started");
  };

  return (
    <div
      className="relative m-0 min-h-screen h-screen w-[100vw] overflow-auto p-0"
      style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}
    >
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

      <div
        className="fixed inset-0 z-[1]"
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      <div
        className="fixed inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,20,30,0.15) 0%, rgba(10,20,30,0.65) 100%)",
        }}
      />

      <div className="relative z-[3] min-h-screen flex flex-col items-center justify-center w-full">
        <div
          style={{
            width: "100%",
            maxWidth: "540px",
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push("/onboarding/q4")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/onboarding/q4")}
            className="inline-flex items-center gap-1.5 cursor-pointer mb-6"
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "14px",
              fontWeight: 500,
              minHeight: "44px",
              padding: "0 8px",
            }}
          >
            ← Back
          </div>

          <div className="flex justify-center mb-4">
            <Image src="/liftd-icon.svg" alt="LIFTD+" width={140} height={140} className="w-[140px] h-[140px]" />
          </div>

          <p
            className="text-center text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "#6b938c" }}
          >
            BEFORE WE FINISH
          </p>

          <h1 className="text-center text-[26px] font-bold text-white leading-snug mb-5">
            Before we continue
          </h1>

          <div
            className="rounded-2xl border py-6 px-[26px] mb-6"
            style={{
              background: "rgba(255,255,255,0.18)",
              borderColor: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              LIFTD+ is designed to help you better understand cannabis and cannabis
              products through educational content and personalized guidance.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              We do not provide medical advice, treatment, or healthcare recommendations.
              If you have questions about medications, health conditions, pregnancy,
              breastfeeding, or cannabis use, please speak with a qualified healthcare
              professional.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-5">
              Nothing on LIFTD+ is intended to diagnose, treat, cure, or prevent any
              medical condition.
            </p>

            <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3 bg-white/[0.08]">
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
                    checked ? "" : "bg-white/20 border border-white/30"
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
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path
                        d="M1 5.5L5 9.5L13 1.5"
                        stroke="#313a43"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm text-white/80 leading-snug">
                I confirm I&apos;m 21 or older and understand LIFTD+ provides educational
                information, not medical advice.
              </span>
            </label>
          </div>

          <div
            role="button"
            tabIndex={checked ? 0 : -1}
            onClick={checked ? handleContinue : undefined}
            onKeyDown={(e) => e.key === "Enter" && checked && handleContinue()}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
              backgroundColor: checked ? "#ccff33" : "rgba(255,255,255,0.12)",
              color: checked ? "#313a43" : "rgba(255,255,255,0.3)",
              boxShadow: checked ? "0 0 28px rgba(204,255,51,0.3)" : "none",
              cursor: checked ? "pointer" : "not-allowed",
            }}
          >
            Continue →
          </div>
        </div>
      </div>
    </div>
  );
}

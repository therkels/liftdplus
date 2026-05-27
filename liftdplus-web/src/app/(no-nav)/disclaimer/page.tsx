"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";

const CHECKMARKS = [
  "Product recommendations tailored to your comfort level and goals",
  "Guidance designed for curious and cautious beginners",
  "A clearer understanding of what may fit your lifestyle and needs",
] as const;

export default function DisclaimerPage() {
  const router = useRouter();

  useEffect(() => {
    sendGAEvent("event", "disclaimer_viewed", {});
  }, []);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "disclaimer_bridge" });
  }, []);

  const handleContinue = () => {
    sendGAEvent("event", "disclaimer_bridge_continued", {});
    trackEvent("onboarding_step_completed", { step: "disclaimer_bridge" });
    router.push("/onboarding/q2");
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
            onClick={() => router.push("/")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/")}
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
            <Image
              src="/liftd-icon.svg"
              alt="LIFTD+"
              width={140}
              height={140}
              className="w-[140px] h-[140px]"
            />
          </div>

          <p
            className="text-center text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "#6b938c" }}
          >
            BEFORE WE BEGIN
          </p>

          <h1 className="text-center text-[26px] font-bold text-white leading-snug mb-5">
            You&apos;re in the right place.
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
              Based on your answers, we&apos;ll build you a personalized guide with
              beginner-friendly education, dosage guidance, and product recommendations
              tailored to your comfort level.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-5">
              You&apos;ll learn about THC, CBD, product types, and what different
              experiences can feel like — without the pressure or jargon.
            </p>

            <ul className="space-y-3">
              {CHECKMARKS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-0.5 font-bold"
                    style={{ color: "#6b938c" }}
                  >
                    ✓
                  </span>
                  <span className="text-sm text-white/85 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={handleContinue}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
              backgroundColor: "#ccff33",
              color: "#313a43",
              boxShadow: "0 0 28px rgba(204,255,51,0.3)",
              cursor: "pointer",
            }}
          >
            Start My Guide →
          </div>
        </div>
      </div>
    </div>
  );
}

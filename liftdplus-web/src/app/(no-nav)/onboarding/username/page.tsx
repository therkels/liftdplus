"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";
import { createClient } from "@/utils/supabase/client";
import { pageCache } from "@/utils/cache/PageCache";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const TOPIC_MAP: Record<string, string> = {
  "Sleep": "Sleep & Rest",
  "Stress and anxiety": "Stress & Anxiety",
  "Focus and productivity": "Focus & Creativity",
  "Pain and recovery": "Pain Relief",
  "Intimacy & Libido": "Intimacy & Libido",
  "Hormonal Changes": "Hormonal Changes",
  "Understanding cannabis basics": "Cannabis 101",
  "General wellness": "Cannabis 101",
};
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

type OnboardingData = {
  topics?: string[];
  experienceLevel?: string;
  purchaseBehavior?: string;
  learningGoal?: string;
};

function parseStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function OnboardingUsernamePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Auth check and read localStorage on mount
  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const q1 = parseStorage<{ topics: string[] }>("liftd_onboarding_q1");
      const q2 = parseStorage<{ experienceLevel: string }>("liftd_onboarding_q2");
      const q3 = parseStorage<{ purchaseBehavior: string }>("liftd_onboarding_q3");
      const q4 = parseStorage<{ learningGoal: string }>("liftd_onboarding_q4");

      setOnboardingData({
        topics: q1?.topics ?? [],
        experienceLevel: q2?.experienceLevel ?? "",
        purchaseBehavior: q3?.purchaseBehavior ?? "",
        learningGoal: q4?.learningGoal ?? "",
      });
      setMounted(true);
    };
    run();
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    sendGAEvent("event", "username_screen_viewed", {});
  }, [mounted]);

  const validationError = useMemo(() => {
    const trimmed = username.trim();
    if (trimmed.length < MIN_LENGTH) {
      return "Username must be at least 3 characters";
    }
    if (trimmed.length > MAX_LENGTH) {
      return "Username must be 20 characters or less";
    }
    if (!USERNAME_REGEX.test(trimmed)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  }, [username]);

  const isValid = validationError === null;
  const displayError = apiError ?? validationError;

  const handleContinue = async () => {
    if (!isValid || submitting) return;

    setApiError(null);
    setSubmitting(true);

    try {
      // Same as onboarding/page.tsx: update existing username (create_user already set a random one)
      const formData = new FormData();
      formData.append("username", username.trim());

      const usernameRes = await fetch("/api/v0/user/username", {
        method: "POST",
        body: formData,
      });

      if (!usernameRes.ok) {
        const errBody = await usernameRes.json().catch(() => ({}));
        const message = errBody?.error ?? "Something went wrong";
        const isTaken =
          usernameRes.status === 409 ||
          /taken|already exists|duplicate|unique/i.test(String(message));
        setApiError(isTaken ? "This username is already taken" : message);
        setSubmitting(false);
        return;
      }

      // Same format as onboarding/page.tsx: POST preferences with { interests: array }
      const selectedInterests = (onboardingData.topics ?? []).map(
        (topic) => TOPIC_MAP[topic] ?? topic
      );
      const prefRes = await fetch("/api/v0/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interests: selectedInterests,
        }),
      });

      if (!prefRes.ok) {
        setApiError("Failed to save preferences. Please try again.");
        setSubmitting(false);
        return;
      }

      pageCache.invalidate("feed:");
      pageCache.invalidate("profile:");
      pageCache.invalidate("favorites:");

      if (typeof window !== "undefined") {
        localStorage.removeItem("liftd_disclaimer");
        localStorage.removeItem("liftd_onboarding_q1");
        localStorage.removeItem("liftd_onboarding_q2");
        localStorage.removeItem("liftd_onboarding_q3");
        localStorage.removeItem("liftd_onboarding_q4");
      }

      trackEvent("onboarding_completed", { source: "username_step" });
      trackEvent("signup_completed", { method: "google" });

      sendGAEvent("event", "onboarding_completed", {
        experienceLevel: onboardingData.experienceLevel,
        purchaseBehavior: onboardingData.purchaseBehavior,
        learningGoal: onboardingData.learningGoal,
      });

      router.push("/getting-started");
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div
        className="relative m-0 min-h-screen w-[100vw] overflow-auto p-0 flex items-center justify-center"
        style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}
      >
        <div className="text-white/60">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="relative m-0 min-h-screen h-screen w-[100vw] overflow-auto p-0"
      style={{ fontSize: "16px", WebkitTextSizeAdjust: "100%" }}
    >
      {/* Full-screen background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/uran-wang-EewJbSBL8ec-unsplash.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "50% 40%" }}
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
          {/* Icon */}
          <div className="flex justify-center">
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

          {/* Eyebrow */}
          <p
            className="text-center mt-4 mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#ccff33" }}
          >
            ALMOST THERE
          </p>

          {/* Title */}
          <h1 className="text-[22px] font-bold text-white text-center leading-snug mb-2">
            Choose your username
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-white/40 text-center leading-relaxed mb-2">
            This is how you&apos;ll appear on LIFTD+. You can change it later.
          </p>
          <p className="text-sm text-center leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
            We&apos;ll use your answers to build your guide — a personalized starting point for your first dispensary visit.
          </p>

          {/* Input */}
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setApiError(null);
            }}
            placeholder="e.g. wellness_explorer"
            autoComplete="username"
            className="w-full rounded-xl border transition-colors outline-none placeholder:opacity-50 placeholder:text-white"
            style={{
              padding: "14px 18px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "white",
              fontSize: "16px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#ccff33";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.14)";
            }}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? "username-error" : undefined}
          />

          {/* Error message */}
          {displayError ? (
            <p
              id="username-error"
              className="text-sm mt-2 mb-0"
              style={{ color: "#ff6b6b" }}
            >
              {displayError}
            </p>
          ) : null}

          {/* Continue button */}
          <div
            role="button"
            tabIndex={isValid && !submitting ? 0 : -1}
            onClick={isValid && !submitting ? handleContinue : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid && !submitting) handleContinue();
            }}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
              marginTop: "24px",
              transition: "all 0.2s ease",
              backgroundColor:
                isValid && !submitting ? "#ccff33" : "rgba(255,255,255,0.12)",
              color:
                isValid && !submitting ? "#1a2530" : "rgba(255,255,255,0.3)",
              boxShadow:
                isValid && !submitting
                  ? "0 0 28px rgba(204,255,51,0.3)"
                  : "none",
              cursor:
                isValid && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Saving…" : "Continue →"}
          </div>
        </div>
      </div>
    </div>
  );
}

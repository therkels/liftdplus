"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { trackEvent } from "@/utils/analytics";

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

export default function GettingStartedPage() {
  const [topic, setTopic] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "getting_started_guide" });
    const q1 = parseStorage<{ topics: string[] }>("liftd_onboarding_q1");
    if (q1?.topics?.[0]) {
      setTopic(q1.topics[0]);
    }
  }, []);

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
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <Image
          src="/liftd-icon.svg"
          alt="LIFTD+"
          width={80}
          height={80}
          style={{ margin: "0 auto 24px" }}
        />

        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b938c",
            marginBottom: 12,
          }}
        >
          Your personalized guide
        </p>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#313a43",
            marginBottom: 16,
            lineHeight: 1.25,
          }}
        >
          {topic ? `Built for: ${topic}` : "Your guide is ready"}
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "#5a656e",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Your answers are saved locally. Enter your email on the guide page when
          you&apos;re ready to save your progress — we&apos;ll sync everything then.
        </p>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e0e4e8",
            borderRadius: 12,
            padding: "24px 20px",
            color: "#313a43",
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          <strong>Coming soon:</strong> Landing page v2 with your full personalized
          guide, product recommendations, and email signup.
        </div>
      </div>
    </div>
  );
}

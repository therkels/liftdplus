"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    sendGAEvent("event", "welcome_viewed", { page: "/welcome" });
  }, []);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: "welcome" });
  }, []);

  return (
    <div className="relative m-0 min-h-screen h-screen w-[100vw] overflow-hidden p-0">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-0">
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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex h-full flex-col justify-between pt-12 pb-8 px-6">
        {/* Top: logo */}
        <div className="pt-4 pl-6 md:pt-10">
          <Image
            src="/logos/04 LIFTD+ Logo - White.png"
            width={160}
            height={36}
            alt="LIFTD+"
            className="object-cover object-top w-24 h-auto md:w-40"
          />
        </div>

        {/* Bottom: copy + CTA */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-1">
              Start your guided cannabis exploration.
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Answer 4 quick questions. We&apos;ll build your personalized guide from there.
            </p>
            <p className="mt-2 text-[0.85rem] text-white/60">
              Takes about 2 minutes.
            </p>
            <ul className="mt-4 space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-accent shrink-0 mt-0.5">✓</span>
                <span className="text-base text-white/90">Understand what cannabis actually does, in plain language</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent shrink-0 mt-0.5">✓</span>
                <span className="text-base text-white/90">Learn about dosing and formats before you try anything</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent shrink-0 mt-0.5">✓</span>
                <span className="text-base text-white/90">Feel prepared the next time you walk into a dispensary</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              sendGAEvent("event", "welcome_continued", { page: "/welcome" });
              router.push("/disclaimer");
            }}
            style={{ margin: "0 auto", width: "min(calc(100% - 32px), 400px)" }}
            className="rounded-full bg-accent py-3 text-base font-semibold text-black transition-colors hover:bg-accent/90"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

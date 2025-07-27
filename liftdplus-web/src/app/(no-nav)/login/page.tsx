"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center my-8">
          <img src="/lftd-text.png" alt="LIFTD" className="h-auto w-[60vw]" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 rounded-t-3xl text-center text-white flex flex-col justify-start py-16 bg-accent-dark">
          <h2 className="text-5xl font-[560] mb-4 text-onboarding-header">
            Explore
            <br />
            Your Way
          </h2>
          <p className="text-lg text-white mb-4  leading-relaxed">
            Curious about what cannabis really has
            <br />
            to offer? You're in the right place.
          </p>
          <p className="text-gray-100 mb-8 text-base">
            We'll tailor your experience based on
            <br />
            what you're curious about.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="w-[60vw] py-4 rounded-full font-medium text-black bg-accent"
            >
              Get Started
            </button>
            <button className="w-[60vw] py-4 rounded-full border text-white border-accent">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

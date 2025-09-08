"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <>
      {/* Mobile View */}
      <div className="min-h-screen flex flex-col bg-background lg:hidden">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center my-8">
            <img
              src="/liftd-text.svg"
              alt="LIFTD"
              className="h-auto w-[60vw]"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 rounded-t-3xl text-center text-white flex flex-col justify-start py-16 bg-foreground">
            <h2 className="text-5xl font-[560] mb-4 text-accent-light">
              Explore
              <br />
              Your Way
            </h2>
            <p className="text-lg text-white mb-4 leading-relaxed">
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

      {/* Desktop Web View */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Hero/Branding */}
        <div className="flex-1 bg-foreground flex flex-col justify-center items-center text-white px-12">
          <div className="max-w-lg text-center">
            <img
              src="/liftd-text.svg"
              alt="LIFTD"
              className="h-24 mb-8 mx-auto bg-white px-6 py-3 rounded-lg"
            />
            <h1 className="text-6xl font-[560] mb-6 text-accent-light leading-tight">
              Explore
              <br />
              Your Way
            </h1>
            <p className="text-xl text-white mb-6 leading-relaxed">
              Curious about what cannabis really has to offer? You're in the
              right place.
            </p>
            <p className="text-lg text-gray-100">
              We'll tailor your experience based on what you're curious about.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 bg-background flex flex-col justify-center items-center px-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="text-subtext">Sign in to continue your journey</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGetStarted}
                className="w-full py-4 px-6 rounded-lg font-medium text-black bg-accent hover:bg-accent/90 transition-colors text-lg"
              >
                Get Started
              </button>
              <button className="w-full py-4 px-6 rounded-lg border-2 text-foreground border-foreground hover:bg-backgroundLight transition-colors text-lg">
                Sign In
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-subtext text-sm">
                New to LIFTD?
                <button
                  onClick={handleGetStarted}
                  className="text-accent-light hover:underline ml-1"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

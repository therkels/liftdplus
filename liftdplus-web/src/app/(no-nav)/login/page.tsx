"use client";

import { useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://app.liftdplus.com/api/v0/auth/callback",
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Mobile Web View */}
      <div className="flex flex-col bg-background lg:hidden">
        <div className="text-center">
          <div className="flex justify-center my-8">
            <Image
              src="/liftd-text.svg"
              alt="LIFTD"
              width={240}
              height={96}
              className="h-auto w-[60vw]"
            />
          </div>

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
                to offer? You&apos;re in the right place.
              </p>
              <p className="text-gray-100 mb-8 text-base">
                We&apos;ll tailor your experience based on
                <br />
                what you&apos;re curious about.
              </p>

              <div className="space-y-4 flex flex-col items-center">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-[60vw] py-4 rounded-full font-medium text-black bg-accent flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Get Started</span>
                </button>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-[60vw] py-4 rounded-full border text-white border-accent hover:bg-accent/10 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Web View */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Hero/Branding */}
        <div className="flex-1 bg-foreground flex flex-col justify-center items-center text-white px-12">
          <div className="max-w-lg text-center">
            <Image
              src="/liftd-text.svg"
              alt="LIFTD"
              width={200}
              height={96}
              className="h-24 mb-8 mx-auto bg-white px-6 py-3 rounded-lg"
            />
            <h1 className="text-6xl font-[560] mb-6 text-accent-light leading-tight">
              Explore
              <br />
              Your Way
            </h1>
            <p className="text-xl text-white mb-6 leading-relaxed">
              Curious about what cannabis really has to offer? You&apos;re in
              the right place.
            </p>
            <p className="text-lg text-gray-100">
              We&apos;ll tailor your experience based on what you&apos;re
              curious about.
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
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-6 rounded-lg font-medium text-black bg-accent hover:bg-accent/90 transition-colors text-lg flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Get Started with Google</span>
              </button>

              <div className="text-center">
                <p className="text-subtext text-sm mb-2">
                  Already have an account?
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-6 rounded-lg border-2 text-foreground border-foreground hover:bg-backgroundLight transition-colors text-lg"
                >
                  Sign In with Google
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-subtext text-xs">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

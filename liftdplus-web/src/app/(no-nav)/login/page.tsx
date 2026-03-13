"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://liftdplus.com/api/v0/auth/callback",
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
        {/* Left Side - Hero/Branding (60%) */}
        <div
          className="relative min-h-screen flex-[0_0_60%]"
          style={{ width: "60%" }}
        >
          <Image
            src="/images/uran-wang-EewJbSBL8ec-unsplash.jpg"
            alt=""
            fill
            className="object-cover object-[50%_40%]"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(175deg, rgba(12,28,36,0.35) 0%, rgba(12,28,36,0.55) 40%, rgba(12,28,36,0.92) 100%)",
            }}
          />
          <div
            className="relative z-10 flex flex-col justify-center items-center text-white px-12"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div className="max-w-lg text-center">
              <Image
                src="/logos/04 LIFTD+ Logo - White.png"
                alt="LIFTD+"
                width={200}
                height={96}
                className="h-24 mx-auto w-auto"
                style={{ marginBottom: "24px" }}
              />
              <h1 className="text-6xl font-[560] mb-6 text-white leading-tight">
                Continue your journey
              </h1>
              <p className="text-xl text-white mb-6 leading-relaxed">
                Save your preferences and explore cannabis education designed
                for you.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form (40%) */}
        <div
          className="flex flex-col min-h-screen flex-[0_0_40%]"
          style={{ width: "40%", backgroundColor: "#f9f8f6" }}
        >
          <div
            className="w-full"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "0 52px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: "20px",
                padding: "48px 40px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                maxWidth: "420px",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p
                className="uppercase"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  color: "#6b938c",
                  marginBottom: "16px",
                }}
              >
                WELCOME TO LIFTD+
              </p>
              <h1
                className="text-2xl font-bold"
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "#1a2530",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Your personalized feed is ready.
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1a2530",
                  textAlign: "center",
                  marginBottom: "24px",
                  marginTop: "-8px",
                }}
              >
                Sign in to save your answers and access your feed.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-6 rounded-lg font-medium text-black bg-accent hover:bg-accent/90 transition-colors text-lg flex items-center justify-center space-x-3"
                style={{ maxWidth: "360px" }}
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
                <span>Continue with Google</span>
              </button>
              <p
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline hover:no-underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

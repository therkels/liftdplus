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
      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f9f8f6' }}>
        <div className="w-full max-w-sm flex flex-col items-center">
          <Image
            src="/liftd-icon.svg"
            alt="LIFTD+"
            width={48}
            height={48}
            className="mb-8"
          />
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
            Welcome to LIFTD+
          </p>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Your personalized feed is ready.
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Sign in to pick up where you left off.
          </p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
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

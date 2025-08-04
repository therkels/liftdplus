"use client";
import { useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 80 }}>
      <h1>Sign in</h1>
      <button
        style={{ padding: "12px 24px", fontSize: "1.2rem", cursor: "pointer", marginTop: 24 }}
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </button>
    </main>
  );
}
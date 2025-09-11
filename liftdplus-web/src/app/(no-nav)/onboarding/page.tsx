"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRight } from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";
import { pageCache } from "@/utils/cache/PageCache";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<"username" | "interests">(
    "username"
  );
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const interests = [
    "Sleep & Rest",
    "Stress & Anxiety",
    "Intimacy & Libido",
    "Hormonal Changes",
    "Pain Relief",
    "Focus & Creativity",
    "I'm Not Sure Yet",
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateUsername = (usernameValue: string): string | null => {
    if (!usernameValue.trim()) {
      return "Username cannot be empty";
    }
    if (usernameValue.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (usernameValue.trim().length > 30) {
      return "Username must be less than 30 characters";
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(usernameValue.trim())) {
      return "Username can only contain letters, numbers, underscores, dots, and hyphens";
    }
    return null;
  };

  const handleUsernameNext = async () => {
    if (!user) return;

    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    setSaving(true);
    setUsernameError(null);

    try {
      const formData = new FormData();
      formData.append("username", username.trim());

      const response = await fetch("/api/v0/user/username", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update username");
      }

      // Move to interests step
      setCurrentStep("interests");
    } catch (error) {
      console.error("Error updating username:", error);
      setUsernameError(
        error instanceof Error ? error.message : "Failed to update username"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!user || selectedInterests.length === 0) return;

    setSaving(true);
    try {
      // Save preferences to API
      const response = await fetch("/api/v0/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interests: selectedInterests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      pageCache.invalidate("feed:");
      pageCache.invalidate("profile:");
      pageCache.invalidate("favorites:");

      // Redirect to main app
      router.push("/");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="min-h-screen flex flex-col bg-background lg:hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col pt-12">
          <div className="flex-1 rounded-3xl p-8 text-center text-white relative bg-foreground">
            {/* Icon */}
            <div>
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <Image
                  src="/liftd-icon.svg"
                  alt="LIFTD+ Icon"
                  width={80}
                  height={80}
                />
              </div>
            </div>

            {currentStep === "username" ? (
              <>
                <h2 className="text-3xl font-[560] mb-4 text-white">
                  Choose your
                  <br />
                  username
                </h2>
                <p className="text-base text-white mb-6 leading-relaxed">
                  This will be how others see you
                  <br />
                  in the LIFTD+ community.
                </p>

                {/* Username input */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (usernameError) setUsernameError(null);
                    }}
                    className="w-[60vw] py-4 px-4 rounded-full font-medium text-center text-foreground outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter username"
                    disabled={saving}
                  />
                  {usernameError && (
                    <p className="text-red-300 text-sm mt-2 text-center">
                      {usernameError}
                    </p>
                  )}
                  <p className="text-white/70 text-xs mt-2 text-center">
                    3-30 characters, letters, numbers, _, -, and . only
                  </p>
                </div>

                {/* Next button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUsernameNext}
                    disabled={saving || !username.trim()}
                    className="bg-accentLight text-white px-6 py-2 rounded-full text-sm flex items-center disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Next"}{" "}
                    <HiOutlineArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-[560] mb-4 text-white">
                  What are you curious
                  <br />
                  about right now?
                </h2>
                <p className="text-base text-white mb-4 leading-relaxed">
                  There&apos;s no right answer, just what feels
                  <br />
                  true today. We&apos;ll guide you from there.
                </p>

                {/* Interest buttons */}
                <div className="space-y-3 mb-8">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`w-[60vw] py-4 rounded-full font-medium transition-all border border-accent ${
                        selectedInterests.includes(interest)
                          ? "text-[#616161] bg-accent font-semibold"
                          : "text-white"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setCurrentStep("username")}
                    className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={selectedInterests.length === 0 || saving}
                    className="bg-accentLight text-white px-6 py-2 rounded-full text-sm flex items-center disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Continue"}{" "}
                    <HiOutlineArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Web View */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left side - Branding */}
        <div className="w-2/5 bg-foreground text-white p-12 flex flex-col justify-center">
          <div className="text-center">
            <Image
              src="/liftd-text.svg"
              alt="LIFTD"
              width={200}
              height={96}
              className="h-24 mb-8 mx-auto bg-white px-8 py-4 rounded-lg"
            />
            <h3 className="text-xl text-accent-light font-medium">
              Personalized Cannabis Journey
            </h3>
            <p className="text-gray-200 mt-2">
              We&apos;ll curate content based on your interests and curiosity.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-3/5 bg-background p-12 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            {currentStep === "username" ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-[560] text-foreground mb-4">
                    Choose your username
                  </h1>
                  <p className="text-lg text-subtext leading-relaxed">
                    This will be how others see you in the LIFTD+ community.
                  </p>
                </div>

                {/* Username input */}
                <div className="mb-8">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (usernameError) setUsernameError(null);
                    }}
                    className="w-full py-4 px-6 rounded-lg font-medium text-lg text-center text-foreground border-2 border-foreground outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter username"
                    disabled={saving}
                  />
                  {usernameError && (
                    <p className="text-red-600 text-sm mt-2 text-center">
                      {usernameError}
                    </p>
                  )}
                  <p className="text-subtext text-sm mt-2 text-center">
                    3-30 characters, letters, numbers, underscores, dots, and
                    hyphens only
                  </p>
                </div>

                {/* Next button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUsernameNext}
                    disabled={saving || !username.trim()}
                    className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center transition-all ${
                      username.trim() && !saving
                        ? "bg-accent text-[#616161] hover:bg-accent/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Next <HiOutlineArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-[560] text-foreground mb-4">
                    What are you curious about right now?
                  </h1>
                  <p className="text-lg text-subtext leading-relaxed">
                    There&apos;s no right answer, just what feels true today.
                    We&apos;ll guide you from there.
                  </p>
                </div>

                {/* Interest buttons - Grid layout for desktop */}
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`w-full py-4 px-6 rounded-lg font-medium transition-all border-2 text-lg ${
                        selectedInterests.includes(interest)
                          ? "text-[#616161] bg-accent border-accent font-semibold"
                          : "text-foreground border-foreground hover:bg-backgroundLight"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentStep("username")}
                    className="px-6 py-3 rounded-lg text-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={selectedInterests.length === 0 || saving}
                    className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center transition-all ${
                      selectedInterests.length > 0 && !saving
                        ? "bg-accent text-[#616161] hover:bg-accent/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue{" "}
                        <HiOutlineArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>

                {selectedInterests.length > 0 && (
                  <p className="text-center text-sm text-subtext mt-4">
                    {selectedInterests.length} interest
                    {selectedInterests.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

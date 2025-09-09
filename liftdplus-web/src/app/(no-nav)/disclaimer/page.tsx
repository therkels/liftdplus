"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRight } from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";

export default function DisclaimerPage() {
  const router = useRouter();
  const [setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);
  const [educationalAccepted, setEducationalAccepted] = useState(false);

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

  const handleContinue = () => {
    if (ageVerified && educationalAccepted) {
      router.push("/onboarding");
    }
  };

  const canContinue = ageVerified && educationalAccepted;

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

            <h2 className="text-3xl font-[560] mb-6 text-white">
              Important
              <br />
              Information
            </h2>

            <div className="text-left bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-accent">
                Educational Disclaimer
              </h3>
              <p className="text-base text-white mb-4 leading-relaxed">
                This application is designed for{" "}
                <strong>educational purposes only</strong>. The content provided
                is intended to inform and educate users about cannabis-related
                topics and should not be considered as medical advice, treatment
                recommendations, or professional guidance.
              </p>
              <p className="text-base text-white mb-4 leading-relaxed">
                Always consult with qualified healthcare professionals before
                making any decisions related to cannabis use or health matters.
                The information provided here is not intended to diagnose,
                treat, cure, or prevent any medical condition.
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 mb-8 text-left">
              <label className="flex cursor-pointer group">
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="mt-1 w-5 h-5 flex-shrink-0 text-accent bg-white border-2 border-gray-300 rounded focus:ring-accent focus:ring-2 group-hover:border-accent transition-colors"
                />
                <span className="ml-4 text-white text-base leading-relaxed">
                  I confirm that I am <strong>18 years of age or older</strong>
                </span>
              </label>

              <label className="flex cursor-pointer group">
                <input
                  type="checkbox"
                  checked={educationalAccepted}
                  onChange={(e) => setEducationalAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 flex-shrink-0 text-accent bg-white border-2 border-gray-300 rounded focus:ring-accent focus:ring-2 group-hover:border-accent transition-colors"
                />
                <span className="ml-4 text-white text-base leading-relaxed">
                  I understand this application is for{" "}
                  <strong>educational purposes only</strong> and does not
                  provide medical advice
                </span>
              </label>
            </div>

            {/* Continue button */}
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-6 py-2 rounded-full text-sm flex items-center transition-all ${
                  canContinue
                    ? "bg-accentLight text-white hover:bg-accentLight/90"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
              >
                Continue <HiOutlineArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
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
              Educational Cannabis Platform
            </h3>
            <p className="text-gray-200 mt-2">
              Learn about cannabis in a safe, educational environment.
            </p>
          </div>
        </div>

        {/* Right side - Disclaimer Form */}
        <div className="w-3/5 bg-background p-12 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-[560] text-foreground mb-4">
                Important Information
              </h1>
              <p className="text-lg text-subtext leading-relaxed">
                Please read and acknowledge the following before continuing.
              </p>
            </div>

            <div className="bg-backgroundLight rounded-2xl p-8 mb-8 border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                Educational Disclaimer
              </h3>
              <div className="space-y-4 text-subtext leading-relaxed">
                <p>
                  This application is designed for{" "}
                  <strong>educational purposes only</strong>. The content
                  provided is intended to inform and educate users about
                  cannabis-related topics and should not be considered as
                  medical advice, treatment recommendations, or professional
                  guidance.
                </p>
                <p>
                  Always consult with qualified healthcare professionals before
                  making any decisions related to cannabis use or health
                  matters. The information provided here is not intended to
                  diagnose, treat, cure, or prevent any medical condition.
                </p>
                <p>
                  By using this application, you acknowledge that you understand
                  these limitations and agree to use the information
                  responsibly.
                </p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-6 mb-8">
              <label className="flex cursor-pointer group">
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="mt-1 w-5 h-5 flex-shrink-0 text-accent bg-white border-2 border-gray-300 rounded focus:ring-accent focus:ring-2 group-hover:border-accent transition-colors"
                />
                <span className="ml-4 text-foreground text-lg leading-relaxed">
                  I confirm that I am <strong>18 years of age or older</strong>
                </span>
              </label>

              <label className="flex cursor-pointer group">
                <input
                  type="checkbox"
                  checked={educationalAccepted}
                  onChange={(e) => setEducationalAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 flex-shrink-0 text-accent bg-white border-2 border-gray-300 rounded focus:ring-accent focus:ring-2 group-hover:border-accent transition-colors"
                />
                <span className="ml-4 text-foreground text-lg leading-relaxed">
                  I understand this application is for{" "}
                  <strong>educational purposes only</strong> and does not
                  provide medical advice
                </span>
              </label>
            </div>

            {/* Continue button */}
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center transition-all ${
                  canContinue
                    ? "bg-accent text-[#616161] hover:bg-accent/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue <HiOutlineArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {canContinue && (
              <p className="text-center text-sm text-subtext mt-4">
                Ready to begin your educational journey
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

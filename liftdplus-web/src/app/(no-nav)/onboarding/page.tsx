"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRight } from "react-icons/hi";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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

  const handleNext = () => {
    router.push("/");
  };

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

            <h2 className="text-3xl font-[560] mb-4 text-white">
              What are you curious
              <br />
              about right now?
            </h2>
            <p className="text-base text-white mb-4 leading-relaxed">
              There's no right answer, just what feels
              <br />
              true today. We'll guide you from there.
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

            {/* Next button */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="bg-accentLight text-white px-6 py-2 rounded-full text-sm flex items-center"
              >
                Next <HiOutlineArrowRight className="w-4 h-4 ml-1" />
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
            <img
              src="/liftd-text.svg"
              alt="LIFTD"
              className="h-24 mb-8 mx-auto bg-white px-8 py-4 rounded-lg"
            />
            <h3 className="text-xl text-accent-light font-medium">
              Personalized Cannabis Journey
            </h3>
            <p className="text-gray-200 mt-2">
              We'll curate content based on your interests and curiosity.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-3/5 bg-background p-12 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-[560] text-foreground mb-4">
                What are you curious about right now?
              </h1>
              <p className="text-lg text-subtext leading-relaxed">
                There's no right answer, just what feels true today. We'll guide
                you from there.
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

            {/* Next button */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                disabled={selectedInterests.length === 0}
                className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center transition-all ${
                  selectedInterests.length > 0
                    ? "bg-accent text-[#616161] hover:bg-accent/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue <HiOutlineArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {selectedInterests.length > 0 && (
              <p className="text-center text-sm text-subtext mt-4">
                {selectedInterests.length} interest
                {selectedInterests.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

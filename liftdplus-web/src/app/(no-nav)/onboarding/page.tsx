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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col pt-12">
        <div className="flex-1 rounded-3xl p-8 text-center text-white relative bg-foreground">
          {/* Icon */}
          <div>
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <Image
                src="/lftd-icon.svg"
                alt="LFTD Icon"
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
  );
}

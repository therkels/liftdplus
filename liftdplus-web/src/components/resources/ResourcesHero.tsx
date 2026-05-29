"use client";

import Image from "next/image";

export default function ResourcesHero() {
  return (
    <section className="bg-[#f4f7f5] px-6 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Mobile: image above text */}
        <div className="mb-8 overflow-hidden rounded-xl lg:hidden">
          <Image
            src="/photos/resources-hero.jpg"
            alt="A calm morning scene with a journal and coffee"
            width={800}
            height={260}
            className="h-[260px] w-full object-cover object-[center_65%]"
            priority
          />
        </div>

        {/* Desktop: side by side */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Text */}
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-[#6b938c]">
              Resources
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[#313a43] lg:text-4xl">
              Explore Cannabis, Without the Overwhelm
            </h1>
            <p className="mt-4 text-base text-[#4f5a58]">
              Beginner-friendly guides and cannabis wellness resources designed
              to help you feel more informed and more confident.
            </p>
          </div>

          {/* Right: Image with left fade — desktop only */}
          <div className="hidden lg:block">
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl">
              <Image
                src="/photos/resources-hero.jpg"
                alt="A calm morning scene with a journal and coffee"
                fill
                className="object-cover object-[center_65%]"
                priority
              />
              {/* Fade left edge into background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#f4f7f5] via-[#f4f7f5]/20 to-transparent" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

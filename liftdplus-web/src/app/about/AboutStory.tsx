"use client";

export default function AboutStory() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-[680px]">

        {/* Opening */}
        <div className="mb-8">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-6">
            Like a lot of people, I associated cannabis with one thing and one
            thing only: getting high.
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            But when I started learning more about it, I realized there was a
            whole other side to how it can be used, especially for sleep,
            stress, and everyday overwhelm.
          </p>
        </div>

        {/* Pull Quote */}
        <div className="border-l-2 border-[#6b938c]/40 pl-8 my-16">
          <p className="text-xl leading-relaxed tracking-[-0.01em] text-[#313a43] font-medium">
            "Most of what I found in the cannabis space did not feel like it
            was made for people like me. It felt either too clinical or too
            disconnected from real life."
          </p>
        </div>

        {/* Pulse paragraph */}
        <div className="my-12">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            As a mom, I know what it feels like to be carrying a lot and still
            trying to find something that helps you slow down without losing
            yourself in the process.
          </p>
        </div>

        {/* Builder paragraph */}
        <div className="mb-16">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            So I built LIFTD+ to make cannabis feel more approachable, more
            thoughtful, and more aligned with how real people actually live.
          </p>
        </div>

        {/* What LIFTD+ Means */}
        <div className="bg-[#f8f7f5] rounded-xl p-8 my-16">
          <p className="text-[10px] font-medium text-[#6b938c] tracking-widest uppercase mb-5">
            What LIFTD+ Means
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-4">
            And the name matters, too.
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            Yes, "lifted" can mean getting high, but LIFTD+ is also about
            elevating your understanding, reframing your relationship with the
            plant, and finding products that genuinely fit your life. The
            "plus" is intentional: more clarity, more confidence, more
            support, and a more informed way to explore cannabis.
          </p>
        </div>

        {/* Closing */}
        <div className="mt-16">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-6">
            This is for people who are curious, cautious, and just starting to
            explore what support might look like for them.
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-10">
            No pressure. Just guidance at your pace.
          </p>
          <p className="text-sm font-medium text-[#313a43]">— Erin, Co-Founder</p>
        </div>

      </div>
    </section>
  );
}

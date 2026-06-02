"use client";

export default function AboutStory() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-[680px]">

        {/* Opening */}
        <div className="mb-8">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-6">
            I built LIFTD+ because I couldn&apos;t find anything that felt
            made for someone like me.
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            I was exhausted, overwhelmed, and quietly curious about
            cannabis, but everything I found felt either too clinical,
            too casual, or designed for someone with way more confidence
            than I had at the time.
          </p>
        </div>

        {/* Pull Quote */}
        <div className="border-l-2 border-[#6b938c]/40 pl-8 my-16">
          <p className="text-xl leading-relaxed tracking-[-0.01em] text-[#313a43] font-medium">
            &quot;I didn&apos;t need more information. I needed someone to
            tell me what to actually do, and to make it feel safe
            to start.&quot;
          </p>
        </div>

        {/* Pulse paragraph */}
        <div className="my-12">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            As a mom navigating perimenopause, sleep issues, and a
            schedule that never stops, I wasn&apos;t looking for a cannabis
            experience. I was looking for relief. Quiet. Something that
            worked without requiring a PhD to understand.
          </p>
        </div>

        {/* Builder paragraph */}
        <div className="mb-16">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58]">
            So I built LIFTD+: a guided recommendation system for
            people who are curious but cautious. Every product in our
            catalog is independently tested and evaluated against a
            set of standards I&apos;d want applied to something I was
            giving myself or someone I love. No guesswork. No overwhelm.
            Just a starting point you can trust.
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
            &quot;Lifted&quot; speaks to getting high, because yes, that is part
            of it. But the &quot;+&quot; is intentional. Get high (or don&apos;t),
            then go further. Reframe your relationship with the plant,
            build a clearer understanding of what works for you, and
            discover products that actually fit your life and your
            wellness goals. We are here to support every step with a
            more informed, intentional way to explore cannabis.
          </p>
        </div>

        {/* Closing */}
        <div className="mt-16">
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-6">
            This is for the woman who already has too much on her plate
            and doesn&apos;t have time to figure out something new, navigate
            confusing terms, or worry about getting it wrong. LIFTD+
            exists to make it simple enough that it&apos;s actually worth trying.
          </p>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-10">
            You&apos;re in the right place. Take your time.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <img
              src="/photos/founder-hero.jpg"
              alt="Erin, Founder of LIFTD+"
              className="w-12 h-12 rounded-full object-cover object-top"
            />
            <p className="text-sm font-medium text-[#313a43]">
              Erin, Founder
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import InstagramFeed from "@/components/landing/InstagramFeed";
import AboutStory from "./AboutStory";

export const metadata: Metadata = {
  title: "About | LIFTD+",
  description:
    "The story behind LIFTD+ — approachable cannabis education built for real life, from sleep and stress to curiosity without pressure.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-[#f9f8f7] py-20 px-6">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-xs font-medium text-[#6b938c] tracking-widest uppercase mb-6">
            About LIFTD+
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-[#313a43] mb-6">
            Built for people who never thought cannabis was for them.
          </h1>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] max-w-[620px] mx-auto">
            LIFTD+ was created to make cannabis education feel more accessible,
            more understandable, and less overwhelming for curious beginners.
          </p>
        </div>
      </section>

      {/* STORY */}
      <AboutStory />

      {/* CTA */}
      <section className="bg-[#f9f8f7] py-20 px-6 mt-14">
        <div className="max-w-[680px] mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#313a43] mb-4">
            A calmer way to explore cannabis.
          </h2>
          <p className="text-[15px] md:text-base leading-8 text-[#4f5a58] mb-8">
            You don't need to know everything before you begin. LIFTD+ exists
            to help you explore more thoughtfully, more confidently, and at
            your own pace.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b938c] text-white rounded-md font-medium hover:bg-[#5a7d75] transition-colors duration-200"
          >
            Get My Personalized Guide →
          </Link>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-16 px-6">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-lg font-semibold text-[#313a43] mb-8">
            Stay connected
          </h2>
          <InstagramFeed showLabel={false} />
        </div>
      </section>

    </main>
  );
}

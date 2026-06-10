import type { Metadata } from "next";
import FAQAccordion from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ | LIFTD+",
  description: "Common questions about LIFTD+: who it's for, how personalization works, products, privacy, and more.",
};

export default function FAQPage() {
  return (
    <main className="bg-white">
      <section className="bg-[#f9f8f7] py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#313a43] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#4f5a58]">
            Questions from people exploring cannabis for the first time — answered in plain language.
          </p>
        </div>
      </section>

      <FAQAccordion />

      <section className="bg-[#f9f8f7] py-20 px-6 mt-14">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#313a43] mb-4">Still have questions?</h2>
          <p className="text-[#4f5a58] text-lg mb-8 leading-relaxed">
            We're here to help you explore at your own pace.<br />No pressure. No judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@liftdplus.com" className="px-6 py-3 border border-[#6b938c] text-[#6b938c] rounded-lg font-medium hover:bg-[#f4f7f5] transition-colors duration-200">Contact Us</a>
            <a href="/" className="px-6 py-3 bg-[#6b938c] text-white rounded-lg font-medium hover:bg-[#5a7d75] transition-colors duration-200">Get My Personalized Guide →</a>
          </div>
        </div>
      </section>
    </main>
  );
}

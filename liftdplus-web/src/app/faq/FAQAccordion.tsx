"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = { id: string; question: string; answer: string };
type FAQSection = { id: string; title: string; subtitle: string; items: FAQItem[] };

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    subtitle: "New to cannabis? Start here.",
    items: [
      { id: "for-me", question: "Is this for me if I've never used cannabis before?", answer: "Yes. LIFTD+ is built for beginners and people who are not sure where to start. You do not need any prior knowledge. There are no wrong questions and no wrong starting points: just start with how you are feeling and we guide the rest. You can take your time." },
      { id: "why-use", question: "Why would I use LIFTD+?", answer: "If you feel overwhelmed, exhausted, or unsure what might help, LIFTD+ takes the guesswork out of it. You answer a few questions and get guidance based on what you are trying to support like sleep, stress, focus, or hormonal shifts." },
      { id: "overwhelmed", question: "I'm overwhelmed. I don't know where to start.", answer: "That is exactly who this is for. You do not need to know anything about cannabis or products. Start with how you are feeling and we will guide you from there." },
      { id: "sign-up", question: "Do I need to sign up to use this?", answer: "No. You can get your guide without creating an account. If you choose to save it with email, we can remember your preferences and improve future recommendations based on what you find helpful." },
    ],
  },
  {
    id: "feeling-safe",
    title: "Feeling Safe & In Control",
    subtitle: "Questions about dosage, overwhelm, and first-time experiences.",
    items: [
      { id: "high", question: "Will this make me feel \"high\"?", answer: "Not necessarily. Many people explore low-dose THC, CBD, or non-intoxicating options depending on what they are trying to support. We help you understand the differences so you can choose what fits your life, whether that is unwinding at night, sleeping better, or taking the edge off stress. You are always in control of what you explore." },
      { id: "anxious", question: "How do I avoid feeling anxious or overwhelmed?", answer: "Start low and go slow. Our guides include dosing recommendations designed for beginners. You control how much you take and can adjust based on how you feel. Many people start with very low doses (2.5-5mg THC) or CBD-only options if anxiety is a concern." },
      { id: "medications", question: "What about medications or health conditions?", answer: "Cannabis may not be appropriate during pregnancy or while breastfeeding and it can interact with certain medications. If you are unsure, speak with your healthcare provider. LIFTD+ is for educational purposes only and does not replace medical advice." },
      { id: "medical-advice", question: "Is this medical advice?", answer: "No. LIFTD+ provides educational guidance only and does not offer medical advice, diagnosis, or treatment." },
    ],
  },
  {
    id: "products",
    title: "Products & Experiences",
    subtitle: "THC, CBD, gummies, tinctures, and what to expect.",
    items: [
      { id: "product-types", question: "What kinds of cannabis products do you recommend?", answer: "Your recommendations are based on what you are trying to support, whether that is THC, CBD, CBN, or hemp-derived options. Everything is tailored to your goals and comfort level, not a generic list." },
      { id: "personalization", question: "How does the personalization actually work?", answer: "You answer a few short questions about what you are trying to support and what feels important to you. We use that to create guidance tailored to your goals and comfort level. If you save your guide, it can improve over time based on what you engage with." },
      { id: "what-is", question: "What is LIFTD+?", answer: "LIFTD+ is a solution-first cannabis education platform that helps you understand what may support how you feel day to day like sleep, stress, focus, or hormonal shifts. Instead of searching through endless content, you get simple, relevant guidance based on your answers." },
    ],
  },
  {
    id: "platform",
    title: "Using LIFTD+",
    subtitle: "How the platform works and what to expect.",
    items: [
      { id: "legal-state", question: "I don't live in a legal state. Can I still use this?", answer: "Yes. We include hemp-derived options and adjust recommendations based on what is available where you live. You can still use LIFTD+ for education and guidance regardless of location." },
      { id: "dispensary", question: "What makes this different from a dispensary?", answer: "Dispensaries focus on products. LIFTD+ helps you understand what those products actually do in real life like sleep, anxiety, focus, or relaxation and turns that into simple guidance you can actually use." },
      { id: "data-privacy", question: "How do you handle my data?", answer: "Your information is kept private and secure. We do not sell or share your data. If you save your guide, we use your input only to improve future recommendations within LIFTD+." },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#cdcec7] py-6" role="region" aria-labelledby={`faq-question-${item.id}`}>
      <button id={`faq-question-${item.id}`} onClick={onToggle} className="flex w-full items-start justify-between gap-4 text-left transition-all duration-300 ease-in-out hover:bg-[rgba(107,147,140,0.04)] px-0 py-0" aria-expanded={isOpen}>
        <span className="text-base font-semibold text-[#313a43] flex-grow tracking-[-0.01em]">{item.question}</span>
        <ChevronDown className={`flex-shrink-0 text-[#6b938c] transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`} size={20} />
      </button>
      {isOpen && (
        <div className="mt-4 pr-8">
          <p className="text-base leading-relaxed text-[#4f5a58]">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="bg-white">
      {FAQ_SECTIONS.map((section) => (
        <section key={section.id} className="py-10 border-t border-[#e7e5e4]">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#313a43] mb-2">{section.title}</h2>
              <div className="w-10 h-[2px] bg-[#6b938c] mb-4 opacity-50" />
              <p className="text-sm text-[#5f6b68]">{section.subtitle}</p>
            </div>
            <div className="space-y-0">
              {section.items.map((item) => (
                <AccordionItem key={item.id} item={item} isOpen={openItems.has(item.id)} onToggle={() => toggleItem(item.id)} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

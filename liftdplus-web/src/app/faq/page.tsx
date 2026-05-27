import type { Metadata } from "next";
import Image from "next/image";
import SubPageLayout from "@/components/landing/SubPageLayout";
import NewsletterBlock from "@/components/landing/NewsletterBlock";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "FAQ | LIFTD+",
  description:
    "Common questions about LIFTD+: who it's for, how personalization works, products, privacy, and more.",
};

const FAQ_ITEMS = [
  {
    q: "Is this for me if I've never used cannabis before?",
    a: "Yes. LIFTD+ is built for beginners and people who are not sure where to start. You do not need any prior knowledge. Just start with how you are feeling and we guide the rest.",
  },
  {
    q: "Why would I use LIFTD+?",
    a: "If you feel overwhelmed, exhausted, or unsure what might help, LIFTD+ takes the guesswork out of it. You answer a few questions and get guidance based on what you are trying to support like sleep, stress, focus, or hormonal shifts.",
  },
  {
    q: "What is LIFTD+?",
    a: "LIFTD+ is a solution-first cannabis education platform that helps you understand what may support how you feel day to day like sleep, stress, focus, or hormonal shifts. Instead of searching through endless content, you get simple, relevant guidance based on your answers.",
  },
  {
    q: "I'm overwhelmed. I don't know where to start.",
    a: "That is exactly who this is for. You do not need to know anything about cannabis or products. Start with how you are feeling and we will guide you from there.",
  },
  {
    q: "Do I need to sign up to use this?",
    a: "No. You can get your guide without creating an account. If you choose to save it with email, we can remember your preferences and improve future recommendations based on what you find helpful.",
  },
  {
    q: "What kinds of cannabis products do you recommend?",
    a: "Your recommendations are based on what you are trying to support, whether that is THC, CBD, CBN, or hemp-derived options. Everything is tailored to your goals and comfort level, not a generic list.",
  },
  {
    q: "How does the personalization actually work?",
    a: "You answer two questions: what you are trying to support and what you are unsure about. We use that to create guidance based on your goals and comfort level. If you save your guide, it can improve over time based on what you engage with.",
  },
  {
    q: "Will this make me feel 'high'?",
    a: "Not necessarily. Many people explore low-dose THC, CBD, or non-intoxicating options depending on what they are trying to support. We help you understand the differences so you can choose what fits your life, whether that is unwinding at night, sleeping better, or taking the edge off stress. You are always in control of what you explore.",
  },
  {
    q: "I don't live in a legal state. Can I still use this?",
    a: "Yes. We include hemp-derived options and adjust recommendations based on what is available where you live. You can still use LIFTD+ for education and guidance regardless of location.",
  },
  {
    q: "What about pregnancy, breastfeeding, or medications?",
    a: "Cannabis may not be appropriate during pregnancy or while breastfeeding and it can interact with certain medications. If you are unsure, speak with your healthcare provider. LIFTD+ is for educational purposes only and does not replace medical advice.",
  },
  {
    q: "What makes this different from a dispensary?",
    a: "Dispensaries focus on products. LIFTD+ helps you understand what those products actually do in real life like sleep, anxiety, focus, or relaxation and turns that into simple guidance you can actually use.",
  },
  {
    q: "Is this medical advice?",
    a: "No. LIFTD+ provides educational guidance only and does not offer medical advice, diagnosis, or treatment.",
  },
  {
    q: "How do you handle my data?",
    a: "Your information is kept private and secure. We do not sell or share your data. If you save your guide, we use your input only to improve future recommendations within LIFTD+.",
  },
];

export default function FaqPage() {
  return (
    <SubPageLayout>
      <div className={styles.subPageBand}>
        <div className={styles.subPageInner}>
          <Image
            src="/liftd-icon.svg"
            alt=""
            width={140}
            height={140}
            className={styles.subPageIcon}
            priority
          />
          <h1 className={styles.subPageTitle}>FAQs</h1>

          <div className={styles.faqAccordion}>
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>{item.q}</summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <NewsletterBlock />
    </SubPageLayout>
  );
}

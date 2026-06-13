"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/utils/analytics";
import InlineOnboardingFlow from "@/components/landing/InlineOnboardingFlow";
import { Testimonials } from "@/components/Testimonials";
import styles from "./page.module.css";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Tell us what you're dealing with",
    description:
      "Choose the goal or challenge that feels most relevant right now — sleep, stress, focus, or figuring out where to start.",
  },
  {
    title: "See what fits your needs",
    description:
      "Get recommendations tailored to your goals, experience level, and what's available where you live — including CBD, CBN, and where available, THC.",
  },
  {
    title: "Move forward with confidence",
    description:
      "Understand what may help, how it works, and what to consider so you can decide what feels right for you.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealEls = container.querySelectorAll(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.root} ref={containerRef}>
      {/* Nav */}
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : styles.navOverPhoto}`}
      >
        <Link href="/">
          <Image
            src="/logos/04 LIFTD+ Logo - White.png"
            alt="LIFTD+"
            width={140}
            height={40}
            className={styles.navLogoLight}
          />
          <Image
            src="/logos/01 LIFTD+ Logo - Primary.png"
            alt="LIFTD+"
            width={140}
            height={40}
            className={styles.navLogoDark}
          />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/results" className={styles.navLink}>
            My Guide
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/faq" className={styles.navLink}>
            FAQ
          </Link>
          <Link
            href="/resources"
            className={styles.navSignIn}
            onClick={() => trackEvent("cta_click", { label: "nav_resources" })}
          >
            Resources
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src="/images/hero-woman.jpg"
          alt=""
        />
        <div className={styles.heroBgGradient} aria-hidden />
        <div className={styles.heroNavGradient} aria-hidden />
        <div className={styles.heroLeft}>
          <div className={styles.heroTextCard}>
            <p className={styles.heroEyebrow}>
              <span className={styles.heroDot} aria-hidden />
              A gentler place to begin
            </p>
            <h1 className={styles.heroTitle}>
              Exhaustion isn&apos;t a badge of honor. It&apos;s a{" "}
              <span className={styles.heroTitleAccent}>signal.</span>
            </h1>
            <p className={styles.heroIntro}>
              Whether you&apos;re looking for better sleep, less stress, or a little more breathing room, LIFTD+ helps you explore CBD, CBN, and THC options with personalized guidance for women.
            </p>
            <p className={styles.heroSub}>
              Answer a few questions and get a guide tailored to your goals. No account, no prior experience needed.
            </p>
            <a href="#topics" className={styles.heroCta}>
              Get my free guide
            </a>
          </div>
        </div>
        <div className={styles.heroRight} />
      </section>

      {/* Quiz */}
      <section
        className={`${styles.section} ${styles.topicsSection}`}
        id="topics"
      >
        <div className={`${styles.sectionInner} ${styles.reveal}`}>
          <InlineOnboardingFlow
            sectionTitleClassName={styles.topicsSectionTitle}
            sectionHelperClassName={styles.topicsSectionHelper}
          />
        </div>
      </section>

      {/* How it works — horizontal 3-step flow */}
      <section
        className={`${styles.section} ${styles.howSection} ${styles.howWorkLeadSection}`}
        id="how-it-works"
      >
        <div className={styles.sectionInner}>
          <div className={`${styles.howWorkStack} ${styles.reveal}`}>
            <h2 className={styles.howWorkHeadline}>Here&apos;s how it works</h2>
            <div className={styles.howWorkSteps}>
              <div className={styles.howWorkStep}>
                <div className={styles.howWorkStepNum}>1</div>
                <div className={styles.howWorkStepBody}>
                  <h3 className={styles.howWorkStepTitle}>{HOW_IT_WORKS_STEPS[0].title}</h3>
                  <p className={styles.howWorkStepDesc}>{HOW_IT_WORKS_STEPS[0].description}</p>
                </div>
              </div>
              <div className={styles.howWorkConnector}>
                <div className={styles.howWorkConnectorLine} />
              </div>
              <div className={styles.howWorkStep}>
                <div className={styles.howWorkStepNum}>2</div>
                <div className={styles.howWorkStepBody}>
                  <h3 className={styles.howWorkStepTitle}>{HOW_IT_WORKS_STEPS[1].title}</h3>
                  <p className={styles.howWorkStepDesc}>{HOW_IT_WORKS_STEPS[1].description}</p>
                </div>
              </div>
              <div className={styles.howWorkConnector}>
                <div className={styles.howWorkConnectorLine} />
              </div>
              <div className={styles.howWorkStep}>
                <div className={styles.howWorkStepNum}>3</div>
                <div className={styles.howWorkStepBody}>
                  <h3 className={styles.howWorkStepTitle}>{HOW_IT_WORKS_STEPS[2].title}</h3>
                  <p className={styles.howWorkStepDesc}>{HOW_IT_WORKS_STEPS[2].description}</p>
                </div>
              </div>
            </div>
            <p className={styles.howWorkFooterNote}>
              Designed for beginners. No prior cannabis experience needed.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials hidden until real user quotes available */}
      {false && <Testimonials />}

      {/* Newsletter */}
      <section className={styles.newsletterSection}>
        <div className={`${styles.nlInner} ${styles.reveal}`}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Stay in the loop
          </div>
          <h2 className={styles.sectionTitle}>
            Curious, but not ready to start?
          </h2>
          <p className={styles.nlBody}>
            Get one practical email each month with beginner-friendly education, product insights, and guidance for women who are exploring but not ready to start yet.
          </p>
          <p className={styles.nlHelper}>
            No pressure. No jargon. Just simple guidance to help you make better decisions when you&apos;re ready.
          </p>
          <form
            className={styles.emailRow}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newsletterEmail.trim() || newsletterStatus === "loading") return;
              trackEvent("newsletter_signup_attempted", { source: "landing_page" });
              setNewsletterStatus("loading");
              setNewsletterError(null);
              try {
                const res = await fetch("/api/newsletter", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: newsletterEmail.trim() }),
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                  setNewsletterStatus("success");
                  setNewsletterEmail("");
                } else if (data.error === "already_subscribed") {
                  setNewsletterStatus("error");
                  setNewsletterError("This email is already subscribed.");
                } else {
                  setNewsletterStatus("error");
                  setNewsletterError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
                }
              } catch {
                setNewsletterStatus("error");
                setNewsletterError("Something went wrong. Please try again.");
              }
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterStatus === "loading"}
            />
            <button type="submit" disabled={newsletterStatus === "loading"}>
              {newsletterStatus === "loading" ? "Sending…" : "Subscribe →"}
            </button>
          </form>
          {newsletterStatus === "success" && (
            <p className={styles.nlBody} style={{ marginTop: 12, color: "var(--teal)", fontWeight: 600 }}>
              Thanks! You&apos;re on the list.
            </p>
          )}
          {newsletterStatus === "error" && newsletterError && (
            <p className={styles.nlBody} style={{ marginTop: 12, color: "#e57373" }}>
              {newsletterError}
            </p>
          )}
        </div>
      </section>

      <footer className="bg-[#2e3a45] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Image
              src="/logos/04 LIFTD+ Logo - White.png"
              alt="LIFTD+"
              width={160}
              height={44}
              className="mb-4 h-11 w-auto"
            />
            <p className="max-w-xs text-sm text-[#bac8b2]">
              Cannabis guidance for curious and cautious beginners.
            </p>
          </div>

          <div className="mt-6 border-t border-[#4f5a58]/30 pt-6">
            <div className="flex flex-wrap gap-6 text-sm text-[#bac8b2]">
              <Link href="/privacy" className="no-underline hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-[#4f5a58]">·</span>
              <Link href="/terms" className="no-underline hover:text-white">
                Terms
              </Link>
              <span className="text-[#4f5a58]">·</span>
              <Link href="mailto:support@liftdplus.com" className="no-underline hover:text-white">
                Contact
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#4f5a58]">© 2026 LIFTD+</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

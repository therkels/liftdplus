"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/utils/analytics";
import InlineOnboardingFlow from "@/components/landing/InlineOnboardingFlow";
import styles from "./page.module.css";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Answer a few quick questions",
    description:
      "Tell us what you need support with and what you are unsure about. No research. No terminology needed.",
  },
  {
    title: "Get your personalized guide",
    description:
      "Clear recommendations based on sleep, stress, focus, or hormonal support. Includes dosing guidance, what to avoid, and what to ask if you visit a dispensary.",
  },
  {
    title: "Explore it your way",
    description:
      "Read it, screenshot it, or save it with your email so it can get more helpful over time based on what you find useful.",
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
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/faq" className={styles.navLink}>
            FAQ
          </Link>
          <Link
            href="/explore"
            className={styles.navSignIn}
            onClick={() => trackEvent("cta_click", { label: "nav_resources" })}
          >
            Resources
          </Link>
        </div>
      </nav>

      {/* Hero — full-bleed image; contrast only behind copy */}
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src="/images/LIFTD+ V2 Hero.png"
          alt=""
        />
        <div className={styles.heroNavGradient} aria-hidden />
        <div className={styles.heroLeft}>
          <div className={styles.heroTextCard}>
            <h1 className={styles.heroTitle}>
              Exhaustion isn&apos;t a badge of honor. It&apos;s a signal.
            </h1>
            <p className={styles.heroIntro}>
              Better sleep. A quieter mind. Support that helps you slow down without checking out.
            </p>
            <p className={styles.heroCtaSubtext}>
              Answer a few quick questions and get personalized guidance without having to figure it all out yourself.
            </p>
          </div>
        </div>
        <div className={styles.heroRight} />
      </section>

      {/* Topic buttons — main action */}
      <section
        className={`${styles.section} ${styles.howSection} ${styles.topicsLeadSection} ${styles.topicsSection}`}
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
            <ol className={styles.howWorkSteps}>
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <li key={step.title} className={styles.howWorkStep}>
                  <span className={styles.howWorkStepNum}>{index + 1}</span>
                  <div className={styles.howWorkStepBody}>
                    <div className={styles.howWorkStepTitle}>{step.title}</div>
                    <p className={styles.howWorkStepDesc}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.howWorkFooterNote}>
              Takes about 60 seconds. No knowledge needed.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletterSection}>
        <div className={`${styles.nlInner} ${styles.reveal}`}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Stay in the loop
          </div>
          <h2 className={styles.sectionTitle}>
            One email a month. The kind you actually save.
          </h2>
          <p className={styles.nlBody}>
            Beginner-friendly guides on sleep, stress, and winding down, sent to adults exploring cannabis for the first time. Or the first time in a long time.
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
              {newsletterStatus === "loading" ? "Sending…" : "Send me the guides"}
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
          <p className={styles.fine}>No spam. Unsubscribe anytime. Built for adults who prefer to decide for themselves.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>
          <Image
            src="/logos/04 LIFTD+ Logo - White.png"
            alt="LIFTD+"
            width={160}
            height={44}
            className={styles.footerLogo}
          />
          <p className={styles.footerTagline}>
            LIFTD+ is education, not retail. We&apos;re here to help you
            understand cannabis before you decide what&apos;s right for you.
          </p>
        </div>
        <div className={styles.footerRight}>
          <div>© 2026 LIFTD+</div>
          <div>
            <Link href="/privacy">Privacy Policy</Link>
            &nbsp;·&nbsp;
            <Link href="/terms">Terms</Link>
            &nbsp;·&nbsp;
            <Link href="mailto:support@liftdplus.com">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

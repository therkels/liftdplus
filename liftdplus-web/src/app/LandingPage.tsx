"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/utils/analytics";
import styles from "./page.module.css";

const TRUST_ITEMS = [
  "Free to join",
  "Nothing to buy",
  "We don't sell your personal info",
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
          <Link href="#how-it-works" className={styles.navLink}>
            How it works
          </Link>
          <Link href="#learn" className={styles.navLink}>
            Learn
          </Link>
          <Link
            href="/login?ref=returning"
            className={styles.navSignIn}
            onClick={() => trackEvent("cta_click", { label: "returning_user_signin" })}
          >
            Sign In
          </Link>
          <Link
            href="/welcome"
            className={styles.navCta}
            onClick={() => trackEvent("cta_click", { label: "nav_start_free" })}
          >
            Start Learning →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div
          className={styles.heroOverlay}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />
        <img
          className={styles.heroImage}
          src="/images/surface-QDFjQTUGYAQ-unsplash.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "90% center",
            zIndex: 0,
          }}
        />
        <div className={styles.heroBgGradient} />
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroDot} />
            For adults exploring cannabis for the first time — or the first time in years
          </div>
          <h1 className={styles.heroTitle}>
            You've heard it might help with sleep or stress. Let's find out if it's right for you.
          </h1>
          <p className={styles.heroIntro}>
            LIFTD+ is a free learning platform for cautious beginners. Tell us what you're dealing with and we'll build you a personalized starting point.
          </p>
          <Link
            href="/welcome"
            className={styles.btnPrimary}
            onClick={() => trackEvent("cta_click", { label: "hero_start_learning" })}
          >
            Find Out Where to Start — It&apos;s Free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <p className={styles.heroCtaSubtext}>Start with 4 questions. We'll build your personalized guide from there.</p>
          <div className={styles.heroBelowCta}>
            <Link
              href="/login?ref=returning"
              className={styles.heroSignInLink}
              onClick={() => trackEvent("cta_click", { label: "returning_user_signin" })}
            >
              Already have an account? Sign in →
            </Link>
          </div>
          <div className={styles.trustBar}>
            <span className={styles.trustItem}>
              <span className={styles.trustCheck}>✓</span>
              {TRUST_ITEMS[0]}
            </span>
            <span className={styles.trustSeparator}>·</span>
            <span className={styles.trustItem}>
              <span className={styles.trustCheck}>✓</span>
              {TRUST_ITEMS[1]}
            </span>
            <span className={styles.trustSeparator}>·</span>
            <span className={styles.trustItem}>
              <span className={styles.trustCheck}>✓</span>
              {TRUST_ITEMS[2]}
            </span>
          </div>
        </div>
        <div className={styles.uiWrapper}>
          <div className={styles.blurSurface}>
            <div className={styles.onboardingCard}>
              <div className={styles.onboardingCardLogo}>
                <Image
                  src="/liftd-icon.svg"
                  alt="LIFTD+"
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.onboardingCardDots}>
                <span className={styles.progressDotActive} aria-hidden />
                <span className={styles.progressDot} aria-hidden />
                <span className={styles.progressDot} aria-hidden />
                <span className={styles.progressDot} aria-hidden />
              </div>
              <p className={styles.onboardingCardEyebrow}>QUESTION 1 OF 4</p>
              <h2 className={styles.onboardingCardHeading}>What would you like to explore?</h2>
              <p className={styles.onboardingCardSubtext}>
                Choose 3 topics you&apos;d like to explore first. We&apos;ll personalize your feed around your top priorities.
              </p>
              <div className={`${styles.onboardingCardOption} ${styles.onboardingCardOptionSelected}`}>
                <span>Sleep</span>
                <span className={styles.onboardingCardOptionCheckSelected}>✓</span>
              </div>
              <div className={`${styles.onboardingCardOption} ${styles.onboardingCardOptionSelected}`}>
                <span>Stress and anxiety</span>
                <span className={styles.onboardingCardOptionCheckSelected}>✓</span>
              </div>
              <div className={`${styles.onboardingCardOption} ${styles.onboardingCardOptionSelected}`}>
                <span>Pain and recovery</span>
                <span className={styles.onboardingCardOptionCheckSelected}>✓</span>
              </div>
              <div className={styles.onboardingCardOption}>
                <span>Focus and productivity</span>
                <span className={styles.onboardingCardOptionCheck} />
              </div>
              <div className={styles.onboardingCardOption}>
                <span>Intimacy &amp; Libido</span>
                <span className={styles.onboardingCardOptionCheck} />
              </div>
              <div className={styles.onboardingCardOption}>
                <span>Hormonal Changes</span>
                <span className={styles.onboardingCardOptionCheck} />
              </div>
              <div className={styles.onboardingCardOption}>
                <span>I&apos;m not sure yet</span>
                <span className={styles.onboardingCardOptionCheck} />
              </div>
              <p className={styles.onboardingCardCount}>3 of 3 selected</p>
              <button type="button" className={styles.onboardingCardBtn} disabled>
                Continue
              </button>
            </div>
          </div>
        </div>
        <div className={styles.heroRight} />
      </section>

      <div className={styles.trustStrip}>
        <p className={styles.trustTagline}>Cannabis education built around your goals, not around what&apos;s on a shelf.</p>
        <p className={styles.trustQuote}>&quot;I&apos;ve been putting this off for two years. I finally feel like I know enough to actually try it.&quot; — Lisa, 42, mom of three</p>
      </div>

      {/* This is for you if */}
      <section className={`${styles.section} ${styles.trustSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.trustGrid}>
            <div className={styles.reveal}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                This is for you if
              </div>
              <h2 className={styles.sectionTitle}>
                You&apos;re not against trying it. You&apos;re against feeling clueless when you do.
              </h2>
              <p className={styles.trustBody}>
                The information online is either too basic or overwhelming. LIFTD+ is built for the middle — adults who want to understand what they&apos;re getting into, at their own pace, without anyone trying to sell them something.
              </p>
              <div className={styles.dontList}>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>—</div>
                  You&apos;ve been thinking about trying it for months (or years)
                </div>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>—</div>
                  You want real answers, not a sales pitch
                </div>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>—</div>
                  You&apos;d rather learn first and decide later
                </div>
              </div>
            </div>
            <div
              className={`${styles.plainCard} ${styles.reveal}`}
              style={{ transitionDelay: "0.12s" }}
            >
              <h3>
                Plain language.
                <br />
                Real answers.
              </h3>
              <p>
                We explain things the way a knowledgeable friend would. Someone who did the research and genuinely wants to help, not sell you something.
              </p>
              <ul className={styles.plainList}>
                <li>
                  <span className={styles.plainArr}>→</span>
                  What cannabis effects actually feel like, and what&apos;s normal for beginners
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  How to start gently, or restart after a long time away
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  What works differently for sleep, stress, and that 10pm mental unwind
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  A personalized dispensary guide, built for you once you&apos;re ready
                </li>
              </ul>
              <p className={styles.plainCloser}>
                &quot;We don&apos;t assume you already know this stuff. That&apos;s the whole point.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className={`${styles.section} ${styles.howSection}`}
        id="how-it-works"
      >
        <div className={styles.sectionInner}>
          <div className={`${styles.eyebrow} ${styles.reveal}`}>
            <span className={styles.eyebrowLine} />
            Here&apos;s how it works
          </div>
          <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>
            Four steps to feeling actually prepared
          </h2>
          <div className={`${styles.howMockupWrap} ${styles.reveal}`}>
            <Image
              src="/images/app mockup 2.png"
              alt="LIFTD+ app preview"
              width={320}
              height={240}
              className={styles.howMockupImg}
            />
          </div>
          <div className={styles.howGrid}>
            <div className={`${styles.howStep} ${styles.reveal}`}>
              <div className={styles.stepNum}>1</div>
              <h3>Tell us what you&apos;re dealing with</h3>
              <p>
                Sleep? Stress? That feeling of never fully switching off? Pick up to three topics and we&apos;ll build your path around what matters most.
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.07s" }}
            >
              <div className={styles.stepNum}>2</div>
              <h3>Learn at your own pace, no pressure</h3>
              <p>
                Read guides on effects, dosing, and product types written specifically for beginners. No account required to start.
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.14s" }}
            >
              <div className={styles.stepNum}>3</div>
              <h3>Get answers to the questions you were afraid to ask</h3>
              <p>
                &quot;Will I feel groggy?&quot; &quot;How much should I take?&quot; &quot;What if I haven&apos;t done this in 20 years?&quot;
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.21s" }}
            >
              <div className={styles.stepNum}>4</div>
              <h3>Get your personalized dispensary guide</h3>
              <p>
                After you&apos;ve learned enough, we build you a custom guide for your first visit. What to ask for, what to avoid, and what to expect. Only when you&apos;re ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to expect + goals */}
      <section className={`${styles.section} ${styles.expectGoalSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.expectGoalLayout}>
            <div className={styles.reveal} style={{ transitionDelay: "0.05s" }}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                What to expect here
              </div>
              <h2 className={styles.sectionTitle}>
                We teach first. We start with you.
              </h2>
              <ul className={styles.expectBullets}>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  Written for people who&apos;ve never tried cannabis, or haven&apos;t in years
                </li>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  You&apos;ll learn before anyone tries to sell you anything
                </li>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  Organized around your goals, not around what&apos;s on a shelf
                </li>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  Ends with a personalized guide, built for your first dispensary visit
                </li>
              </ul>
              <p className={styles.expectCloser}>
                Your starting point. Your pace. Your goals.
              </p>
            </div>
            <div>
              <div className={styles.goalCards}>
                <div
                  className={`${styles.goalCard} ${styles.reveal}`}
                  style={{ transitionDelay: "0.05s" }}
                >
                  <div className={styles.goalNum}>01</div>
                  <div className={styles.goalText}>
                    <h3>Better Sleep</h3>
                    <p>
                      You want to actually rest, not lie there thinking about everything.
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.goalCard} ${styles.reveal}`}
                  style={{ transitionDelay: "0.1s" }}
                >
                  <div className={styles.goalNum}>02</div>
                  <div className={styles.goalText}>
                    <h3>Winding Down</h3>
                    <p>
                      The mental noise doesn&apos;t stop when the day does. You want something that actually helps you decompress.
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.goalCard} ${styles.reveal}`}
                  style={{ transitionDelay: "0.15s" }}
                >
                  <div className={styles.goalNum}>03</div>
                  <div className={styles.goalText}>
                    <h3>Pain &amp; Recovery</h3>
                    <p>
                      Curious about what might actually help, but cautious about how it&apos;ll feel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section
        className={`${styles.section} ${styles.articlesSection}`}
        id="learn"
      >
        <div className={styles.sectionInner}>
          <div className={`${styles.articlesHeader} ${styles.reveal}`}>
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                See what you&apos;ll learn
              </div>
              <h2 className={styles.sectionTitle}>
                The guide your knowledgeable friend would send you.
              </h2>
            </div>
            <p className={styles.articlesNote}>
              A taste of our approach. Free account unlocks the full library.
            </p>
          </div>
          <div className={styles.articlesGrid}>
            <Link
              href="/post/thc-vs-cbd-for-sleep-whats-the-difference"
              className={`${styles.articleCard} ${styles.reveal}`}
              onClick={() => trackEvent("article_clicked", { slug: "thc-vs-cbd-for-sleep-whats-the-difference", source: "landing_page" })}
            >
              <div className={styles.articleCardImageWrap}>
                <Image
                  src="/images/app.liftdplus.com:post:thc-vs-cbd-for-sleep-whats-the-difference.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className={styles.articleCardImage}
                />
              </div>
              <div className={styles.articleCardBody}>
                <div className={styles.articleTag}>Sleep</div>
                <h3>THC vs. CBD for Sleep: What&apos;s the Difference?</h3>
                <p>Not all cannabis helps you sleep the same way. Here&apos;s the actual difference between THC and CBD, and how to figure out which one fits you.</p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
            <Link
              href="/post/demystifying-microdosing-thc-for-calm-and-stress-relief"
              className={`${styles.articleCard} ${styles.reveal}`}
              style={{ transitionDelay: "0.08s" }}
              onClick={() => trackEvent("article_clicked", { slug: "demystifying-microdosing-thc-for-calm-and-stress-relief", source: "landing_page" })}
            >
              <div className={styles.articleCardImageWrap}>
                <Image
                  src="/images/app.liftdplus.com:post:demystifying-microdosing-thc-for-calm-and-stress-relief.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className={styles.articleCardImage}
                />
              </div>
              <div className={styles.articleCardBody}>
                <div className={styles.articleTag}>Stress</div>
                <h3>Demystifying Microdosing THC for Calm and Stress Relief</h3>
                <p>What microdosing actually means, why people do it, and how to tell if it might be your gentlest starting point.</p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
            <Link
              href="/post/why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it"
              className={`${styles.articleCard} ${styles.reveal}`}
              style={{ transitionDelay: "0.16s" }}
              onClick={() => trackEvent("article_clicked", { slug: "why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it", source: "landing_page" })}
            >
              <div className={styles.articleCardImageWrap}>
                <Image
                  src="/images/app.liftdplus.com:post:why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className={styles.articleCardImage}
                />
              </div>
              <div className={styles.articleCardBody}>
                <div className={styles.articleTag}>Anxiety</div>
                <h3>
                  Why Cannabis Can Sometimes Feel Anxious — and How to Handle It
                </h3>
                <p>It happens to beginners more than you&apos;d think. Here&apos;s why, and the simple adjustments that prevent it.</p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
          </div>
          <div className={`${styles.gateLine} ${styles.reveal}`}>
            <Link href="/welcome" className={styles.btnPrimary}>
              See more beginner guides →
            </Link>
          </div>
        </div>
      </section>

      {/* Mid CTA */}
      <section className={styles.midCta}>
        <div className={styles.midCtaBg} />
        <div className={`${styles.midInner} ${styles.reveal}`}>
          <div
            className={styles.eyebrow}
            style={{ justifyContent: "center" }}
          >
            <span className={styles.eyebrowLine} />
            Still not sure?
          </div>
          <h2 className={styles.sectionTitle}>
            That&apos;s exactly why we built this.
          </h2>
          <p>
            Most people who find LIFTD+ have been thinking about trying it for months. Four questions won&apos;t commit you to anything. They&apos;ll just show you where to start.
          </p>
          <Link
            href="/welcome"
            className={styles.btnPrimary}
            style={{ margin: "0 auto" }}
            onClick={() => trackEvent("cta_click", { label: "mid_page_cta" })}
          >
            Show Me Where to Start →
          </Link>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.75rem" }}>
            Free to start. Nothing to buy. You don&apos;t need to visit a dispensary to get value from this.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletterSection}>
        <div className={`${styles.nlInner} ${styles.reveal}`}>
          <div
            className={styles.eyebrow}
            style={{ justifyContent: "center" }}
          >
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
              {newsletterStatus === "loading" ? "Sending…" : "Send Me the Guides →"}
            </button>
          </form>
          {newsletterStatus === "success" && (
            <p className={styles.nlBody} style={{ marginTop: 12, color: "var(--lime)", fontWeight: 600 }}>
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

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

function trackCta(label: string) {
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (a: string, b: string, c: object) => void }).gtag) {
    (window as unknown as { gtag: (a: string, b: string, c: object) => void }).gtag("event", "cta_click", { event_label: label });
  }
}

const TRUST_ITEMS = [
  "Free to join",
  "Nothing to buy",
  "We don't sell your personal info",
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

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
            href="/login"
            className={styles.navSignIn}
            onClick={() => trackCta("returning_user_signin")}
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className={styles.navCta}
            onClick={() => trackCta("nav_start_free")}
          >
            Start Learning →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroDot} />
            Cannabis education for adults
          </div>
          <h1 className={styles.heroTitle}>
            Curious about cannabis for sleep, stress, or pain?
          </h1>
          <p className={styles.heroSub}>
            We help you understand what cannabis does — and whether it might
            work for you — before you walk into a dispensary.
          </p>
          <Link
            href="/onboarding"
            className={styles.btnPrimary}
            onClick={() => trackCta("hero_start_learning")}
          >
            Start Learning — It&apos;s Free
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
          <div className={styles.heroBelowCta}>
            <Link
              href="/login"
              className={styles.heroSignInLink}
              onClick={() => trackCta("returning_user_signin")}
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
        <div className={styles.heroRight} style={{ minHeight: 0 }} />
      </section>

      {/* Learn before you buy */}
      <section className={`${styles.section} ${styles.trustSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.trustGrid}>
            <div className={styles.reveal}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                Learn before you buy
              </div>
              <h2 className={styles.sectionTitle}>
                Dispensaries help you choose. We help you understand.
              </h2>
              <p className={styles.trustBody}>
                Dispensaries are designed to help you pick a product. LIFTD+
                helps you understand what you&apos;re choosing — and why.
              </p>
              <div className={styles.dontList}>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>✕</div>
                  Push you toward a purchase before you&apos;re ready
                </div>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>✕</div>
                  Prioritize sales over your actual questions
                </div>
                <div className={styles.dontItem}>
                  <div className={styles.xIcon}>✕</div>
                  Hide who we work with or why
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
                Cannabis education can feel intimidating. We explain things the
                way a friend would — if they&apos;d done the research and
                genuinely wanted to help.
              </p>
              <ul className={styles.plainList}>
                <li>
                  <span className={styles.plainArr}>→</span>
                  What cannabis effects actually feel like, and what&apos;s
                  normal
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  How to dose gently if you&apos;re starting, or restarting
                  after years
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  How cannabis affects sleep differently than stress or pain
                </li>
                <li>
                  <span className={styles.plainArr}>→</span>
                  Common mistakes beginners make — and how to avoid them
                </li>
              </ul>
              <p className={styles.plainCloser}>
                &quot;We don&apos;t assume you already know this stuff.
                That&apos;s the whole point.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Merged: What to expect + Start with your goal */}
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
                  Written for people who&apos;ve never tried cannabis — or
                  haven&apos;t in years.
                </li>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  You&apos;ll learn before anyone tries to sell you anything.
                </li>
                <li className={styles.expectBullet}>
                  <span className={styles.expectCheck} aria-hidden>✓</span>
                  Organized around your goals — not around what&apos;s on a
                  shelf.
                </li>
              </ul>
              <p className={styles.expectCloser}>
                We organize around your goals, not around products.
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
                      You want better rest, but worry about feeling off the next
                      day.
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.goalCard} ${styles.reveal}`}
                  style={{ transitionDelay: "0.1s" }}
                >
                  <div className={styles.goalNum}>02</div>
                  <div className={styles.goalText}>
                    <h3>Stress Relief</h3>
                    <p>
                      Manage stress and find calm — without losing your edge.
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.goalCard} ${styles.reveal}`}
                  style={{ transitionDelay: "0.15s" }}
                >
                  <div className={styles.goalNum}>03</div>
                  <div className={styles.goalText}>
                    <h3>Pain Relief</h3>
                    <p>
                      Curious about pain management but hesitant about side
                      effects.
                    </p>
                  </div>
                </div>
              </div>
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
          <div className={`${styles.howChipsWrap} ${styles.reveal}`}>
            <p className={styles.howChipsLabel}>
              Start by choosing what matters to you
            </p>
            <div className={styles.howChips}>
              <span className={styles.howChip}>Sleep & Rest</span>
              <span className={styles.howChip}>Stress & Anxiety</span>
              <span className={styles.howChip}>Pain Relief</span>
              <span className={styles.howChip}>Focus & Creativity</span>
              <span className={styles.howChip}>Hormonal Changes</span>
              <span className={styles.howChip}>I&apos;m Not Sure Yet</span>
            </div>
          </div>
          <div className={styles.howGrid}>
            <div className={`${styles.howStep} ${styles.reveal}`}>
              <div className={styles.stepNum}>1</div>
              <h3>Choose what you want to learn about</h3>
              <p>
                Start with up to three topics like sleep, stress, or pain.
                We&apos;ll guide you from there.
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.07s" }}
            >
              <div className={styles.stepNum}>2</div>
              <h3>Learn at your own pace</h3>
              <p>
                Explore formats, effects, dosing, and safety — written
                specifically for beginners.
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.14s" }}
            >
              <div className={styles.stepNum}>3</div>
              <h3>Get answers to your real questions</h3>
              <p>
                &quot;Will I feel groggy?&quot; &quot;How much should I
                take?&quot; &quot;What if I haven&apos;t done this in 20
                years?&quot;
              </p>
            </div>
            <div
              className={`${styles.howStep} ${styles.reveal}`}
              style={{ transitionDelay: "0.21s" }}
            >
              <div className={styles.stepNum}>4</div>
              <h3>Feel prepared when you walk in</h3>
              <p>
                You&apos;ll know what you&apos;re looking for — and what
                questions to ask.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className={styles.videoSection}>
        <div className={styles.videoInner}>
          <div
            className={`${styles.videoEyebrow} ${styles.reveal}`}
          >
            <span className={styles.eyebrowLine} />
            See how it works
          </div>
          <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>
            A short walkthrough of LIFTD+ in action
          </h2>
          <div className={`${styles.videoFrame} ${styles.reveal}`}>
            <div className={styles.playWrap}>
              <div className={styles.playBtn}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M4 2.5l8 4.5-8 4.5V2.5z"
                    fill="#2e3a45"
                  />
                </svg>
              </div>
            </div>
            <span className={styles.videoLbl}>
              Platform walkthrough — 60–90 seconds
            </span>
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
                Beginner-friendly guides,
                <br />
                written like a knowledgeable friend
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
                <p>
                  A clear breakdown of how THC and CBD affect sleep differently —
                  when each might help, and how to choose what fits your needs.
                </p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
            <Link
              href="/post/demystifying-microdosing-thc-for-calm-and-stress-relief"
              className={`${styles.articleCard} ${styles.reveal}`}
              style={{ transitionDelay: "0.08s" }}
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
                <p>
                  An approachable intro to microdosing — what it is, why people
                  use it, and how it may support calm without feeling out of
                  control.
                </p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
            <Link
              href="/post/why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it"
              className={`${styles.articleCard} ${styles.reveal}`}
              style={{ transitionDelay: "0.16s" }}
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
                <p>
                  An honest look at why anxiety can happen, common beginner
                  missteps, and practical ways to reduce discomfort.
                </p>
                <span className={styles.articleCta}>Read this guide free →</span>
              </div>
            </Link>
          </div>
          <p className={`${styles.gateLine} ${styles.reveal}`}>
            Want to go deeper?{" "}
            <Link href="/onboarding">Create a free account</Link> to unlock the
            full library.
          </p>
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
            Ready when you are
          </div>
          <h2 className={styles.sectionTitle}>
            Start Learning — It&apos;s Free
          </h2>
          <p>
            Start by choosing up to three topics you care about.
            <br />
            We&apos;ll guide you from there.
          </p>
          <Link
            href="/onboarding"
            className={styles.btnPrimary}
            style={{ margin: "0 auto" }}
            onClick={() => trackCta("mid_page_cta")}
          >
            Choose your topics →
          </Link>
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
            Get clear guidance in your inbox
          </h2>
          <p className={styles.nlBody}>
            Monthly beginner-friendly guides on cannabis for sleep, stress, and
            pain — written by people who take the time to understand it.
          </p>
          <form
            className={styles.emailRow}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
            />
            <button type="submit">Send Me the Guides →</button>
          </form>
          <p className={styles.fine}>No spam. Unsubscribe anytime.</p>
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
            <Link href="/privacy">Privacy</Link>
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

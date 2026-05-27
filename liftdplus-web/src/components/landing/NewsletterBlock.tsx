"use client";

import { useState } from "react";
import { trackEvent } from "@/utils/analytics";
import styles from "@/app/page.module.css";

export default function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className={styles.newsletterSection}>
      <div className={styles.nlInner}>
        <div className={styles.eyebrow} style={{ justifyContent: "center" }}>
          <span className={styles.eyebrowLine} />
          Stay in the loop
        </div>
        <h2 className={styles.sectionTitle}>
          One email a month. The kind you actually save.
        </h2>
        <p className={styles.nlBody}>
          Beginner-friendly guides on sleep, stress, and winding down, sent to adults exploring
          cannabis for the first time. Or the first time in a long time.
        </p>
        <form
          className={styles.emailRow}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim() || status === "loading") return;
            trackEvent("newsletter_signup_attempted", { source: "faq_page" });
            setStatus("loading");
            setError(null);
            try {
              const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                setStatus("success");
                setEmail("");
              } else if (data.error === "already_subscribed") {
                setStatus("error");
                setError("This email is already subscribed.");
              } else {
                setStatus("error");
                setError(
                  typeof data.error === "string"
                    ? data.error
                    : "Something went wrong. Please try again."
                );
              }
            } catch {
              setStatus("error");
              setError("Something went wrong. Please try again.");
            }
          }}
        >
          <input
            type="email"
            placeholder="your@email.com"
            aria-label="Email for newsletter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send me the guides"}
          </button>
        </form>
        {status === "success" && (
          <p
            className={styles.nlBody}
            style={{ marginTop: 12, color: "var(--teal)", fontWeight: 600 }}
          >
            Thanks! You&apos;re on the list.
          </p>
        )}
        {status === "error" && error && (
          <p className={styles.nlBody} style={{ marginTop: 12, color: "#e57373" }}>
            {error}
          </p>
        )}
        <p className={styles.fine}>
          No spam. Unsubscribe anytime. Built for adults who prefer to decide for themselves.
        </p>
      </div>
    </section>
  );
}

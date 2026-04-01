"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EventPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || rsvpStatus === "loading") return;
    setRsvpStatus("loading");
    setRsvpError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() }),
      });
      if (res.ok) {
        setRsvpStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setRsvpStatus("error");
        setRsvpError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setRsvpStatus("error");
      setRsvpError("Something went wrong. Please try again.");
    }
  };

  const handleNl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim() || nlStatus === "loading") return;
    setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail.trim() }),
      });
      setNlStatus(res.ok ? "success" : "error");
    } catch {
      setNlStatus("error");
    }
  };

  useEffect(() => {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    if (nav) (nav as HTMLElement).style.display = 'none';
    if (header) (header as HTMLElement).style.display = 'none';
    return () => {
      if (nav) (nav as HTMLElement).style.display = '';
      if (header) (header as HTMLElement).style.display = '';
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: "#f0ede6",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(107,147,140,0.07) 39px, rgba(107,147,140,0.07) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(107,147,140,0.07) 39px, rgba(107,147,140,0.07) 40px)",
    }}>
      <div style={{ textAlign: "center", padding: "12px 24px", fontSize: 12, color: "#6b938c", letterSpacing: "0.04em" }}>
        Learn more about LIFTD+ at&nbsp;
        <a href="https://liftdplus.com" style={{ color: "#6b938c", fontWeight: 600, textDecoration: "underline" }}>liftdplus.com</a>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ep * { box-sizing: border-box; margin: 0; padding: 0; }
        .ep { max-width: 620px; margin: 0 auto; background: #fafaf7; box-shadow: 0 4px 48px rgba(80,90,85,0.13); }

        /* HEADER */
        .ep-header { background: #f4f5f0; padding: 40px 44px 48px; text-align: center; border-bottom: 2px solid #bac8b2; }
        .ep-logos { display: flex; align-items: center; justify-content: center; gap: 28px; margin-bottom: 32px; }
        .ep-logo-img { height: 52px; width: auto; display: block; object-fit: contain; }
        .ep-logo-divider { width: 1px; height: 40px; background: #bac8b2; flex-shrink: 0; }
        .ep-presents { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6b938c; margin-bottom: 20px; }
        .ep-header h1 { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; color: #313a43; line-height: 1.12; margin-bottom: 14px; letter-spacing: -0.01em; }
        .ep-tagline { font-size: 16px; color: #6b7c74; font-weight: 400; max-width: 400px; margin: 0 auto 32px; line-height: 1.6; }
        .ep-meta { display: inline-flex; flex-direction: column; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #bac8b2; border-radius: 14px; padding: 20px 36px; }
        .ep-meta-date { font-size: 17px; font-weight: 600; color: #313a43; }
        .ep-meta-loc { font-size: 14px; color: #6b7c74; }
        .ep-meta-free { display: inline-block; background: #6b938c; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 20px; padding: 4px 14px; margin-top: 2px; }

        /* RSVP */
        .ep-rsvp { background: #fff; padding: 44px; text-align: center; border-bottom: 1px solid #dde0d8; }
        .ep-rsvp h2 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #313a43; margin-bottom: 6px; }
        .ep-rsvp-sub { font-size: 14px; color: #6b7c74; margin-bottom: 28px; }
        .ep-form { display: flex; flex-direction: column; gap: 11px; max-width: 360px; margin: 0 auto; }
        .ep-input { width: 100%; padding: 13px 16px; border: 1.5px solid #dde0d8; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #313a43; background: #fafaf7; outline: none; }
        .ep-input:focus { border-color: #6b938c; }
        .ep-input::placeholder { color: #b0b8b4; }
        .ep-btn-primary { display: block; width: 100%; padding: 14px 24px; background: #6b938c; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; border: none; border-radius: 9px; cursor: pointer; letter-spacing: 0.01em; transition: background 0.2s; }
        .ep-btn-primary:hover { background: #4f5a58; }
        .ep-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ep-rsvp-note { font-size: 12px; color: #6b7c74; margin-top: 12px; }
        .ep-success { background: #f0f5f0; border: 1.5px solid #bac8b2; border-radius: 9px; padding: 20px; text-align: center; }
        .ep-success p { font-size: 15px; font-weight: 600; color: #313a43; margin-bottom: 4px; }
        .ep-success span { font-size: 13px; color: #6b7c74; }
        .ep-error { font-size: 13px; color: #c0392b; margin-top: 8px; text-align: center; }

        /* INTRO */
        .ep-section { padding: 40px 44px; border-bottom: 1px solid #dde0d8; background: #fafaf7; }
        .ep-section p { font-size: 15px; color: #4a5550; line-height: 1.8; margin-bottom: 14px; }
        .ep-section p:last-child { margin-bottom: 0; }

        /* HOST */
        .ep-host { background: #f4f5f0; padding: 44px; border-bottom: 1px solid #dde0d8; }
        .ep-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #6b938c; margin-bottom: 22px; }
        .ep-eyebrow-line { display: inline-block; width: 20px; height: 2px; background: #6b938c; flex-shrink: 0; }
        .ep-host-grid { display: flex; gap: 28px; align-items: flex-start; }
        .ep-host-photo-wrap { flex-shrink: 0; width: 148px; height: 176px; border-radius: 12px; overflow: hidden; border: 3px solid #bac8b2; position: relative; }
        .ep-host-name { display: inline-block; background: #bac8b2; color: #313a43; font-size: 13px; font-weight: 700; border-radius: 6px; padding: 4px 12px; margin-bottom: 6px; }
        .ep-host-title { font-size: 12px; color: #6b7c74; margin-bottom: 14px; letter-spacing: 0.03em; text-transform: uppercase; }
        .ep-host-bio p { font-size: 14px; color: #4a5550; line-height: 1.72; margin-bottom: 10px; }
        .ep-host-bio p:last-child { margin-bottom: 0; }
        .ep-host-sign { font-family: 'Playfair Display', serif; font-style: italic; font-size: 15px; color: #6b938c; margin-top: 14px; display: block; }

        /* AGENDA */
        .ep-agenda { background: #4f5a58; padding: 44px; }
        .ep-agenda h2 { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; color: #fff; margin-bottom: 5px; }
        .ep-agenda-sub { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 28px; }
        .ep-agenda-item { display: flex; gap: 16px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .ep-agenda-item:last-of-type { border-bottom: none; padding-bottom: 0; }
        .ep-agenda-time { flex-shrink: 0; background: rgba(186,200,178,0.15); border: 1px solid rgba(186,200,178,0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #bac8b2; letter-spacing: 0.04em; height: fit-content; margin-top: 1px; white-space: nowrap; }
        .ep-agenda-content h4 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .ep-agenda-content p { font-size: 13px; color: rgba(255,255,255,0.52); line-height: 1.55; margin: 0; }
        .ep-agenda-total { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.3); text-align: right; }

        /* NOT */
        .ep-not { padding: 40px 44px; border-bottom: 1px solid #dde0d8; background: #fafaf7; }
        .ep-not h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: #313a43; margin-bottom: 18px; }
        .ep-not-list { display: flex; flex-direction: column; gap: 9px; margin-bottom: 20px; }
        .ep-not-item { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #6b7c74; }
        .ep-not-dash { color: #bac8b2; flex-shrink: 0; font-weight: 500; }
        .ep-affirm { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #6b938c; line-height: 1.55; margin-bottom: 18px; }
        .ep-exclusive { padding: 13px 16px; background: #f4f5f0; border-radius: 8px; border-left: 3px solid #bac8b2; font-size: 13px; color: #6b7c74; }

        /* NEWSLETTER */
        .ep-nl { padding: 40px 44px; text-align: center; background: #f4f5f0; border-top: 1px solid #dde0d8; }
        .ep-nl h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #313a43; margin-bottom: 8px; }
        .ep-nl p { font-size: 14px; color: #6b7c74; margin-bottom: 24px; line-height: 1.65; max-width: 400px; margin-left: auto; margin-right: auto; }
        .ep-nl-form { display: flex; gap: 10px; max-width: 400px; margin: 0 auto; }
        .ep-btn-secondary { padding: 12px 20px; background: #4f5a58; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; border: none; border-radius: 9px; cursor: pointer; white-space: nowrap; }
        .ep-btn-secondary:hover { background: #313a43; }
        .ep-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ep-fine { font-size: 11px; color: #6b7c74; margin-top: 10px; }

        /* FOOTER */
        .ep-footer { background: #f4f5f0; padding: 32px 44px; text-align: center; border-top: 2px solid #bac8b2; }
        .ep-footer-logos { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 16px; }
        .ep-footer p { font-size: 12px; color: #6b7c74; line-height: 1.6; max-width: 340px; margin: 0 auto 10px; }
        .ep-footer a { color: #6b938c; text-decoration: none; font-size: 12px; }
        .ep-footer a:hover { text-decoration: underline; }

        @media (max-width: 520px) {
          .ep-header, .ep-rsvp, .ep-section, .ep-host, .ep-agenda, .ep-not, .ep-nl, .ep-footer { padding-left: 24px; padding-right: 24px; }
          .ep-header h1 { font-size: 30px; }
          .ep-host-grid { flex-direction: column; }
          .ep-host-photo-wrap { width: 100%; height: 220px; }
          .ep-nl-form { flex-direction: column; }
        }
      `}</style>

      <div className="ep">

        {/* HEADER */}
        <div className="ep-header">
          <div className="ep-logos">
            <Image
              src="https://mcusercontent.com/f505c3ae38f317ee08738d6e5/images/2b5d84a5-e8d1-a511-9867-ec30ddd30414.jpeg"
              alt="The Mama's Network"
              width={52}
              height={52}
              className="ep-logo-img"
              style={{ borderRadius: "50%", width: 52, height: 52, objectFit: "cover" }}
            />
            <div className="ep-logo-divider" />
            <Image
              src="https://mcusercontent.com/f505c3ae38f317ee08738d6e5/images/b9faa24a-d53d-1409-211f-dc83dbf29fbe.png"
              alt="LIFTD+"
              width={110}
              height={36}
              className="ep-logo-img"
              style={{ width: "auto", height: 36 }}
            />
          </div>
          <p className="ep-presents">The Mama&apos;s Network · presented by LIFTD+</p>
          <h1>Cannabis, Without the Guesswork</h1>
          <p className="ep-tagline">A casual evening for parents who are curious about cannabis and just want straight answers.</p>
          <div className="ep-meta">
            <span className="ep-meta-date">Thursday, April 16 · 6pm</span>
            <span className="ep-meta-loc">Little Break Cowork · Michigan</span>
            <span className="ep-meta-free">Free to attend</span>
          </div>
        </div>

        {/* RSVP */}
        <div className="ep-rsvp">
          <h2>Save your spot</h2>
          <p className="ep-rsvp-sub">Space is limited. Takes 30 seconds.</p>
          {rsvpStatus === "success" ? (
            <div className="ep-success">
              <p>You&apos;re in. See you April 16th.</p>
              <span>Check your inbox for a confirmation with the address and any updates.</span>
            </div>
          ) : (
            <form className="ep-form" onSubmit={handleRsvp}>
              <input className="ep-input" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={rsvpStatus === "loading"} />
              <input className="ep-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={rsvpStatus === "loading"} />
              <button className="ep-btn-primary" type="submit" disabled={rsvpStatus === "loading"}>
                {rsvpStatus === "loading" ? "Saving your spot…" : "Save My Spot →"}
              </button>
              {rsvpStatus === "error" && <p className="ep-error">{rsvpError}</p>}
            </form>
          )}
          <p className="ep-rsvp-note">You&apos;ll get a confirmation email with the address and any updates.</p>
        </div>

        {/* INTRO */}
        <div className="ep-section">
          <p>You&apos;ve probably thought about it. Maybe you&apos;re curious but don&apos;t know where to start, or who to ask without it getting weird.</p>
          <p>This is a judgment-free evening designed specifically for our community. Just a room full of parents asking the same questions, and a framework that makes it all make sense.</p>
          <p>You&apos;ll leave knowing exactly what to try, how much, and what to expect.</p>
        </div>

        {/* HOST */}
        <div className="ep-host">
          <div className="ep-eyebrow"><span className="ep-eyebrow-line" />Your host</div>
          <div className="ep-host-grid">
            <div className="ep-host-photo-wrap">
              <Image
                src="https://mcusercontent.com/f505c3ae38f317ee08738d6e5/images/fe521852-8b71-ddc5-7b47-7a7585237af1.png"
                alt="Erin Aloulou"
                fill
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            <div>
              <span className="ep-host-name">Erin Aloulou</span>
              <p className="ep-host-title">Co-Founder, LIFTD+</p>
              <div className="ep-host-bio">
                <p>Almost six years into parenthood, I realized that doing it all wasn&apos;t the same as being present for it.</p>
                <p>I started exploring cannabis as a way to actually slow down and reconnect with myself, and quickly discovered how much there was to understand and how little of it was explained in a way that felt relevant to my life.</p>
                <span className="ep-host-sign">That&apos;s why I built LIFTD+.</span>
              </div>
            </div>
          </div>
        </div>

        {/* AGENDA */}
        <div className="ep-agenda">
          <div className="ep-eyebrow" style={{ color: "#bac8b2" }}>
            <span style={{ display: "inline-block", width: 20, height: 2, background: "#bac8b2", flexShrink: 0 }} />
            What to expect
          </div>
          <h2>Here&apos;s exactly how the evening flows</h2>
          <p className="ep-agenda-sub">About 75 minutes total. Free to attend.</p>
          {[
            { time: "10 min", title: "We open with the real talk", body: "The questions most women are too embarrassed to ask out loud. Chances are yours is in there." },
            { time: "20 min", title: "A simple framework, together", body: "Goal. Format. Dose. Expectation. We walk through a live example so nothing feels abstract." },
            { time: "15 min", title: "Your personal cheat sheet", body: "A one-page tool you fill out and take home. By the time you're done, you'll know what to try and how to start safely." },
            { time: "15 min", title: "Open Q&A", body: "Ask anything. This is usually the most valuable part of the night." },
            { time: "10 min", title: "Meet LIFTD+", body: "A quick look at the app that turns everything you just figured out into a personalized guide built around your goals." },
          ].map((item) => (
            <div className="ep-agenda-item" key={item.title}>
              <div className="ep-agenda-time">{item.time}</div>
              <div className="ep-agenda-content">
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
          <div className="ep-agenda-total">~75 minutes total</div>
        </div>

        {/* WHAT THIS IS NOT */}
        <div className="ep-not">
          <h2>What this is not</h2>
          <div className="ep-not-list">
            {["A sales event", "A room full of experts talking at you", "Pressure to try anything"].map((item) => (
              <div className="ep-not-item" key={item}>
                <span className="ep-not-dash">—</span>{item}
              </div>
            ))}
          </div>
          <p className="ep-affirm">This is about helping you understand your options, so you can make your own decision.</p>
          <div className="ep-exclusive">
            This evening is exclusively for The Mama&apos;s Network community and their guests.
          </div>
        </div>

        {/* CAN'T MAKE IT */}
        <div className="ep-nl">
          <h3>Can&apos;t make it April 16th?</h3>
          <p>Join the LIFTD+ list and we&apos;ll send you the cheat sheet from the event, plus updates on what&apos;s coming next.</p>
          {nlStatus === "success" ? (
            <p style={{ color: "#6b938c", fontWeight: 600, fontSize: 14 }}>You&apos;re on the list. We&apos;ll send you the cheat sheet after the event.</p>
          ) : (
            <form className="ep-nl-form" onSubmit={handleNl}>
              <input className="ep-input" type="email" placeholder="your@email.com" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} required disabled={nlStatus === "loading"} style={{ flex: 1 }} />
              <button className="ep-btn-secondary" type="submit" disabled={nlStatus === "loading"}>
                {nlStatus === "loading" ? "Sending…" : "Send it →"}
              </button>
            </form>
          )}
          <p className="ep-fine">No spam. Unsubscribe anytime.</p>
        </div>

        {/* FOOTER */}
        <div className="ep-footer">
          <div className="ep-footer-logos">
            <Image
              src="https://mcusercontent.com/f505c3ae38f317ee08738d6e5/images/2b5d84a5-e8d1-a511-9867-ec30ddd30414.jpeg"
              alt="The Mama's Network"
              width={36}
              height={36}
              style={{ borderRadius: "50%", width: 36, height: 36, objectFit: "cover" }}
            />
            <div style={{ width: 1, height: 28, background: "#bac8b2" }} />
            <Image
              src="https://mcusercontent.com/f505c3ae38f317ee08738d6e5/images/b9faa24a-d53d-1409-211f-dc83dbf29fbe.png"
              alt="LIFTD+"
              width={80}
              height={28}
              style={{ width: "auto", height: 28, objectFit: "contain" }}
            />
          </div>
          <p>LIFTD+ is education, not retail. We&apos;re here to help you understand cannabis before you decide what&apos;s right for you.</p>
          <Link href="https://liftdplus.com" style={{ marginRight: 8 }}>Learn more at liftdplus.com</Link>
          &nbsp;·&nbsp;
          <Link href="mailto:erin@liftdplus.com" style={{ marginLeft: 8 }}>erin@liftdplus.com</Link>
        </div>

      </div>
    </div>
  );
}

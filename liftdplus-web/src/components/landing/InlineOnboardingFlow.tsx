"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/utils/analytics";
import flowStyles from "./InlineOnboarding.module.css";

const TOPIC_PROMPTS = [
  "I'm exhausted",
  "I need help relaxing",
  "I want to feel more present",
  "I want to feel more focused",
  "I don't know where to start",
] as const;

const WELCOME_CHECKMARKS = [
  "Product recommendations tailored to your comfort level and goals",
  "Guidance designed for curious and cautious beginners",
  "A clearer understanding of what may fit your lifestyle and needs",
] as const;

const Q1_OPTIONS = [
  "I've never tried cannabis before",
  "I've tried it once or twice",
  "I use it occasionally",
  "I use it somewhat regularly",
  "I used cannabis in the past but not anymore",
] as const;

const Q2_OPTIONS = [
  "I've never been to one before",
  "I'm curious but haven't gone yet",
  "I've been once or twice",
  "I'm fairly comfortable with them",
] as const;

const Q3_OPTIONS = [
  "How to feel relaxed without feeling out of control",
  "How to avoid feeling too high or mentally foggy",
  "How dosage actually works",
  "What different products and formats feel like",
  "How to find products that fit my lifestyle",
  "I'm mostly here to learn and explore",
] as const;

type Step = "support" | "welcome" | "q1" | "q2" | "q3" | "disclaimer" | "guide";

const STEP_ORDER: Step[] = ["support", "welcome", "q1", "q2", "q3", "disclaimer", "guide"];

const QUESTION_STEPS: Step[] = ["q1", "q2", "q3"];
const TRANSITION_STEPS: Step[] = ["welcome", "disclaimer"];

function ProgressDots({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  return (
    <div className={flowStyles.progressDots} aria-label={`Question ${activeStep} of 3`}>
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={`${flowStyles.dot} ${
            s === activeStep
              ? flowStyles.dotActive
              : s < activeStep
                ? flowStyles.dotDone
                : flowStyles.dotPending
          }`}
        />
      ))}
    </div>
  );
}

function OptionCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={`${flowStyles.optionCheck} ${selected ? flowStyles.optionCheckSelected : ""}`}
    >
      {selected && (
        <svg viewBox="0 0 13 13" fill="none" width={13} height={13}>
          <path
            d="M2 6.5l3.5 3.5 5.5-6"
            stroke="#313a43"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

interface InlineOnboardingFlowProps {
  sectionTitleClassName?: string;
  sectionHelperClassName?: string;
}

export default function InlineOnboardingFlow({
  sectionTitleClassName,
  sectionHelperClassName,
}: InlineOnboardingFlowProps) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("support");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<Set<string>>(new Set());
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [guideEmail, setGuideEmail] = useState("");
  const [guideStatus, setGuideStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [guideError, setGuideError] = useState<string | null>(null);

  const goTo = useCallback((next: Step) => {
    setStep(next);
    requestAnimationFrame(() => {
      flowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) goTo(STEP_ORDER[idx - 1]);
  }, [step, goTo]);

  useEffect(() => {
    const viewed: Record<Step, string> = {
      support: "inline_support",
      welcome: "inline_welcome",
      q1: "inline_q1_experience",
      q2: "inline_q2_dispensary",
      q3: "inline_q3_goals",
      disclaimer: "inline_disclaimer",
      guide: "inline_guide",
    };
    trackEvent("onboarding_step_viewed", { step: viewed[step] });
    if (step === "welcome") sendGAEvent("event", "disclaimer_viewed", {});
    if (step === "q1") sendGAEvent("event", "onboarding_q2_viewed", {});
    if (step === "q2") sendGAEvent("event", "onboarding_q3_viewed", {});
    if (step === "q3") sendGAEvent("event", "onboarding_q4_viewed", {});
    if (step === "disclaimer") sendGAEvent("event", "onboarding_disclaimer_final_viewed", {});
    if (step === "guide") trackEvent("onboarding_step_viewed", { step: "getting_started_guide" });
  }, [step]);

  const selectTopic = (label: string) => {
    trackEvent("cta_click", { label: "topic_prompt", prompt: label });
    trackEvent("onboarding_answer_selected", { step: "support_topic", answer: label });
    localStorage.setItem("liftd_onboarding_q1", JSON.stringify({ topics: [label] }));
    setSelectedTopic(label);
    goTo("welcome");
  };

  const renderQuestionContinue = (enabled: boolean, onClick: () => void) => (
    <button
      type="button"
      className={`${flowStyles.continueBtn} ${enabled ? flowStyles.continueBtnActive : flowStyles.continueBtnDisabled}`}
      disabled={!enabled}
      onClick={onClick}
    >
      Continue →
    </button>
  );

  const renderQuestionTopRow = (progress: 1 | 2 | 3) => (
    <div className={flowStyles.topRow}>
      <button type="button" className={flowStyles.backBtn} onClick={goBack}>
        ← Back
      </button>
      <ProgressDots activeStep={progress} />
    </div>
  );

  const renderWelcome = () => (
    <div className={`${flowStyles.fullBleed} ${flowStyles.gradientBg} ${flowStyles.transitionScreen}`}>
      <div className={flowStyles.transitionInner}>
        <h2 className={flowStyles.transitionHeadline}>You&apos;re in the right place.</h2>

        <div className={flowStyles.welcomeBodyGroup}>
          <p className={flowStyles.transitionBody}>
            Based on your answers, we&apos;ll build you a personalized guide with beginner-friendly
            education, dosage guidance, and product recommendations tailored to your comfort level.
          </p>
          <p className={flowStyles.transitionBody}>
            You&apos;ll learn about THC, CBD, product types, and what different experiences can feel
            like — without the pressure or jargon.
          </p>
        </div>

        <ul className={flowStyles.welcomeCheckList}>
          {WELCOME_CHECKMARKS.map((item) => (
            <li key={item} className={flowStyles.welcomeCheckItem}>
              <span className={flowStyles.welcomeCheckMark} aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className={flowStyles.welcomeCtaWrap}>
          <button
            type="button"
            className={flowStyles.ctaBtn}
            onClick={() => {
              sendGAEvent("event", "disclaimer_bridge_continued", {});
              trackEvent("onboarding_step_completed", { step: "inline_welcome" });
              goTo("q1");
            }}
          >
            Start My Guide →
          </button>
        </div>
      </div>
    </div>
  );

  const renderDisclaimer = () => (
    <div className={`${flowStyles.fullBleed} ${flowStyles.gradientBg} ${flowStyles.transitionScreen}`}>
      <button type="button" className={flowStyles.transitionBackBtn} onClick={goBack}>
        ← Back
      </button>
      <div className={flowStyles.transitionInner}>
        <h2 className={flowStyles.transitionHeadline}>Before we continue</h2>

        <div className={flowStyles.disclaimerBodyGroup}>
          <p className={flowStyles.transitionBody}>
            LIFTD+ is designed to help you better understand cannabis and cannabis products through
            educational content and personalized guidance.
          </p>
          <p className={flowStyles.transitionBody}>
            We do not provide medical advice, treatment, or healthcare recommendations. If you have
            questions about medications, health conditions, pregnancy, breastfeeding, or cannabis use,
            please speak with a qualified healthcare professional.
          </p>
          <p className={flowStyles.transitionBody}>
            Nothing on LIFTD+ is intended to diagnose, treat, cure, or prevent any medical condition.
          </p>
        </div>

        <div className={flowStyles.disclaimerCheckboxWrap}>
          <label className={flowStyles.disclaimerCheckboxRow}>
            <input
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
              className={flowStyles.visuallyHidden}
              aria-label="I confirm I'm 21 or older and understand LIFTD+ provides educational information, not medical advice"
            />
            <span
              className={`${flowStyles.disclaimerCheckboxBox} ${disclaimerChecked ? flowStyles.disclaimerCheckboxBoxChecked : ""}`}
            >
              {disclaimerChecked && (
                <svg width="16" height="12" viewBox="0 0 14 11" fill="none" aria-hidden>
                  <path
                    d="M1 5.5L5 9.5L13 1.5"
                    stroke="#313a43"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={flowStyles.disclaimerCheckboxLabel}>
              I confirm I&apos;m 21 or older and understand LIFTD+ provides educational information,
              not medical advice.
            </span>
          </label>
        </div>

        <div className={flowStyles.disclaimerCtaWrap}>
          <button
            type="button"
            className={flowStyles.ctaBtn}
            disabled={!disclaimerChecked}
            onClick={() => {
              sendGAEvent("event", "onboarding_disclaimer_accepted", {});
              localStorage.setItem(
                "liftd_disclaimer",
                JSON.stringify({ disclaimerAccepted: true })
              );
              goTo("guide");
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestionPanel = () => {
    if (!QUESTION_STEPS.includes(step)) return null;

    const content = (() => {
      switch (step) {
        case "q1":
          return (
            <>
              {renderQuestionTopRow(1)}
              <div className={flowStyles.iconWrap}>
                <Image
                  src="/liftd-icon.svg"
                  alt=""
                  width={72}
                  height={72}
                  className={`${flowStyles.icon} ${flowStyles.iconInvert}`}
                />
              </div>
              <div className={flowStyles.questionsCard}>
              <p className={flowStyles.eyebrowOnDark}>Question 1 of 3</p>
              <h3 className={flowStyles.headlineOnDark}>
                What&apos;s your experience with cannabis so far?
              </h3>
              <div className={flowStyles.options}>
                {Q1_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${flowStyles.option} ${q1 === option ? flowStyles.optionSelected : ""}`}
                    onClick={() => {
                      setQ1(option);
                      trackEvent("onboarding_answer_selected", {
                        step: "q1_experience",
                        answer: option,
                      });
                    }}
                  >
                    <span>{option}</span>
                    <OptionCheck selected={q1 === option} />
                  </button>
                ))}
              </div>
              </div>
              {renderQuestionContinue(!!q1, () => {
                sendGAEvent("event", "onboarding_q2_completed", { experienceLevel: q1 });
                localStorage.setItem(
                  "liftd_onboarding_q2",
                  JSON.stringify({ experienceLevel: q1 })
                );
                goTo("q2");
              })}
            </>
          );
        case "q2":
          return (
            <>
              {renderQuestionTopRow(2)}
              <div className={flowStyles.iconWrap}>
                <Image
                  src="/liftd-icon.svg"
                  alt=""
                  width={72}
                  height={72}
                  className={`${flowStyles.icon} ${flowStyles.iconInvert}`}
                />
              </div>
              <div className={flowStyles.questionsCard}>
              <p className={flowStyles.eyebrowOnDark}>Question 2 of 3</p>
              <h3 className={flowStyles.headlineOnDark}>
                How familiar are you with dispensaries?
              </h3>
              <div className={flowStyles.options}>
                {Q2_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${flowStyles.option} ${q2 === option ? flowStyles.optionSelected : ""}`}
                    onClick={() => {
                      setQ2(option);
                      trackEvent("onboarding_answer_selected", {
                        step: "q2_dispensary",
                        answer: option,
                      });
                    }}
                  >
                    <span>{option}</span>
                    <OptionCheck selected={q2 === option} />
                  </button>
                ))}
              </div>
              </div>
              {renderQuestionContinue(!!q2, () => {
                sendGAEvent("event", "onboarding_q3_completed", { dispensaryFamiliarity: q2 });
                localStorage.setItem(
                  "liftd_onboarding_q3",
                  JSON.stringify({ purchaseBehavior: q2 })
                );
                goTo("q3");
              })}
            </>
          );
        case "q3":
          return (
            <>
              {renderQuestionTopRow(3)}
              <div className={flowStyles.iconWrap}>
                <Image
                  src="/liftd-icon.svg"
                  alt=""
                  width={72}
                  height={72}
                  className={`${flowStyles.icon} ${flowStyles.iconInvert}`}
                />
              </div>
              <div className={flowStyles.questionsCard}>
              <p className={flowStyles.eyebrowOnDark}>Question 3 of 3</p>
              <h3 className={flowStyles.headlineOnDark}>
                What would you most like help understanding?
              </h3>
              <p className={flowStyles.subhead}>Select all that apply.</p>
              <div className={flowStyles.options}>
                {Q3_OPTIONS.map((option) => {
                  const isSelected = q3.has(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`${flowStyles.option} ${isSelected ? flowStyles.optionSelected : ""}`}
                      onClick={() => {
                        trackEvent("onboarding_answer_selected", {
                          step: "q3_goals",
                          answer: option,
                        });
                        setQ3((prev) => {
                          const next = new Set(prev);
                          if (next.has(option)) next.delete(option);
                          else next.add(option);
                          return next;
                        });
                      }}
                    >
                      <span>{option}</span>
                      <OptionCheck selected={isSelected} />
                    </button>
                  );
                })}
              </div>
              </div>
              {renderQuestionContinue(q3.size > 0, () => {
                const learningGoals = Array.from(q3);
                sendGAEvent("event", "onboarding_q4_completed", { learningGoals });
                localStorage.setItem(
                  "liftd_onboarding_q4",
                  JSON.stringify({ learningGoal: learningGoals })
                );
                goTo("disclaimer");
              })}
            </>
          );
        default:
          return null;
      }
    })();

    return (
      <div className={`${flowStyles.fullBleed} ${flowStyles.gradientBg} ${flowStyles.questionBleed}`}>
        <div className={flowStyles.flowPanelWrap}>
          <div className={flowStyles.panel}>
            <div className={flowStyles.panelContent}>{content}</div>
          </div>
        </div>
      </div>
    );
  };

  const handleGuideEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideEmail.trim() || guideStatus === "loading") return;
    trackEvent("newsletter_signup_attempted", { source: "onboarding_guide" });
    setGuideStatus("loading");
    setGuideError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guideEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGuideStatus("success");
        trackEvent("onboarding_guide_email_saved", { source: "inline" });
        localStorage.removeItem("liftd_onboarding_q1");
        localStorage.removeItem("liftd_onboarding_q2");
        localStorage.removeItem("liftd_onboarding_q3");
        localStorage.removeItem("liftd_onboarding_q4");
        localStorage.removeItem("liftd_disclaimer");
      } else if (data.error === "already_subscribed") {
        setGuideStatus("error");
        setGuideError("This email is already on our list.");
      } else {
        setGuideStatus("error");
        setGuideError(
          typeof data.error === "string" ? data.error : "Something went wrong. Please try again."
        );
      }
    } catch {
      setGuideStatus("error");
      setGuideError("Something went wrong. Please try again.");
    }
  };

  const isImmersiveStep =
    TRANSITION_STEPS.includes(step) || QUESTION_STEPS.includes(step) || step === "guide";

  return (
    <div
      ref={flowRef}
      className={flowStyles.flow}
      data-onboarding-immersive={isImmersiveStep ? "true" : undefined}
    >
      {step === "support" && (
        <>
          <h2 className={sectionTitleClassName}>
            What do you need support with right now?
          </h2>
          <p className={sectionHelperClassName}>
            Just pick what feels closest. No wrong answer.
          </p>
          <div className={flowStyles.supportGrid}>
            <div className={flowStyles.supportRow}>
              {TOPIC_PROMPTS.slice(0, 3).map((label) => (
                <button
                  key={label}
                  type="button"
                  className={flowStyles.topicBtn}
                  onClick={() => selectTopic(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={flowStyles.supportRowBottom}>
              {TOPIC_PROMPTS.slice(3).map((label) => (
                <button
                  key={label}
                  type="button"
                  className={flowStyles.topicBtn}
                  onClick={() => selectTopic(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "welcome" && renderWelcome()}
      {QUESTION_STEPS.includes(step) && renderQuestionPanel()}
      {step === "disclaimer" && renderDisclaimer()}

      {step === "guide" && (
        <div className={flowStyles.flowPanelWrap}>
          <div className={flowStyles.guideCard}>
            <button
              type="button"
              className={`${flowStyles.backBtn} ${flowStyles.backBtnLight}`}
              onClick={goBack}
              style={{ marginBottom: 16 }}
            >
              ← Back
            </button>
            <Image
              src="/liftd-icon.svg"
              alt="LIFTD+"
              width={64}
              height={64}
              style={{ margin: "0 auto 16px", display: "block" }}
            />
            <p className={flowStyles.guideTopic}>Your personalized guide</p>
            <h3 className={flowStyles.guideTitle}>
              {selectedTopic ? `Built for: ${selectedTopic}` : "Your guide is ready"}
            </h3>
            <p className={flowStyles.guideBody}>
              Save your guide with your email. We&apos;ll keep your answers on this device until you
              do — nothing is sent to our servers until you sign up below.
            </p>
            {guideStatus === "success" ? (
              <p className={flowStyles.emailSuccess}>
                Thanks! Check your inbox — your guide is on its way.
              </p>
            ) : (
              <form className={flowStyles.emailForm} onSubmit={handleGuideEmail}>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email to save your guide"
                  className={flowStyles.emailInput}
                  value={guideEmail}
                  onChange={(e) => setGuideEmail(e.target.value)}
                  disabled={guideStatus === "loading"}
                />
                <button
                  type="submit"
                  className={flowStyles.emailBtn}
                  disabled={guideStatus === "loading"}
                >
                  {guideStatus === "loading" ? "Saving…" : "Save my guide"}
                </button>
                {guideStatus === "error" && guideError && (
                  <p className={flowStyles.emailError}>{guideError}</p>
                )}
              </form>
            )}
            <p className={flowStyles.emailNote}>
              No spam. Unsubscribe anytime. For adults exploring cannabis thoughtfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type EventName =
  | "cta_click"
  | "article_clicked"
  | "newsletter_signup_attempted"
  | "onboarding_step_viewed"
  | "onboarding_step_completed"
  | "onboarding_answer_selected"
  | "onboarding_guide_email_saved"
  | "onboarding_completed"
  | "legacy_onboarding_completed"
  | "signup_initiated"
  | "signup_completed"
  | "article_read"
  | "results_viewed"
  | "save_guide_clicked"
  | "otp_requested"
  | "guide_saved";

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: EventName, params?: EventParams) {
  if (
    typeof window === "undefined" ||
    !(window as unknown as { gtag?: unknown }).gtag
  ) {
    return;
  }
  (
    window as unknown as {
      gtag: (a: string, b: string, c: object) => void;
    }
  ).gtag("event", name, params ?? {});
}

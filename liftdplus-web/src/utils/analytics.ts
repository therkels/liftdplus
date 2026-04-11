type EventName =
  | "cta_click"
  | "article_clicked"
  | "newsletter_signup_attempted"
  | "onboarding_step_viewed"
  | "onboarding_answer_selected"
  | "onboarding_completed"
  | "legacy_onboarding_completed"
  | "signup_initiated"
  | "signup_completed"
  | "article_read";

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

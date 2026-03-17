export type ChecklistItemId =
  | "understand_basics"
  | "know_your_formats"
  | "understand_dosing"
  | "match_to_your_goal"
  | "know_the_lingo";

export interface ChecklistItem {
  id: ChecklistItemId;
  title: string;
  description: string;
  slug: string;
  goalSlugMap?: Record<string, string>;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "understand_basics",
    title: "Understand the basics",
    description: "Learn the difference between THC and CBD — the two most important things to know before anything else.",
    slug: "thc-vs-cbd-whats-the-difference",
  },
  {
    id: "know_your_formats",
    title: "Know your format options",
    description: "Edibles, tinctures, flower — each one works differently. Find out which might suit you.",
    slug: "edibles-demystified",
  },
  {
    id: "understand_dosing",
    title: "Learn how to dose safely",
    description: "Understand why less is more, and what to do if cannabis ever feels overwhelming.",
    slug: "why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it",
  },
  {
    id: "match_to_your_goal",
    title: "Match cannabis to your goal",
    description: "Get the guide that's most relevant to what you're trying to achieve.",
    slug: "thc-vs-cbd-for-sleep-whats-the-difference",
    goalSlugMap: {
      sleep: "thc-vs-cbd-for-sleep-whats-the-difference",
      stress: "thc-vs-cbd-for-stress-which-one-helps-you-chill-without-the-fog",
      pain: "cannabis-for-pain-relief-a-beginners-guide-to-aches-inflammation--ev",
      focus: "microdosing-for-focus-creativity-and-flow-a-beginner-playbook",
      intimacy: "cannabis-sex-what-the-research-actually-says",
      hormonal: "cannabis-and-your-cycle-products-that-support-hormonal-balance",
    },
  },
  {
    id: "know_the_lingo",
    title: "Learn the lingo",
    description: "Know what budtenders are talking about so you can ask the right questions when you walk in.",
    slug: "know-the-lingo",
  },
];

export const CHECKLIST_COMPLETION_MESSAGE = {
  headline: "You're dispensary ready. 🌿",
  subtext: "You've covered the essentials. You know what to look for, how to dose safely, and how to have a real conversation when you walk in.",
};

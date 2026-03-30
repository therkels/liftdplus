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
  readTime: string;
  goalSlugMap?: Record<string, string>;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "understand_basics",
    title: "Understand the basics",
    description: "Get clear on THC vs. CBD. The two things everything else builds on.",
    slug: "thc-vs-cbd-whats-the-difference",
    readTime: "3 min",
  },
  {
    id: "know_your_formats",
    title: "Explore your options",
    description: "See which format might work best for you — edibles, tinctures, and more.",
    slug: "edibles-demystified",
    readTime: "4 min",
    goalSlugMap: {
      sleep: "how-to-time-your-cannabis-for-better-sleep",
      stress: "demystifying-microdosing-thc-for-calm-and-stress-relief",
      pain: "cannabis-for-pain-relief-a-beginners-guide-to-aches-inflammation--everyday-discomfort",
      focus: "microdosing-for-focus-creativity-and-flow-a-beginner-playbook",
      intimacy: "low-dose-thc-might-be-the-key-to-better-sex",
      hormonal: "cannabis-and-your-cycle-products-that-support-hormonal-balance",
    },
  },
  {
    id: "understand_dosing",
    title: "Dose with confidence",
    description: "Why less is more and what to do if it ever feels like too much.",
    slug: "why-cannabis-can-sometimes-feel-anxious--and-how-to-handle-it",
    readTime: "3 min",
  },
  {
    id: "match_to_your_goal",
    title: "Find what fits your goals",
    description: "Better sleep, less stress, more ease. Start with what matters to you.",
    slug: "thc-vs-cbd-for-sleep-whats-the-difference",
    readTime: "4 min",
    goalSlugMap: {
      sleep: "thc-vs-cbd-for-sleep-whats-the-difference",
      stress: "thc-vs-cbd-for-stress-which-one-helps-you-chill-without-the-fog",
      pain: "cannabis-for-pain-relief-a-beginners-guide-to-aches-inflammation--everyday-discomfort",
      focus: "microdosing-for-focus-creativity-and-flow-a-beginner-playbook",
      intimacy: "cannabis--sex-what-the-research-actually-says",
      hormonal: "cannabis-and-your-cycle-products-that-support-hormonal-balance",
    },
  },
  {
    id: "know_the_lingo",
    title: "Make sense of the lingo",
    description: "So nothing feels confusing when you need it most.",
    slug: "know-the-lingo",
    readTime: "3 min",
  },
];

export const CHECKLIST_COMPLETION_MESSAGE = {
  headline: "That's the important stuff covered.",
  subtext: "You know what cannabis does, how to use it safely, and what to look for. Everything else builds from here.",
};

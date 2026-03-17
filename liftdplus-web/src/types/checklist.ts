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
  postId: number;
  goalPostMap?: Record<string, number>;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "understand_basics",
    title: "Understand the basics",
    description: "Learn the difference between THC and CBD — the two most important things to know before anything else.",
    postId: 14,
  },
  {
    id: "know_your_formats",
    title: "Know your format options",
    description: "Edibles, tinctures, flower — each one works differently. Find out which might suit you.",
    postId: 40,
  },
  {
    id: "understand_dosing",
    title: "Learn how to dose safely",
    description: "Understand why less is more, and what to do if cannabis ever feels overwhelming.",
    postId: 18,
  },
  {
    id: "match_to_your_goal",
    title: "Match cannabis to your goal",
    description: "Get the guide that's most relevant to what you're trying to achieve.",
    postId: 15, // default: sleep
    goalPostMap: {
      sleep: 15,       // THC vs. CBD for Sleep
      stress: 17,      // THC vs. CBD for Stress
      pain: 41,        // Cannabis for Pain Relief
      focus: 43,       // Microdosing for Focus
      intimacy: 20,    // Cannabis & Sex: What the Research Says
      hormonal: 23,    // Cannabis and Your Cycle
    },
  },
  {
    id: "know_the_lingo",
    title: "Learn the lingo",
    description: "Know what budtenders are talking about so you can ask the right questions when you walk in.",
    postId: 31,
  },
];

export const CHECKLIST_COMPLETION_MESSAGE = {
  headline: "You're dispensary ready. 🌿",
  subtext: "You've covered the essentials. You know what to look for, how to dose safely, and how to have a real conversation when you walk in.",
};

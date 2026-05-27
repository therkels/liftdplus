import type { Metadata } from "next";
import Image from "next/image";
import SubPageLayout from "@/components/landing/SubPageLayout";
import InstagramFeed from "@/components/landing/InstagramFeed";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "About | LIFTD+",
  description:
    "The story behind LIFTD+ — approachable cannabis education built for real life, from sleep and stress to curiosity without pressure.",
};

const FOUNDER_HOOK =
  "Built for moms who never thought cannabis was for them";

const FOUNDER_PARAGRAPHS = [
  "Like a lot of people, I associated cannabis with one thing and one thing only: getting high.",
  "But when I started learning more about it, I realized there was a whole other side to how it can be used, especially for sleep, stress, and everyday overwhelm.",
  "Most of what I found in the cannabis space did not feel like it was made for people like me. It felt either too clinical or too disconnected from real life.",
  "As a mom, I know what it feels like to be carrying a lot and still trying to find something that helps you slow down without losing yourself in the process.",
  "So I built LIFTD+ to make cannabis feel more approachable, more thoughtful, and more aligned with how real people actually live.",
  "And the name matters, too.",
  'Yes, "lifted" can mean getting high, but LIFTD+ is also about elevating your understanding, reframing your relationship with the plant, and finding products that genuinely fit your life. The "plus" is intentional: more clarity, more confidence, more support, and a more informed way to explore cannabis.',
  "This is for people who are curious, cautious, and just starting to explore what support might look like for them.",
  "No pressure. Just guidance at your pace.",
];

export default function AboutPage() {
  return (
    <SubPageLayout>
      <div className={styles.subPageBand}>
        <div className={styles.subPageInner}>
          <Image
            src="/liftd-icon.svg"
            alt=""
            width={140}
            height={140}
            className={styles.subPageIcon}
            priority
          />
          <h1 className={styles.subPageTitle}>About</h1>

          <div className={styles.aboutStory}>
            <p className={styles.founderStoryHook}>{FOUNDER_HOOK}</p>
            <div className={styles.aboutStoryBody}>
              {FOUNDER_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <p className={styles.aboutSignoff}>— Erin, Co-Founder</p>

          <h2 className={styles.aboutInstagramHeadline}>Stay connected</h2>
          <InstagramFeed showLabel={false} />
        </div>
      </div>
    </SubPageLayout>
  );
}

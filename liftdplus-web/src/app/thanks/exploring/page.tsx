import type { Metadata } from "next";
import ThanksPage from "../ThanksPage";

export const metadata: Metadata = {
  title: "Thanks | LIFTD+",
  robots: { index: false, follow: false },
};

export default function ThanksExploringPage() {
  return (
    <ThanksPage message="Got it. We'll keep things relevant to where you are." />
  );
}

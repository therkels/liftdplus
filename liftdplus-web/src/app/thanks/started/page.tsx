import type { Metadata } from "next";
import ThanksPage from "../ThanksPage";

export const metadata: Metadata = {
  title: "Thanks | LIFTD+",
  robots: { index: false, follow: false },
};

export default function ThanksStartedPage() {
  return (
    <ThanksPage message="Got it. When you're ready to try something, your guide will be there." />
  );
}

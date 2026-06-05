import type { Metadata } from "next";
import ThanksPage from "../ThanksPage";

export const metadata: Metadata = {
  title: "Thanks | LIFTD+",
  robots: { index: false, follow: false },
};

export default function ThanksActivePage() {
  return (
    <ThanksPage message="Got it. Your guide can help you compare and track what you're noticing." />
  );
}

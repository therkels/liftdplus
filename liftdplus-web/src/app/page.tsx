import type { Metadata } from "next";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finally Feel Informed About Cannabis | LIFTD+",
  description:
    "Not sure where to start with cannabis for sleep, stress, or winding down? LIFTD+ gives adults a personalized starting point — no dispensary pressure, no jargon. Free to join.",
  keywords:
    "cannabis for sleep, cannabis for stress, beginner cannabis guide, cannabis education adults, CBD for sleep, THC for beginners, microdosing, cannabis anxiety, cannabis for women",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Finally Feel Informed About Cannabis | LIFTD+",
    description:
      "Answer 4 questions. Get a personalized cannabis starting point built around your goals — sleep, stress, or winding down. Written for beginners. Free.",
    url: "https://liftdplus.com",
    siteName: "LIFTD+",
    type: "website",
    images: [
      {
        url: "https://liftdplus.com/images/og-hero-updated.jpg",
        width: 1200,
        height: 630,
        alt: "LIFTD+ — Cannabis Education for Adults",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finally Feel Informed About Cannabis | LIFTD+",
    description:
      "Answer 4 questions. Get a personalized cannabis starting point built around your goals. Free, no dispensary required.",
    images: ["https://liftdplus.com/images/og-hero-updated.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function Home() {
  return <LandingPage />;
}

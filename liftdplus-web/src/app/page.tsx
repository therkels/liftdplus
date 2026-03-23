import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Understand Cannabis Before You Decide | LIFTD+",
  description:
    "Curious about cannabis for sleep, stress, or pain? LIFTD+ helps you understand what cannabis does and whether it might work for you before you walk into a dispensary. Free to join, nothing to buy.",
  keywords:
    "cannabis education, CBD for sleep, THC for pain, cannabis for stress, beginner cannabis guide, cannabis for adults, microdosing, cannabis anxiety",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Understand Cannabis Before You Decide | LIFTD+",
    description:
      "Learn what cannabis really does for sleep, stress, and pain — in plain English. Written for beginners. No pressure. Free to start.",
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
    title: "Understand Cannabis Before You Decide | LIFTD+",
    description:
      "Learn what cannabis really does for sleep, stress, and pain — in plain English. Written for beginners. No pressure. Free to start.",
    images: ["https://liftdplus.com/images/og-hero-updated.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/explore");
  }

  return <LandingPage />;
}

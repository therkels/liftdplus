import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LIFTD+ | Cannabis Education for Adults",
  description:
    "Curious about cannabis for sleep, stress, or pain? LIFTD+ helps you understand what cannabis does — and whether it might work for you — before you walk into a dispensary. Free to join, nothing to buy.",
  openGraph: {
    title: "LIFTD+ | Cannabis Education for Adults",
    description:
      "Learn about cannabis for sleep, stress, and pain. Written for beginners. Free to start.",
    url: "https://liftdplus.com",
    siteName: "LIFTD+",
    type: "website",
    images: [
      {
        url: "https://liftdplus.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LIFTD+ | Cannabis Education for Adults",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIFTD+ | Cannabis Education for Adults",
    description:
      "Learn about cannabis for sleep, stress, and pain. Free to start.",
    images: ["https://liftdplus.com/images/og-image.jpg"],
  },
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

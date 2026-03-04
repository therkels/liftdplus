import UnregisterSW from "@/components/dev/UnregisterSW";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavBar from "@/components/site_core/ConditionalNavBar";
import ConditionalMain from "@/components/site_core/ConditionalMain";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LIFTD+ | Cannabis Education for Adults",
  description:
    "Curious about cannabis for sleep, stress, or pain? LIFTD+ helps you understand what cannabis does — and whether it might work for you — before you walk into a dispensary. Free to join, nothing to buy.",
  keywords:
    "cannabis education, CBD for sleep, THC for pain, cannabis for stress, beginner cannabis guide, cannabis for adults, microdosing, cannabis anxiety",
  metadataBase: new URL("https://liftdplus.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LIFTD+ | Cannabis Education for Adults",
    description:
      "Learn about cannabis for sleep, stress, and pain. Written for beginners. Free to start.",
    url: "https://liftdplus.com",
    siteName: "LIFTD+",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LIFTD+ | Cannabis Education for Adults",
    description:
      "Learn about cannabis for sleep, stress, and pain. Free to start.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/liftd-icon.svg",
    shortcut: "/liftd-icon.svg",
    apple: "/liftd-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <ClientProviders>
          <ConditionalNavBar />
          <ConditionalMain>{children}</ConditionalMain>
        </ClientProviders>

        {/* Keep this outside providers if you like; just don't render children again */}
        <UnregisterSW />
        <GoogleAnalytics gaId="G-NYZ84B03HS" />
      </body>
    </html>
  );
}

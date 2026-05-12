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
  metadataBase: new URL("https://liftdplus.com"),
  icons: {
    icon: "/liftd-icon.svg",
    shortcut: "/liftd-icon.svg",
    apple: "/liftd-icon.svg",
  },
  verification: {
    google: "Af8K6Ez_3BJwofpTPEoPBRsFrOofR2EVFhwN7lY4jQ0",
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

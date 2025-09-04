import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavBar from "@/components/site_core/ConditionalNavBar";
import ConditionalMain from "@/components/site_core/ConditionalMain";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/site_core/ToastContainer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LIFTD+ App",
  description: "LIFTD+ Application",
  icons: {
    icon: "/liftd-icon.svg",
    shortcut: "/liftd-icon.svg",
    apple: "/liftd-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen bg-gray-50`}>
        <ToastProvider>
          <ConditionalNavBar />
          <ConditionalMain>{children}</ConditionalMain>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}

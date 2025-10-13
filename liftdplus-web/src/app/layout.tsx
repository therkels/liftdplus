import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavBar from "@/components/site_core/ConditionalNavBar";
import ConditionalMain from "@/components/site_core/ConditionalMain";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/site_core/ToastContainer";
import Script from "next/script";


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
    <head>
      {/* Google Analytics */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-NYZ84B03HS"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NYZ84B03HS');
        `}
      </Script>
    </head>

       <body className={`${inter.variable} antialiased min-h-screen bg-gray-50`}>
      <ConditionalNavBar />
      <ConditionalMain>{children}</ConditionalMain>
      <ToastContainer />
    </body>
  </html>
  );
}

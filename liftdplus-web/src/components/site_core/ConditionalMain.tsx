"use client";

import { usePathname } from "next/navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();

  const isNoNavRoute =
    pathname === "/about" ||
    pathname === "/faq" ||
    pathname.startsWith("/login") ||
    pathname === "/getting-started" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/disclaimer");

  return (
    <main
      className={
        isNoNavRoute ? "min-h-screen m-0 p-0 w-screen overflow-hidden" : "pb-20 md:pb-8 md:pt-20" // Added top padding for fixed desktop nav
      }
    >
      {children}
    </main>
  );
}

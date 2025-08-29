"use client";

import { usePathname } from "next/navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();

  const isNoNavRoute =
    pathname.startsWith("/login") || pathname.startsWith("/onboarding");

  return (
    <main
      className={
        isNoNavRoute ? "min-h-screen m-0 p-0" : "pb-20 md:pb-8 md:px-8"
      }
    >
      {children}
    </main>
  );
}

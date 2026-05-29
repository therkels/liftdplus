"use client";

import { usePathname } from "next/navigation";

interface ConditionalMainProps {
  children: React.ReactNode;
}

const MARKETING_ROUTES = ["/about", "/faq", "/privacy", "/terms"];

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();

  const isNoNavRoute =
    pathname === "/" ||
    pathname === "" ||
    pathname.startsWith("/login") ||
    pathname === "/getting-started" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/disclaimer");

  const isMarketingRoute =
    MARKETING_ROUTES.includes(pathname) ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");

  const className = isNoNavRoute
    ? "min-h-screen m-0 p-0 w-screen overflow-hidden"
    : isMarketingRoute
      ? "min-h-screen pt-[76px]"
      : "pb-20 md:pb-8 md:pt-20";

  return <main className={className}>{children}</main>;
}

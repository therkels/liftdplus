"use client";

import { usePathname } from "next/navigation";
import MarketingNav from "@/components/landing/MarketingNav";
import NavBar from "./nav";

const MARKETING_ROUTES = ["/about", "/faq", "/resources", "/privacy", "/terms", "/results"];
const NO_NAV_ROUTES = ["/", "", "/getting-started"];

export default function ConditionalNavBar() {
  const pathname = usePathname();

  const isNoNav =
    NO_NAV_ROUTES.includes(pathname) ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/disclaimer") ||
    pathname.startsWith("/thanks");

  const isMarketingNav =
    MARKETING_ROUTES.includes(pathname) ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");

  if (isNoNav) return null;
  if (isMarketingNav) return <MarketingNav />;
  return <NavBar />;
}

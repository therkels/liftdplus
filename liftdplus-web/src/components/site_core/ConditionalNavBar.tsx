"use client";

import { usePathname } from "next/navigation";
import NavBar from "./nav";

export default function ConditionalNavBar() {
  const pathname = usePathname();

  const isNoNavRoute =
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname === "" ||
    pathname.startsWith("/login") ||
    pathname === "/onboarding/username" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/disclaimer");

  if (isNoNavRoute) {
    return null;
  }

  return <NavBar />;
}

"use client";

import { usePathname } from "next/navigation";
import NavBar from "./nav";

export default function ConditionalNavBar() {
  const pathname = usePathname();
  
  const isNoNavRoute = pathname.startsWith("/login") || pathname.startsWith("/onboarding");
  
  if (isNoNavRoute) {
    return null;
  }
  
  return <NavBar />;
} 
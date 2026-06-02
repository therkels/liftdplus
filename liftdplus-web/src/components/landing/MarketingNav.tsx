"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // On non-hero pages, always show scrolled (solid) state
  const hasHero = pathname === "/";

  useEffect(() => {
    if (!hasHero) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasHero]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        height: "76px",
        transition: "background 0.4s, box-shadow 0.4s",
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        boxShadow: scrolled ? "0 1px 0 rgba(107,147,140,0.15)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logos/01 LIFTD+ Logo - Primary.png"
          alt="LIFTD+"
          width={80}
          height={24}
          className="object-contain"
          priority
        />
      </Link>
      <div className="flex items-center gap-3 md:gap-6">
        <Link
          href="/results"
          className="whitespace-nowrap text-xs md:text-sm"
          style={{
            fontWeight: 500,
            color: "var(--navy)",
            textDecoration: "none",
            letterSpacing: "0.015em",
          }}
        >
          My Guide
        </Link>
        <Link
          href="/about"
          className="whitespace-nowrap text-xs md:text-sm"
          style={{
            fontWeight: 500,
            color: "var(--navy)",
            textDecoration: "none",
            letterSpacing: "0.015em",
          }}
        >
          About
        </Link>
        <Link
          href="/faq"
          className="whitespace-nowrap text-xs md:text-sm"
          style={{
            fontWeight: 500,
            color: "var(--navy)",
            textDecoration: "none",
            letterSpacing: "0.015em",
          }}
        >
          FAQ
        </Link>
        <Link
          href="/resources"
          className="whitespace-nowrap text-xs md:text-sm"
          style={{
            fontWeight: 500,
            color: "var(--navy)",
            textDecoration: "none",
            letterSpacing: "0.015em",
          }}
        >
          Resources
        </Link>
      </div>
    </nav>
  );
}

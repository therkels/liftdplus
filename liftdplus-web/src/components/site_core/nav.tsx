"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HiOutlineBookOpen,
  HiOutlineSearch,
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";

const NavBar: React.FC = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("explore");

  // Set active tab based on current pathname
  useEffect(() => {
    if (pathname === "/" || pathname === "/explore") {
      setActiveTab("explore");
    } else if (pathname === "/search") {
      setActiveTab("discover");
    } else if (pathname === "/favorites") {
      setActiveTab("favorites");
    } else if (pathname === "/profile") {
      setActiveTab("profile");
    }
  }, [pathname]);

  const navItems = [
    { id: "explore", label: "Explore", icon: HiOutlineBookOpen, href: "/explore" },
    {
      id: "discover",
      label: "Discover",
      icon: HiOutlineSearch,
      href: "/search",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: HiOutlineHeart,
      href: "/favorites",
    },
    { id: "profile", label: "Profile", icon: HiOutlineUser, href: "/profile" },
  ];

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-foreground shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center bg-white rounded-lg p-2">
            <Image
              src="/liftd-text.svg"
              alt="Liftd+ Logo"
              width={64}
              height={64}
              className="h-8 w-24"
            />
          </div>

          {/* Centered navigation tabs */}
          <div className="flex items-center space-x-8 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  activeTab === item.id
                    ? "text-slate-900 bg-accent font-medium"
                    : "text-white hover:text-gray-200"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-foreground shadow-lg">
        <div className="flex items-center">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3"
            >
              <div
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg ${
                  activeTab === item.id
                    ? "text-slate-900 bg-accent font-medium"
                    : "text-white hover:text-gray-200"
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default NavBar;

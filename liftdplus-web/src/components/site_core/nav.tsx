"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    if (pathname === "/") {
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
    { id: "explore", label: "Explore", icon: HiOutlineBookOpen, href: "/" },
    { id: "discover", label: "Discover", icon: HiOutlineSearch, href: "/search" },
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
      <nav className="hidden md:block text-white bg-foreground">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-bold text-xl">LFTD+</div>
          <div className="flex space-x-4 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center px-4 py-2 rounded-full transition-colors min-w-[80px] ${
                  activeTab === item.id
                    ? "text-slate-900 font-medium bg-accent"
                    : "hover:text-lime-400"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-foreground">
          <div className="flex">
            {navItems.map((item) => (
              <div key={item.id} className="w-1/4 flex justify-center py-3">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-5 py-1 transition-colors ${
                    activeTab === item.id
                      ? "text-slate-900 rounded-full bg-accent"
                      : "text-white"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-8 h-8" />
                  {activeTab === item.id && (
                    <span className="text-xs font-medium mt-1">
                      {item.label}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineSearch,
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";

const NavBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState("explore");

  const navItems = [
    { id: "explore", label: "Explore", icon: HiOutlineBookOpen, href: "/" },
    { id: "search", label: "Search", icon: HiOutlineSearch, href: "/search" },
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
      <nav className="hidden md:block bg-slate-700 text-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="font-bold text-xl">LFTD+</div>
          <div className="flex space-x-4 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center px-4 py-2 rounded-full transition-colors min-w-[80px] ${
                  activeTab === item.id
                    ? "bg-lime-400 text-slate-900 font-medium"
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
        <div className="bg-slate-700">
          <div className="flex">
            {navItems.map((item) => (
              <div key={item.id} className="w-1/4 flex justify-center py-3">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-5 py-1 transition-colors ${
                    activeTab === item.id
                      ? "bg-lime-400 text-slate-900 rounded-full"
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

"use client";

import React, { useState } from "react";

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      {/* Mobile*/}
      <div className="flex items-center justify-between px-6 py-4 md:hidden">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="font-bold text-xl">LFTD+</div>
        <button className="text-white focus:outline-none" aria-label="Profile">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        <div className="font-bold text-xl">LFTD+</div>
        <ul className="flex space-x-6">
          <li>
            <a href="/" className="hover:text-gray-300">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-gray-300">
              About
            </a>
          </li>
          <li>
            <a href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-gray-300">
              Contact
            </a>
          </li>
        </ul>
        <button className="text-white focus:outline-none" aria-label="Profile">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-[59px] left-0 right-0 bg-gray-800 shadow-lg md:hidden z-50">
          <ul className="flex flex-col">
            <li>
              <a href="/" className="block px-6 py-2 hover:bg-gray-700">
                Home
              </a>
            </li>
            <li className="border-b-2 border-gray-700" />
            <li>
              <a href="/about" className="block px-6 py-2 hover:bg-gray-700">
                About
              </a>
            </li>
            <li className="border-b-2 border-gray-700" />
            <li>
              <a
                href="/dashboard"
                className="block px-6 py-2 hover:bg-gray-700"
              >
                Dashboard
              </a>
            </li>
            <li className="border-b-2 border-gray-700" />
            <li>
              <a href="/contact" className="block px-6 py-2 hover:bg-gray-700">
                Contact
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

"use client";

import React, { useState } from "react";

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 w-full">
      {/* Mobile*/}
      <div className="flex items-center justify-between md:hidden">
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
      <div className="hidden md:flex items-center justify-between">
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

        {/* Profile Icon for Desktop */}
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

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <ul className="flex flex-col space-y-2">
            <li>
              <a href="/" className="block py-2 px-4 rounded">
                Home
              </a>
            </li>
            <li className="border-b-2 border-gray-600" />
            <li>
              <a
                href="/about"
                className="block py-2 px-4 rounded"
              >
                About
              </a>
            </li>
            <li className="border-b-2 border-gray-600" />
            <li>
              <a
                href="/dashboard"
                className="block py-2 px-4 rounded"
              >
                Dashboard
              </a>
            </li>
            <li className="border-b-2 border-gray-600" />
            <li>
              <a
                href="/contact"
                className="block py-2 px-4 rounded"
              >
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

import React from "react";

const NavBar: React.FC = () => (
  <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
    <div className="font-bold text-xl">LiftdPlus</div>
    <ul className="flex space-x-6">
      <li>
        <a href="/" className="hover:text-gray-300">Home</a>
      </li>
      <li>
        <a href="/about" className="hover:text-gray-300">About</a>
      </li>
      <li>
        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
      </li>
      <li>
        <a href="/contact" className="hover:text-gray-300">Contact</a>
      </li>
    </ul>
  </nav>
);

export default NavBar;
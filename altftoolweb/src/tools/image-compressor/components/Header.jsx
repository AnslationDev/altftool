"use client";
import React, { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Privacy Policy", href: "#privacy-policy" },
    { name: "FAQs", href: "#faq" },
  ];

  return (
    <nav className="sticky top-0 z-10 bg-(--background) border-b border-(--border) shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className=" shrink-0 flex items-center">
            <span className="text-xl font-bold text-(--primary)">
              Image Compressor
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium rounded-md 
                           text-(--foreground)/80 hover:text-(--primary)
                           hover:bg-(--muted) transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-(--foreground)/70 
                         hover:text-(--foreground) hover:bg-(--muted)
                         focus:outline-none focus:ring-2 focus:ring-(--primary)"
            >
              {/* Menu Icon */}
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "hidden" : "block"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>

              {/* Close Icon */}
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "block" : "hidden"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:hidden ${isMenuOpen ? "block" : "hidden"} bg-(--background)`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block px-3 py-2 text-base font-medium rounded-md 
                         text-(--foreground)/80 hover:bg-(--muted)
                         hover:text-(--primary)"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

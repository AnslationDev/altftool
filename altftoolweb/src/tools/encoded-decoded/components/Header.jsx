
"use client"

import React, { useState } from "react";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { label: "Home", id: "hero" },
    { label: "Features", id: "features" },
    { label: "FAQ", id: "faq" },
  ];

  const handleNavClick = (id) => {
    setDrawerOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick("hero")}
          >
            <h1 className="text-lg font-bold text-indigo-600">Encode/Decode</h1>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-sm text-gray-600 dark:text-gray-200 hover:text-indigo-600 px-3 py-2 font-semibold rounded"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-md text-indigo-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-lg p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";
import React, { useState } from "react";

export default function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-(--border)">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full py-4 flex justify-between items-center text-left 
                   font-medium text-(--foreground) hover:text-(--primary) 
                   transition-colors"
      >
        <span>{title}</span>

        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-(--primary)" : "text-(--muted-foreground)"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen pb-4" : "max-h-0"
        }`}
      >
        <div className="text-(--muted-foreground) pr-4">{children}</div>
      </div>
    </div>
  );
}

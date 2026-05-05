"use client";

import { ChevronDown } from "lucide-react";

const AccordionItem = ({ title, content, isOpen, toggle }) => (
  <div className="border-b border-(--border) w-full">
    <button
      onClick={toggle}
      aria-expanded={isOpen}
      className="flex w-full items-start sm:items-center justify-between gap-3 py-3 sm:py-4 text-left font-semibold text-(--foreground) transition-colors hover:text-(--primary)"
    >
      <span className="flex-1 text-sm sm:text-base md:text-lg leading-snug break-words">
        {title}
      </span>

      <ChevronDown
        className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      />
    </button>

    {isOpen && (
      <div className="pb-4 text-xs sm:text-sm md:text-base leading-relaxed text-(--muted-foreground) break-words">
        {content}
      </div>
    )}
  </div>
);

export default AccordionItem;
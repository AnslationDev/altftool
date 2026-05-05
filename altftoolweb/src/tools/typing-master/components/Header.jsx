"use client";

import { Keyboard } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-20 mt-[-40]">
      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* ICON */}
        <div
          className="
            mx-auto mb-6
            h-16 w-16 sm:h-20 sm:w-20
            rounded-2xl
            bg-(--primary)
            flex items-center justify-center
            shadow-lg
          "
        >
          <Keyboard className="w-8 h-8 sm:w-10 sm:h-10 text-(--primary-foreground)" />
        </div>

        {/* TITLE */}
        <h1 className="heading font-primary text-(--primary)">
         Typing Master
        </h1>

        {/* DESCRIPTION */}
        <p className="description mt-4 max-w-2xl mx-auto">
          Improve typing speed and accuracy with interactive practice
        </p>

      </div>
    </header>
  );
}

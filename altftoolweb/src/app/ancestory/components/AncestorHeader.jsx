"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function AncestorHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();

  return (
    <header className="w-full bg-card border-b border-border">
      <div className="max-w-[1840px] mx-auto px-4 sm:px-6 md:px-[8.75rem] h-14 flex items-center justify-between">
        <Link href="/ancestory" className="flex items-center gap-1.5 font-bold text-xl tracking-tight select-none">
          <span className="text-primary" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>altfestory</span>
        </Link>
        <button
          onClick={() => setThemeMode(resolvedTheme === "dark" ? "light" : "dark")}
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 cursor-pointer hover:bg-muted/60"
          aria-label="Toggle Theme"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={16} className="text-[#14B8A6]" />
          ) : (
            <Moon size={16} className="text-[#14B8A6]" />
          )}
        </button>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Radar, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";

export default function LookupsHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <header className="lookouts-header">
      <div className="lookouts-header-inner">
        <span className="altf-brandlock">
          <Link href="/lookouts" className="lookouts-brand">
            <span className="lookouts-brand-mark" aria-hidden="true">
              <Radar size={16} strokeWidth={2.2} />
            </span>
            Lookouts
          </Link>
          <AltfByline />
        </span>

        <div className="lookouts-header-actions">
          <button
            type="button"
            className="lookouts-icon-button"
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun size={16} strokeWidth={2.2} />
            ) : (
              <Moon size={16} strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

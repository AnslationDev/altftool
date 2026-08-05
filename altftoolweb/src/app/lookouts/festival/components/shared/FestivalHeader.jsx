"use client";

import Link from "next/link";
import { Globe2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";

export default function FestivalHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="festival-header">
      <div className="festival-header-inner">
        {/* Byline is a sibling, not a child: the name links to the hub, the
            logo links to altftool.com, and anchors cannot nest. */}
        <span className="altf-brandlock">
          <Link href="/lookouts/festival" className="festival-brand">
            <span className="festival-brand-mark" aria-hidden="true">
              <Globe2 size={16} strokeWidth={2.2} />
            </span>
            World Festival Hub
          </Link>
          <AltfByline />
        </span>

        <div className="festival-header-actions">
          <button
            type="button"
            className="festival-icon-button"
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
          >
            {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </header>
  );
}

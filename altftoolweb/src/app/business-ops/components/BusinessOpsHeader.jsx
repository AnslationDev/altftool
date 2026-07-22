"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";

export default function BusinessOpsHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();

  // No mount guard needed: ThemeProvider's own initial state is "light" on both
  // the server and the first client render, and it re-renders from its effect
  // once the stored preference is read. Reading resolvedTheme directly is
  // therefore already hydration-safe, and avoids a setState-in-effect that
  // costs an extra render pass on every page.
  const isDark = resolvedTheme === "dark";

  return (
    <header className="bizops-header">
      <div className="bizops-header-inner">
        {/* Byline is a sibling, not a child: the name links to the dashboard,
            the logo links to altftool.com, and anchors cannot nest. */}
        <span className="altf-brandlock">
          <Link href="/business-ops" className="bizops-brand">
            <span className="bizops-brand-mark" aria-hidden="true">
              <Briefcase size={16} strokeWidth={2.2} />
            </span>
            Business Ops
          </Link>
          <AltfByline />
        </span>

        <div className="bizops-header-actions">
          <Link href="/" className="bizops-ghost-link">
            <ArrowLeft size={15} strokeWidth={2.2} />
            Back to AltFTool
          </Link>

          <button
            type="button"
            className="bizops-icon-button"
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

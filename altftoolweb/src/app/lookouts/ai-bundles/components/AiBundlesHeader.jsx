"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Package, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";

/** Sticky header for the AI Bundles hub — mirrors FestivalHeader exactly: brand + dark-mode toggle only. */
export default function AiBundlesHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.header
      className="aib-header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="aib-header-inner">
        <span className="altf-brandlock">
          <Link href="/lookouts/ai-bundles" className="aib-brand">
            <motion.span
              className="aib-brand-mark"
              aria-hidden="true"
              whileHover={{ scale: 1.08, rotate: -4 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Package size={16} strokeWidth={2.2} />
            </motion.span>
            AI Bundles
          </Link>
          <AltfByline />
        </span>

        <div className="aib-header-actions">
          <motion.button
            type="button"
            className="aib-icon-button"
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AltfByline from "@/app/_altf/AltfByline";
import { baloo2 } from "../lib/fonts";

/** Sticky header for Top Discount Products — mirrors FreeAiToolHeader's structure: brand mark + name + byline + dark-mode toggle. */
export default function TopDealsHeader() {
  const { resolvedTheme, setThemeMode } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.header
      className="tdp-header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="tdp-header-inner">
        <span className="altf-brandlock">
          <Link href="/lookouts/top-discount-products" className={`${baloo2.className} tdp-brand`}>
            <motion.span
              className="tdp-brand-mark"
              aria-hidden="true"
              whileHover={{ scale: 1.08, rotate: -4 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Flame size={16} strokeWidth={2.2} />
            </motion.span>
            Today&apos;s Deals
          </Link>
          <AltfByline />
        </span>

        <div className="tdp-header-actions">
          <motion.button
            type="button"
            className="tdp-icon-button"
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

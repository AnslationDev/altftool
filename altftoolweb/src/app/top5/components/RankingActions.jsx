"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Share2, Link2, Check } from "lucide-react";
import { EASE } from "./motion";

const STORAGE_KEY = "top5:saved-rankings";

function readSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaved(slugs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    /* storage unavailable (private mode etc.) — state still works in-memory */
  }
}

/**
 * Working Save + Share actions for a ranking page.
 * - Save persists per-ranking in localStorage and survives reloads.
 * - Share uses the native share sheet where available, otherwise copies
 *   the link. Both paths confirm with an animated toast.
 */
export default function RankingActions({ slug, title, description }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setSaved(readSaved().includes(slug));
  }, [slug]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleSave = () => {
    const current = readSaved();
    const next = saved ? current.filter((s) => s !== slug) : [...new Set([...current, slug])];
    writeSaved(next);
    setSaved(!saved);
    setToast(
      saved
        ? { icon: Bookmark, text: "Removed from your saved rankings" }
        : { icon: Check, text: "Saved to your rankings" },
    );
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return; // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast({ icon: Link2, text: "Link copied to clipboard" });
    } catch {
      setToast({ icon: Link2, text: url });
    }
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          onClick={toggleSave}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.2, ease: EASE }}
          aria-pressed={saved}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
            saved
              ? "border-[#0b1120] bg-[#0b1120] text-white"
              : "border-black/10 text-[#0b1120] hover:bg-[#f3f4f6]"
          }`}
        >
          <motion.span
            initial={false}
            animate={saved ? { scale: [1, 1.45, 1], rotate: [0, -12, 0] } : { scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="inline-flex"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </motion.span>
          {saved ? "Saved" : "Save ranking"}
        </motion.button>

        <motion.button
          type="button"
          onClick={share}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#0b1120] hover:bg-[#f3f4f6] transition-colors"
        >
          <Share2 size={15} />
          Share
        </motion.button>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <span className="flex items-center gap-2.5 rounded-full bg-[#0b1120] px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/30">
              <toast.icon size={15} className="text-[#10b981]" />
              {toast.text}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

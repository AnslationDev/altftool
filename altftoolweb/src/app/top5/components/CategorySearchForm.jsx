"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, X } from "lucide-react";

// Emits live `top5:category-search` events; CategoryExplorer (further down
// the page) listens and filters the grid in real time.
export default function CategorySearchForm({ entityName }) {
  const [value, setValue] = useState("");

  const emit = (next) => {
    setValue(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("top5:category-search", { detail: next }));
    }
  };

  // The explorer's "Reset filters" button clears this input too.
  useEffect(() => {
    const onReset = () => setValue("");
    window.addEventListener("top5:category-search-reset", onReset);
    return () => window.removeEventListener("top5:category-search-reset", onReset);
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        emit(value);
        document
          .getElementById("top5-category-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="mt-5 flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-black/5"
    >
      <Search size={16} className="text-[#10b981] shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(event) => emit(event.target.value)}
        placeholder={`Search within ${entityName}`}
        className="flex-1 min-w-0 bg-transparent py-2.5 text-sm text-[#0b1120] placeholder:text-[#9ca3af] outline-none"
      />
      <AnimatePresence>
        {value ? (
          <motion.button
            key="clear"
            type="button"
            aria-label="Clear search"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            onClick={() => emit("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#0b1120] transition-colors"
          >
            <X size={14} />
          </motion.button>
        ) : null}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        type="submit"
        aria-label="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1120] text-white"
      >
        <ArrowRight size={15} />
      </motion.button>
    </form>
  );
}

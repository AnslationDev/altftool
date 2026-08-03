"use client";

import { ArrowRight, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../ui/Logo";
import { useTop11Search } from "../SearchContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openSearch } = useTop11Search();
  const router = useRouter();
  const pathname = usePathname();
  // The transparent-over-hero treatment belongs to the landing page only; every
  // other route gets the solid sticky bar.
  const home = pathname === "/top11";

  // The in-page anchors live on the landing page. From a deeper route, navigate
  // there with the hash and let the browser handle the scroll.
  const goToSection = (id) => {
    setMenuOpen(false);
    if (!home) {
      router.push(`/top11#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`${home ? "absolute text-white" : "sticky border-b border-slate-200/70 bg-white/90 text-slate-950 backdrop-blur-xl"} top-0 z-40 w-full`}
    >
      <div className="mx-auto flex h-20 max-w-[1536px] items-center justify-between px-5 md:px-10 xl:px-16">
        <Link href="/top11" aria-label="Go to Top11 homepage">
          <Logo inverse={home} />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {["Trending", "Categories", "Countries"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => goToSection(item.toLowerCase())}
              className={`text-sm font-medium transition ${home ? "text-white/75 hover:text-white" : "text-slate-500 hover:text-slate-950"}`}
            >
              {item}
            </button>
          ))}
          <Link
            href="/top11/category/technology"
            className={`text-sm font-medium transition ${home ? "text-white/75 hover:text-white" : "text-slate-500 hover:text-slate-950"}`}
          >
            New &amp; notable
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Open search"
            className={`flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition md:px-4 ${home ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <Search className="h-4 w-4" /> <span className="hidden lg:inline">Search</span>
            <span
              className={`hidden rounded px-1.5 py-0.5 text-[10px] lg:inline ${home ? "bg-white/10 text-white/60" : "bg-white text-slate-400"}`}
            >
              /
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className={`flex h-11 w-11 items-center justify-center rounded-full md:hidden ${home ? "bg-white/10" : "bg-slate-100"}`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 rounded-2xl bg-white p-3 text-slate-950 shadow-2xl md:hidden"
          >
            {["Trending", "Categories", "Countries"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => goToSection(item.toLowerCase())}
                className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-base font-semibold hover:bg-slate-50"
              >
                {item} <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

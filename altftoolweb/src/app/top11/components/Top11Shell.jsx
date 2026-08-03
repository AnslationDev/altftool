"use client";

import { useEffect } from "react";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import MobileNav from "./layout/MobileNav";
import SearchDialog from "./search/SearchDialog";
import { SearchProvider, useTop11Search } from "./SearchContext";

/**
 * "/" opens the palette, matching the hint rendered in the header. Lives here
 * rather than in the header so the shortcut works on every Top11 route.
 */
function SearchHotkey() {
  const { openSearch } = useTop11Search();

  useEffect(() => {
    const handleKey = (event) => {
      const tag = event.target?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openSearch]);

  return null;
}

/**
 * Top11's own chrome — its header, footer and mobile bar. AltFTool's global
 * header/footer are suppressed for this section (see the "/top11" entry in
 * platform/navigation/GlobalChromeGate), so this is the only chrome on screen.
 *
 * Rendered from the section layout, so it persists across route changes
 * instead of remounting on every navigation.
 */
export default function Top11Shell({ children }) {
  return (
    <SearchProvider>
      <div className="top11-root min-h-screen bg-white text-slate-950 antialiased">
        <SearchHotkey />
        <Header />
        {children}
        <Footer />
        <SearchDialog />
        <MobileNav />
      </div>
    </SearchProvider>
  );
}

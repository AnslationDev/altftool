"use client";

// Former standalone App.jsx — unchanged apart from the "use client"
// directive and the top3-root/top3-scope classes on the root element,
// which anchor this section's namespaced design tokens and base styles
// (see top3.css) so nothing leaks into the rest of AltFTool.
import { motion, AnimatePresence } from "framer-motion";
import { navigate, navigateToSection, useRoute, useRouteScroll, routeKey } from "./router";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { CatalogPage } from "./pages/CatalogPage";
import { CategoryPage } from "./pages/CategoryPage";
import { RankingDetail } from "./pages/RankingDetail";

/**
 * Delegated link handler: the standalone build navigated with plain anchors
 * (hash router), so instead of rewriting every component, one listener turns
 * in-section links into pushState navigations. Section anchors ("#experts")
 * scroll to the home-page section without a hash ever reaching the URL.
 */
function handleLinkClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.("a");
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
  const href = a.getAttribute("href") || "";
  if (href === "#" || href === "#/") {
    // Placeholder links (Footer social/legal) — inert, never scroll to top.
    e.preventDefault();
    return;
  }
  if (href.startsWith("/top3")) {
    e.preventDefault();
    navigate(href);
    return;
  }
  if (href.startsWith("#")) {
    e.preventDefault();
    navigateToSection(href.slice(1));
  }
}

export default function Top3Client({ initialPath = "/top3" }) {
  const route = useRoute(initialPath);
  useRouteScroll(route);

  return (
    <div onClick={handleLinkClick} className="top3-root top3-scope relative min-h-screen bg-paper text-ink selection:bg-ink selection:text-paper">
      <Nav />

      <AnimatePresence mode="wait">
        <motion.main
          key={routeKey(route)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {route.name === "ranking" && <RankingDetail slug={route.slug} />}
          {route.name === "category" && <CategoryPage slug={route.slug} />}
          {route.name === "catalog" && <CatalogPage />}
          {route.name === "home" && <Home />}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

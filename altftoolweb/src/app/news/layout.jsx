"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/sections/Sidebar";
import Ads from "./components/sections/Ads";
import "./news-theme.css";

const KNOWN_SUBROUTES = new Set([
  "headlines", "local", "newsletter", "topics", "trending", "api",
]);

const FULL_WIDTH_ROUTES = new Set([
  "headlines", "local", "trending", "topics",
]);

function isArticlePage(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length === 2 &&
    segments[0] === "news" &&
    !KNOWN_SUBROUTES.has(segments[1])
  );
}

function isFullWidthPage(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2 && FULL_WIDTH_ROUTES.has(segments[1]);
}

export default function NewsLayout({ children }) {
  const pathname = usePathname();
  const isNewsHome = pathname === "/news";
  const isArticle = isArticlePage(pathname);
  const isFullWidth = isFullWidthPage(pathname);
  const hasRails = !isNewsHome && !isArticle && !isFullWidth;

  return (
    <div className="news-page w-full mb-[10px]">
      <div className={`section section-wide grid grid-cols-1 gap-8 ${hasRails ? "lg:grid-cols-[260px_1fr_300px] xl:grid-cols-[260px_1fr_300px]" : ""}`}>
        {hasRails && (
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <Sidebar />
            </div>
          </aside>
        )}

        <main className="min-w-0">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>

        {hasRails && (
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <Ads />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// src/app/tradeon/components/landing/TradeonHeader.jsx
// Flat, compact, sticky financial header (no gradients, no glass, no shrink
// animation). A continuously-moving market tape sits at the very top; the whole
// bar pins to the top of the viewport as the page scrolls.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LayoutGrid, Search, User, Wrench } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../utils/cn";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import MarketStatusBadge from "../shared/MarketStatusBadge";
import MarketClock from "../shared/MarketClock";
import Dropdown from "../shared/Dropdown";
import LiveTicker from "./LiveTicker";
import MarketsMegaMenu from "./MarketsMegaMenu";
import SearchOverlay from "./SearchOverlay";

const NAV = [
  { label: "Predictions", href: "#predictions" },
  { label: "Workspace", href: "/tradeon/workspace" },
  { label: "Dashboard", href: "/tradeon/dashboard" },
];

const ACCOUNT_LINKS = [
  { Icon: User, label: "Account", href: "/account" },
  { Icon: LayoutDashboard, label: "Tradeon dashboard", href: "/tradeon/dashboard" },
  { Icon: LayoutGrid, label: "Chart workspace", href: "/tradeon/workspace" },
  { Icon: Wrench, label: "All AltFTool products", href: "/products" },
];

export default function TradeonHeader({ data = [], status = "live" }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useClickOutside(() => setMegaOpen(false), megaOpen);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="tdn-topbar sticky top-0 z-50">
      {/* Continuously-moving market tape — pinned at the very top */}
      <LiveTicker data={data} />

      <div className="tdn-container">
        <nav ref={megaRef} className="relative flex items-center gap-2 h-[52px]">
          <Link href="/tradeon" className="shrink-0">
            <Logo size={28} />
          </Link>

          {/* Primary nav — scrolls horizontally on narrow screens (no hamburger) */}
          <div className="flex-1 min-w-0 flex items-center gap-0.5 overflow-x-auto tdn-scroll-hide px-1">
            <button
              onClick={() => setMegaOpen((o) => !o)}
              className="tdn-navlink inline-flex items-center gap-1"
              data-active={megaOpen}
              aria-expanded={megaOpen}
            >
              Markets <ChevronDown size={13} className={cn("transition-transform", megaOpen && "rotate-180")} />
            </button>
            {NAV.map((l) =>
              l.href.startsWith("/") ? (
                <Link key={l.label} href={l.href} className="tdn-navlink">{l.label}</Link>
              ) : (
                <a key={l.label} href={l.href} className="tdn-navlink">{l.label}</a>
              )
            )}
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden xl:inline-flex items-center gap-3 mr-1">
              <MarketClock compact />
              <MarketStatusBadge status={status} />
            </span>

            <button
              onClick={() => setSearchOpen(true)}
              className="tdn-btn tdn-btn-icon !w-9 !h-9"
              aria-label="Search markets (Ctrl/Cmd+K)"
              title="Search  ⌘K"
            >
              <Search size={17} />
            </button>

            <ThemeToggle />

            <Dropdown
              showChevron={false}
              buttonClassName="shrink-0"
              width={210}
              align="right"
              label={
                <span
                  className="w-9 h-9 rounded-full grid place-items-center"
                  style={{ background: "color-mix(in srgb, var(--tdn-iris) 16%, transparent)", color: "var(--tdn-iris-2)", border: "1px solid var(--tdn-border)" }}
                >
                  <User size={16} />
                </span>
              }
            >
              {({ close }) => (
                <div className="p-1">
                  <div className="px-2.5 py-2 mb-1 border-b" style={{ borderColor: "var(--tdn-border)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>My account</p>
                    <p className="text-[0.68rem]" style={{ color: "var(--tdn-faint)" }}>AltFTool preferences and products</p>
                  </div>
                  {ACCOUNT_LINKS.map(({ Icon, label, href }) => (
                    <Link key={href} href={href} onClick={close} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-[color-mix(in_srgb,var(--tdn-iris)_9%,transparent)]" style={{ color: "var(--tdn-fg)" }}>
                      <Icon size={15} style={{ color: "var(--tdn-muted)" }} /> {label}
                    </Link>
                  ))}
                </div>
              )}
            </Dropdown>
          </div>

          {/* Markets mega menu */}
          {megaOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-[60]" onClick={() => setMegaOpen(false)}>
              <MarketsMegaMenu data={data} onNavigate={() => setMegaOpen(false)} />
            </div>
          )}
        </nav>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} data={data} />
    </header>
  );
}

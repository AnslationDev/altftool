// src/app/tradeon/components/landing/TradeonHeader.jsx
// Flat, compact financial header. The nav bar stays sticky at the top of the
// viewport; a dedicated index ticker sits directly beneath it and scrolls away
// with the page (not sticky). Fully responsive — on narrow screens the primary
// nav collapses into a hamburger that opens a slide-in sidebar drawer.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Coins, Globe, LayoutDashboard, Menu, Newspaper, Search, Star, User } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../utils/cn";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import MarketStatusBadge from "../shared/MarketStatusBadge";
import MarketClock from "../shared/MarketClock";
import Dropdown from "../shared/Dropdown";
import LiveTicker from "./LiveTicker";
import MobileNavDrawer from "./MobileNavDrawer";
import MarketsMegaMenu from "./MarketsMegaMenu";
import SearchOverlay from "./SearchOverlay";

const NAV = [
  { label: "News", href: "/tradeon/news" },
  { label: "Workspace", href: "/tradeon/workspace" },
  { label: "Weekly Outlook", href: "/tradeon/outlook" },
  { label: "Dashboard", href: "/tradeon/dashboard" },
];

const LANGUAGES = [
  { value: "en", label: "English", icon: "🇺🇸" },
  { value: "hi", label: "हिन्दी", icon: "🇮🇳" },
  { value: "es", label: "Español", icon: "🇪🇸" },
  { value: "de", label: "Deutsch", icon: "🇩🇪" },
  { value: "ja", label: "日本語", icon: "🇯🇵" },
];
const CURRENCIES = [
  { value: "USD", label: "USD · US Dollar", icon: "$" },
  { value: "EUR", label: "EUR · Euro", icon: "€" },
  { value: "GBP", label: "GBP · Pound", icon: "£" },
  { value: "INR", label: "INR · Rupee", icon: "₹" },
  { value: "JPY", label: "JPY · Yen", icon: "¥" },
];
const NOTIFICATIONS = [
  { t: "NVDA signal flipped to Buy", d: "2m ago", c: "var(--tdn-up)" },
  { t: "BTC crossed $66,000 resistance", d: "11m ago", c: "var(--tdn-iris-2)" },
  { t: "Fed minutes released — high impact", d: "34m ago", c: "var(--tdn-amber)" },
];

export default function TradeonHeader({ data = [], status = "live" }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const megaRef = useClickOutside(() => setMegaOpen(false), megaOpen);
  const pathname = usePathname() || "";

  const isActive = (href) => href.startsWith("/") && (pathname === href || pathname.startsWith(href + "/") || (href.includes("outlook") && pathname.includes("outlook")));

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
    <>
      {/* Sticky header — continuous market tape at the very top, then the nav bar */}
      <header className="tdn-topbar sticky top-0 z-50">
        <LiveTicker data={data} />
        <div className="tdn-container">
          <nav ref={megaRef} className="relative flex items-center gap-2 h-[52px]">
            {/* Hamburger — phones only (wrapper avoids .tdn-btn's display winning over md:hidden) */}
            <div className="md:hidden shrink-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="tdn-btn tdn-btn-icon !w-9 !h-9"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>

            <Link href="/tradeon" className="shrink-0">
              <Logo size={28} />
            </Link>

            {/* Primary nav — tablet & up */}
            <div className="hidden md:flex flex-1 min-w-0 items-center gap-0.5 px-1">
              <button
                onClick={() => setMegaOpen((o) => !o)}
                className="tdn-navlink inline-flex items-center gap-1"
                data-active={megaOpen}
                aria-expanded={megaOpen}
              >
                Markets <ChevronDown size={13} className={cn("transition-transform", megaOpen && "rotate-180")} />
              </button>
              {NAV.map((l) => (
                <Link key={l.label} href={l.href} className="tdn-navlink" data-active={isActive(l.href)}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Spacer on phones (pushes utilities right) */}
            <div className="flex-1 md:hidden" />

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

              <div className="hidden lg:block">
                <Dropdown
                  icon={Globe}
                  label={LANGUAGES.find((l) => l.value === lang)?.icon}
                  items={LANGUAGES}
                  value={lang}
                  onSelect={setLang}
                  buttonClassName="tdn-btn tdn-btn-icon !w-auto !px-2 !text-xs"
                  width={170}
                  showChevron={false}
                />
              </div>
              <div className="hidden lg:block">
                <Dropdown
                  icon={Coins}
                  label={currency}
                  items={CURRENCIES}
                  value={currency}
                  onSelect={setCurrency}
                  buttonClassName="tdn-btn tdn-btn-icon !w-auto !px-2 !text-xs"
                  width={190}
                  showChevron={false}
                />
              </div>

              <div className="hidden sm:block">
              <Dropdown icon={Bell} showChevron={false} buttonClassName="tdn-btn tdn-btn-icon !w-9 !h-9" width={280} align="right">
                {() => (
                  <div className="p-1">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Notifications</span>
                      <span className="tdn-badge-live !text-[0.6rem] !py-0.5">3 new</span>
                    </div>
                    {NOTIFICATIONS.map((n) => (
                      <div key={n.t} className="flex gap-2.5 px-2 py-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--tdn-iris)_8%,transparent)]">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: n.c }} />
                        <div>
                          <p className="text-xs leading-snug" style={{ color: "var(--tdn-fg)" }}>{n.t}</p>
                          <span className="text-[0.62rem]" style={{ color: "var(--tdn-faint)" }}>{n.d}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Dropdown>
              </div>

              <ThemeToggle />

              <Dropdown
                showChevron={false}
                buttonClassName="shrink-0"
                width={210}
                align="right"
                label={
                  <span
                    className="w-9 h-9 rounded-full grid place-items-center text-xs font-bold"
                    style={{ background: "color-mix(in srgb, var(--tdn-iris) 16%, transparent)", color: "var(--tdn-iris-2)", border: "1px solid var(--tdn-border)" }}
                  >
                    <User size={16} />
                  </span>
                }
              >
                {({ close }) => (
                  <div className="p-1">
                    <div className="px-2.5 py-2 mb-1 border-b" style={{ borderColor: "var(--tdn-border)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Tradeon</p>
                      <p className="text-[0.68rem]" style={{ color: "var(--tdn-faint)" }}>Financial intelligence platform</p>
                    </div>
                    {[
                      [LayoutDashboard, "Dashboard", "/tradeon/dashboard"],
                      [Newspaper, "Market News", "/tradeon/news"],
                      [Star, "Weekly Outlook", "/tradeon/outlook"],
                    ].map(([Ic, label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => close()}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-[color-mix(in_srgb,var(--tdn-iris)_9%,transparent)]"
                        style={{ color: "var(--tdn-fg)" }}
                      >
                        <Ic size={15} style={{ color: "var(--tdn-muted)" }} /> {label}
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
      </header>

      {/* Mobile slide-in nav */}
      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        nav={NAV}
        activeHref={pathname}
      />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} data={data} />
    </>
  );
}

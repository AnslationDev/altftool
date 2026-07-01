"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Navigation items ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Home", href: "/news" },
  { label: "India", href: "/news/topics/india" },
  { label: "World", href: "/news/topics/world" },
  { label: "Politics", href: "/news/topics/politics" },
  { label: "Business", href: "/news/topics/business" },
  { label: "Technology", href: "/news/topics/technology" },
  { label: "Sports", href: "/news/topics/sports" },
  { label: "Entertainment", href: "/news/topics/entertainment" },
  { label: "Lifestyle", href: "/news/topics/lifestyle" },
];

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Focus search on open
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function isActive(href) {
    if (href === "/news") return pathname === "/news";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      {/* ── Primary Navbar ────────────────────────────────────────────── */}
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-4 md:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/news" className="shrink-0">
          <div className="leading-none">
            <span className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">
              <span className="text-[var(--foreground)]">New</span>
              <span className="text-[var(--primary)]">s</span>
            </span>
            <p className="mt-[-2px] text-[10px] font-semibold uppercase tracking-[2px] text-[var(--muted-foreground)] sm:text-[11px]">
              Everything Matters
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex lg:flex-1 lg:justify-center">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[15px] font-medium transition-colors duration-200 hover:text-[var(--primary)] ${active ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                  }`}
              >
                {item.label === "More" ? (
                  <span className="flex items-center gap-1">
                    More <ChevronDown size={12} className="mt-0.5" />
                  </span>
                ) : (
                  item.label
                )}
                {active && (
                  <span className="absolute -bottom-[22px] left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-sm bg-[var(--primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics..."
                className="h-[42px] w-[160px] rounded-full bg-[var(--muted)] pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition-all duration-200 focus:w-[200px] focus:ring-2 focus:ring-[var(--primary)]/30 focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </form>
          </div>

          {/* Mobile search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Notification */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--background)]" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Subscribe */}
          <Link
            href="/news/newsletter"
            className="flex h-[42px] w-[110px] items-center justify-center rounded-lg bg-[var(--primary)] text-[15px] font-semibold text-[var(--primary-foreground)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110"
          >
            Subscribe
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)] lg:hidden"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile overlay search ────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--background)]/95 backdrop-blur-sm md:hidden">
          <form onSubmit={handleSearch} className="mt-24 w-full max-w-md px-6">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics..."
                className="h-[50px] w-full rounded-2xl bg-[var(--muted)] pl-12 pr-12 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none ring-2 ring-[var(--primary)]/30"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Mobile menu drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[300px] flex-col bg-[var(--background)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-[var(--foreground)]">New</span>
                <span className="text-[var(--primary)]">s</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${active
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                      }`}
                  >
                    {item.label === "More" ? (
                      <span className="flex items-center gap-1">
                        More <ChevronDown size={14} />
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-[var(--border)] px-5 py-4">
              <Link
                href="/news/newsletter"
                className="flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

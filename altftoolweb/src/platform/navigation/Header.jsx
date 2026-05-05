"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search, Menu, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { IconButton, Input } from "@altftool/ui";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const isBlogSlug = /^\/blogs\/[^/]+/.test(pathname);

  useEffect(() => {
    const existingQuery = new URLSearchParams(window.location.search).get("q") || "";
    setSearchQuery(existingQuery);
  }, [pathname]);

  const handleChange = (value) => {
    setSearchQuery(value);

    const trimmed = value.trim();

    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }

    if (trimmed.length === 0 && pathname === "/search") {
      router.push("/");
    }
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 4) {
      alert("Minimum 4 characters required");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery("");
  };

  const NAV = {
    explore: "Explore",
    resources: "Resources",
    deals: "Deals",
    news: "News",
    but: "BuySmart",
    sale: "Sale Locator",
  };

  const navItems = [
    {
      label: NAV.explore,
      hasDropdown: true,
      options: [
        { label: "Tools", href: "/tools/all" },
        { label: "Extensions", href: "/extensions" },
        { label: "Desktop Softwares", href: "/desktop" },
        { label: "Academy", href: "/academy" },

        { label: "Trending Videos", href: "/trendingvids" },
      ],
    },
    {
      label: NAV.resources,
      hasDropdown: true,
      options: [
        { label: "Blog", href: "/blogs" },
        { label: "Setting Support", href: "/supportsetting" },
        { label: "About", href: "/policypages/about" },
        { label: "Consumer Ratings", href: "/brandrating" },
      ],
    },
    { label: NAV.deals, hasDropdown: false, href: "/exclusivedeals" },
    { label: NAV.news, hasDropdown: false, href: "/news" },
    { label: NAV.but, hasDropdown: false, href: "/buysmart" },
    { label: NAV.sale, hasDropdown: false, href: "/sale" },
  ];

  // Hide global header on immersive routes.
  if (pathname === "/search-eng" || pathname.startsWith("/search-eng/") || isBlogSlug) {
    return null;
  }

  return (
    <>
      <header id="main-header" className="sticky top-0 z-50 border-b border-(--border) bg-(--card) px-4 py-2 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6">
          {/* LOGO */}
          <Link href="/" className="flex min-w-fit items-center">
            <img
              src="/assets/logo3.png"
              className="h-9 w-auto object-contain"
              alt="Logo"
            />
          </Link>


          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button
                      className={`relative flex items-center gap-1 rounded-[var(--anslation-ds-radius)] px-3 py-2 text-sm font-medium transition
                        ${item.options?.some((o) => isActive(o.href))
                          ? "bg-(--muted) text-(--primary)"
                          : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                        }`}
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                    </button>

                    <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
                      <div className="w-56 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-1 shadow-[var(--anslation-ds-shadow-md)]">
                        {item.options?.map((option) => (
                          <Link
                            key={option.label}
                            href={option.href}
                            className={`block rounded-[6px] px-3 py-2 text-sm transition
                              ${isActive(option.href)
                                ? "bg-(--muted) text-(--primary)"
                                : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                              }`}
                          >
                            {option.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`relative rounded-[var(--anslation-ds-radius)] px-3 py-2 text-sm font-medium transition
                      ${isActive(item.href)
                        ? "bg-(--muted) text-(--primary)"
                        : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                      }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* SEARCH INPUT */}
            <div className="hidden sm:flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search tools, extensions..."
                value={searchQuery}
                onChange={(e) => handleChange(e.target.value)}
                className="w-64"
                style={{ background: "var(--background)" }}
              />

              <IconButton onClick={handleSearch} aria-label="Search">
                <Search className="h-4 w-4" />
              </IconButton>
            </div>

            {/* THEME TOGGLE */}
            <IconButton
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </IconButton>

            {/* MOBILE MENU BUTTON */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? "" : "pointer-events-none"
          }`}
      >
        <div
          className={`fixed inset-0 bg-(--background) backdrop-blur-sm transition-opacity duration-300
          ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 w-full max-w-xs border-r border-(--border) bg-(--card) p-5 text-(--foreground) shadow-[var(--anslation-ds-shadow-lg)] transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* LOGO + CLOSE BUTTON */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <img
                src="/assets/logo3.png"
                className="h-9 w-auto object-contain"
                alt="Logo"
              />
            </Link>

            {/* LUCIDE X ICON */}
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              variant="ghost"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          <nav className="mt-8 flex flex-col gap-4">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.hasDropdown ? (
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between py-2 text-sm font-medium">
                      {item.label}
                      <ChevronDown className="h-4 w-4 group-open:rotate-180 transition" />
                    </summary>
                    <div className="mt-1 flex flex-col gap-1 pl-4">
                      {item.options?.map((option) => (
                        <Link
                          key={option.label}
                          href={option.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`rounded-lg px-2 py-2 text-sm ${isActive(option.href)
                            ? "text-(--primary)"
                            : theme === "dark"
                              ? "text-gray-400 hover:bg-zinc-900 hover:text-white"
                              : "text-gray-500 hover:bg-gray-100 hover:text-black"
                            }`}
                        >
                          {option.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    href={item.href}
                    onClick={()=>setMobileMenuOpen(false)}
                    className={`block py-2 text-sm font-medium ${isActive(item.href)
                      ? "text-(--primary)"
                      : theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                      }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;

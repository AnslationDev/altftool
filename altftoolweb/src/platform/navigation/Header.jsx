"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Search, Menu, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(existingQuery);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const isBlogSlug = /^\/blogs\/[^/]+/.test(pathname);

  // Hide global header on the search engine page to mimic Google's clean UI
  if (pathname === "/search-eng" || pathname.startsWith("/search-eng/")) {
    return null;
  }
  useEffect(() => {
    setSearchQuery(existingQuery);
  }, [existingQuery]);

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

  const buttonClass =
    theme === "dark"
      ? "flex border border-zinc-700 h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-800 text-white"
      : "flex border border-gray-200 h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600";

  const searchButtonClass =
    theme === "dark"
      ? "flex h-9 items-center text-gray-400 gap-2 rounded-md border border-zinc-700 bg-black px-4 text-sm hover:border-blue-500 hover:bg-zinc-900"
      : "flex h-9 items-center text-[#9BA2AE] gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm hover:border-primary/30 hover:bg-muted/50";
      if (isBlogSlug) return null
  return (
    <>
      <header id="main-header" className="sticky top-0 z-50 py-2 px-4 sm:px-6 md:px-[8.75rem] max-w-[1840px] mx-auto bg-(--background) border-b border-(--border)">
        <div className="flex h-16 items-center justify-between gap-10 ">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo3.png"
              className="h-20 w-30 object-contain"
              alt="Logo"
            />
          </Link>


          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button
                      className={`relative flex items-center gap-1 py-2 text-sm font-medium
                        ${item.options?.some((o) => isActive(o.href))
                          ? "text-(--primary)"
                          : "text-(--muted-foreground)"
                        }`}
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />

                      {item.options?.some((o) => isActive(o.href)) && (
                        <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-(--primary)" />
                      )}
                    </button>

                    <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
                      <div className="w-48 rounded-md border p-1 shadow-lg bg-(--background) border-(--border)">
                        {item.options?.map((option) => (
                          <Link
                            key={option.label}
                            href={option.href}
                            className={`block rounded-sm px-3 py-2 text-sm transition
                              ${isActive(option.href)
                                ? "text-(--primary) bg-(--primary)/10"
                                : theme === "dark"
                                  ? "text-gray-300 hover:bg-zinc-900"
                                  : "text-gray-700 hover:bg-gray-100"
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
                    className={`relative text-sm font-medium transition-colors
                      ${isActive(item.href)
                        ? "text-(--primary)"
                        : "text-(--muted-foreground) hover:text-(--primary)"
                      }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-(--primary)" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* SEARCH INPUT */}
            <div className="hidden sm:flex items-center gap-2">
              <input
                type="text"
                placeholder="Search tools, extensions..."
                value={searchQuery}
                onChange={(e) => handleChange(e.target.value)}
                className="h-9 w-64 px-3 rounded-md border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />

              <button onClick={handleSearch} className={buttonClass}>
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={buttonClass}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`${buttonClass} lg:hidden`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? "" : "pointer-events-none"
          }`}
      >
        <div
          className={`fixed inset-0 bg-(--background)/80 backdrop-blur-sm transition-opacity duration-300
          ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 w-full max-w-xs border-r p-6 shadow-lg bg-(--background) border-(--border) text-(--foreground) transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* LOGO + CLOSE BUTTON */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <img
                src="/assets/logo3.png"
                className="h-10 w-20 object-contain"
                alt="Logo"
              />
            </Link>

            {/* LUCIDE X ICON */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
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
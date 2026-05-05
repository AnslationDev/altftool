"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  MapPin,
  Menu,
  Monitor,
  Moon,
  Newspaper,
  Puzzle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Tags,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { IconButton, Input } from "@altftool/ui";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { label: "Tools", href: "/tools/all", icon: Wrench },
  { label: "Extensions", href: "/extensions", icon: Puzzle },
  {
    label: "Deals",
    icon: Tags,
    hasDropdown: true,
    options: [
      { label: "Exclusive Deals", href: "/exclusivedeals", icon: Tags },
      { label: "BuySmart", href: "/buysmart", icon: ShoppingBag },
      { label: "Sale Locator", href: "/sale", icon: MapPin },
    ],
  },
  {
    label: "Learn",
    icon: BookOpen,
    hasDropdown: true,
    options: [
      { label: "Academy", href: "/academy", icon: GraduationCap },
      { label: "Blog", href: "/blogs", icon: BookOpen },
      { label: "Brand Ratings", href: "/brandrating", icon: ShieldCheck },
      { label: "Support", href: "/supportsetting", icon: Sparkles },
    ],
  },
  { label: "News", href: "/news", icon: Newspaper },
  {
    label: "More",
    icon: LayoutGrid,
    hasDropdown: true,
    options: [
      { label: "Desktop Software", href: "/desktop", icon: Monitor },
      { label: "Trending Videos", href: "/trendingvids", icon: Sparkles },
      { label: "About AltFTool", href: "/policypages/about", icon: ShieldCheck },
    ],
  },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [themeReady, setThemeReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const isBlogSlug = /^\/blogs\/[^/]+/.test(pathname);

  const prefetchRoute = (href) => {
    if (!href?.startsWith("/")) return;
    router.prefetch(href);
  };

  const routePreviewProps = (href) => ({
    onMouseEnter: () => prefetchRoute(href),
    onFocus: () => prefetchRoute(href),
  });

  useEffect(() => {
    const existingQuery =
      new URLSearchParams(window.location.search).get("q") || "";
    setSearchQuery(existingQuery);
  }, [pathname]);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const handleChange = (value) => {
    setSearchQuery(value);
    if (searchError) setSearchError("");
  };

  const handleSearch = (event) => {
    event?.preventDefault();
    const trimmed = searchQuery.trim();

    if (!trimmed && pathname === "/search") {
      router.push("/");
      setSearchError("");
      setMobileMenuOpen(false);
      return;
    }

    if (trimmed.length < 4) {
      setSearchError("Type at least 4 characters.");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery(trimmed);
    setSearchError("");
    setMobileMenuOpen(false);
  };

  // Hide global header on immersive routes.
  if (
    pathname === "/search-eng" ||
    pathname.startsWith("/search-eng/") ||
    isBlogSlug
  ) {
    return null;
  }

  return (
    <>
      <header
        id="main-header"
        className="sticky top-0 z-50 border-b border-(--border) bg-(--card) px-4 py-2 backdrop-blur-xl sm:px-6 lg:px-10"
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-5">
          <Link
            href="/"
            className="flex min-w-fit items-center"
            {...routePreviewProps("/")}
          >
            <img
              src="/assets/logo3.png"
              className="h-9 w-auto object-contain"
              alt="AltFTool"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.hasDropdown
                ? item.options?.some((option) => isActive(option.href))
                : isActive(item.href);

              return (
                <div key={item.label} className="group relative">
                  {item.hasDropdown ? (
                    <>
                      <button
                        className={`relative flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2 text-sm font-medium transition ${
                          isCurrent
                            ? "bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                            : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                      </button>

                      <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
                        <div className="w-64 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-1.5 shadow-[var(--anslation-ds-shadow-md)]">
                          {item.options?.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <Link
                                key={option.label}
                                href={option.href}
                                {...routePreviewProps(option.href)}
                                className={`flex items-center gap-3 rounded-[6px] px-2.5 py-2 text-sm transition ${
                                  isActive(option.href)
                                    ? "bg-(--muted) text-(--primary)"
                                    : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                                }`}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                                  <OptionIcon className="h-4 w-4" />
                                </span>
                                <span className="font-medium">
                                  {option.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      {...routePreviewProps(item.href)}
                      className={`relative flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2 text-sm font-medium transition ${
                        isCurrent
                          ? "bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                          : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <form
              className="hidden items-center gap-2 sm:flex"
              onSubmit={handleSearch}
            >
              <Input
                type="text"
                placeholder="Search tools, extensions..."
                value={searchQuery}
                onChange={(event) => handleChange(event.target.value)}
                className="w-64"
                style={{ background: "var(--background)" }}
              />

              <IconButton type="submit" aria-label="Search">
                <Search className="h-4 w-4" />
              </IconButton>
            </form>

            <IconButton onClick={toggleTheme} aria-label="Toggle Theme">
              {themeReady && theme === "dark" ? (
                <Sun className="h-4 w-4 text-(--primary)" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </IconButton>

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

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 w-full max-w-xs transform border-r border-(--border) bg-(--card) p-5 text-(--foreground) shadow-[var(--anslation-ds-shadow-lg)] transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              {...routePreviewProps("/")}
            >
              <img
                src="/assets/logo3.png"
                className="h-9 w-auto object-contain"
                alt="AltFTool"
              />
            </Link>

            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              variant="ghost"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          <nav className="mt-8 flex flex-col gap-4">
            <form className="grid gap-2" onSubmit={handleSearch}>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(event) => handleChange(event.target.value)}
                  className="min-w-0"
                />
                <IconButton type="submit" aria-label="Search">
                  <Search className="h-4 w-4" />
                </IconButton>
              </div>
              {searchError ? (
                <p className="text-xs font-medium text-[var(--anslation-ds-danger)]">
                  {searchError}
                </p>
              ) : null}
            </form>

            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.hasDropdown
                  ? item.options?.some((option) => isActive(option.href))
                  : isActive(item.href);

                return (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <details className="group">
                        <summary
                          className={`flex cursor-pointer list-none items-center justify-between rounded-[var(--anslation-ds-radius)] px-2.5 py-2.5 text-sm font-medium transition ${
                            isCurrent
                              ? "bg-(--muted) text-(--primary)"
                              : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                        </summary>
                        <div className="mt-1 flex flex-col gap-1 pl-3">
                          {item.options?.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <Link
                                key={option.label}
                                href={option.href}
                                {...routePreviewProps(option.href)}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2 text-sm font-medium transition ${
                                  isActive(option.href)
                                    ? "bg-(--muted) text-(--primary)"
                                    : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                                }`}
                              >
                                <OptionIcon className="h-4 w-4" />
                                {option.label}
                              </Link>
                            );
                          })}
                        </div>
                      </details>
                    ) : (
                      <Link
                        href={item.href}
                        {...routePreviewProps(item.href)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2.5 text-sm font-medium transition ${
                          isCurrent
                            ? "bg-(--muted) text-(--primary)"
                            : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;

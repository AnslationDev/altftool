"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { IconButton, Input } from "@altftool/ui";
import { useTheme } from "@/contexts/ThemeContext";
import {
  isPublicRouteActive,
  isPublicShellHidden,
  PUBLIC_NAV_ITEMS,
} from "./siteRoutes";
import ManagedImage from "@/components/ui/ManagedImage";

const THEME_OPTIONS = [
  { value: "system", label: "System default", icon: Monitor },
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [themeReady, setThemeReady] = useState(false);
  const themeMenuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const currentThemeOption =
    THEME_OPTIONS.find((option) => option.value === themeMode) ??
    THEME_OPTIONS[0];
  const displayedThemeOption = themeReady ? currentThemeOption : THEME_OPTIONS[0];
  const CurrentThemeIcon = displayedThemeOption.icon;

  const isActive = (route) => isPublicRouteActive(pathname, route);

  const prefetchRoute = (href) => {
    if (!href?.startsWith("/")) return;
    router.prefetch(href);
  };

  const routePreviewProps = (href) => ({
    onMouseEnter: () => prefetchRoute(href),
    onFocus: () => prefetchRoute(href),
  });

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    const syncSearchQuery = setTimeout(() => {
      const existingQuery =
        new URLSearchParams(window.location.search).get("q") || "";
      setSearchQuery(existingQuery);
    }, 0);

    return () => clearTimeout(syncSearchQuery);
  }, [pathname]);

  useEffect(() => {
    setThemeMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!themeMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!themeMenuRef.current?.contains(event.target)) {
        setThemeMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [themeMenuOpen]);

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

    if (trimmed.length < 2) {
      setSearchError("Type at least 2 characters.");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery(trimmed);
    setSearchError("");
    setMobileMenuOpen(false);
  };

  const handleThemeSelect = (nextThemeMode) => {
    setThemeMode(nextThemeMode);
    setThemeMenuOpen(false);
  };

  // Hide global header on immersive routes.
  if (isPublicShellHidden(pathname)) {
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
            <ManagedImage
              src="/assets/logo3.png"
              className="h-9 w-auto object-contain"
              alt="AltFTool"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.options
                ? item.options.some((option) => isActive(option))
                : isActive(item);

              return (
                <div key={item.label} className="group relative">
                  {item.options ? (
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
                                  isActive(option)
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
                className="w-64 bg-[var(--background)]"
              />

              <IconButton type="submit" aria-label="Search">
                <Search className="h-4 w-4" />
              </IconButton>
            </form>

            <div className="relative" ref={themeMenuRef}>
              <IconButton
                onClick={() => setThemeMenuOpen((isOpen) => !isOpen)}
                aria-label="Toggle Theme"
                aria-haspopup="menu"
                aria-expanded={themeMenuOpen}
                title={`Theme: ${displayedThemeOption.label}`}
              >
                <span
                  className="grid h-4 w-4 place-items-center"
                  suppressHydrationWarning
                >
                  <CurrentThemeIcon
                    className={`h-4 w-4 ${
                      themeReady && resolvedTheme === "dark" ? "text-(--primary)" : ""
                    }`}
                  />
                </span>
              </IconButton>

              {themeMenuOpen ? (
                <div
                  role="menu"
                  aria-label="Theme mode"
                  className="absolute right-0 top-full z-50 mt-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-1.5 shadow-[var(--anslation-ds-shadow-md)]"
                >
                  <div className="flex min-w-max items-center gap-1">
                    {THEME_OPTIONS.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = option.value === themeMode;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          aria-label={option.label}
                          title={option.label}
                          onClick={() => handleThemeSelect(option.value)}
                          className={`relative grid h-9 w-9 place-items-center rounded-[6px] border text-(--muted-foreground) transition hover:border-(--primary) hover:bg-(--muted) hover:text-(--foreground) ${
                            isSelected
                              ? "border-(--primary) bg-(--muted) text-(--primary)"
                              : "border-transparent"
                          }`}
                        >
                          <OptionIcon className="h-4 w-4" />
                          {isSelected ? (
                            <Check className="pointer-events-none absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-(--primary) p-0.5 text-(--primary-foreground)" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

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
              <ManagedImage
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
              {PUBLIC_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.options
                  ? item.options.some((option) => isActive(option))
                  : isActive(item);

                return (
                  <div key={item.label}>
                    {item.options ? (
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
                                  isActive(option)
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

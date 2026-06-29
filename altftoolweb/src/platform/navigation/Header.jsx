"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Menu,
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
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
];

const HOME_NAV_ITEMS = PUBLIC_NAV_ITEMS;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [themeReady, setThemeReady] = useState(false);
  const themeMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const mobileMenuPanelId = "site-mobile-navigation";
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
    const readyTimer = window.setTimeout(() => setThemeReady(true), 0);
    return () => window.clearTimeout(readyTimer);
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
    const closeThemeTimer = window.setTimeout(() => setThemeMenuOpen(false), 0);
    return () => window.clearTimeout(closeThemeTimer);
  }, [pathname]);

  useEffect(() => {
    const closeMenuTimer = window.setTimeout(() => setMobileMenuOpen(false), 0);
    return () => window.clearTimeout(closeMenuTimer);
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

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusCloseButton = window.setTimeout(() => {
      const closeButton =
        mobileCloseButtonRef.current ||
        document.querySelector('button[aria-label="Close menu"]');
      closeButton?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        window.setTimeout(() => {
          mobileMenuButtonRef.current?.focus({ preventScroll: true });
        }, 0);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(focusCloseButton);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = ({ returnFocus = false } = {}) => {
    setMobileMenuOpen(false);

    if (returnFocus) {
      window.setTimeout(() => {
        mobileMenuButtonRef.current?.focus({ preventScroll: true });
      }, 0);
    }
  };

  const handleMobileMenuKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openMobileMenu();
  };

  // Hide global header on immersive routes.
  if (isPublicShellHidden(pathname)) {
    return null;
  }

  const isHomeDark = themeReady && resolvedTheme === "dark";

  if (pathname === "/") {
    return (
      <>
        <header
          id="main-header"
          data-hydrated={themeReady ? "true" : "false"}
          className={`sticky top-0 z-50 border-b px-4 backdrop-blur-xl sm:px-6 lg:px-8 ${
            isHomeDark
              ? "border-[rgba(148,163,184,0.12)] bg-[#020617]/92 shadow-[0_1px_0_rgba(0,0,0,0.28)]"
              : "border-[#E2E8F0] bg-[#F8FAFC]/92 shadow-[0_1px_0_rgba(15,23,42,0.08)]"
          }`}
        >
          <div className="mx-auto grid h-16 max-w-[var(--anslation-ds-container)] grid-cols-[auto_1fr_auto] items-center gap-3 sm:h-[72px] lg:gap-4 min-[1360px]:grid-cols-[minmax(8rem,1fr)_auto_minmax(8rem,1fr)]">
            <Link
              href="/"
              className="flex min-w-fit items-center justify-self-start"
              {...routePreviewProps("/")}
            >
              <ManagedImage
                src="/assets/logo3.png"
                className="h-8 w-auto object-contain sm:h-9"
                alt="AltFTool"
              />
            </Link>

            <nav
              className={`hidden max-w-full items-center justify-center gap-1 justify-self-center rounded-full border px-2 py-1.5 min-[1360px]:flex ${
                isHomeDark
                  ? "border-transparent bg-transparent shadow-none"
                  : "border-transparent bg-transparent shadow-none"
              }`}
            >
              {HOME_NAV_ITEMS.map((item) => {
                const isActive =
                  isPublicRouteActive(pathname, item) ||
                  item.options?.some((option) => isPublicRouteActive(pathname, option));
                const hasOptions = Boolean(item.options?.length);
                const homeNavItemClass = `relative flex h-10 appearance-none items-center gap-1.5 whitespace-nowrap rounded-full border-0 px-4 py-0 text-base font-medium leading-5 transition duration-200 [font-family:var(--font-ibm-plex-sans)] ${
                  isActive
                    ? isHomeDark
                      ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6] shadow-[0_0_24px_rgba(20,184,166,0.18)]"
                      : "bg-[#F0FDFA] text-[#0D9488] shadow-[0_2px_8px_rgba(2,6,23,0.06)]"
                    : isHomeDark
                      ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC] hover:shadow-[0_2px_8px_rgba(2,6,23,0.6)]"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] hover:shadow-[0_2px_8px_rgba(2,6,23,0.06)]"
                }`;
                const activeUnderlineClass = `absolute inset-x-4 bottom-1 h-0.5 origin-left rounded-full bg-[#14B8A6] transition-transform duration-200 ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`;

                return (
                  <div key={item.label} className="group relative">
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        aria-haspopup={hasOptions ? "true" : undefined}
                        {...routePreviewProps(item.href)}
                        className={homeNavItemClass}
                      >
                        {item.label}
                        {hasOptions ? (
                          <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                        ) : null}
                        <span className={activeUnderlineClass} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        suppressHydrationWarning
                        aria-current={isActive ? "page" : undefined}
                        aria-haspopup="true"
                        className={homeNavItemClass}
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                        <span className={activeUnderlineClass} />
                      </button>
                    )}

                    {hasOptions ? (
                      <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 group-focus-within:block group-hover:block">
                        <div
                          className={`w-56 rounded-2xl border p-2 shadow-[0_22px_50px_rgba(15,23,42,0.16)] ${
                            isHomeDark
                              ? "border-[rgba(148,163,184,0.12)] bg-[#0F172A]"
                              : "border-[#E2E8F0] bg-white"
                          }`}
                        >
                          {item.options.map((option) => (
                            <Link
                              key={option.label}
                              href={option.href}
                              {...routePreviewProps(option.href)}
                              className={`block rounded-xl px-3 py-2.5 text-base font-medium transition duration-200 [font-family:var(--font-ibm-plex-sans)] ${
                                isPublicRouteActive(pathname, option)
                                  ? isHomeDark
                                    ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6] shadow-[0_0_24px_rgba(20,184,166,0.14)]"
                                    : "bg-[#F0FDFA] text-[#0D9488]"
                                  : isHomeDark
                                    ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                                    : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                              }`}
                            >
                              {option.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="flex min-w-fit items-center justify-end gap-2 justify-self-end">
              <form
                className="relative hidden shrink-0 items-center gap-2 2xl:flex"
                onSubmit={handleSearch}
              >
                <div className="shrink-0">
                  <Input
                    type="text"
                    placeholder="Search tools, extensions, deals..."
                    value={searchQuery}
                    onChange={(event) => handleChange(event.target.value)}
                    aria-invalid={searchError ? "true" : "false"}
                    suppressHydrationWarning
                    className={`h-11 !w-[16rem] shrink-0 rounded-xl text-sm font-semibold shadow-none transition focus-visible:border-[#14B8A6] focus-visible:ring-2 focus-visible:ring-[#14B8A6]/20 min-[1800px]:!w-[24rem] ${
                      isHomeDark
                        ? "border-[rgba(148,163,184,0.12)] bg-[#0F172A] text-[#F8FAFC] placeholder:text-[#94A3B8]"
                        : "border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#475569]"
                    }`}
                  />
                </div>

                <IconButton type="submit" aria-label="Search">
                  <Search className="h-4 w-4" />
                </IconButton>
                {searchError ? (
                  <p className="absolute right-0 top-full mt-2 rounded-lg border border-[var(--anslation-ds-danger)] bg-white px-2 py-1 text-xs font-semibold text-[var(--anslation-ds-danger)] shadow-[0_12px_30px_rgba(7,27,58,0.08)]">
                    {searchError}
                  </p>
                ) : null}
              </form>

              <div className="relative" ref={themeMenuRef}>
                <IconButton
                  onClick={() =>
                    handleThemeSelect(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  aria-label="Toggle Theme"
                  aria-pressed={resolvedTheme === "dark"}
                  title={`Theme: ${displayedThemeOption.label}`}
                >
                  <span
                    className="grid h-4 w-4 place-items-center"
                    suppressHydrationWarning
                  >
                    <CurrentThemeIcon
                      className={`h-4 w-4 ${
                        themeReady && resolvedTheme === "dark" ? "text-[#14B8A6]" : "text-[#14B8A6]"
                      }`}
                    />
                  </span>
                </IconButton>
              </div>

              <div className="min-[1360px]:hidden">
                <IconButton
                  ref={mobileMenuButtonRef}
                  onClick={openMobileMenu}
                  onKeyDown={handleMobileMenuKeyDown}
                  aria-label="Open menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls={mobileMenuPanelId}
                >
                  <Menu className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          </div>
        </header>

        <div
          id={mobileMenuPanelId}
          role="dialog"
          aria-label="Mobile navigation"
          aria-modal={mobileMenuOpen ? "true" : undefined}
          aria-hidden={mobileMenuOpen ? undefined : "true"}
          inert={!mobileMenuOpen}
          className={`fixed inset-0 z-[70] min-[1360px]:hidden ${
            mobileMenuOpen ? "" : "pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-0 bg-[#171B33]/45 backdrop-blur-sm transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => closeMobileMenu()}
          />

          <aside
            className={`fixed inset-y-0 left-0 flex w-[min(24rem,calc(100vw-0.75rem))] transform flex-col overflow-y-auto border-r p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out ${
              isHomeDark
                ? "border-[rgba(148,163,184,0.12)] bg-[#0F172A] text-[#F8FAFC]"
                : "border-[#E2E8F0] bg-white text-[#0F172A]"
            } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => closeMobileMenu()}
                {...routePreviewProps("/")}
              >
                <ManagedImage
                  src="/assets/logo3.png"
                  className="h-9 w-auto object-contain"
                  alt="AltFTool"
                />
              </Link>

              <IconButton
                ref={mobileCloseButtonRef}
                onClick={() => closeMobileMenu({ returnFocus: true })}
                variant="ghost"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <form className="mt-8 grid gap-2" onSubmit={handleSearch}>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(event) => handleChange(event.target.value)}
                  suppressHydrationWarning
                  className={`min-w-0 rounded-xl ${
                    isHomeDark
                      ? "border-[rgba(148,163,184,0.12)] bg-[#020617] text-[#F8FAFC] placeholder:text-[#94A3B8]"
                      : "border-[#E2E8F0]"
                  }`}
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

            <nav className="mt-8 grid gap-2 pb-6">
              {HOME_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.options
                  ? item.options.some((option) => isActive(option))
                  : isActive(item);

                return item.options ? (
                  <details key={item.label} className="group">
                    <summary
                    className={`flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition duration-200 [font-family:var(--font-ibm-plex-sans)] ${
                        isCurrent
                          ? isHomeDark
                            ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6] shadow-[0_0_24px_rgba(20,184,166,0.14)]"
                            : "bg-[#F0FDFA] text-[#0D9488]"
                          : isHomeDark
                            ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                    </summary>
                    <div className="mt-1 grid gap-1 pl-3">
                      {item.options?.map((option) => {
                        const OptionIcon = option.icon;
                        return (
                          <Link
                            key={option.href}
                            href={option.href}
                            {...routePreviewProps(option.href)}
                            onClick={() => closeMobileMenu()}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 [font-family:var(--font-ibm-plex-sans)] ${
                              isHomeDark
                                ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                                : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
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
                    key={item.label}
                    href={item.href}
                    {...routePreviewProps(item.href)}
                    onClick={() => closeMobileMenu()}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition duration-200 [font-family:var(--font-ibm-plex-sans)] ${
                      isCurrent
                        ? isHomeDark
                          ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6] shadow-[0_0_24px_rgba(20,184,166,0.14)]"
                          : "bg-[#F0FDFA] text-[#0D9488]"
                        : isHomeDark
                          ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div
                className={`mt-5 rounded-2xl border p-2 ${
                  isHomeDark
                    ? "border-[rgba(148,163,184,0.12)] bg-[#020617]"
                    : "border-[#E2E8F0] bg-[#F8FAFC]"
                }`}
              >
                <p
                  className={`px-2 pb-2 text-xs font-medium uppercase tracking-normal ${
                    isHomeDark ? "text-[#94A3B8]" : "text-[#475569]"
                  }`}
                >
                  Theme
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {THEME_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = themeReady && option.value === themeMode;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        onClick={() => handleThemeSelect(option.value)}
                        className={`grid h-11 place-items-center rounded-xl border transition ${
                          isSelected
                            ? isHomeDark
                              ? "border-[#14B8A6] bg-[#1E293B] text-[#38BDF8]"
                              : "border-[#14B8A6] bg-[#F0FDFA] text-[#14B8A6]"
                            : isHomeDark
                              ? "border-transparent text-[#94A3B8] hover:bg-[#1E293B]"
                              : "border-transparent text-[#475569] hover:bg-white"
                        }`}
                      >
                        <OptionIcon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <header
        id="main-header"
        data-hydrated={themeReady ? "true" : "false"}
        className="sticky top-0 z-50 border-b border-(--border) bg-[color-mix(in_srgb,var(--card)_90%,transparent)] px-4 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl sm:px-6 lg:px-8"
      >
          <div className="mx-auto grid h-14 max-w-[var(--anslation-ds-container)] grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-4 min-[1360px]:grid-cols-[minmax(8rem,1fr)_auto_minmax(8rem,1fr)]">
          <Link
            href="/"
            className="flex min-w-fit items-center justify-self-start"
            {...routePreviewProps("/")}
          >
            <ManagedImage
              src="/assets/logo3.png"
              className="h-8 w-auto object-contain sm:h-9"
              alt="AltFTool"
            />
          </Link>

          <nav className="hidden max-w-full items-center gap-1 justify-self-center min-[1360px]:flex">
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
                        type="button"
                        aria-haspopup="true"
                        className={`relative flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2 font-[inherit] text-sm font-medium transition ${
                          isCurrent
                            ? "bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                            : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                      </button>

                      <div className="absolute left-0 top-full hidden pt-2 group-focus-within:block group-hover:block">
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
                      className={`relative flex items-center gap-2 rounded-[var(--anslation-ds-radius)] px-2.5 py-2 font-[inherit] text-sm font-medium transition ${
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

          <div className="flex min-w-fit items-center justify-end gap-2 justify-self-end">
            <form
              className="relative hidden items-center gap-2 md:flex min-[1360px]:hidden 2xl:flex"
              onSubmit={handleSearch}
            >
              <Input
                type="text"
                placeholder="Search tools, extensions..."
                value={searchQuery}
                onChange={(event) => handleChange(event.target.value)}
                aria-invalid={searchError ? "true" : "false"}
                className="w-56 bg-[var(--background)]"
              />

              <IconButton type="submit" aria-label="Search">
                <Search className="h-4 w-4" />
              </IconButton>
              {searchError ? (
                <p className="absolute right-0 top-full mt-2 rounded-[6px] border border-[var(--anslation-ds-danger)] bg-[var(--card)] px-2 py-1 text-xs font-semibold text-[var(--anslation-ds-danger)] shadow-[var(--anslation-ds-shadow-sm)]">
                  {searchError}
                </p>
              ) : null}
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
                      const isSelected = themeReady && option.value === themeMode;

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
              ref={mobileMenuButtonRef}
              onClick={openMobileMenu}
              onKeyDown={handleMobileMenuKeyDown}
              className="min-[1360px]:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuPanelId}
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <div
        id={mobileMenuPanelId}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal={mobileMenuOpen ? "true" : undefined}
        aria-hidden={mobileMenuOpen ? undefined : "true"}
        inert={!mobileMenuOpen}
        className={`fixed inset-0 z-[70] min-[1360px]:hidden ${
          mobileMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => closeMobileMenu()}
        />

        <aside
          className={`fixed inset-y-0 left-0 flex w-[min(24rem,calc(100vw-0.75rem))] transform flex-col overflow-y-auto border-r border-(--border) bg-(--card) p-5 text-(--foreground) shadow-[var(--anslation-ds-shadow-lg)] transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => closeMobileMenu()}
              {...routePreviewProps("/")}
            >
              <ManagedImage
                src="/assets/logo3.png"
                className="h-9 w-auto object-contain"
                alt="AltFTool"
              />
            </Link>

            <IconButton
              ref={mobileCloseButtonRef}
              onClick={() => closeMobileMenu({ returnFocus: true })}
              variant="ghost"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          <nav className="mt-8 flex flex-col gap-4 pb-6">
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
                                onClick={() => closeMobileMenu()}
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
                        onClick={() => closeMobileMenu()}
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
        </aside>
      </div>
    </>
  );
};

export default Header;

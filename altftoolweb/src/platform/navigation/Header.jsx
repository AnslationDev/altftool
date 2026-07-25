"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid, Menu, Search, X } from "lucide-react";
import {
  BrandLogo,
  IconButton,
  Input,
  ThemeModeMenu,
  ThemeModeSelector,
} from "@altftool/ui";
import { useTheme } from "@/contexts/ThemeContext";
import AccountMenu from "./AccountMenu";
import {
  isPublicRouteActive,
  isPublicShellHidden,
  PUBLIC_NAV_ITEMS,
  SITE_ROUTES,
} from "./siteRoutes";

function groupNavigationOptions(options = []) {
  const groups = new Map();

  for (const option of options) {
    const label = option.group || "Explore";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(option);
  }

  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

function getDesktopMenuLayout(item) {
  const position =
    item.menuAlign === "left"
      ? "left-0"
      : item.menuAlign === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  if (item.menuColumns === 4) {
    return {
      columns: "grid-cols-4",
      position,
      width: "w-[min(54rem,calc(100vw-2rem))]",
    };
  }

  if (item.menuColumns === 3) {
    return {
      columns: "grid-cols-3",
      position,
      width: "w-[min(52rem,calc(100vw-2rem))]",
    };
  }

  if (item.menuColumns === 2) {
    return {
      columns: "grid-cols-2",
      position,
      width: "w-[min(38rem,calc(100vw-2rem))]",
    };
  }

  return { columns: "grid-cols-1", position, width: "w-72" };
}

export default function Header() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { setThemeMode, themeMode } = useTheme();
  const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [themeReady, setThemeReady] = useState(false);
  const mobileMenuButtonRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const mobileMenuPanelId = "site-mobile-navigation";

  const prefetchRoute = (href) => {
    if (href?.startsWith("/")) router.prefetch(href);
  };

  const routePreviewProps = (href) => ({
    onFocus: () => prefetchRoute(href),
    onMouseEnter: () => prefetchRoute(href),
  });

  const closeMobileMenu = ({ returnFocus = false } = {}) => {
    setMobileMenuOpen(false);
    if (returnFocus) {
      window.setTimeout(() => {
        mobileMenuButtonRef.current?.focus({ preventScroll: true });
      }, 0);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setThemeReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveDesktopMenu(null);
      setMobileMenuOpen(false);
      setSearchError("");
      setSearchQuery(
        new URLSearchParams(window.location.search).get("q") || "",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      mobileCloseButtonRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu({ returnFocus: true });
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = mobilePanelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [mobileMenuOpen]);

  if (isPublicShellHidden(pathname)) return null;

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchError("Type at least 2 characters.");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeMobileMenu();
  };

  const handleThemeSelect = (value) => {
    setThemeMode(value);
  };

  return (
    <>
      <header
        id="main-header"
        data-hydrated={themeReady ? "true" : "false"}
        className="sticky top-0 z-50 isolate border-b border-border bg-background/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid h-16 max-w-[var(--anslation-ds-container)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link
            href="/"
            prefetch={false}
            aria-label="AltFTool home"
            className="inline-flex min-w-fit items-center rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            {...routePreviewProps("/")}
          >
            <BrandLogo size="sm" />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden min-w-0 items-center justify-center gap-0.5 justify-self-center xl:flex"
          >
            {PUBLIC_NAV_ITEMS.map((item) => {
              const hasOptions = Boolean(item.options?.length);
              const itemIsActive =
                isPublicRouteActive(pathname, item) ||
                item.options?.some((option) =>
                  isPublicRouteActive(pathname, option),
                );
              const menuIsOpen = activeDesktopMenu === item.label;
              const groups = groupNavigationOptions(item.options);
              const layout = getDesktopMenuLayout(item);

              return (
                <div
                  className="relative"
                  key={item.label}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setActiveDesktopMenu(null);
                    }
                  }}
                  onFocusCapture={() => {
                    prefetchRoute(item.href);
                    if (hasOptions) setActiveDesktopMenu(item.label);
                  }}
                  onMouseEnter={() => {
                    prefetchRoute(item.href);
                    if (hasOptions) setActiveDesktopMenu(item.label);
                  }}
                  onMouseLeave={() => setActiveDesktopMenu(null)}
                >
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={itemIsActive ? "page" : undefined}
                    aria-expanded={hasOptions ? menuIsOpen : undefined}
                    aria-haspopup={hasOptions ? "true" : undefined}
                    className={`relative flex h-11 items-center gap-1 rounded-md px-3 text-sm font-semibold transition after:pointer-events-none after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:after:transition-none ${
                      itemIsActive
                        ? "bg-muted text-primary after:scale-x-100"
                        : "text-muted-foreground after:origin-left after:scale-x-0 hover:bg-muted hover:text-foreground hover:after:scale-x-100"
                    }`}
                  >
                    {item.label}
                    {hasOptions ? (
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 transition ${menuIsOpen ? "rotate-180" : ""}`}
                      />
                    ) : null}
                  </Link>

                  {hasOptions && menuIsOpen ? (
                    <div
                      className={`absolute top-full z-[70] pt-2 ${layout.position}`}
                    >
                      <div
                        className={`${layout.width} max-h-[min(32rem,calc(100vh-5rem))] origin-top animate-[altft-menu-in_150ms_ease-out] overflow-y-auto overscroll-contain rounded-lg border border-border bg-[var(--anslation-ds-surface)] p-4 shadow-[var(--anslation-ds-shadow-lg)] [scrollbar-gutter:stable] motion-reduce:animate-none`}
                      >
                        <div className={`grid gap-3 ${layout.columns}`}>
                          {groups.map((group) => (
                            <section
                              aria-label={group.label}
                              className="min-w-0"
                              key={group.label}
                            >
                              <p className="px-2 pb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                                {group.label}
                              </p>
                              <div className="grid gap-1">
                                {group.items.map((option) => {
                                  const OptionIcon = option.icon || LayoutGrid;
                                  const optionIsActive = isPublicRouteActive(
                                    pathname,
                                    option,
                                  );

                                  return (
                                    <Link
                                      key={option.href}
                                      href={option.href}
                                      prefetch={false}
                                      {...routePreviewProps(option.href)}
                                      onClick={() => setActiveDesktopMenu(null)}
                                      className={`group flex min-h-11 items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                        optionIsActive
                                          ? "bg-muted text-primary"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                      }`}
                                    >
                                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-primary transition group-hover:bg-background">
                                        <OptionIcon
                                          className="h-4 w-4"
                                          aria-hidden="true"
                                        />
                                      </span>
                                      <span className="min-w-0 leading-5">
                                        {option.label}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex min-w-fit items-center justify-end gap-2 justify-self-end">
            <Link
              href="/search"
              prefetch={false}
              aria-label="Search AltFTool"
              title="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none"
              {...routePreviewProps("/search")}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>

            <ThemeModeMenu
              value={themeMode}
              onChange={handleThemeSelect}
              hydrated={themeReady}
            />

            <AccountMenu />

            <span className="xl:hidden">
              <IconButton
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileMenuPanelId}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            </span>
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
        className={`fixed inset-0 z-[90] xl:hidden ${
          mobileMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => closeMobileMenu()}
          className={`fixed inset-0 bg-foreground/35 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          ref={mobilePanelRef}
          className={`fixed inset-y-0 left-0 flex w-[min(24rem,calc(100vw-0.75rem))] flex-col overflow-y-auto border-r border-border bg-card p-5 text-foreground shadow-lg transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              prefetch={false}
              aria-label="AltFTool home"
              onClick={() => closeMobileMenu()}
              className="rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              <BrandLogo size="sm" />
            </Link>
            <IconButton
              ref={mobileCloseButtonRef}
              type="button"
              onClick={() => closeMobileMenu({ returnFocus: true })}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>

          <form className="mt-6 grid gap-2" onSubmit={handleSearch}>
            <div className="flex items-center gap-2">
              <Input
                type="search"
                aria-label="Search AltFTool"
                placeholder="Search tools, apps, and guides"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  if (searchError) setSearchError("");
                }}
                className="min-w-0"
              />
              <IconButton type="submit" aria-label="Search">
                <Search className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
            {searchError ? (
              <p className="text-xs font-medium text-destructive">
                {searchError}
              </p>
            ) : null}
          </form>

          <nav aria-label="Mobile navigation" className="mt-6 grid gap-1 pb-6">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const groups = groupNavigationOptions(item.options);
              const itemIsActive =
                isPublicRouteActive(pathname, item) ||
                item.options?.some((option) =>
                  isPublicRouteActive(pathname, option),
                );

              return (
                <details
                  className="group"
                  key={item.label}
                  open={itemIsActive || undefined}
                >
                  <summary
                    className={`flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      itemIsActive
                        ? "bg-muted text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 transition group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <div className="mt-1 grid gap-3 border-l border-border pl-3">
                    {groups.map((group) => (
                      <section
                        aria-label={group.label}
                        className="grid gap-1"
                        key={group.label}
                      >
                        <p className="px-3 pt-1 text-xs font-semibold uppercase text-muted-foreground">
                          {group.label}
                        </p>
                        {group.items.map((option) => {
                          const OptionIcon = option.icon || LayoutGrid;
                          const optionIsActive = isPublicRouteActive(
                            pathname,
                            option,
                          );

                          return (
                            <Link
                              key={option.href}
                              href={option.href}
                              prefetch={false}
                              {...routePreviewProps(option.href)}
                              onClick={() => closeMobileMenu()}
                              className={`flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                optionIsActive
                                  ? "bg-muted text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <OptionIcon
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{option.label}</span>
                            </Link>
                          );
                        })}
                      </section>
                    ))}
                  </div>
                </details>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Theme
            </p>
            <ThemeModeSelector
              className="mt-2"
              value={themeReady ? themeMode : "system"}
              onChange={handleThemeSelect}
            />

            <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">
              Quick access
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[SITE_ROUTES.docs, SITE_ROUTES.siteMap, SITE_ROUTES.support].map(
                (route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    prefetch={false}
                    onClick={() => closeMobileMenu()}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-semibold text-foreground transition duration-150 hover:border-primary hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transform-none"
                  >
                    {route.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

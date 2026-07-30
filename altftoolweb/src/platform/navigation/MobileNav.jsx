"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  House,
  LayoutGrid,
  Search,
  X,
} from "lucide-react";
import { Input, ThemeModeSelector } from "@altftool/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { isVisibleFocusable } from "./navigationFocusPolicy";
import {
  isPublicRouteActive,
  MOBILE_MORE_NAV_ITEMS,
  MOBILE_TAB_ITEMS,
  MOBILE_UTILITY_LINKS,
  SITE_ROUTES,
  TOOL_BROWSE_GROUPS,
  TOOL_DIRECTORY_LINKS,
  TOOL_QUICK_LINKS,
} from "./siteRoutes";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Focusable descendants that are actually rendered. Links inside a collapsed
 * `<details>` still match the selector, so an unfiltered trap can park focus on
 * an invisible element and appear to break Tab entirely.
 *
 * A client-rect test is not enough to spot them: measured in Chrome, a link
 * inside a closed `<details>` in the Explore sheet still reports one client
 * rect of 332x44 while `checkVisibility()` returns false and `focus()` refuses
 * to move focus to it. With 6 collapsed groups that is ~78 unfocusable nodes
 * inside the trap's list, and today only DOM order keeps `first`/`last` off
 * them. `checkVisibility()` is the test that agrees with the browser.
 */
function getVisibleFocusable(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    isVisibleFocusable,
  );
}

function groupNavigationOptions(options = []) {
  const groups = new Map();

  for (const option of options) {
    const label = option.group || "Explore";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(option);
  }

  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

const tileClass =
  "flex min-h-11 items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:border-primary hover:text-(--primary-text) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none";

const sectionHeadingClass =
  "px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * Decorative icon inside a sheet, rendered only once the client has mounted.
 *
 * The sheets stay mounted so their anchors are in the server HTML, but the
 * icons are the one part of that markup with no crawl or accessibility value:
 * every one is `aria-hidden`, every link carries a visible text label, and the
 * three icon-only buttons name themselves with `aria-label`. Measured on the
 * dev server, the 133 icons this file renders into the three closed sheets
 * cost 63,419 of a tool page's 535,217 HTML bytes.
 *
 * Deferring them is invisible: a sheet is opened from React state, so it
 * cannot be open before the mount effect has run. The tab bar's own icons are
 * NOT deferred — those are on screen from the first paint.
 */
function SheetIcon({ icon: Icon, ready, className }) {
  if (!ready || !Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

function SheetSection({ title, children }) {
  return (
    <section aria-label={title} className="grid gap-2">
      <h3 className={sectionHeadingClass}>{title}</h3>
      {children}
    </section>
  );
}

/**
 * Bottom sheet shell. Always mounted (so its links stay in the server-rendered
 * HTML) and `inert` while closed, which keeps it out of the tab order and off
 * the accessibility tree without unmounting.
 */
function Sheet({
  id,
  labelId,
  open,
  title,
  onClose,
  panelRef,
  iconsReady,
  children,
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal={open ? "true" : undefined}
      aria-labelledby={labelId}
      aria-hidden={open ? undefined : "true"}
      inert={!open}
      className={`fixed inset-0 z-[90] xl:hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Close ${title}`}
        onClick={() => onClose()}
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        className={`absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-xl border-t border-border bg-card text-foreground shadow-[var(--anslation-ds-shadow-lg)] transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id={labelId} className="text-base font-bold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onClose({ returnFocus: true })}
            aria-label={`Close ${title}`}
            className="inline-flex h-[var(--anslation-ds-control-md)] w-[var(--anslation-ds-control-md)] shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none"
          >
            <SheetIcon icon={X} ready={iconsReady} className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function MobileNav({ activeSheet, onOpenSheet, onCloseSheet }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { setThemeMode, themeMode } = useTheme();
  // One post-mount flag for the two things that must not be server-rendered:
  // the theme selector's value (it reads localStorage) and the sheets'
  // decorative icons (see `SheetIcon`).
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const baseId = useId().replace(/[^a-zA-Z0-9-]/g, "");

  const searchInputRef = useRef(null);
  const toolsPanelRef = useRef(null);
  const searchPanelRef = useRef(null);
  const morePanelRef = useRef(null);

  const getPanel = (id) => {
    if (id === "tools") return toolsPanelRef.current;
    if (id === "search") return searchPanelRef.current;
    if (id === "more") return morePanelRef.current;
    return null;
  };

  const sheetId = (id) => `altft-nav-sheet-${id}-${baseId}`;
  const sheetLabelId = (id) => `${sheetId(id)}-title`;

  const prefetchRoute = (href) => {
    if (href?.startsWith("/")) router.prefetch(href);
  };

  const routePreviewProps = (href) => ({
    onFocus: () => prefetchRoute(href),
    onMouseEnter: () => prefetchRoute(href),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchError("");
      setSearchQuery(
        new URLSearchParams(window.location.search).get("q") || "",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Escape, focus trap, initial focus, and a scroll lock that compensates for
  // the scrollbar so locking the body cannot shift the page sideways.
  useEffect(() => {
    if (!activeSheet) return undefined;

    const panel = getPanel(activeSheet);
    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    // `document.scrollingElement` is <html> here, and globals.css puts
    // `overflow-x: clip` on the root element — the viewport only takes its
    // overflow from <body> while the root's own overflow is `visible`, so a
    // body-only lock cannot be relied on to hold. Lock the element that
    // actually scrolls as well.
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => {
      const target =
        activeSheet === "search"
          ? searchInputRef.current
          : getVisibleFocusable(panel)[0];
      target?.focus({ preventScroll: true });
    }, 60);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseSheet({ returnFocus: true });
        return;
      }

      if (event.key !== "Tab") return;

      const livePanel = getPanel(activeSheet);
      const focusable = getVisibleFocusable(livePanel);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!livePanel?.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchError("Type at least 2 characters.");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
    onCloseSheet();
  };

  const linkProps = (href) => ({
    href,
    prefetch: false,
    onClick: () => onCloseSheet(),
    ...routePreviewProps(href),
  });

  return (
    <>
      {/* Reserves room for the fixed tab bar so it can never cover the end of
          the page, and exposes its height for other fixed chrome to sit on. */}
      <style>{`:root{--altft-mobile-nav-height:3.5rem}@media (max-width:767.98px){body{padding-bottom:calc(var(--altft-mobile-nav-height) + env(safe-area-inset-bottom,0px))}}`}</style>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <ul className="mx-auto grid h-14 max-w-md grid-cols-4">
          {MOBILE_TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const sheetIsOpen = item.sheet ? activeSheet === item.sheet : false;
            const routeIsActive = item.href
              ? isPublicRouteActive(pathname, item)
              : false;
            // While a sheet is open it owns the highlight; otherwise the tab
            // that matches the current route does.
            const isActive = activeSheet ? sheetIsOpen : routeIsActive;

            const inner = (
              <>
                <span
                  className={`flex h-7 w-14 items-center justify-center rounded-pill transition duration-150 motion-reduce:transition-none ${
                    isActive ? "bg-primary/12" : "bg-transparent"
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2 : 1.75}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-[0.6875rem] leading-none">
                  {item.label}
                </span>
              </>
            );

            const shared = `flex h-14 w-full flex-col items-center justify-center gap-1 rounded-md transition duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none ${
              isActive
                ? "font-semibold text-(--primary-text)"
                : "font-medium text-muted-foreground"
            }`;

            return (
              <li key={item.id} className="min-w-0">
                {item.sheet ? (
                  <button
                    type="button"
                    className={shared}
                    aria-haspopup="dialog"
                    aria-expanded={sheetIsOpen}
                    aria-controls={sheetId(item.sheet)}
                    onClick={(event) => {
                      prefetchRoute(item.href);
                      if (sheetIsOpen) {
                        onCloseSheet();
                        return;
                      }
                      onOpenSheet(item.sheet, event.currentTarget);
                    }}
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={shared}
                    aria-current={routeIsActive ? "page" : undefined}
                    {...routePreviewProps(item.href)}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ---------------------------------------------------------------- */}
      {/* Tools — the primary job. Two taps from any page to a category.    */}
      {/* ---------------------------------------------------------------- */}
      <Sheet
        id={sheetId("tools")}
        labelId={sheetLabelId("tools")}
        title="Tools"
        open={activeSheet === "tools"}
        onClose={onCloseSheet}
        panelRef={toolsPanelRef}
        iconsReady={mounted}
      >
        <div className="grid gap-5">
          <Link
            {...linkProps(SITE_ROUTES.tools.href)}
            className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition duration-150 hover:bg-(--primary-hover) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none"
          >
            Browse the full tool directory
            <SheetIcon
              icon={ArrowRight}
              ready={mounted}
              className="h-4 w-4 shrink-0"
            />
          </Link>

          <SheetSection title="Jump to">
            <div className="grid grid-cols-2 gap-2">
              {TOOL_QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    {...linkProps(link.href)}
                    className={tileClass}
                  >
                    <SheetIcon
                      icon={Icon}
                      ready={mounted}
                      className="h-4 w-4 shrink-0 text-(--primary-text)"
                    />
                    <span className="min-w-0 leading-5">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetSection>

          {TOOL_BROWSE_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section
                key={group.label}
                aria-label={group.label}
                className="grid gap-2"
              >
                <h3
                  className={`${sectionHeadingClass} flex items-center gap-2`}
                >
                  <SheetIcon
                    icon={GroupIcon}
                    ready={mounted}
                    className="h-3.5 w-3.5 text-(--primary-text)"
                  />
                  {group.label}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((option) => (
                    <Link
                      key={option.href}
                      {...linkProps(option.href)}
                      aria-current={
                        isPublicRouteActive(pathname, option)
                          ? "page"
                          : undefined
                      }
                      className={`${tileClass} ${
                        isPublicRouteActive(pathname, option)
                          ? "border-primary text-(--primary-text)"
                          : ""
                      }`}
                    >
                      <span className="min-w-0 leading-5">{option.label}</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <SheetSection title="Tool directories">
            <div className="grid grid-cols-2 gap-2">
              {TOOL_DIRECTORY_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    {...linkProps(link.href)}
                    className={tileClass}
                  >
                    <SheetIcon
                      icon={Icon}
                      ready={mounted}
                      className="h-4 w-4 shrink-0 text-(--primary-text)"
                    />
                    <span className="min-w-0 leading-5">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetSection>
        </div>
      </Sheet>

      {/* ---------------------------------------------------------------- */}
      {/* Search — one tap to a focused field, no page load first.          */}
      {/* ---------------------------------------------------------------- */}
      <Sheet
        id={sheetId("search")}
        labelId={sheetLabelId("search")}
        title="Search"
        open={activeSheet === "search"}
        onClose={onCloseSheet}
        panelRef={searchPanelRef}
        iconsReady={mounted}
      >
        <div className="grid gap-5">
          <form className="grid gap-2" onSubmit={handleSearch} role="search">
            <div className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-label="Search AltFTool"
                aria-describedby={
                  searchError ? `${sheetId("search")}-error` : undefined
                }
                invalid={Boolean(searchError)}
                placeholder="Search tools, apps, and guides"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  if (searchError) setSearchError("");
                }}
                className="min-w-0 flex-1"
              />
              <button
                type="submit"
                className="inline-flex h-[var(--anslation-ds-control-md)] shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition duration-150 hover:bg-(--primary-hover) active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <SheetIcon icon={Search} ready={mounted} className="h-4 w-4" />
                Go
              </button>
            </div>
            <p
              id={`${sheetId("search")}-error`}
              role="alert"
              className="min-h-4 text-xs font-medium text-destructive"
            >
              {searchError}
            </p>
          </form>

          <SheetSection title="Jump to">
            <div className="grid grid-cols-2 gap-2">
              {TOOL_QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    {...linkProps(link.href)}
                    className={tileClass}
                  >
                    <SheetIcon
                      icon={Icon}
                      ready={mounted}
                      className="h-4 w-4 shrink-0 text-(--primary-text)"
                    />
                    <span className="min-w-0 leading-5">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetSection>

          <button
            type="button"
            onClick={() => onOpenSheet("tools")}
            className={`${tileClass} justify-between`}
          >
            <span className="flex items-center gap-2.5">
              <SheetIcon
                icon={LayoutGrid}
                ready={mounted}
                className="h-4 w-4 shrink-0 text-(--primary-text)"
              />
              Browse tools by category
            </span>
            <SheetIcon
              icon={ArrowRight}
              ready={mounted}
              className="h-4 w-4 shrink-0"
            />
          </button>
        </div>
      </Sheet>

      {/* ---------------------------------------------------------------- */}
      {/* Explore — everything that is not a tool or a search.              */}
      {/* ---------------------------------------------------------------- */}
      <Sheet
        id={sheetId("more")}
        labelId={sheetLabelId("more")}
        title="Explore AltFTool"
        open={activeSheet === "more"}
        onClose={onCloseSheet}
        panelRef={morePanelRef}
        iconsReady={mounted}
      >
        <div className="grid gap-5">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenSheet("tools")}
              className={`${tileClass} flex-col justify-center gap-1.5 text-center`}
            >
              <SheetIcon
                icon={LayoutGrid}
                ready={mounted}
                className="h-5 w-5 text-(--primary-text)"
              />
              Tools
            </button>
            <button
              type="button"
              onClick={() => onOpenSheet("search")}
              className={`${tileClass} flex-col justify-center gap-1.5 text-center`}
            >
              <SheetIcon
                icon={Search}
                ready={mounted}
                className="h-5 w-5 text-(--primary-text)"
              />
              Search
            </button>
            <Link
              {...linkProps(SITE_ROUTES.home.href)}
              className={`${tileClass} flex-col justify-center gap-1.5 text-center`}
            >
              <SheetIcon
                icon={House}
                ready={mounted}
                className="h-5 w-5 text-(--primary-text)"
              />
              Home
            </Link>
          </div>

          <div className="grid gap-1">
            {MOBILE_MORE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const groups = groupNavigationOptions(item.options);
              const itemIsActive =
                isPublicRouteActive(pathname, item) ||
                item.options?.some((option) =>
                  isPublicRouteActive(pathname, option),
                );

              return (
                <details
                  className="group rounded-md border border-border bg-background"
                  key={item.label}
                  open={itemIsActive || undefined}
                >
                  <summary
                    className={`flex min-h-12 cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 ${
                      itemIsActive
                        ? "text-(--primary-text)"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <SheetIcon
                        icon={Icon}
                        ready={mounted}
                        className="h-4 w-4"
                      />
                      {item.label}
                    </span>
                    <SheetIcon
                      icon={ChevronDown}
                      ready={mounted}
                      className="h-4 w-4 shrink-0 transition group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>

                  <div className="grid gap-3 px-3 pb-3">
                    {groups.map((group) => (
                      <section
                        aria-label={group.label}
                        className="grid gap-1.5"
                        key={group.label}
                      >
                        <p className={sectionHeadingClass}>{group.label}</p>
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
                                {...linkProps(option.href)}
                                aria-current={
                                  optionIsActive ? "page" : undefined
                                }
                                className={`flex min-h-11 items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 ${
                                  optionIsActive
                                    ? "bg-muted text-(--primary-text)"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                <SheetIcon
                                  icon={OptionIcon}
                                  ready={mounted}
                                  className="h-4 w-4 shrink-0"
                                />
                                <span className="min-w-0">{option.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <SheetSection title="Help">
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_UTILITY_LINKS.map((route) => (
                <Link
                  key={route.href}
                  {...linkProps(route.href)}
                  className={tileClass}
                >
                  <span className="min-w-0 leading-5">{route.label}</span>
                </Link>
              ))}
            </div>
          </SheetSection>

          <SheetSection title="Theme">
            <ThemeModeSelector
              value={mounted ? themeMode : "system"}
              onChange={setThemeMode}
            />
          </SheetSection>
        </div>
      </Sheet>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid, Menu, Search } from "lucide-react";
import { BrandLogo, IconButton, ThemeModeMenu } from "@altftool/ui";
import { useTheme } from "@/contexts/ThemeContext";
import AccountMenu from "./AccountMenu";
import MobileNav from "./MobileNav";
import {
  isPublicRouteActive,
  isPublicShellHidden,
  PUBLIC_NAV_ITEMS,
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
  const [activeSheet, setActiveSheet] = useState(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const sheetTriggerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const desktopTriggerRefs = useRef(new Map());
  const suppressMenuReopenRef = useRef(null);

  const prefetchRoute = (href) => {
    if (href?.startsWith("/")) router.prefetch(href);
  };

  const routePreviewProps = (href) => ({
    onFocus: () => prefetchRoute(href),
    onMouseEnter: () => prefetchRoute(href),
  });

  const openSheet = (id, trigger) => {
    if (trigger) sheetTriggerRef.current = trigger;
    setActiveSheet(id);
  };

  const closeSheet = ({ returnFocus = false } = {}) => {
    setActiveSheet(null);
    if (!returnFocus) return;
    const trigger = sheetTriggerRef.current;
    window.setTimeout(() => trigger?.focus?.({ preventScroll: true }), 0);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setThemeReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveDesktopMenu(null);
      setActiveSheet(null);
      setHeaderHidden(false);
      suppressMenuReopenRef.current = null;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // The desktop menus open on hover and on focus, so Escape has to dismiss them
  // without moving the pointer (WCAG 1.4.13). Until this existed, an open panel
  // covering a third of the page could only be closed by mousing away from it.
  useEffect(() => {
    if (!activeDesktopMenu) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      const label = activeDesktopMenu;
      const trigger = desktopTriggerRefs.current.get(label);

      // Focus may be sitting on an option that is about to unmount, so pull it
      // back to the trigger first. That refocus would otherwise re-open the
      // menu through onFocusCapture below, hence the one-shot suppression flag.
      if (trigger?.parentElement?.contains(document.activeElement)) {
        suppressMenuReopenRef.current = label;
        trigger.focus({ preventScroll: true });
      }

      setActiveDesktopMenu(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeDesktopMenu]);

  // App-style auto-hide: the bar slides out of the way while reading and comes
  // back on the first upward scroll. It is a transform on a sticky element, so
  // the document never reflows and nothing shifts. Skipped entirely for
  // reduced-motion users, who keep a permanently visible bar.
  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduceMotion) return undefined;

    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY;
        if (Math.abs(delta) < 8) return;
        lastY = y;
        setHeaderHidden(y > 96 && delta > 0);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (isPublicShellHidden(pathname)) return null;

  const handleThemeSelect = (value) => {
    setThemeMode(value);
  };

  const hideHeader = headerHidden && !activeSheet;

  // The bar slides out of view on scroll but its controls stay in the tab
  // order, so a keyboard user could land on an invisible logo or menu button.
  // onFocusCapture below brings it back before focus lands.
  return (
    <>
      <header
        id="main-header"
        data-hydrated={themeReady ? "true" : "false"}
        onFocusCapture={() => setHeaderHidden(false)}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
        className={`sticky top-0 z-50 isolate border-b border-border bg-background/90 shadow-sm backdrop-blur-xl transition-transform duration-200 ease-out motion-reduce:transition-none xl:translate-y-0 ${
          hideHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto grid h-14 max-w-[var(--anslation-ds-container)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
          {/* The mark is only 32px tall, which left the home link short of a
              thumb target on a phone. `--anslation-ds-control-md` is the shared
              control height, and tokens.css already raises it to 44px under
              `pointer: coarse`, so the link grows on touch and keeps mouse
              density on a desktop — without resizing the logo itself. */}
          <Link
            href="/"
            prefetch={false}
            aria-label="AltFTool home"
            className="inline-flex h-[var(--anslation-ds-control-md)] min-w-fit items-center rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
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
                    if (suppressMenuReopenRef.current === item.label) {
                      suppressMenuReopenRef.current = null;
                      return;
                    }
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
                    ref={(node) => {
                      const refs = desktopTriggerRefs.current;
                      if (node) refs.set(item.label, node);
                      else refs.delete(item.label);
                    }}
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
            {/* Below `md` the thumb-reachable bottom bar owns search, so the
                corner icon would only be a second, harder-to-reach copy. */}
            <Link
              href="/search"
              prefetch={false}
              aria-label="Search AltFTool"
              title="Search"
              className="hidden h-[var(--anslation-ds-control-md)] w-[var(--anslation-ds-control-md)] items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none md:inline-flex"
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

            {/* Tablet-width trigger for the same sheet the bottom bar opens. */}
            <span className="hidden md:inline-flex xl:hidden">
              <IconButton
                ref={menuButtonRef}
                type="button"
                onClick={(event) =>
                  activeSheet === "more"
                    ? closeSheet()
                    : openSheet("more", event.currentTarget)
                }
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={activeSheet === "more"}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            </span>
          </div>
        </div>
      </header>

      <MobileNav
        activeSheet={activeSheet}
        onOpenSheet={openSheet}
        onCloseSheet={closeSheet}
      />
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton, SkeletonText } from "@altftool/ui";

import SettingsContent from "./components/SettingsContent";
import SettingsSidebar from "./components/SettingsSidebar";
import { UTILITY_TITLES } from "./components/UtilityPage";
import { ToastProvider } from "./components/ToastProvider";
import { usePlatform } from "./data/platformDetect";
import { getSettingsForPlatform, getFrequentlyUsed, getRecommended } from "./data/settingData";
import { usePagePreferences, useRecentlyUsed, useBookmarks } from "./data/preferences";
import { aiTools } from "./data/aiTools";
import { ALL_DEVICE_SETTINGS } from "./data/devices";
import { useAds } from "@/ads/AdsProvider";
import AdCard from "@/ads/layouts/settingsupport/AdCardSupport";
import "./supportsetting.css";

export default function SettingSupportPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adsSettled, setAdsSettled] = useState(false);
  const searchInputRef = useRef(null);

  const platformState = usePlatform();
  const { prefs, togglePref, updatePref, resetPrefs, ready: prefsReady } = usePagePreferences();
  const { recentlyUsedIds, markVisited, clearHistory } = useRecentlyUsed();
  const { bookmarkedIds, isBookmarked, toggleBookmark, clearBookmarks, ready: bookmarksReady } = useBookmarks();
  const ads = useAds({ placement: "settingsupport" });

  // True once real platform detection AND the persisted page preferences
  // have both loaded from the client. Before that, the initial render is
  // just a "windows" + default-prefs guess — showing a skeleton instead of
  // that guess avoids a flash of possibly-wrong content on mount.
  const pageReady = platformState.ready && prefsReady && bookmarksReady;

  const focusMode = prefs.focusMode;
  const sponsoredCollapsed = prefs.sponsoredCollapsed;

  const sidebarAds = useMemo(() => {
    if (!ads.length) return [];
    return ads.slice(0, 4);
  }, [ads]);
  const hasAds = sidebarAds.length > 0;

  useEffect(() => {
    if (hasAds) {
      setAdsSettled(true);
      return;
    }
    const timer = setTimeout(() => setAdsSettled(true), 2000);
    return () => clearTimeout(timer);
  }, [hasAds]);

  const allSettings = useMemo(
    () => getSettingsForPlatform(platformState.platform),
    [platformState.platform],
  );
  const frequentlyUsed = useMemo(
    () => getFrequentlyUsed(platformState.platform),
    [platformState.platform],
  );
  const recommended = useMemo(
    () => getRecommended(platformState.platform),
    [platformState.platform],
  );

  const recentlyUsedSettings = useMemo(() => {
    if (!prefs.rememberLastVisited) return [];
    return recentlyUsedIds
      .map((id) => allSettings.find((setting) => setting.id === id))
      .filter(Boolean);
  }, [recentlyUsedIds, allSettings, prefs.rememberLastVisited]);

  const bookmarkedSettings = useMemo(() => {
    const pool = [...allSettings, ...ALL_DEVICE_SETTINGS];
    return bookmarkedIds.map((id) => pool.find((s) => s.id === id)).filter(Boolean);
  }, [bookmarkedIds, allSettings]);

  // Same "resolve what's currently open" logic SettingsContent uses,
  // duplicated here (cheap pure lookups) purely so the browser tab title
  // effect below knows what's open without threading extra state back up
  // through props.
  const isUtility = typeof activeId === "string" && activeId.startsWith("util-");
  const isAiTool = typeof activeId === "string" && activeId.startsWith("ai-");
  const isDeviceLanding = typeof activeId === "string" && activeId.startsWith("device-");
  const activeOsSetting =
    !isUtility && !isAiTool && !isDeviceLanding && activeId ? allSettings.find((s) => s.id === activeId) : null;
  const activeDeviceSetting =
    !isUtility && !isAiTool && !isDeviceLanding && activeId && !activeOsSetting
      ? ALL_DEVICE_SETTINGS.find((s) => s.id === activeId)
      : null;
  const activeAiTool = isAiTool ? aiTools.find((t) => t.id === activeId) : null;

  // If the platform preview changes and the currently open OS setting
  // doesn't exist on the new platform, fall back to the landing page
  // instead of showing a blank/mismatched detail view. Utility pages, AI
  // Tools, device landing pages, and device guides aren't tied to the
  // current OS platform, so they're exempt from this check.
  useEffect(() => {
    if (!activeId || activeId.startsWith("util-") || activeId.startsWith("ai-") || activeId.startsWith("device-")) return;
    if (allSettings.some((setting) => setting.id === activeId)) return;
    if (ALL_DEVICE_SETTINGS.some((setting) => setting.id === activeId)) return;
    setActiveId(null);
  }, [allSettings, activeId]);

  // Jump to the top of the page on every navigation (opening a setting,
  // switching to another one via a "related" link, or heading back home) —
  // otherwise a visitor scrolled deep into a long article would land mid-
  // scroll on whatever opens next.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeId]);

  // Keep the browser tab title in sync with whatever's actually open, so
  // switching tabs or checking history shows something more useful than a
  // static "Support Settings" the whole time.
  useEffect(() => {
    const base = "Support Settings";
    let title = base;
    if (activeId?.startsWith("util-")) {
      title = `${UTILITY_TITLES[activeId] || "Help & Tools"} — ${base}`;
    } else if (activeAiTool) {
      title = `${activeAiTool.name} — ${base}`;
    } else if (activeOsSetting) {
      title = `${activeOsSetting.title} — ${base}`;
    } else if (activeDeviceSetting) {
      title = `${activeDeviceSetting.title} — ${base}`;
    }
    document.title = title;
  }, [activeId, activeAiTool, activeOsSetting, activeDeviceSetting]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  // "/" focuses the sidebar search, "Esc" clears it, "F" toggles Focus Mode
  // while a support page is open — the shortcuts the Keyboard Shortcuts
  // card promises, all wired to actually work.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      } else if ((event.key === "f" || event.key === "F") && !isTyping && activeId) {
        event.preventDefault();
        togglePref("focusMode");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, togglePref]);

  const handleOpenSidebar = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  const handleSelectSetting = (id) => {
    setActiveId(id);
    if (prefs.rememberLastVisited) markVisited(id);
    handleCloseSidebar();
  };

  const handleSelectUtility = (id) => {
    setActiveId(id);
    handleCloseSidebar();
  };

  const handleGoHome = () => setActiveId(null);
  const handleToggleFocusMode = () => togglePref("focusMode");
  const handleToggleSponsoredCollapse = () => togglePref("sponsoredCollapsed");

  const baseSidebarProps = {
    settings: allSettings,
    activeId,
    onSelect: handleSelectSetting,
    searchQuery,
    onSearchChange: setSearchQuery,
    platformState,
    aiTools,
  };

  // True whenever the sponsored rail isn't actually claiming its w-72 of
  // width — either the visitor collapsed it, or there's nothing to show
  // there at all (ads settled with none available). Either way the main
  // content should reclaim that freed space instead of leaving a dead gap
  // between the article and the right edge. Focus Mode already gets its
  // own (wider) expansion rule below, so it's excluded here to avoid the
  // two rules fighting each other.
  const railCollapsedOrEmpty = !focusMode && (sponsoredCollapsed || !(hasAds || !adsSettled));

  const shellClassName = [
    "support-setting-shell section flex flex-1 min-h-0 relative",
    focusMode ? "support-focus-mode" : "",
    railCollapsedOrEmpty ? "support-ads-collapsed" : "",
    prefs.highContrast ? "support-high-contrast" : "",
    prefs.reduceMotion ? "support-reduce-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!pageReady) {
    return (
      <div className="support-setting-page flex flex-col min-h-screen">
        <div className="support-setting-shell section flex flex-1 min-h-0 relative">
          <div className="hidden md:block md:w-72 shrink-0">
            <div className="support-setting-sticky sticky top-0 h-screen overflow-y-auto support-skeleton-sidebar">
              <Skeleton className="support-skeleton-line support-skeleton-title" />
              <Skeleton className="support-skeleton-line support-skeleton-pill" />
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="support-skeleton-line support-skeleton-row" />
              ))}
            </div>
          </div>

          <div className="support-setting-main-wrap flex flex-1 min-w-0">
            <main className="support-setting-main flex-1 min-w-0">
              <div className="support-settings-content-inner">
                <Skeleton className="support-skeleton-hero" />
                <SkeletonText lines={2} className="support-skeleton-text-block" />
                <div className="support-skeleton-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="support-skeleton-card" />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="support-setting-page flex flex-col min-h-screen">
        {/* Main Layout */}
        <div className={shellClassName}>
          {/* Sidebar for Desktop — sticky so it stays in view while content scrolls */}
          <div className="hidden md:block md:w-72 shrink-0">
            <div className="support-setting-sticky sticky top-0 h-screen overflow-y-auto">
              <SettingsSidebar
                {...baseSidebarProps}
                onClose={handleCloseSidebar}
                searchInputRef={searchInputRef}
              />
            </div>
          </div>

          {/* Sidebar for Mobile/Tablet - Slide in from left */}
          <div
            className={`
              md:hidden
              fixed inset-y-0 left-0 top-16 bottom-0 z-50 w-72
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            style={{ top: "62", paddingTop: "0" }}
          >
            <SettingsSidebar {...baseSidebarProps} onClose={handleCloseSidebar} />
          </div>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
              onClick={handleCloseSidebar}
              aria-hidden="true"
            />
          )}

          {/* Content - This container allows scrolling */}
          <div className="support-setting-main-wrap flex flex-1 min-w-0">
            {/* Main Content */}
            <main className="support-setting-main flex-1 min-w-0">
              <SettingsContent
                activeId={activeId}
                platformState={platformState}
                allSettings={allSettings}
                frequentlyUsed={frequentlyUsed}
                recommended={recommended}
                recentlyUsedSettings={recentlyUsedSettings}
                aiTools={aiTools}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                prefs={prefs}
                togglePref={togglePref}
                updatePref={updatePref}
                resetPrefs={resetPrefs}
                onSelectSetting={handleSelectSetting}
                onSelectUtility={handleSelectUtility}
                onVisit={markVisited}
                onOpenSidebar={handleOpenSidebar}
                onGoHome={handleGoHome}
                focusMode={focusMode}
                onToggleFocusMode={handleToggleFocusMode}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
                bookmarkedSettings={bookmarkedSettings}
                onClearBookmarks={bookmarkedIds.length ? clearBookmarks : undefined}
                onClearHistory={recentlyUsedIds.length ? clearHistory : undefined}
              />
            </main>

            {/* Sponsored (Desktop only) — hidden entirely in Focus Mode so
                the article can expand to the full available width. Only
                rendered once we know whether there are ads to show, or
                while we're still waiting to find out (skeleton), so the
                layout doesn't jump once ads resolve.

                Collapsing this rail animates its width down to 0 (not a
                small persistent strip) so the main column — a CSS grid
                track sized `minmax(0, 1fr)` — reclaims the *entire* freed
                width instead of leaving a dead gap the size of a mini
                sidebar. The re-expand control lives outside this column
                entirely (see the floating toggle below) so it never claims
                any layout width of its own, collapsed or not. */}
            {!focusMode && (hasAds || !adsSettled) && (
              <aside
                className={`support-setting-ads hidden lg:block shrink-0 pl-6 ${
                  sponsoredCollapsed ? "support-setting-ads-collapsed" : "w-72"
                }`}
                aria-hidden={sponsoredCollapsed}
              >
                <div className="support-setting-ads-stack sticky top-20 space-y-3 flex flex-col">
                  <div className="support-ads-panel-header">
                    <span className="support-ads-panel-label">Sponsored</span>
                  </div>
                  {hasAds
                    ? sidebarAds.map((ad, i) => <AdCard key={`support-ad-${i}`} ad={ad} />)
                    : Array.from({ length: 2 }).map((_, index) => (
                        <div key={`ad-skeleton-${index}`} className="support-setting-ad-skeleton" aria-hidden="true">
                          <Skeleton className="support-setting-ad-skeleton-media" />
                        </div>
                      ))}
                </div>
              </aside>
            )}
          </div>

          {/* Floating re-expand/collapse toggle for the Sponsored rail —
              positioned absolutely against the shell (not inside the grid
              row above), so it never reserves layout width of its own in
              either state. This is also why it sits in visually the same
              spot whether the rail is open or collapsed, instead of
              jumping around with the column it controls. */}
          {!focusMode && (hasAds || !adsSettled) && (
            <button
              type="button"
              className="support-ads-collapse-toggle support-ads-collapse-toggle-floating hidden lg:inline-flex"
              onClick={handleToggleSponsoredCollapse}
              aria-expanded={!sponsoredCollapsed}
              aria-label={sponsoredCollapsed ? "Expand sponsored panel" : "Collapse sponsored panel"}
            >
              {sponsoredCollapsed ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

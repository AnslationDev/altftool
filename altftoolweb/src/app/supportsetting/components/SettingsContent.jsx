"use client";

import { Menu, ChevronRight, Home, Maximize2, Minimize2 } from "lucide-react";
import HomeSearchBar from "./HomeSearchBar";
import SupportLandingPage from "./SupportLandingPage";
import SettingDetailPage from "./SettingDetailPage";
import UtilityPage, { UTILITY_TITLES } from "./UtilityPage";
import AiToolDetailPage from "./AiToolDetailPage";
import DeviceLandingPage from "./DeviceLandingPage";
import CategoryHubPage from "./CategoryHubPage";
import CompatibilityBanner from "./CompatibilityBanner";
import { getCategoryById } from "../data/categories";
import { getDeviceById } from "../data/deviceTaxonomy";
import { getSettingsForDevice, ALL_DEVICE_SETTINGS } from "../data/devices";
import { getSettingsForCategoryFromSettings, parseCategoryActiveId } from "../data/clientData";

const PLATFORM_LABEL = { windows: "Windows", macos: "macOS", android: "Android", ios: "iOS" };

/**
 * Slim orchestrator for the master-detail layout: exactly one "page" type
 * renders at a time, driven entirely by `activeId`:
 *
 *   activeId === null            -> landing page
 *   activeId starts "util-"      -> the matching Help & Tools page
 *   activeId starts "ai-"        -> the matching AI Tool page
 *   activeId starts "device-"    -> that device's landing/coming-soon page
 *   matches a device setting id  -> that device's guide (SettingDetailPage,
 *                                    reused as-is — same schema)
 *   otherwise                    -> that OS setting's full detail page
 *
 * Whenever activeId isn't the landing page, a shared breadcrumb + back-to-
 * home + Focus Mode bar renders above the page content, plus a
 * compatibility banner whenever the open guide doesn't match the platform
 * actually in use (item 3 — the "wrong platform" experience).
 */
const SettingsContent = ({
  activeId,
  platformState,
  allSettings,
  frequentlyUsed,
  recommended,
  recentlyUsedSettings,
  aiTools,
  wideSearchResults,
  searchQuery,
  onSearchChange,
  prefs,
  togglePref,
  updatePref,
  resetPrefs,
  onSelectSetting,
  onSelectUtility,
  onVisit,
  onOpenSidebar,
  onGoHome,
  searchInputRef,
  focusMode,
  onToggleFocusMode,
  isBookmarked,
  toggleBookmark,
  bookmarkedIds,
  bookmarkedSettings,
  onClearBookmarks,
  onClearHistory,
}) => {
  const { platform, detectedPlatform } = platformState;

  const isUtility = typeof activeId === "string" && activeId.startsWith("util-");
  const isAiTool = typeof activeId === "string" && activeId.startsWith("ai-");
  const isDeviceLanding = typeof activeId === "string" && activeId.startsWith("device-");
  const activeDeviceLanding = isDeviceLanding ? getDeviceById(activeId.slice("device-".length)) : null;

  const categoryRef = parseCategoryActiveId(activeId);
  const isCategoryHub = categoryRef !== null;
  const activeCategory = categoryRef ? getCategoryById(categoryRef.categoryId) : null;
  const categorySettings = categoryRef ? getSettingsForCategoryFromSettings(allSettings, categoryRef.categoryId) : [];

  const activeOsSetting =
    !isUtility && !isAiTool && !isDeviceLanding && !isCategoryHub && activeId
      ? allSettings.find((s) => s.id === activeId)
      : null;
  const activeDeviceSetting =
    !isUtility && !isAiTool && !isDeviceLanding && !isCategoryHub && activeId && !activeOsSetting
      ? ALL_DEVICE_SETTINGS.find((s) => s.id === activeId)
      : null;
  const activeSetting = activeOsSetting || activeDeviceSetting;
  const activeAiTool = isAiTool ? (aiTools || []).find((t) => t.id === activeId) : null;

  // Related-setting chips on a device guide should resolve against that
  // device's own catalog, not the current OS platform's.
  const relatedLookup = activeDeviceSetting ? ALL_DEVICE_SETTINGS : allSettings;

  let breadcrumb = null;
  if (activeOsSetting) {
    const category = getCategoryById(activeOsSetting.category);
    breadcrumb = { section: category?.label || "Settings", title: activeOsSetting.title };
  } else if (activeDeviceSetting) {
    const device = getDeviceById(activeDeviceSetting.platform);
    breadcrumb = { section: device?.name || "Devices", title: activeDeviceSetting.title };
  } else if (isUtility) {
    breadcrumb = { section: "Help & Tools", title: UTILITY_TITLES[activeId] || "Help & Tools" };
  } else if (activeAiTool) {
    breadcrumb = { section: "AI Tools", title: activeAiTool.name };
  } else if (activeDeviceLanding) {
    breadcrumb = { section: "Devices", title: activeDeviceLanding.name };
  } else if (activeCategory) {
    breadcrumb = { section: PLATFORM_LABEL[categoryRef.platform] || "Settings", title: activeCategory.label };
  }

  // Compatibility check (item 3): does the guide currently open match the
  // device actually in use? Only fires for content that's genuinely
  // platform-specific — device guides without a `requiresPlatform` list
  // (e.g. PlayStation, Android TV) work regardless of what OS you're on.
  let compatibility = null;
  if (activeOsSetting && activeOsSetting.platform !== detectedPlatform) {
    compatibility = { targetId: activeOsSetting.platform, targetLabel: PLATFORM_LABEL[activeOsSetting.platform] };
  } else if (activeDeviceSetting?.requiresPlatform && !activeDeviceSetting.requiresPlatform.includes(detectedPlatform)) {
    const preferred = activeDeviceSetting.requiresPlatform[0];
    compatibility = { targetId: preferred, targetLabel: PLATFORM_LABEL[preferred] || preferred };
  }

  const activeDeviceMeta = activeDeviceSetting ? getDeviceById(activeDeviceSetting.platform) : null;

  return (
    <div
      className={`support-settings-content support-text-${prefs.textSize} support-width-${prefs.readingWidth} support-linespacing-${prefs.lineSpacing}`}
    >
      <div className="support-settings-content-inner">
        {/* THE one persistent "Find a setting" search bar — rendered here,
            at the very top of the content pane, on every page including
            Home. Matches every native Settings app (Windows, macOS,
            Android, iOS): search lives in exactly one fixed top spot, never
            in the side nav and never only-on-some-pages. It shares the same
            searchQuery state the sidebar list filters against, so typing
            here filters the sidebar too. */}
        <div className="support-persistent-search">
          <HomeSearchBar
            ref={searchInputRef}
            settings={allSettings}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectSetting={onSelectSetting}
            platform={platform}
            onSwitchPlatform={platformState?.setOverride}
            wideSearchResults={wideSearchResults}
          />
        </div>

        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden my-5">
          <button onClick={onOpenSidebar} className="support-settings-mobile-toggle">
            <Menu className="h-4 w-4" />
            Explore Settings
          </button>
        </div>

        {activeId !== null && (
          <div className="support-page-nav">
            <div className="support-page-breadcrumb">
              <button type="button" className="support-page-breadcrumb-link" onClick={onGoHome}>
                <Home className="h-3.5 w-3.5" />
                Support Home
              </button>
              {breadcrumb && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 support-page-breadcrumb-sep" />
                  <span className="support-page-breadcrumb-link" style={{ cursor: "default" }}>
                    {breadcrumb.section}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 support-page-breadcrumb-sep" />
                  <span className="support-page-breadcrumb-current">{breadcrumb.title}</span>
                </>
              )}
            </div>

            <div className="support-page-nav-actions">
              <button type="button" className="support-page-back-btn" onClick={onGoHome}>
                <Home className="h-3.5 w-3.5" />
                Back to Support Home
              </button>
              <button
                type="button"
                className={`support-page-focus-btn ${focusMode ? "support-page-focus-btn-active" : ""}`}
                onClick={onToggleFocusMode}
                aria-pressed={focusMode}
              >
                {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {focusMode ? "Exit Focus Mode" : "Focus Mode"}
              </button>
            </div>
          </div>
        )}

        {compatibility && (
          <CompatibilityBanner
            targetLabel={compatibility.targetLabel}
            currentLabel={PLATFORM_LABEL[detectedPlatform] || detectedPlatform}
            officialDocsUrl={activeDeviceMeta?.officialDocsUrl || getDeviceById(compatibility.targetId)?.officialDocsUrl}
          />
        )}

        {activeSetting ? (
          <SettingDetailPage
            key={activeSetting.id}
            setting={activeSetting}
            detectedPlatform={detectedPlatform}
            allSettings={relatedLookup}
            onSelectSetting={onSelectSetting}
            onVisit={onVisit}
            showImages={prefs.showStepImages}
            isBookmarked={isBookmarked?.(activeSetting.id)}
            onToggleBookmark={() => toggleBookmark?.(activeSetting.id)}
          />
        ) : isUtility ? (
          <UtilityPage id={activeId} platform={platform} detectedPlatform={detectedPlatform} />
        ) : activeAiTool ? (
          <AiToolDetailPage
            key={activeAiTool.id}
            tool={activeAiTool}
            allTools={aiTools}
            onSelectTool={onSelectSetting}
          />
        ) : activeDeviceLanding ? (
          <DeviceLandingPage
            device={activeDeviceLanding}
            settings={getSettingsForDevice(activeDeviceLanding.id)}
            onSelectSetting={onSelectSetting}
            platformState={platformState}
            onGoHome={onGoHome}
          />
        ) : activeCategory ? (
          <CategoryHubPage
            category={activeCategory}
            settings={categorySettings}
            platform={categoryRef.platform}
            onSelectSetting={onSelectSetting}
          />
        ) : (
          <SupportLandingPage
            platform={platform}
            platformState={platformState}
            detectedPlatform={detectedPlatform}
            allSettings={allSettings}
            frequentlyUsed={frequentlyUsed}
            recommended={recommended}
            recentlyUsedSettings={recentlyUsedSettings}
            bookmarkedSettings={bookmarkedSettings}
                aiTools={aiTools}
                wideSearchResults={wideSearchResults}
                searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectSetting={onSelectSetting}
            onSelectUtility={onSelectUtility}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsContent;

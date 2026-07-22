"use client";

import { Menu, ChevronRight, Home, Maximize2, Minimize2 } from "lucide-react";
import PagePreferencesPanel from "./PagePreferencesPanel";
import SupportLandingPage from "./SupportLandingPage";
import SettingDetailPage from "./SettingDetailPage";
import UtilityPage, { UTILITY_TITLES } from "./UtilityPage";
import AiToolDetailPage from "./AiToolDetailPage";
import { getCategoryById } from "../data/categories";

/**
 * Slim orchestrator for the master-detail layout: exactly one of
 * SupportLandingPage / SettingDetailPage / UtilityPage / AiToolDetailPage
 * renders at a time, driven entirely by `activeId` (owned by SupportClient
 * so the sidebar and this content pane can both read/react to it).
 *
 *   activeId === null        -> landing page
 *   activeId starts "util-"  -> the matching Help & Tools page
 *   activeId starts "ai-"    -> the matching AI Tool page
 *   otherwise                -> that setting's full detail page
 *
 * Whenever activeId isn't the landing page, a shared breadcrumb + back-to-
 * home + Focus Mode bar renders above the page content so navigation is
 * identical across every support page type.
 */
const SettingsContent = ({
  activeId,
  platformState,
  allSettings,
  frequentlyUsed,
  recommended,
  recentlyUsedSettings,
  aiTools,
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
  focusMode,
  onToggleFocusMode,
}) => {
  const { platform, detectedPlatform } = platformState;

  const isUtility = typeof activeId === "string" && activeId.startsWith("util-");
  const isAiTool = typeof activeId === "string" && activeId.startsWith("ai-");
  const activeSetting =
    !isUtility && !isAiTool && activeId ? allSettings.find((s) => s.id === activeId) : null;
  const activeAiTool = isAiTool ? (aiTools || []).find((t) => t.id === activeId) : null;

  let breadcrumb = null;
  if (activeSetting) {
    const category = getCategoryById(activeSetting.category);
    breadcrumb = { section: category?.label || "Settings", title: activeSetting.title };
  } else if (isUtility) {
    breadcrumb = { section: "Help & Tools", title: UTILITY_TITLES[activeId] || "Help & Tools" };
  } else if (activeAiTool) {
    breadcrumb = { section: "AI Tools", title: activeAiTool.name };
  }

  return (
    <div className={`support-settings-content support-text-${prefs.textSize}`}>
      <div className="support-settings-content-inner">
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

        <PagePreferencesPanel
          prefs={prefs}
          togglePref={togglePref}
          updatePref={updatePref}
          resetPrefs={resetPrefs}
        />

        {activeSetting ? (
          <SettingDetailPage
            key={activeSetting.id}
            setting={activeSetting}
            detectedPlatform={detectedPlatform}
            allSettings={allSettings}
            onSelectSetting={onSelectSetting}
            onVisit={onVisit}
            showImages={prefs.showStepImages}
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
        ) : (
          <SupportLandingPage
            platform={platform}
            detectedPlatform={detectedPlatform}
            allSettings={allSettings}
            frequentlyUsed={frequentlyUsed}
            recommended={recommended}
            recentlyUsedSettings={recentlyUsedSettings}
            aiTools={aiTools}
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

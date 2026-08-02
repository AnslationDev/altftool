"use client";

import {
  RefreshCw,
  LifeBuoy,
  Cpu,
  MessageCircle,
  History,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import PlatformSwitcher from "./PlatformSwitcher";
import { categoryActiveId } from "../data/clientData";
import { getCategoryById } from "../data/categories";

// Every quick action below routes to a REAL setting/tool already authored
// for that platform — nothing here is a dead link or a generic
// "coming soon". Update the id here if the underlying data ever renames
// this setting.
const UPDATE_SETTING = { windows: "windows-update", macos: "macos-software-update", android: "android-system-update", ios: "ios-software-update" };

// Sample wallpaper thumbnails for the Home page "Personalize" gallery —
// static images shipped with the app (not a screenshot of the user's real
// current wallpaper, which we have no way to know), the same way native
// Settings' own "Browse more backgrounds" gallery shows a fixed set of
// sample images rather than nothing.
const PERSONALIZE_WALLPAPERS = [
  { src: "/images/supportsetting/personalize/tile-1-bloom.jpg", alt: "Blue and purple abstract bloom wallpaper" },
  { src: "/images/supportsetting/personalize/tile-2-sunset-mountains.jpg", alt: "Sunset mountain ridge wallpaper" },
  { src: "/images/supportsetting/personalize/tile-3-aurora.jpg", alt: "Aurora night sky wallpaper" },
  { src: "/images/supportsetting/personalize/tile-4-ocean-sunset.jpg", alt: "Ocean sunset wallpaper" },
  { src: "/images/supportsetting/personalize/tile-5-forest-ridge.jpg", alt: "Misty forest ridge wallpaper" },
  { src: "/images/supportsetting/personalize/tile-6-dark-glow.jpg", alt: "Dark mode abstract glow wallpaper" },
];

/**
 * The default view before any setting is selected — laid out as a native
 * Settings app "Home" page actually is: a short title (search itself now
 * lives once, persistently, at the top of the whole content pane — see
 * SettingsContent — not duplicated here), a premium platform/device picker
 * panel (moved here from the sidebar so switching what you're previewing
 * is a Home-page action, matching how native Settings apps don't bury
 * device identity in side nav either), then one compact two-column
 * dashboard of small, focused widget cards. "Recommended" and "Popular
 * Settings" anchor the main column; "Favorites", "Recent Activity" and
 * "Personalize" sit in the side column — matching how a real Home screen
 * keeps a couple of primary panels next to a couple of secondary ones,
 * with no long scroll of extra marketing-style sections underneath.
 */
const SupportLandingPage = ({
  platform,
  platformState,
  detectedPlatform,
  allSettings,
  frequentlyUsed,
  recentlyUsedSettings,
  bookmarkedSettings,
  onSelectSetting,
  onSelectUtility,
  aiTools,
}) => {
  const popularSettings = frequentlyUsed.slice(0, 4);
  const favoriteSettings = bookmarkedSettings || [];

  const QUICK_ACTIONS = [
    {
      icon: RefreshCw,
      title: "Check for Updates",
      description: "Go straight to your update settings.",
      categoryId: "system-updates",
      onClick: () => onSelectSetting(UPDATE_SETTING[platform]),
    },
    {
      icon: LifeBuoy,
      title: "Run Troubleshooter",
      description: "Fix common issues step by step.",
      categoryId: "troubleshooting-diagnostics",
      onClick: () => onSelectUtility("util-troubleshooting"),
    },
    {
      icon: Cpu,
      title: "View Device Information",
      description: "See detailed device & diagnostics.",
      categoryId: "system-info",
      onClick: () => onSelectUtility("util-device"),
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Reach our team or send feedback.",
      categoryId: "accounts-sync-family",
      onClick: () => onSelectUtility("util-contact"),
    },
  ];

  return (
    <div className="support-landing" aria-label="Support Settings home">
      <header className="support-landing-hero">
        <h2 className="support-hero-title">Home</h2>
      </header>

      {/* Premium platform/device picker — was buried as an icon row in the
          sidebar; now a proper Home-page panel with the full (non-compact)
          PlatformSwitcher: current platform, every other platform, Reset,
          and "More Devices". Nothing about how switching works changed —
          only where the control lives. */}
      <section className="support-landing-widget support-landing-platform-panel" aria-label="Choose a platform or device">
        <PlatformSwitcher
          platform={platformState.platform}
          detectedPlatform={platformState.detectedPlatform}
          isOverridden={platformState.isOverridden}
          onSelect={platformState.setOverride}
          onReset={platformState.clearOverride}
          onNavigateDevice={onSelectSetting}
          aiTools={aiTools}
        />
      </section>

      {/* One compact two-column widget dashboard — see the component doc
          comment above for why this replaced the old long single-column
          stack of big marketing-style cards plus extra sections below. */}
      <div className="support-landing-dashboard">
        <div className="support-landing-dashboard-main">
          <section className="support-landing-widget" aria-label="Recommended">
            <SectionHeader title="Recommended" description="Go-to settings and tools." />
            <div className="support-category-hub-list support-landing-widget-list">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                const actionColor = getCategoryById(action.categoryId)?.color;
                return (
                  <button
                    key={action.title}
                    type="button"
                    className="support-category-hub-row"
                    style={actionColor ? { "--category-accent": actionColor } : undefined}
                    onClick={action.onClick}
                  >
                    <span className="support-category-hub-row-icon" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="support-category-hub-row-text">
                      <span className="support-category-hub-row-title">{action.title}</span>
                      {action.description && (
                        <span className="support-category-hub-row-desc">{action.description}</span>
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4 support-category-hub-row-chevron" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          {popularSettings.length > 0 && (
            <section className="support-landing-widget" aria-label="Popular settings">
              <SectionHeader title="Popular Settings" description="The most commonly used settings for your device." />
              <div className="support-category-hub-list support-landing-widget-list">
                {popularSettings.map((setting) => {
                  const Icon = setting.icon;
                  const popularColor = getCategoryById(setting.category)?.color;
                  return (
                    <button
                      key={setting.id}
                      type="button"
                      className="support-category-hub-row"
                      style={popularColor ? { "--category-accent": popularColor } : undefined}
                      onClick={() => onSelectSetting(setting.id)}
                    >
                      <span className="support-category-hub-row-icon" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="support-category-hub-row-text">
                        <span className="support-category-hub-row-title">{setting.title}</span>
                        {setting.heading && <span className="support-category-hub-row-desc">{setting.heading}</span>}
                      </span>
                      <ChevronRight className="h-4 w-4 support-category-hub-row-chevron" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="support-landing-dashboard-side">
          {favoriteSettings.length > 0 && (
            <section className="support-landing-widget" aria-label="Favorite settings">
              <SectionHeader
                title="Favorite Settings"
                description="Settings you've starred for quick access."
                actions={<Star className="h-4 w-4 support-favorites-star" fill="currentColor" />}
              />
              <div className="support-category-hub-list support-landing-widget-list">
                {favoriteSettings.map((setting) => {
                  const Icon = setting.icon;
                  const favoriteColor = getCategoryById(setting.category)?.color;
                  return (
                    <button
                      key={setting.id}
                      type="button"
                      className="support-category-hub-row"
                      style={favoriteColor ? { "--category-accent": favoriteColor } : undefined}
                      onClick={() => onSelectSetting(setting.id)}
                    >
                      <span className="support-category-hub-row-icon" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="support-category-hub-row-text">
                        <span className="support-category-hub-row-title">{setting.title}</span>
                        {setting.heading && <span className="support-category-hub-row-desc">{setting.heading}</span>}
                      </span>
                      <Star className="h-3.5 w-3.5 support-favorite-card-badge" fill="currentColor" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="support-landing-widget" aria-label="Recent activity">
            <SectionHeader title="Recent Activity" description="Settings you've opened recently, for quick access." />
            {recentlyUsedSettings.length > 0 ? (
              <div className="support-pinned-chips support-landing-widget-list">
                {recentlyUsedSettings.map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <button
                      key={setting.id}
                      type="button"
                      className="support-pinned-chip support-pinned-chip-muted"
                      onClick={() => onSelectSetting(setting.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {setting.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="support-recent-empty support-landing-widget-list">
                <History className="h-5 w-5" aria-hidden="true" />
                <p>Nothing here yet.</p>
                <p className="support-recent-empty-sub">Settings you open will show up here for quick access next time.</p>
              </div>
            )}
          </section>

          {/* Personalize — real wallpaper-style thumbnail photos (not CSS
              swatches), matching the "Browse more backgrounds, colors, and
              themes" gallery every native Settings app shows. These are
              decorative sample wallpapers (not a screenshot of your actual
              current wallpaper, which we have no way to know) that link to
              the real Personalization category for this platform. */}
          <section className="support-landing-widget" aria-label="Personalize your device">
            <SectionHeader title="Personalize" description="Themes, wallpaper, and layout." />
            <div className="support-personalize-grid">
              {PERSONALIZE_WALLPAPERS.map((wallpaper) => (
                <button
                  key={wallpaper.src}
                  type="button"
                  className="support-personalize-tile"
                  onClick={() => onSelectSetting(categoryActiveId(platform, "personalization"))}
                  aria-label={`Open personalization settings — ${wallpaper.alt}`}
                >
                  <img
                    src={wallpaper.src}
                    alt={wallpaper.alt}
                    className="support-personalize-tile-img"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="support-personalize-more"
              onClick={() => onSelectSetting(categoryActiveId(platform, "personalization"))}
            >
              Browse personalization settings
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportLandingPage;

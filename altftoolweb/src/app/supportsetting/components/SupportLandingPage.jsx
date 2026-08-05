"use client";

import { ChevronRight } from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import PlatformSwitcher from "./PlatformSwitcher";
import { HowThisWorksChip } from "./AdaptiveExperience";
import SystemOverview from "./SystemOverview";
import { getCategoryById } from "../data/categories";

// Every quick action below routes to a REAL setting/tool already authored
// for that platform — nothing here is a dead link or a generic
// "coming soon". Update the id here if the underlying data ever renames
// this setting.
const UPDATE_SETTING = { windows: "windows-update", macos: "macos-software-update", android: "android-system-update", ios: "ios-software-update" };

// Same per-platform security setting ids already verified to exist for the
// "Secure Your Device" Helpful Tip below — reused here so
// SystemOverview's "Connection Security" tile has somewhere real to send
// a visitor who taps it.
const SECURITY_SETTING = {
  windows: "windows-security",
  macos: "macos-privacy-security-hub",
  android: "android-security-screen-lock",
  ios: "ios-sign-in-security",
};

// "Helpful Tips" — four evergreen habits worth a nudge on every platform,
// each pointing at a REAL, already-authored setting for whichever OS is
// currently active (never a hardcoded macOS-only or Windows-only page).
// The tip title/description here is deliberately generic, honest advice
// copy rather than a live "you're 3 days overdue for a backup" style status,
// which this app
// has no way to actually know. If a platform is ever added without a
// matching setting for one of these four, that tip simply won't render for
// it — see the `.filter(Boolean)` below — instead of linking somewhere
// wrong.
const HELPFUL_TIPS = [
  {
    key: "backup",
    title: "Back Up Your Files",
    description: "Keep a backup running so nothing important is ever one bad day away from gone.",
    settingIds: {
      windows: "windows-backup",
      macos: "macos-time-machine-backup",
      android: "android-backup-restore",
      ios: "ios-icloud-backup",
    },
  },
  {
    key: "security",
    title: "Secure Your Device",
    description: "Review your sign-in, lock screen, and privacy settings every so often.",
    settingIds: {
      windows: "windows-security",
      macos: "macos-privacy-security-hub",
      android: "android-security-screen-lock",
      ios: "ios-sign-in-security",
    },
  },
  {
    key: "storage",
    title: "Free Up Storage",
    description: "Clear out space when things start running low or downloads start failing.",
    settingIds: {
      windows: "windows-storage-sense",
      macos: "macos-storage-management",
      android: "android-storage-cleanup",
      ios: "ios-iphone-storage",
    },
  },
  {
    key: "battery",
    title: "Battery & Power",
    description: "Check battery health and power settings to get the most out of every charge.",
    settingIds: {
      windows: "power-sleep",
      macos: "macos-battery",
      android: "android-battery",
      ios: "ios-battery-health-troubleshoot",
    },
  },
];

/**
 * Purely decorative hero artwork — a filled brand-gradient panel (the same
 * `--support-primary` → `--support-secondary` gradient already used on
 * every CTA button across this app) with two SOLID, OPAQUE white icon
 * badges on top — a monitor glyph and a phone glyph, linked by a dashed
 * "synced" arc — not a sourced illustration image or photo.
 *
 * This replaces an earlier version of this same illustration that drew the
 * devices as translucent white line-art (10–50% opacity) directly on the
 * gradient. At this element's real on-page size (140–190px wide, 88px
 * tall — see `.support-landing-hero-illustration`) that low-opacity detail
 * was too faint to read clearly and looked unfinished/placeholder-ish
 * rather than like deliberate art. Solid white badges with a bold-stroke
 * brand-colored glyph inside (the same visual language as
 * `.support-platform-device-card-icon` elsewhere on this page) read clearly
 * at a glance instead.
 *
 * Deliberately TWO different device shapes (not one laptop) so the hero
 * itself visually says "this covers more than one system" — this page
 * spans Windows, macOS, Android and iOS, so no one silhouette is the
 * "right" one to show alone. Both stay generic rather than a specific
 * product for the same reason. Inline JSX rather than an
 * `<img src="...svg">` pointed at a static file for two reasons: an
 * `<img>`-loaded SVG renders in an isolated document that can't see this
 * page's CSS variables, so it would need hardcoded colors baked in and
 * would silently stop matching the app's theme (or a future dark mode) —
 * and this isn't a screenshot of any real device.
 *
 * Content is deliberately kept inside roughly the middle 55% of the 300×100
 * viewBox (x≈55–235) because `preserveAspectRatio="xMidYMid slice"` crops
 * the sides to fill whatever width `.support-landing-hero-illustration`
 * happens to be at a given viewport (that CSS class clamps between 140px
 * and 190px, both at a fixed 88px tall) — verified with a Playwright
 * screenshot at both extremes that nothing in the composition gets clipped.
 */
function HomeHeroIllustration({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 100"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-hero-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--support-primary)" />
          <stop offset="100%" stopColor="var(--support-secondary)" />
        </linearGradient>
        <linearGradient id="ss-hero-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary-foreground)" stopOpacity="0.16" />
          <stop offset="55%" stopColor="var(--primary-foreground)" stopOpacity="0" />
        </linearGradient>
        <filter id="ss-hero-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="var(--foreground)" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* the filled gradient panel itself, edge to edge */}
      <rect x="0" y="0" width="300" height="100" fill="url(#ss-hero-panel)" />
      {/* diagonal light sheen across the whole panel for depth */}
      <rect x="0" y="0" width="300" height="100" fill="url(#ss-hero-sheen)" />

      {/* soft light blobs for depth, same idea as the rest of the app's
          decorative gradient treatment */}
      <circle cx="255" cy="18" r="46" fill="var(--primary-foreground)" opacity="0.08" />
      <circle cx="40" cy="88" r="36" fill="var(--primary-foreground)" opacity="0.07" />

      {/* dashed arc linking the two devices — reads as "kept in sync
          across your devices", not a fabricated live status */}
      <path d="M122 34 Q152 12 182 36" stroke="var(--primary-foreground)" strokeOpacity="0.75" strokeWidth="2" strokeDasharray="3.5 5" fill="none" />

      {/* monitor badge — solid opaque white square with a bold monitor
          glyph in the brand primary color, not translucent line-art */}
      <g filter="url(#ss-hero-shadow)">
        <rect x="66" y="24" width="54" height="54" rx="15" fill="var(--surface)" />
        <rect x="80" y="37" width="26" height="18" rx="2.5" stroke="var(--support-primary)" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M89 59h8M93 55v4" stroke="var(--support-primary)" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* phone badge — distinctly different device shape from the monitor,
          deliberately, so the pair reads as "multiple devices" at a glance
          rather than one device drawn twice; secondary brand color so the
          two badges are also visually distinct from each other */}
      <g filter="url(#ss-hero-shadow)">
        <rect x="174" y="18" width="54" height="62" rx="15" fill="var(--surface)" />
        <rect x="189" y="29" width="24" height="38" rx="4.5" stroke="var(--support-secondary)" strokeWidth="2.6" />
        <circle cx="201" cy="62" r="1.8" fill="var(--support-secondary)" />
      </g>

      {/* status badge — a generic checkmark, not a fabricated live stat —
          tucked at the phone badge's bottom-right corner like a sync/status
          pill, echoed by the same checkmark motif on the active device card
          (see .support-platform-device-card-status-active) below it */}
      <g transform="translate(197 71)" filter="url(#ss-hero-shadow)">
        <circle cx="15" cy="15" r="15" fill="var(--surface)" />
        <path d="M8 15.3l4.5 4.5L23 9.5" stroke="var(--support-primary)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/**
 * The default view before any setting is selected, modeled directly on a
 * native OS "Settings & Support" home screen — and deliberately kept to
 * the same small handful of sections that reference has, not every
 * possible widget stacked on top of each other. Top to bottom: a compact
 * hero (title + subtitle + a brand-gradient illustration, with the
 * platform/device picker folded into the same card via a thin divider
 * rather than its own separately-bordered panel), a "System Overview" of
 * real browser-reported device info (see SystemOverview.jsx — the page's
 * former "Quick Actions" row of shortcut cards was removed as redundant
 * with SystemOverview's own Update Status/Connection Security action tiles
 * plus the sidebar), one merged "Popular Settings" list (frequently-used
 * settings topped up with anything from Recommended not already in that
 * list), and a closing "Helpful Tips" grid of four evergreen, real-setting
 * shortcuts (Back Up, Secure, Free Up Storage, Battery & Power) — see
 * HELPFUL_TIPS.
 *
 * This page used to also carry a six-card secondary dashboard (Popular
 * Settings + Recently Viewed + Popular AI Tools in one column, Recommended
 * + Favorites + Personalize in another) — every one of those was a real,
 * working destination, but stacking six separately-bordered cards under
 * the hero and System Overview read as a crowded feature showcase
 * rather than the clean, premium, single-screen home the reference design
 * has. That whole dashboard was collapsed down to the one merged "Popular
 * Settings" list above. AI tools and personalization remain in the sidebar;
 * bookmark and history data remains stored locally and manageable from
 * preferences, without a separate dashboard card on Home.
 *
 * SystemOverview shows only what the browser itself actually reports
 * (storage estimate, connection security, etc.) — never a fabricated
 * "Storage: 128 GB free" / battery% / serial-number style stat this app
 * has no real device API access to produce (see that component's own
 * docblock). Icons throughout intentionally stay one consistent
 * brand-teal treatment rather than a per-category rainbow — see the
 * "Deliberately NOT reading `--category-accent`" comment on
 * `.support-category-hub-row-icon` in the stylesheet for why that was
 * already tried and rejected for this page.
 */
const SupportLandingPage = ({
  platform,
  platformState,
  detectedPlatform,
  allSettings,
  frequentlyUsed,
  recommended,
  onSelectSetting,
  onSelectUtility,
  aiTools,
}) => {
  // "Popular Settings" below is frequently-used settings topped up with
  // anything from Recommended that isn't already in that list, deduped by
  // id and capped at 5 — one merged list instead of two separate cards.
  const popularSettings = frequentlyUsed.slice(0, 4);
  const popularIds = new Set(popularSettings.map((s) => s.id));
  const extraRecommended = (recommended || []).filter((s) => !popularIds.has(s.id)).slice(0, 2);
  const topSettings = [...popularSettings, ...extraRecommended].slice(0, 5);
  // Resolve each tip's per-platform setting id against the real settings
  // list — see the HELPFUL_TIPS comment above for why this looks up a
  // fresh setting per platform instead of using one fixed id.
  const helpfulTips = HELPFUL_TIPS
    .map((tip) => {
      const settingId = tip.settingIds[platform];
      const setting = settingId ? (allSettings || []).find((s) => s.id === settingId) : null;
      return setting ? { ...tip, setting } : null;
    })
    .filter(Boolean);

  return (
    <div className="support-landing" aria-label="Support Settings home">
      {/* One hero card carries the title/subtitle row AND the platform/
          device picker underneath it (was its own separately-bordered
          panel before — folding it in here removes an entire redundant
          card's worth of border/padding/shadow plus the extra gap between
          two stacked boxes). The picker itself still behaves exactly as
          before: current platform, every other platform, Reset, and "More
          Devices" — only where it visually lives changed. */}
      <header className="support-landing-hero">
        <div className="support-landing-hero-top">
          <div className="support-landing-hero-content">
            {/* Title + the "How this works" chip side by side — the chip
                opens a right-hand side sheet explaining how this page
                adapts per platform (see AdaptiveExperience.jsx). */}
            <div className="support-hero-title-row">
              <h1 className="support-hero-title">Support Settings</h1>
              <HowThisWorksChip />
            </div>
            <p className="support-landing-hero-subtitle">
              Find settings, troubleshooting guides, and clear help for your devices.
            </p>
          </div>
          <HomeHeroIllustration className="support-landing-hero-illustration" />
        </div>
        <div className="support-landing-hero-platform" aria-label="Choose a platform or device">
          <PlatformSwitcher
            platform={platformState.platform}
            detectedPlatform={platformState.detectedPlatform}
            isOverridden={platformState.isOverridden}
            onSelect={platformState.setOverride}
            onReset={platformState.clearOverride}
            onNavigateDevice={onSelectSetting}
            aiTools={aiTools}
          />
        </div>
      </header>

      {/* Everything below the picker (System Overview, Popular Settings,
          Helpful Tips) is entirely platform-specific — remounted (via
          `key={platform}`) and given a short fade/slide-in on every device
          switch, so picking a different card visibly refreshes the content
          underneath instead of it just silently jumping to new numbers/
          links. `.support-landing-platform-content` mirrors `.support-
          landing`'s own flex-column + gap (see supportsetting.css) so
          wrapping these three sections in one extra div doesn't change any
          spacing — purely an animation hook, no layout change. Respects
          both the OS-level prefers-reduced-motion media query and this
          app's own in-page "Reduce Motion" preference (see supportsetting.
          css's `.support-reduce-motion *` override), same as every other
          animation on this page. */}
      <div key={platform} className="support-landing-platform-content">
        {/* System Overview — kept to a compact handful of tiles (OS + version
            merged into one, storage estimate, connection security, update
            status) — every tile is either a real value the browser itself
            reports or a clearly-labeled action, never a fabricated
            "Storage: 128GB free" / serial-number style stat this app has no
            way to actually know (see SystemOverview.jsx's own docblock).
            Tiles for unsupported browser APIs are simply omitted rather than
            shown empty or faked. */}
        <SystemOverview
          platform={platform}
          updateSettingId={UPDATE_SETTING[platform]}
          securitySettingId={SECURITY_SETTING[platform]}
          onSelectSetting={onSelectSetting}
        />

        {/* One compact "Popular Settings" list — the most-used settings for
            this platform, topped up with anything else worth recommending
            that isn't already in that list. This replaces what used to be a
            six-card, two-column dashboard here (Popular Settings, Popular AI
            Tools, Recently Viewed, Recommended, Favorite Settings,
            Personalize) — every one of those was a real, working
            destination, but stacking six separately-bordered cards under an
            already-busy hero and System Overview read as a
            crowded feature showcase rather than a clean, premium native
            Settings Home screen. AI tools and preferences remain available
            from the sidebar; bookmark and history data remains local to this
            browser and can be cleared from preferences. */}
        {topSettings.length > 0 && (
          <section className="support-landing-widget" aria-label="Popular settings">
            <SectionHeader title="Popular Settings" description="The most useful settings for your device, all in one place." />
            <div className="support-category-hub-list support-landing-widget-list">
              {topSettings.map((setting) => {
                const Icon = setting.icon;
                const settingColor = getCategoryById(setting.category)?.color;
                return (
                  <button
                    key={setting.id}
                    type="button"
                    className="support-category-hub-row"
                    style={settingColor ? { "--category-accent": settingColor } : undefined}
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

        {/* Helpful Tips — same evergreen-habit idea a native Settings Home
            screen's "Tips" card has, but every card here routes to a real
            setting for the platform actually being browsed (see HELPFUL_TIPS
            above) instead of a generic marketing blurb. */}
        {helpfulTips.length > 0 && (
          <section className="support-landing-tips" aria-label="Helpful tips">
            <SectionHeader title="Helpful Tips" description="A few small habits that keep things running smoothly." />
            <div className="support-landing-tip-grid">
              {helpfulTips.map(({ key, title, description, setting }) => {
                const Icon = setting.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    className="support-landing-tip-card"
                    onClick={() => onSelectSetting(setting.id)}
                  >
                    <span className="support-landing-tip-icon" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="support-landing-tip-card-text">
                      <span className="support-landing-tip-card-title">{title}</span>
                      <p>{description}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SupportLandingPage;

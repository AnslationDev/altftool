"use client";

import { useEffect, useMemo, useRef } from "react";
import { X, LifeBuoy, HelpCircle, Cpu, MessageCircle, Layers, Home } from "lucide-react";
import { searchEverything } from "../data/search";
import { getCategoriesForPlatform, categoryActiveId } from "../data/settingData";

export const UTILITY_ITEMS = [
  { id: "util-faq", title: "FAQ & Help", icon: HelpCircle },
  { id: "util-device", title: "Device Info & Diagnostics", icon: Cpu },
  { id: "util-contact", title: "Contact & Feedback", icon: MessageCircle },
];

/** Wraps the first match of `query` inside `text` in a <mark> so live
 * search results show exactly what matched, not just that something did. */
function highlightMatch(text, query) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const index = lower.indexOf(query);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="support-search-highlight">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * Native-Settings-app-style navigation. Browsing an OS with no search
 * query active shows that platform's CATEGORIES (System, Bluetooth &
 * devices, Network & internet, ...) — the same top-level list a real
 * Windows/macOS/Android/iOS Settings app shows — instead of a flat dump of
 * every individual setting; picking one opens its CategoryHubPage, which
 * groups every setting in that category together (see
 * components/CategoryHubPage.jsx). Viewing a device (deviceContext set —
 * see SupportClient's deviceSidebarContext) or actively searching both
 * still show a flat list exactly as before: a query should surface
 * matching settings directly, not require picking a category first, and a
 * device's own guide list isn't large enough to need category grouping.
 * The active row is kept in view (smooth scroll) whenever selection
 * changes from elsewhere (e.g. a "related setting" link on the detail
 * page).
 */
const SettingsSidebar = ({
  settings,
  activeId,
  onSelect,
  onClose,
  searchQuery,
  platformState,
  aiTools,
  deviceContext,
  onGoHome,
}) => {
  const navRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  // Only needed for the default (no search, not viewing a device) view —
  // computed unconditionally since hooks can't be called behind an early
  // branch, but cheap (12 categories max, filtered from data already in
  // memory).
  const categories = useMemo(
    () => getCategoriesForPlatform(platformState.platform),
    [platformState.platform],
  );

  // A real Settings app keeps a category's row highlighted for as long as
  // you're anywhere inside it — including on one specific setting's own
  // page, not just the category hub itself. `settings` is the current
  // platform's full list either way, so this lookup stays cheap and never
  // needs its own effect/state.
  const activeSettingCategory = useMemo(
    () => settings.find((setting) => setting.id === activeId)?.category ?? null,
    [settings, activeId],
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredSettings = query
    ? settings.filter(
        (setting) =>
          setting.title.toLowerCase().includes(query) ||
          setting.description?.toLowerCase().includes(query),
      )
    : settings;

  const filteredAiTools = query
    ? (aiTools || []).filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.tagline?.toLowerCase().includes(query),
      )
    : aiTools || [];

  // Universal Search (item 6): when there's a query, also surface matches
  // from every other platform and from the expanded device catalog —
  // grouped below the current platform's own results rather than mixed in
  // above them, so the platform you're actually on always comes first.
  const wideResults = useMemo(
    () => (query ? searchEverything(query, { platform: platformState.platform }) : null),
    [query, platformState.platform],
  );
  const otherPlatformResults = wideResults?.otherPlatforms || [];
  const deviceResults = wideResults?.devices || [];

  const noResults =
    query &&
    filteredSettings.length === 0 &&
    filteredAiTools.length === 0 &&
    otherPlatformResults.length === 0 &&
    deviceResults.length === 0;

  const handleSelect = (id) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <aside className="support-settings-sidebar" aria-label="Settings navigation">
      <div className="support-settings-sidebar-header">
        <div className="support-settings-sidebar-title">
          <span className="support-settings-sidebar-title-icon" aria-hidden="true">
            <LifeBuoy className="h-4 w-4" />
          </span>
          <h2>Support Settings</h2>
        </div>
        <button onClick={onClose} className="support-settings-close" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Device context banner — while browsing a device's landing page or
          one of its guides, this is the one signal that unambiguously says
          "you're inside {Device}'s settings now" and the nav below is that
          device's own list, not the current OS platform's. Without it,
          switching from an OS to a device page reads as a silent context
          switch (the sidebar list changes, but nothing explains why). The
          exit control is a fast, obvious way back to the OS-based nav. */}
      {deviceContext && (
        <div className="support-sidebar-device-context" style={{ "--device-accent": deviceContext.color }}>
          <span className="support-sidebar-device-context-icon" aria-hidden="true">
            <deviceContext.icon className="h-4 w-4" />
          </span>
          <div className="support-sidebar-device-context-text">
            <p className="support-sidebar-device-context-eyebrow">Now viewing</p>
            <p className="support-sidebar-device-context-name">{deviceContext.name}</p>
          </div>
          <button
            type="button"
            className="support-sidebar-device-context-exit"
            onClick={onGoHome}
            aria-label="Exit device settings — back to Support Home"
            title="Back to Support Home"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <nav className="support-settings-nav" ref={navRef} aria-label="Individual settings">
        {noResults ? (
          <p className="support-sidebar-empty">No settings match "{searchQuery}".</p>
        ) : (
          <>
            {!query && deviceContext && (
              <p className="support-settings-nav-group-label support-settings-nav-group-label-with-badge">
                <deviceContext.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="support-settings-nav-group-label-text">{deviceContext.name} Settings</span>
                <span className="support-settings-nav-group-count">{filteredSettings.length}</span>
              </p>
            )}
            {!query && !deviceContext
              ? categories.map((category) => {
                  const Icon = category.icon;
                  const catId = categoryActiveId(platformState.platform, category.id);
                  const isActive = activeId === catId || activeSettingCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      ref={isActive ? activeRef : null}
                      onClick={() => handleSelect(catId)}
                      aria-current={isActive ? "page" : undefined}
                      className={`support-settings-nav-item support-settings-nav-item-category ${
                        isActive ? "support-settings-nav-item-active" : "support-settings-nav-item-idle"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{category.label}</span>
                    </button>
                  );
                })
              : filteredSettings.map((setting) => {
                  const Icon = setting.icon;
                  const isActive = activeId === setting.id;
                  return (
                    <button
                      key={setting.id}
                      ref={isActive ? activeRef : null}
                      onClick={() => handleSelect(setting.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`support-settings-nav-item ${
                        isActive ? "support-settings-nav-item-active" : "support-settings-nav-item-idle"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{highlightMatch(setting.title, query)}</span>
                    </button>
                  );
                })}
          </>
        )}

        {/* AI Tools — placed above Help & Tools, always visible (matches
            every OS platform) and included in live search results. */}
        {filteredAiTools.length > 0 && (
          <>
            <p className="support-settings-nav-group-label support-settings-nav-group-label-spaced support-settings-nav-group-label-with-badge">
              AI Tools
              <span className="support-new-badge">New</span>
            </p>
            {filteredAiTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeId === tool.id;
              return (
                <button
                  key={tool.id}
                  ref={isActive ? activeRef : null}
                  onClick={() => handleSelect(tool.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`support-settings-nav-item ${
                    isActive ? "support-settings-nav-item-active" : "support-settings-nav-item-idle"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{highlightMatch(tool.name, query)}</span>
                </button>
              );
            })}
          </>
        )}

        {query && deviceResults.length > 0 && (
          <>
            <p className="support-settings-nav-group-label support-settings-nav-group-label-spaced">
              Devices
            </p>
            {deviceResults.slice(0, 4).map((setting) => {
              const Icon = setting.icon;
              return (
                <button
                  key={setting.id}
                  onClick={() => handleSelect(setting.id)}
                  className="support-settings-nav-item support-settings-nav-item-idle"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{highlightMatch(setting.title, query)}</span>
                </button>
              );
            })}
          </>
        )}

        {query && otherPlatformResults.length > 0 && (
          <>
            <p className="support-settings-nav-group-label support-settings-nav-group-label-spaced">
              <Layers className="h-3 w-3 inline mr-1" />
              Other Platforms
            </p>
            {otherPlatformResults.map((group) => (
              <div key={group.platform} className="support-sidebar-other-platform-group">
                <p className="support-sidebar-other-platform-label">{group.label}</p>
                {group.results.slice(0, 3).map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <button
                      key={setting.id}
                      onClick={() => {
                        platformState.setOverride(group.platform);
                        handleSelect(setting.id);
                      }}
                      className="support-settings-nav-item support-settings-nav-item-idle support-settings-nav-item-crossplatform"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{highlightMatch(setting.title, query)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {!query && (
          <>
            <p className="support-settings-nav-group-label support-settings-nav-group-label-spaced">
              Help &amp; Tools
            </p>
            {UTILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  ref={isActive ? activeRef : null}
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`support-settings-nav-item ${
                    isActive ? "support-settings-nav-item-active" : "support-settings-nav-item-idle"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;

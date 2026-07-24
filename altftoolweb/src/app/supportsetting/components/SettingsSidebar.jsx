"use client";

import { useEffect, useRef } from "react";
import { X, LifeBuoy, HelpCircle, Cpu, MessageCircle } from "lucide-react";
import { SearchInput } from "@altftool/ui";
import PlatformSwitcher from "./PlatformSwitcher";

export const UTILITY_ITEMS = [
  { id: "util-troubleshooting", title: "Troubleshooting", icon: LifeBuoy },
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
 * Flat, OS-settings-style navigation: one row per setting, no grouping,
 * no accordions. Search filters the list live. The active row is kept in
 * view (smooth scroll) whenever selection changes from elsewhere (e.g. a
 * "related setting" link on the detail page).
 */
const SettingsSidebar = ({
  settings,
  activeId,
  onSelect,
  onClose,
  searchQuery,
  onSearchChange,
  platformState,
  searchInputRef,
  aiTools,
}) => {
  const navRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

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

  const noResults = query && filteredSettings.length === 0 && filteredAiTools.length === 0;

  const handleSelect = (id) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <aside className="support-settings-sidebar" aria-label="Settings navigation">
      <div className="support-settings-sidebar-header">
        <h2>Support Settings</h2>
        <button onClick={onClose} className="support-settings-close" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="support-sidebar-switcher">
        <PlatformSwitcher
          compact
          platform={platformState.platform}
          detectedPlatform={platformState.detectedPlatform}
          isOverridden={platformState.isOverridden}
          onSelect={platformState.setOverride}
          onReset={platformState.clearOverride}
        />
      </div>

      <div className="support-sidebar-search">
        <SearchInput
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
          placeholder="Search settings…"
          aria-label="Search settings"
        />
      </div>

      <nav className="support-settings-nav" ref={navRef} aria-label="Individual settings">
        {noResults ? (
          <p className="support-sidebar-empty">No settings match "{searchQuery}".</p>
        ) : (
          filteredSettings.map((setting) => {
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
          })
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

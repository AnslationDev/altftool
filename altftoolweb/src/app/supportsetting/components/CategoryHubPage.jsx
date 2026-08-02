"use client";

import { useMemo } from "react";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { getDeviceById } from "../data/deviceTaxonomy";
import { getCategoryById } from "../data/categories";

/**
 * A single row in the category hub's settings list — deliberately NOT a
 * card. Native Settings apps (Windows' "System" page, macOS' grouped
 * lists, Android/iOS settings) present a category's sub-settings as one
 * dense, divided list: icon, title, a SHORT one-line description,
 * chevron. That description is `setting.heading` — a short, hand-authored
 * tagline (e.g. "Manage Windows Updates") — not `setting.description`
 * (the long paragraph meant for the detail page, which wrapped/overflowed
 * here). No difficulty/read-time badges, no "Open" call-to-action, no
 * ranking — just the row, matching the reference platform screenshots.
 */
function CategoryHubRow({ setting, onSelectSetting }) {
  const SettingIcon = setting.icon;
  const categoryColor = getCategoryById(setting.category)?.color;
  return (
    <button
      type="button"
      className="support-category-hub-row"
      style={categoryColor ? { "--category-accent": categoryColor } : undefined}
      onClick={() => onSelectSetting(setting.id)}
    >
      <span className="support-category-hub-row-icon" aria-hidden="true">
        <SettingIcon className="h-5 w-5" />
      </span>
      <span className="support-category-hub-row-text">
        <span className="support-category-hub-row-title">{setting.title}</span>
        {setting.heading && <span className="support-category-hub-row-desc">{setting.heading}</span>}
      </span>
      <ChevronRight className="h-4 w-4 support-category-hub-row-chevron" aria-hidden="true" />
    </button>
  );
}

/**
 * The native-Settings-app-style "category hub" — what opens when a visitor
 * picks a category from the sidebar (e.g. "Bluetooth & devices") instead of
 * a single setting. Every real OS Settings app works this way: the category
 * is a page of its own, grouping every related setting together, rather
 * than each setting being an isolated, disconnected article. The hero
 * banner reuses the device-landing header visual language
 * (`.support-device-landing-*`), but the settings themselves render as a
 * single flat, divided list (`.support-category-hub-list`/`-row`) —
 * matching native Settings apps' own category sub-pages (e.g. Windows'
 * "System" list) instead of a card grid. Clicking a row still opens the
 * existing SettingDetailPage via `onSelectSetting`, unchanged.
 *
 * `platform` is passed through explicitly (not read from platformState)
 * because the category itself is embedded in the activeId
 * ("cat-{platform}-{categoryId}") — see data/settingData.js — so this
 * always renders the platform actually being browsed, even for a split
 * second before platformState finishes applying a deep-linked override.
 */
const CategoryHubPage = ({ category, settings, platform, onSelectSetting }) => {
  const safeSettings = useMemo(() => settings || [], [settings]);

  if (!category) return null;
  const Icon = category.icon;
  const platformDevice = getDeviceById(platform);

  return (
    <div
      className="support-device-landing support-category-hub"
      aria-label={category.label}
      style={{ "--device-accent": platformDevice?.color }}
    >
      <header className="support-utility-page-hero support-device-landing-hero">
        <span className="support-device-landing-icon" aria-hidden="true">
          <Icon className="h-7 w-7" />
        </span>
        <h2 className="support-hero-title">{category.label}</h2>
        <p className="support-hero-description">{category.description}</p>
        <div className="support-device-landing-meta">
          <span className="support-device-landing-meta-item">
            <LayoutGrid aria-hidden="true" />
            {safeSettings.length} {safeSettings.length === 1 ? "setting" : "settings"}
          </span>
        </div>
      </header>

      <section className="support-category-hub-list" aria-label={`${category.label} settings`}>
        {safeSettings.map((setting) => (
          <CategoryHubRow key={setting.id} setting={setting} onSelectSetting={onSelectSetting} />
        ))}
      </section>
    </div>
  );
};

export default CategoryHubPage;

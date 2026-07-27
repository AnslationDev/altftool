"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Clock, Wrench, ArrowRight, Sparkles, Gauge, LayoutGrid } from "lucide-react";
import { Button, Badge } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";
import { getGroupsWithDevices, getDevicesByGroup, estimateDifficulty, estimateReadingTime } from "../data/deviceTaxonomy";

// Category ids are shared with the OS settings catalog (e.g.
// "display-sound-notifications") but device guides don't carry a matching
// icon/label registry the way the OS sidebar does. Rather than duplicate
// that registry here, this turns the id into a readable heading directly —
// still gives the page real visual chunking instead of one flat list.
function formatCategoryLabel(categoryId) {
  if (!categoryId) return "General";
  return categoryId
    .split("-")
    .map((word) => (word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function GuideCard({ setting, onSelectSetting }) {
  const SettingIcon = setting.icon;
  const difficulty = estimateDifficulty(setting);
  const readingTime = estimateReadingTime(setting);
  return (
    <button
      type="button"
      className="support-card support-device-guide-card"
      onClick={() => onSelectSetting(setting.id)}
    >
      <div className="support-card-top">
        <span className="support-card-icon" aria-hidden="true">
          <SettingIcon className="h-5 w-5" />
        </span>
        <div className="support-card-heading">
          <h3 className="support-card-title">{setting.title}</h3>
        </div>
      </div>
      <p className="support-card-description support-card-description-clamp">{setting.description}</p>
      <div className="support-card-meta-row">
        <span className="support-card-meta-badge">
          <Gauge aria-hidden="true" /> {difficulty}
        </span>
        <span className="support-card-meta-badge">
          <Clock aria-hidden="true" /> {readingTime}
        </span>
      </div>
      <span className="support-device-guide-card-cta">
        Read guide <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

/**
 * The landing page for one entry in the expanded device taxonomy — either
 * a device with real authored guides (Apple Watch, PlayStation, Android TV,
 * AirPods today; more over time) or one that's fully wired into navigation
 * and search but doesn't have guides yet. Either way, this is never a dead
 * link or a page that silently doesn't exist — it's always an honest,
 * on-brand destination.
 */
const DeviceLandingPage = ({ device, settings, onSelectSetting, platformState, onGoHome }) => {
  const safeSettings = useMemo(() => settings || [], [settings]);
  const highlighted = useMemo(
    () => safeSettings.filter((s) => s.frequentlyUsed || s.recommended).slice(0, 3),
    [safeSettings]
  );
  const groupedByCategory = useMemo(() => {
    const groups = [];
    const index = new Map();
    safeSettings.forEach((setting) => {
      const key = setting.category || "general";
      if (!index.has(key)) {
        index.set(key, { key, label: formatCategoryLabel(key), items: [] });
        groups.push(index.get(key));
      }
      index.get(key).items.push(setting);
    });
    return groups;
  }, [safeSettings]);

  if (!device) return null;
  const Icon = device.icon;
  const hasGuides = safeSettings.length > 0;
  const showHighlight = hasGuides && safeSettings.length > 4 && highlighted.length > 0;
  const showCategoryHeadings = hasGuides && groupedByCategory.length > 1;

  const group = getGroupsWithDevices().find((g) => g.id === device.group);
  const siblings = getDevicesByGroup(device.group).filter((d) => d.id !== device.id);

  return (
    <div
      className="support-device-landing"
      aria-label={device.name}
      style={{ "--device-accent": device.color }}
    >
      <header className="support-utility-page-hero support-device-landing-hero">
        <p className="support-hero-eyebrow">{group?.label || "Devices"}</p>
        <span className="support-device-landing-icon" style={{ "--device-accent": device.color }} aria-hidden="true">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="support-hero-title">{device.name}</h1>
        {hasGuides ? (
          <div className="support-device-landing-meta">
            <span className="support-device-landing-meta-item">
              <LayoutGrid aria-hidden="true" />
              {safeSettings.length} {safeSettings.length === 1 ? "guide" : "guides"}
            </span>
            {device.officialDocsUrl && (
              <a
                href={device.officialDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="support-device-landing-meta-link"
              >
                Official {device.name} support <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ) : (
          <Badge tone="neutral" className="support-device-landing-badge">
            <Clock className="h-3 w-3" /> Guides coming soon
          </Badge>
        )}
      </header>

      {hasGuides ? (
        <section className="support-device-landing-guides" aria-label={`${device.name} guides`}>
          {showHighlight && (
            <div className="support-device-landing-highlight">
              <p className="support-device-landing-highlight-heading">
                <span className="support-device-landing-highlight-icon" aria-hidden="true">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                Most used for {device.name}
              </p>
              <div className="support-card-grid support-card-grid-compact">
                {highlighted.map((setting) => (
                  <GuideCard key={setting.id} setting={setting} onSelectSetting={onSelectSetting} />
                ))}
              </div>
            </div>
          )}

          {showCategoryHeadings ? (
            groupedByCategory.map((group) => (
              <div key={group.key} className="support-device-landing-category-section">
                <h2 className="support-device-landing-category-heading">
                  {group.label}
                  <span className="support-device-landing-category-count">
                    {group.items.length} {group.items.length === 1 ? "guide" : "guides"}
                  </span>
                </h2>
                <div className="support-card-grid">
                  {group.items.map((setting) => (
                    <GuideCard key={setting.id} setting={setting} onSelectSetting={onSelectSetting} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="support-card-grid" style={{ marginTop: showHighlight ? "1.75rem" : 0 }}>
              {safeSettings.map((setting) => (
                <GuideCard key={setting.id} setting={setting} onSelectSetting={onSelectSetting} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="support-device-comingsoon" aria-label="Guides coming soon">
          <p className="support-device-comingsoon-text">
            We haven&rsquo;t published AltFTool guides for {device.name} yet — this page is here so it&rsquo;s easy to
            find the moment we do. In the meantime, {device.name}&rsquo;s own official support is the most reliable
            source for setup and troubleshooting steps.
          </p>
          <div className="support-device-comingsoon-actions">
            {device.officialDocsUrl && (
              <a href={device.officialDocsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="support-detail-action-btn">
                  Open Official {device.name} Support
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
            <Link href={SITE_ROUTES.requestTool.href}>
              <Button variant="secondary" className="support-detail-action-btn">
                <Wrench className="h-4 w-4" />
                Request This Guide
              </Button>
            </Link>
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="support-device-landing-siblings" aria-label={`Other ${group?.label || "devices"}`}>
          <p className="support-prefs-group-label">More {group?.label}</p>
          <div className="support-devicemenu-grid support-device-landing-sibling-grid">
            {siblings.map((sibling) => {
              const SiblingIcon = sibling.icon;
              return (
                <button
                  key={sibling.id}
                  type="button"
                  className="support-devicemenu-item"
                  style={{ "--device-accent": sibling.color }}
                  onClick={() => {
                    if (sibling.isPrimaryOS && platformState) {
                      platformState.setOverride(sibling.id);
                      onGoHome?.();
                    } else {
                      onSelectSetting(`device-${sibling.id}`);
                    }
                  }}
                >
                  <span className="support-devicemenu-item-icon" aria-hidden="true">
                    <SiblingIcon className="h-4 w-4" />
                  </span>
                  <span className="support-devicemenu-item-label">{sibling.shortName}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default DeviceLandingPage;

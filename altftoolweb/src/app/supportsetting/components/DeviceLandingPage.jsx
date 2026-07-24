"use client";

import Link from "next/link";
import { ExternalLink, Clock, Wrench, ArrowRight } from "lucide-react";
import { Button, Badge } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";
import { getGroupsWithDevices, getDevicesByGroup } from "../data/deviceTaxonomy";

/**
 * The landing page for one entry in the expanded device taxonomy — either
 * a device with real authored guides (Apple Watch, PlayStation, Android TV,
 * AirPods today; more over time) or one that's fully wired into navigation
 * and search but doesn't have guides yet. Either way, this is never a dead
 * link or a page that silently doesn't exist — it's always an honest,
 * on-brand destination.
 */
const DeviceLandingPage = ({ device, settings, onSelectSetting, platformState, onGoHome }) => {
  if (!device) return null;
  const Icon = device.icon;
  const hasGuides = settings && settings.length > 0;

  const group = getGroupsWithDevices().find((g) => g.id === device.group);
  const siblings = getDevicesByGroup(device.group).filter((d) => d.id !== device.id);

  return (
    <div className="support-device-landing" aria-label={device.name}>
      <header className="support-utility-page-hero support-device-landing-hero">
        <p className="support-hero-eyebrow">{group?.label || "Devices"}</p>
        <span className="support-device-landing-icon" style={{ "--device-accent": device.color }} aria-hidden="true">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="support-hero-title">{device.name}</h1>
        {!hasGuides && (
          <Badge tone="neutral" className="support-device-landing-badge">
            <Clock className="h-3 w-3" /> Guides coming soon
          </Badge>
        )}
      </header>

      {hasGuides ? (
        <section className="support-device-landing-guides" aria-label={`${device.name} guides`}>
          <div className="support-card-grid">
            {settings.map((setting) => {
              const SettingIcon = setting.icon;
              return (
                <button
                  key={setting.id}
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
                  <p className="support-card-description">{setting.description}</p>
                  <span className="support-device-guide-card-cta">
                    Read guide <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
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

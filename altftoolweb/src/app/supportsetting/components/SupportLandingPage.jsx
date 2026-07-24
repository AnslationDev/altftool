"use client";

import {
  RefreshCw,
  LifeBuoy,
  Cpu,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  Gauge,
  HardDrive,
  CloudUpload,
  History,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import HomeSearchBar from "./HomeSearchBar";
import SystemOverview from "./SystemOverview";
import { UTILITY_ITEMS } from "./SettingsSidebar";

const PLATFORM_LABEL = {
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  ios: "iOS",
};

// Every quick action / guidance tip below routes to a REAL setting already
// authored for that platform — nothing here is a dead link or a generic
// "coming soon". Update the ids here if the underlying data ever renames
// one of these settings.
const UPDATE_SETTING = { windows: "windows-update", macos: "macos-software-update", android: "android-system-update", ios: "ios-software-update" };
const SECURITY_SETTING = { windows: "windows-security", macos: "macos-privacy-security-hub", android: "android-security-screen-lock", ios: "ios-privacy-permissions" };
const PERFORMANCE_SETTING = { windows: "windows-startup-apps", macos: "macos-login-items", android: "android-battery", ios: "ios-battery" };
const STORAGE_SETTING = { windows: "windows-storage-sense", macos: "macos-storage-management", android: "android-storage-cleanup", ios: "ios-iphone-storage" };
const BACKUP_SETTING = { windows: "windows-backup", macos: "macos-time-machine-backup", android: "android-backup-restore", ios: "ios-icloud-backup" };

const GUIDANCE = [
  {
    icon: RefreshCw,
    title: "Stay Updated",
    text: "Install updates soon after they're released — most security patches only protect you once they're actually installed.",
    settingMap: UPDATE_SETTING,
  },
  {
    icon: ShieldCheck,
    title: "Strengthen Security",
    text: "Review app permissions and your security settings regularly, especially right after installing something new.",
    settingMap: SECURITY_SETTING,
  },
  {
    icon: Gauge,
    title: "Boost Performance",
    text: "Too many startup items and background apps are the single most common cause of a device that feels slow.",
    settingMap: PERFORMANCE_SETTING,
  },
  {
    icon: HardDrive,
    title: "Manage Storage",
    text: "Running low on space slows everything down — clear out what you don't need before it becomes a real problem.",
    settingMap: STORAGE_SETTING,
  },
  {
    icon: CloudUpload,
    title: "Back Up Regularly",
    text: "A recent backup is the difference between a minor inconvenience and losing everything for good.",
    settingMap: BACKUP_SETTING,
  },
];

/**
 * The default view before any setting is selected — redesigned as a
 * premium support dashboard rather than a stack of generic cards. Every
 * section earns its place: a functional hero search, a handful of genuinely
 * useful quick actions, an honest live system snapshot, concise actionable
 * guidance, real recent-activity history (with a real empty state, never
 * placeholder data), a tightly-curated popular-settings row, and a support
 * discovery block that nudges people toward help they haven't found yet.
 */
const SupportLandingPage = ({
  platform,
  detectedPlatform,
  allSettings,
  frequentlyUsed,
  recommended,
  recentlyUsedSettings,
  searchQuery,
  onSearchChange,
  onSelectSetting,
  onSelectUtility,
  aiTools,
}) => {
  const platformLabel = PLATFORM_LABEL[platform];
  const popularSettings = frequentlyUsed.slice(0, 6);
  const suggestedTopics = recommended.slice(0, 3);

  const scrollToOverview = () => {
    document.getElementById("system-overview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const QUICK_ACTIONS = [
    {
      icon: RefreshCw,
      title: "Check for Updates",
      description: "Go straight to your update settings.",
      onClick: () => onSelectSetting(UPDATE_SETTING[platform]),
    },
    {
      icon: LifeBuoy,
      title: "Run Troubleshooter",
      description: "Fix common issues step by step.",
      onClick: () => onSelectUtility("util-troubleshooting"),
    },
    {
      icon: Cpu,
      title: "View Device Information",
      description: "See detailed device & diagnostics.",
      onClick: () => onSelectUtility("util-device"),
    },
    {
      icon: HeartPulse,
      title: "Open System Health",
      description: "Jump to your live system snapshot.",
      onClick: scrollToOverview,
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Reach our team or send feedback.",
      onClick: () => onSelectUtility("util-contact"),
    },
  ];

  return (
    <div className="support-landing" aria-label="Support Settings home">
      <header className="support-landing-hero">
        <p className="support-hero-eyebrow">Settings &amp; Support</p>
        <h1 className="support-hero-title">Support Settings</h1>
        <p className="support-hero-description">
          Your personal support center for {platformLabel} — search for anything, jump straight to a
          setting, or explore curated guidance built for the device you're actually using.
        </p>

        <HomeSearchBar
          settings={allSettings}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectSetting={onSelectSetting}
        />
      </header>

      <section className="support-quick-actions" aria-label="Quick actions">
        <div className="support-quick-actions-grid">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.title} type="button" className="support-quick-action-card" onClick={action.onClick}>
                <span className="support-quick-action-icon" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="support-quick-action-title">{action.title}</span>
                <span className="support-quick-action-desc">{action.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SystemOverview
        platform={platform}
        updateSettingId={UPDATE_SETTING[platform]}
        securitySettingId={SECURITY_SETTING[platform]}
        onSelectSetting={onSelectSetting}
      />

      <section className="support-guidance" aria-label="Helpful guidance">
        <SectionHeader title="Helpful Guidance" description="A few habits worth keeping up with." />
        <div className="support-guidance-grid">
          {GUIDANCE.map((tip) => {
            const Icon = tip.icon;
            return (
              <button
                key={tip.title}
                type="button"
                className="support-guidance-card"
                onClick={() => onSelectSetting(tip.settingMap[platform])}
              >
                <span className="support-guidance-icon" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="support-guidance-title">{tip.title}</span>
                <span className="support-guidance-text">{tip.text}</span>
                <span className="support-guidance-arrow" aria-hidden="true">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="support-recent" aria-label="Recent activity">
        <SectionHeader title="Recent Activity" description="Settings you've opened recently, for quick access." />
        {recentlyUsedSettings.length > 0 ? (
          <div className="support-pinned-chips">
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
          <div className="support-recent-empty">
            <History className="h-5 w-5" aria-hidden="true" />
            <p>Nothing here yet.</p>
            <p className="support-recent-empty-sub">Settings you open will show up here for quick access next time.</p>
          </div>
        )}
      </section>

      {popularSettings.length > 0 && (
        <section className="support-popular" aria-label="Popular settings">
          <SectionHeader title="Popular Settings" description="The most commonly used settings for your device." />
          <div className="support-popular-grid">
            {popularSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <button
                  key={setting.id}
                  type="button"
                  className="support-popular-card"
                  onClick={() => onSelectSetting(setting.id)}
                >
                  <span className="support-popular-icon" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="support-popular-title">{setting.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="support-discovery" aria-label="Support discovery">
        <div className="support-discovery-col">
          <SectionHeader
            title="Suggested Topics"
            description="A few things worth knowing about."
            actions={<Sparkles className="h-4 w-4 support-discovery-sparkle" />}
          />
          {suggestedTopics.length > 0 ? (
            <div className="support-discovery-list">
              {suggestedTopics.map((setting) => {
                const Icon = setting.icon;
                return (
                  <button
                    key={setting.id}
                    type="button"
                    className="support-discovery-item"
                    onClick={() => onSelectSetting(setting.id)}
                  >
                    <span className="support-discovery-item-icon" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="support-discovery-item-text">
                      <span className="support-discovery-item-title">{setting.title}</span>
                      <span className="support-discovery-item-desc">{setting.heading}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="support-discovery-empty">No suggestions available right now.</p>
          )}
        </div>

        <div className="support-discovery-col">
          <SectionHeader
            title="Explore Support Tools"
            description="Frequently accessed help, tools & AI assistants."
          />
          <div className="support-discovery-tools">
            {UTILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="support-discovery-tool"
                  onClick={() => onSelectUtility(item.id)}
                >
                  <span className="support-discovery-tool-icon" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="support-discovery-tool-label">{item.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 support-discovery-tool-arrow" />
                </button>
              );
            })}
          </div>

          {aiTools?.length > 0 && (
            <>
              <p className="support-discovery-subtitle">AI Tools</p>
              <div className="support-discovery-tools">
                {aiTools.slice(0, 4).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      className="support-discovery-tool"
                      onClick={() => onSelectSetting(tool.id)}
                    >
                      <span className="support-discovery-tool-icon support-discovery-tool-icon-ai" aria-hidden="true">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="support-discovery-tool-label">{tool.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 support-discovery-tool-arrow" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SupportLandingPage;

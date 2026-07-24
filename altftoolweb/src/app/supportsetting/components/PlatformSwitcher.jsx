"use client";

import { Monitor, Laptop, Bot, Smartphone, RotateCcw, Check } from "lucide-react";
import DeviceMegaMenu from "./DeviceMegaMenu";

const PLATFORM_META = {
  windows: { label: "Windows", icon: Monitor },
  macos: { label: "macOS", icon: Laptop },
  android: { label: "Android", icon: Bot },
  ios: { label: "iOS", icon: Smartphone },
};

const ORDER = ["windows", "macos", "android", "ios"];

/**
 * The redesigned OS/device selector. The old version was icon-only, so
 * nobody could tell Windows from macOS without hovering — every pill here
 * always shows its logo AND its name, the active platform gets an explicit
 * "Currently Selected" state (not just a subtle highlight), and "More
 * Devices" opens the full scalable taxonomy (Computers/Phones/Tablets/
 * Watches/TVs/Gaming/Accessories/AI Tools) without ever needing this
 * component to change shape as new devices are added.
 *
 * `compact` renders a denser variant for the sidebar — smaller pills, no
 * intro sentence — but still always shows icon + label; compact never
 * means icon-only again.
 */
const PlatformSwitcher = ({
  platform,
  detectedPlatform,
  isOverridden,
  onSelect,
  onReset,
  onNavigateDevice,
  aiTools = [],
  compact = false,
}) => {
  const handleMegaSelect = (id, meta) => {
    if (meta?.kind === "os") onSelect(id);
    else if (meta?.kind === "device") onNavigateDevice?.(`device-${id}`);
    else onNavigateDevice?.(id);
  };

  return (
    <div className={`support-platform-switcher ${compact ? "support-platform-switcher-compact" : ""}`}>
      {!compact && (
        <div className="support-platform-switcher-label">
          {isOverridden ? (
            <span>
              Previewing <strong>{PLATFORM_META[platform].label}</strong> settings
            </span>
          ) : (
            <span>
              Showing settings for your device: <strong>{PLATFORM_META[platform].label}</strong>
            </span>
          )}
        </div>
      )}

      <div className="support-platform-switcher-row">
        <div className="support-platform-switcher-pills" role="group" aria-label="Choose a platform">
          {ORDER.map((key) => {
            const meta = PLATFORM_META[key];
            const Icon = meta.icon;
            const isActive = key === platform;
            return (
              <button
                key={key}
                type="button"
                className={`support-platform-pill ${compact ? "support-platform-pill-compact" : ""} ${
                  isActive ? "support-platform-pill-active" : ""
                }`}
                onClick={() => onSelect(key)}
                aria-pressed={isActive}
              >
                <span className="support-platform-pill-icon" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="support-platform-pill-label">{meta.label}</span>
                {isActive ? (
                  <span className="support-platform-pill-current">
                    <Check className="h-3 w-3" />
                    {!compact && "Currently Selected"}
                  </span>
                ) : (
                  key === detectedPlatform && <span className="support-platform-pill-tag">Detected</span>
                )}
              </button>
            );
          })}

          {isOverridden && (
            <button
              type="button"
              title={compact ? "Reset to my device" : undefined}
              className={`support-platform-pill-reset ${compact ? "support-platform-pill-reset-compact" : ""}`}
              onClick={onReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {!compact && "Reset to my device"}
            </button>
          )}
        </div>

        <DeviceMegaMenu activeDeviceId={platform} onSelectDevice={handleMegaSelect} />
      </div>
    </div>
  );
};

export default PlatformSwitcher;

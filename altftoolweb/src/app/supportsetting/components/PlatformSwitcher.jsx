"use client";

import { Monitor, Laptop, Bot, Smartphone, RotateCcw } from "lucide-react";

const PLATFORM_META = {
  windows: { label: "Windows", icon: Monitor },
  macos: { label: "macOS", icon: Laptop },
  android: { label: "Android", icon: Bot },
  ios: { label: "iOS", icon: Smartphone },
};

const ORDER = ["windows", "macos", "android", "ios"];

/**
 * Shows which OS's Support Settings are currently displayed, and lets
 * anyone preview a different one. Auto-detection still runs underneath —
 * this only changes what's *displayed*, and is clearly labeled as a
 * preview whenever it differs from the real detected platform.
 *
 * `compact` renders a smaller, icon-first variant meant for the sidebar
 * (no label sentence, shorter pills, a small dot instead of a "Detected"
 * tag) so it fits comfortably above the search box.
 */
const PlatformSwitcher = ({
  platform,
  detectedPlatform,
  isOverridden,
  onSelect,
  onReset,
  compact = false,
}) => {
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

      <div className="support-platform-switcher-pills" role="group" aria-label="Preview a different platform">
        {ORDER.map((key) => {
          const meta = PLATFORM_META[key];
          const Icon = meta.icon;
          const isActive = key === platform;
          return (
            <button
              key={key}
              type="button"
              title={compact ? meta.label : undefined}
              className={`support-platform-pill ${compact ? "support-platform-pill-compact" : ""} ${
                isActive ? "support-platform-pill-active" : ""
              }`}
              onClick={() => onSelect(key)}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              {!compact && meta.label}
              {key === detectedPlatform && !compact && (
                <span className="support-platform-pill-tag">Detected</span>
              )}
              {key === detectedPlatform && compact && (
                <span className="support-platform-pill-dot" aria-hidden="true" />
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
    </div>
  );
};

export default PlatformSwitcher;

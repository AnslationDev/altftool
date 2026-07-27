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
 * The OS/device selector. Full (non-compact) rendering always shows every
 * platform's logo AND name, with an explicit "Currently Selected" state —
 * unchanged from before, though nothing currently mounts it non-compact.
 *
 * `compact` (the sidebar variant) fits Windows/macOS/Android/iOS in a
 * single horizontal row instead of wrapping into a cramped 2x2 grid: the
 * ACTIVE platform still gets a full icon+label pill (so it's always
 * unambiguous which device you're viewing), while the other three collapse
 * to small icon-only circular buttons with a tooltip/aria-label carrying
 * the name and, on the currently-detected platform, a small dot indicator
 * (reusing the .support-platform-pill-dot treatment).
 *
 * "More Devices" deliberately does NOT share that row. An icon-only button
 * squeezed in alongside the platform pills was two problems at once: it
 * made the row's fit razor-thin (any extra item — Reset, a longer locale
 * string — tipped it into an ugly accidental wrap), and a bare 4-square
 * icon with no visible text isn't something a first-time visitor can be
 * expected to decode. Giving it its own labeled row below fixes both: the
 * platform row now has comfortable margin regardless of how many icons it
 * holds, and "More Devices" says what it does.
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
        <div
          className={`support-platform-switcher-pills ${compact ? "support-platform-switcher-pills-compact" : ""}`}
          role="group"
          aria-label="Choose a platform"
        >
          {ORDER.map((key) => {
            const meta = PLATFORM_META[key];
            const Icon = meta.icon;
            const isActive = key === platform;
            const isDetected = key === detectedPlatform;

            // Compact + inactive: icon-only circular button. The name is
            // still available via title/aria-label, and a small dot marks
            // the auto-detected platform — same signal as the full pill's
            // "Detected" tag, just space-efficient. Compact + active, and
            // the entire non-compact path, are unchanged from before.
            if (compact && !isActive) {
              return (
                <button
                  key={key}
                  type="button"
                  className="support-platform-pill support-platform-pill-icononly"
                  onClick={() => onSelect(key)}
                  aria-pressed={isActive}
                  aria-label={meta.label}
                  title={isDetected ? `${meta.label} (detected on your device)` : meta.label}
                >
                  <span className="support-platform-pill-icon" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  {isDetected && <span className="support-platform-pill-dot" aria-hidden="true" />}
                </button>
              );
            }

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
                  // Compact + active already reads as "selected" from the
                  // filled gradient pill alone — the explicit checkmark
                  // badge is only rendered in the full (non-compact) layout,
                  // where it also carries the "Currently Selected" text.
                  // Dropping it in compact mode isn't just cosmetic: it's
                  // the width this row needs to keep every platform +
                  // Reset + More Devices on one line without clipping.
                  !compact && (
                    <span className="support-platform-pill-current">
                      <Check className="h-3 w-3" />
                      Currently Selected
                    </span>
                  )
                ) : (
                  isDetected && <span className="support-platform-pill-tag">Detected</span>
                )}
              </button>
            );
          })}

          {isOverridden && (
            // Icon-only in both modes — the RotateCcw glyph plus the
            // "Reset to my device" title/aria-label tooltip already say
            // what this does without needing a permanent text label taking
            // up row space next to 4 platform pills + More Devices.
            <button
              type="button"
              title="Reset to my device"
              aria-label="Reset to my device"
              className={`support-platform-pill-reset support-platform-pill-reset-icononly ${compact ? "support-platform-pill-reset-compact" : ""}`}
              onClick={onReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {!compact && <DeviceMegaMenu activeDeviceId={platform} onSelectDevice={handleMegaSelect} compact={compact} />}
        </div>
      </div>

      {compact && (
        <div className="support-platform-switcher-more">
          <DeviceMegaMenu activeDeviceId={platform} onSelectDevice={handleMegaSelect} compact={compact} />
        </div>
      )}
    </div>
  );
};

export default PlatformSwitcher;

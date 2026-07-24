"use client";

import { useEffect, useState } from "react";
import { RotateCcw, MonitorSmartphone } from "lucide-react";
import { detectVersion } from "../data/detectVersion";
import { getDeviceById } from "../data/deviceTaxonomy";

const PLATFORM_LABEL = { windows: "Windows", macos: "macOS", android: "Android", ios: "iOS" };

/**
 * "Current Device" — the dashboard-style hero tile the home page redesign
 * asked for (e.g. shows "Windows 11", "macOS Sonoma", "Android 15"). The
 * version string is read directly from the browser's user agent, same
 * honest source SystemOverview already uses — never guessed.
 *
 * Laid out top-to-bottom (icon+reset row, then label+value) with
 * `justify-content: space-between` so the card fills the height it's
 * stretched to (matching the quick-actions grid beside it) intentionally,
 * instead of leaving a slab of dead space below a short middle row.
 */
const CurrentDeviceCard = ({ platformState }) => {
  const [version, setVersion] = useState(null);
  const { platform, isOverridden, clearOverride } = platformState;
  const device = getDeviceById(platform);
  const Icon = device?.icon || MonitorSmartphone;

  useEffect(() => {
    setVersion(detectVersion(platform));
  }, [platform]);

  return (
    <div className="support-current-device" style={{ "--device-accent": device?.color }}>
      <div className="support-current-device-top">
        <span className="support-current-device-icon" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        {isOverridden && (
          <button type="button" className="support-current-device-reset" onClick={clearOverride}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
      <div className="support-current-device-copy">
        <p className="support-current-device-label">{isOverridden ? "Previewing" : "Your Device"}</p>
        <p className="support-current-device-value">{version || `${PLATFORM_LABEL[platform]} (detecting…)`}</p>
      </div>
    </div>
  );
};

export default CurrentDeviceCard;

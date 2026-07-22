"use client";

import { useEffect, useState } from "react";
import { RefreshCw, HardDrive, Cpu, BatteryFull, ShieldCheck, ShieldAlert, Monitor } from "lucide-react";
import { SectionHeader } from "@altftool/ui";

const PLATFORM_LABEL = {
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  ios: "iOS",
};

// Best-effort OS version parse from the user agent string. This is exactly
// what a browser will actually report — never fabricated — so it can come
// back "Unknown" on browsers that deliberately reduce user-agent detail
// (Chrome's UA reduction, privacy-focused browsers, etc.), and that's
// shown honestly rather than guessed.
function detectVersion(platform) {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";

  if (platform === "windows") {
    const m = ua.match(/Windows NT (\d+\.\d+)/);
    if (!m) return "Unknown";
    const map = { "10.0": "Windows 10 / 11", "6.3": "Windows 8.1", "6.2": "Windows 8", "6.1": "Windows 7" };
    return map[m[1]] || `Windows NT ${m[1]}`;
  }
  if (platform === "macos") {
    const m = ua.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/);
    return m ? `macOS ${m[1].replace(/_/g, ".")}` : "Unknown";
  }
  if (platform === "android") {
    const m = ua.match(/Android (\d+(?:\.\d+)?)/);
    return m ? `Android ${m[1]}` : "Unknown";
  }
  if (platform === "ios") {
    const m = ua.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
    return m ? `iOS ${m[1].replace(/_/g, ".")}` : "Unknown";
  }
  return "Unknown";
}

function formatBytes(bytes) {
  if (bytes == null) return null;
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

/**
 * A compact, honest "System Overview" dashboard — every tile is either a
 * real value the browser actually reports (storage estimate, device memory
 * hint, battery level, connection security) or a clearly-framed action
 * (Update Status), never a fabricated stat. Tiles for APIs a browser
 * doesn't support (deviceMemory/battery are Chromium-only) are simply
 * omitted instead of showing a fake or empty value.
 */
const SystemOverview = ({ platform, updateSettingId, securitySettingId, onSelectSetting }) => {
  const [storage, setStorage] = useState(null); // { usage, quota } | "unsupported" | null(loading)
  const [memoryGb, setMemoryGb] = useState(null); // number | "unsupported"
  const [battery, setBattery] = useState(null); // { level, charging } | "unsupported"
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    setSecure(typeof location !== "undefined" ? location.protocol === "https:" : true);

    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((est) => setStorage({ usage: est.usage, quota: est.quota }))
        .catch(() => setStorage("unsupported"));
    } else {
      setStorage("unsupported");
    }

    if (typeof navigator !== "undefined" && typeof navigator.deviceMemory === "number") {
      setMemoryGb(navigator.deviceMemory);
    } else {
      setMemoryGb("unsupported");
    }

    if (typeof navigator !== "undefined" && navigator.getBattery) {
      navigator
        .getBattery()
        .then((b) => {
          const update = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging });
          update();
          b.addEventListener("levelchange", update);
          b.addEventListener("chargingchange", update);
        })
        .catch(() => setBattery("unsupported"));
    } else {
      setBattery("unsupported");
    }
  }, []);

  const storagePct =
    storage && storage !== "unsupported" && storage.quota
      ? Math.min(100, Math.round((storage.usage / storage.quota) * 100))
      : null;

  return (
    <section className="support-overview" id="system-overview" aria-label="System overview">
      <SectionHeader
        title="System Overview"
        description="A quick, honest snapshot of this device — pulled directly from your browser."
      />

      <div className="support-overview-grid">
        <div className="support-overview-tile">
          <span className="support-overview-tile-icon" aria-hidden="true">
            <Monitor className="h-4 w-4" />
          </span>
          <div className="support-overview-tile-body">
            <p className="support-overview-tile-label">Operating System</p>
            <p className="support-overview-tile-value">{PLATFORM_LABEL[platform]}</p>
          </div>
        </div>

        <div className="support-overview-tile">
          <span className="support-overview-tile-icon" aria-hidden="true">
            <Cpu className="h-4 w-4" />
          </span>
          <div className="support-overview-tile-body">
            <p className="support-overview-tile-label">Version</p>
            <p className="support-overview-tile-value">{detectVersion(platform) || "Detecting…"}</p>
          </div>
        </div>

        <button
          type="button"
          className="support-overview-tile support-overview-tile-action"
          onClick={() => onSelectSetting(updateSettingId)}
        >
          <span className="support-overview-tile-icon" aria-hidden="true">
            <RefreshCw className="h-4 w-4" />
          </span>
          <div className="support-overview-tile-body">
            <p className="support-overview-tile-label">Update Status</p>
            <p className="support-overview-tile-value support-overview-tile-value-sm">Not checked yet — tap to check</p>
          </div>
        </button>

        <button
          type="button"
          className="support-overview-tile support-overview-tile-action"
          onClick={() => onSelectSetting(securitySettingId)}
        >
          <span className="support-overview-tile-icon" aria-hidden="true">
            {secure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          </span>
          <div className="support-overview-tile-body">
            <p className="support-overview-tile-label">Connection Security</p>
            <p className={`support-overview-tile-value support-overview-tile-value-sm ${secure ? "support-overview-value-good" : "support-overview-value-warn"}`}>
              {secure ? "Secure (HTTPS)" : "Not secure"}
            </p>
          </div>
        </button>

        {storage && storage !== "unsupported" && storage.quota > 0 && (
          <div className="support-overview-tile support-overview-tile-wide">
            <span className="support-overview-tile-icon" aria-hidden="true">
              <HardDrive className="h-4 w-4" />
            </span>
            <div className="support-overview-tile-body">
              <p className="support-overview-tile-label">Browser Storage</p>
              <p className="support-overview-tile-value support-overview-tile-value-sm">
                {formatBytes(storage.usage)} used of {formatBytes(storage.quota)} available
              </p>
              <div className="support-overview-bar">
                <div className="support-overview-bar-fill" style={{ width: `${storagePct}%` }} />
              </div>
            </div>
          </div>
        )}

        {typeof memoryGb === "number" && (
          <div className="support-overview-tile">
            <span className="support-overview-tile-icon" aria-hidden="true">
              <Cpu className="h-4 w-4" />
            </span>
            <div className="support-overview-tile-body">
              <p className="support-overview-tile-label">Memory (approx.)</p>
              <p className="support-overview-tile-value">~{memoryGb} GB</p>
            </div>
          </div>
        )}

        {battery && battery !== "unsupported" && (
          <div className="support-overview-tile">
            <span className="support-overview-tile-icon" aria-hidden="true">
              <BatteryFull className="h-4 w-4" />
            </span>
            <div className="support-overview-tile-body">
              <p className="support-overview-tile-label">Battery</p>
              <p className="support-overview-tile-value">
                {battery.level}%{battery.charging ? " · Charging" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SystemOverview;

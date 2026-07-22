"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { SectionHeader, StatCard } from "@altftool/ui";

function readDeviceInfo() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;

  const conn =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return {
    browser: (() => {
      const ua = navigator.userAgent;
      if (/Edg\//.test(ua)) return "Microsoft Edge";
      if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
      if (/Firefox\//.test(ua)) return "Firefox";
      if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
      return "Unknown browser";
    })(),
    screen: `${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio}x`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    language: navigator.language || "—",
    online: navigator.onLine,
    connectionType: conn?.effectiveType ? conn.effectiveType.toUpperCase() : "—",
  };
}

/**
 * Real, in-browser device info (not fabricated). Refreshes on resize/
 * online-offline changes so it stays accurate while the panel is open.
 */
const DeviceInfoPanel = ({ platformLabel }) => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const update = () => setInfo(readDeviceInfo());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <section className="support-utility-section" aria-label="Device information">
      <SectionHeader
        title="Device Information"
        description="Live details read directly from your current browser session."
      />
      <div className="support-stat-grid">
        <StatCard label="Platform (detected)" value={platformLabel} loading={!info} />
        <StatCard label="Browser" value={info?.browser} loading={!info} />
        <StatCard label="Screen resolution" value={info?.screen} loading={!info} />
        <StatCard label="Viewport size" value={info?.viewport} loading={!info} />
        <StatCard label="Language" value={info?.language} loading={!info} />
        <StatCard
          label="Connection"
          value={info ? (info.online ? "Online" : "Offline") : undefined}
          hint={info?.connectionType && info.connectionType !== "—" ? `Type: ${info.connectionType}` : undefined}
          deltaTone={info?.online ? "positive" : "negative"}
          loading={!info}
          icon={<Info className="h-4 w-4" />}
        />
      </div>
    </section>
  );
};

export default DeviceInfoPanel;

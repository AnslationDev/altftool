"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InfoRow } from "../ui/InfoRow";

export function DeviceInfo({ device, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] border-l-4
                    border-l-violet-500 rounded-2xl shadow-sm
                    transition-all duration-300 ease-out">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl transition-colors duration-200"
        onClick={() => setIsOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20
                         flex items-center justify-center text-lg shrink-0">
            💻
          </div>

          <div>
            <p className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Device Information
            </p>
            {!isOpen && !loading && device && (
              <p className="text-xs text-violet-400 font-secondary font-medium mt-0.5">
                {device.platform || "Unknown"} · {device.cpuCores !== "Unknown" ? `${device.cpuCores} cores` : "Cores hidden"}
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-28 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && device && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-secondary
                             text-violet-400 bg-violet-500/10 border-violet-500/20">
              {device.hasTouch ? "Touch" : "Desktop"}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted-foreground)]
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* ── Expandable Content ── */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5">

          <div className="h-px bg-[var(--border)] mb-4" />

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5,6,7].map((i) => (
                <div key={i} className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
              ))}
            </div>

          ) : (
            <div>
              <InfoRow label="Platform / OS"  value={device?.platform} highlight />
              <InfoRow
                label="CPU Cores"
                value={device?.cpuCores !== "Unknown"
                  ? `${device?.cpuCores} logical cores`
                  : "Unknown (privacy protected)"}
              />
              <InfoRow
                label="Device Memory"
                value={device?.deviceMemory !== "Unknown"
                  ? device?.deviceMemory
                  : "Unknown (Firefox/Safari)"}
              />
              <InfoRow
                label="Touch Support"
                value={device?.hasTouch
                  ? `Yes — ${device?.touchPoints} touch point${device?.touchPoints > 1 ? "s" : ""}`
                  : "No — Mouse/trackpad only"}
              />
              <InfoRow
                label="Pixel Ratio"
                value={`${device?.pixelRatio}x${device?.pixelRatio >= 2 ? " (Retina / HiDPI)" : " (Standard)"}`}
              />

              {device?.networkInfo ? (
                <>
                  <InfoRow label="Connection Type" value={device.networkInfo.effectiveType?.toUpperCase() || "Unknown"} />
                  <InfoRow label="Downlink Speed"  value={device.networkInfo.downlink ? `${device.networkInfo.downlink} Mbps` : "N/A"} />
                  <InfoRow label="Latency (RTT)"   value={device.networkInfo.rtt ? `${device.networkInfo.rtt}ms` : "N/A"} />
                  <InfoRow label="Data Saver Mode" value={device.networkInfo.saveData ? "On" : "Off"} />
                </>
              ) : (
                <InfoRow label="Network Info" value="Not available (Firefox/Safari)" />
              )}

              {device?.battery ? (
                <InfoRow
                  label="Battery"
                  value={`${device.battery.level}% ${device.battery.charging ? "⚡ Charging" : "🔋 Discharging"}`}
                />
              ) : (
                <InfoRow label="Battery" value="Restricted (privacy protection)" />
              )}

              <div className="mt-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                  ⚠️ Chrome rounds device memory to the nearest power of 2 (0.25, 0.5, 1, 2, 4, 8 GB)
                  and Safari caps CPU cores at 8 — both do this intentionally for privacy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

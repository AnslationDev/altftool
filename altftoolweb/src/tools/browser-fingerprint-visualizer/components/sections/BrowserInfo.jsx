"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InfoRow } from "../ui/InfoRow";

export function BrowserInfo({ browser, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] border-l-4
                    border-l-[var(--primary)] rounded-2xl shadow-sm
                    transition-all duration-300 ease-out">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl transition-colors duration-200"
        onClick={() => setIsOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20
                         flex items-center justify-center text-lg shrink-0">
            🌐
          </div>

          <div>
            <p className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Browser Information
            </p>
            {!isOpen && !loading && browser && (
              <p className="text-xs text-[var(--primary)] font-secondary font-medium mt-0.5">
                {browser.browserName || "Unknown"} · {browser.timezone || "Unknown TZ"}
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-28 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && browser?.isWebdriver && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-secondary
                             text-red-400 bg-red-500/10 border-red-500/20">
              🤖 Bot
            </span>
          )}
          {!loading && !browser?.isWebdriver && browser && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-secondary
                             text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20">
              {browser.language || "Unknown"}
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
                      ${isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5">

          <div className="h-px bg-[var(--border)] mb-4" />

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
              ))}
            </div>

          ) : (
            <div>
              <InfoRow label="Browser"      value={browser?.browserName} highlight />
              <InfoRow label="Vendor"       value={browser?.vendor || "Unknown"} />
              <InfoRow label="Language"     value={browser?.language} />
              <InfoRow label="All Languages" value={browser?.languages?.join(", ")} truncate />
              <InfoRow label="Timezone"     value={browser?.timezone} />
              <InfoRow
                label="UTC Offset"
                value={browser?.timezoneOffset != null
                  ? `UTC${browser.timezoneOffset <= 0 ? "+" : ""}${-(browser.timezoneOffset / 60)}`
                  : "N/A"}
              />
              <InfoRow
                label="Cookies"
                value={browser?.cookiesEnabled ? "Enabled" : "Disabled"}
                status={browser?.cookiesEnabled}
              />
              <InfoRow label="Do Not Track"          value={browser?.doNotTrack} />
              <InfoRow label="Global Privacy Control" value={browser?.globalPrivacyControl} />
              <InfoRow label="PDF Viewer"            value={browser?.pdfViewerEnabled ? "Yes" : "No"} />
              <InfoRow
                label="Plugins"
                value={browser?.plugins?.length
                  ? `${browser.plugins.length} detected`
                  : "None / Hidden"}
              />
              <InfoRow
                label="Automation"
                value={browser?.isWebdriver ? "⚠️ Webdriver detected" : "Not automated"}
              />

              {/* User Agent */}
              <div className="pt-3 mt-1">
                <p className="text-[10px] text-[var(--muted-foreground)] font-secondary mb-1.5">
                  Full User Agent String
                </p>
                <div
                  className="p-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)]
                             cursor-pointer hover:border-[var(--primary)]/30 transition-colors"
                  onClick={() => navigator.clipboard?.writeText(browser?.userAgent)}
                  title="Click to copy"
                >
                  <p className="text-[10px] font-mono text-[var(--card-foreground)] break-all leading-relaxed">
                    {browser?.userAgent}
                  </p>
                </div>
              </div>

              {/* DNT irony note */}
              {browser?.doNotTrack === "Enabled" && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-[11px] text-yellow-400 font-secondary leading-relaxed">
                    ⚠️ Irony: Enabling Do Not Track makes you slightly more unique
                    and trackable, since very few users have it enabled (~7%).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

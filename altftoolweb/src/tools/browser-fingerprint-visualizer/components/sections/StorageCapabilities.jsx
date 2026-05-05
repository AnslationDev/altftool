"use client";

import { useState } from "react";
import { Card } from "../ui/Card";
import { InfoRow } from "../ui/InfoRow";
import { StatusDot } from "../ui/Badge";

export function StorageCapabilities({ storage, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  const storageItems = storage
    ? [
        {
          label: "localStorage",
          available: storage.localStorage,
          icon: "💾",
          description: "Persists after tab close",
        },
        {
          label: "sessionStorage",
          available: storage.sessionStorage,
          icon: "⏱️",
          description: "Clears on tab close",
        },
        {
          label: "IndexedDB",
          available: storage.indexedDB,
          icon: "🗄️",
          description: "Advanced database storage",
        },
        {
          label: "Cookies",
          available: storage.cookies,
          icon: "🍪",
          description: "Traditional tracking method",
        },
        {
          label: "Cache API",
          available: storage.cacheAPI,
          icon: "⚡",
          description: "Service worker cache",
        },
      ]
    : [];

  //
  const enabledCount = storageItems.filter((i) => i.available).length;

  return (
    <Card hoverable={false}>
      {/* ─ Header — always visible, click to toggle ─ */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl bg-[var(--primary)]/10
                         border border-[var(--primary)]/20
                         flex items-center justify-center text-lg flex-shrink-0"
          >
            💾
          </div>

          {/* Title + quick summary when collapsed */}
          <div>
            <h3 className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Storage Capabilities
            </h3>

            {!isOpen && !loading && storage && (
              <p className="text-xs text-[var(--primary)] font-secondary font-medium mt-0.5">
                {enabledCount}/{storageItems.length} storage types enabled
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-32 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Right: status badge + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!loading && storage && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-secondary
              ${
                enabledCount === storageItems.length
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : enabledCount > 2
                    ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                    : "text-green-400 bg-green-500/10 border-green-500/20"
              }`}
            >
              {enabledCount === storageItems.length
                ? "All Enabled"
                : enabledCount > 2
                  ? "Partial"
                  : "Restricted"}
            </span>
          )}

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* ─ Expandable Content ─ */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
      >
        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-4" />

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-[var(--muted)] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div>
            {/* Storage items list */}
            <div className="grid grid-cols-1 gap-2 mb-3">
              {storageItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5
                             rounded-xl bg-[var(--muted)] border border-[var(--border)]
                             hover:border-[var(--primary)]/20 transition-colors duration-150"
                >
                  {/* Left: icon + label */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--card-foreground)] font-secondary">
                        {item.label}
                      </p>
                      <p className="text-[9px] text-[var(--muted-foreground)] font-secondary">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: status dot + text */}
                  <div className="flex items-center gap-1.5">
                    <StatusDot available={item.available} />
                    <span
                      className={`text-xs font-medium font-secondary
                      ${item.available ? "text-green-400" : "text-red-400"}`}
                    >
                      {item.available ? "Enabled" : "Blocked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Storage quota */}
            {storage?.storageQuota && (
              <InfoRow
                label="Storage Quota"
                value={`${storage.storageQuota.usage} MB used / ${storage.storageQuota.quota} MB total`}
              />
            )}

            {/* Incognito note */}
            <div className="mt-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <p className="text-[11px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                🕶️ Private/Incognito mode detection: In incognito, some browsers
                limit localStorage quota or block IndexedDB. A very small
                storage quota (often under 120 MB) can indicate private browsing
                mode.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

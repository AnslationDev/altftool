"use client";

import { User, Layers, Tag, CalendarClock, Monitor, Key, FileCheck2, Shield } from "lucide-react";

function formatRenderableValue(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  // Handle Firestore Timestamp object { seconds, nanoseconds }
  if (typeof val === "object" && typeof val.seconds === "number") {
    try {
      return new Date(val.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return fallback;
    }
  }
  // Handle Firestore Timestamp instance with toDate()
  if (typeof val === "object" && typeof val.toDate === "function") {
    try {
      return val.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return fallback;
    }
  }
  // Handle standard Date instance
  if (val instanceof Date) {
    return val.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return fallback;
}

export default function ExtensionSidebar({ extension }) {
  const metadataItems = [
    {
      label: "Developer",
      value: formatRenderableValue(extension?.developer),
      icon: User,
    },
    {
      label: "Version",
      value: formatRenderableValue(extension?.version),
      icon: Layers,
      isMono: true,
    },
    {
      label: "Category",
      value: formatRenderableValue(extension?.category, "Utility"),
      icon: Tag,
    },
    {
      label: "Updated",
      value: formatRenderableValue(extension?.updatedAt || extension?.updated, "Recently updated"),
      icon: CalendarClock,
    },
    {
      label: "Platform",
      value: formatRenderableValue(extension?.platform, "Chrome / Chromium Browser"),
      icon: Monitor,
    },
    {
      label: "License",
      value: formatRenderableValue(extension?.license),
      icon: FileCheck2,
    },
  ].filter((item) => item.value);

  const permissions = extension?.permissions && Array.isArray(extension.permissions) && extension.permissions.length > 0
    ? extension.permissions
    : [];

  return (
    <aside className="sticky top-20 md:top-24 space-y-6">
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md shadow-black/5">
        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--primary)]" />
          <span>Extension Metadata</span>
        </h3>

        <div className="space-y-4">
          {metadataItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5 border-b border-[var(--border)] border-dashed last:border-0 last:pb-0 text-sm"
              >
                <div className="flex items-center text-[var(--muted-foreground)] gap-2 min-w-0">
                  <IconComp className="w-4 h-4 shrink-0 text-[var(--primary)]/70" />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`font-semibold text-[var(--foreground)] text-right truncate pl-2 ${
                    item.isMono ? "font-mono text-xs bg-[var(--muted)] px-2 py-0.5 rounded-md" : ""
                  }`}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Permissions Pill list */}
        {permissions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
              <Key className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Permissions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((perm, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs font-mono rounded-md bg-[var(--muted)]/70 text-[var(--foreground)] border border-[var(--border)]"
                >
                  {typeof perm === "string" ? perm : formatRenderableValue(perm, "permission")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

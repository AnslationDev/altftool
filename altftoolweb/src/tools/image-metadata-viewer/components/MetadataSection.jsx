"use client";

import {
  ChevronDown,
  ChevronRight,
  Camera,
  Aperture,
  MapPin,
  Calendar,
  Monitor,
  Info,
} from "lucide-react";

const SECTION_ICONS = {
  Camera: Camera,
  Exposure: Aperture,
  GPS: MapPin,
  Dates: Calendar,
  "Software": Monitor,
  "File Info": Info,
};

export default function MetadataSection({
  title,
  icon,
  rows,
  isExpanded,
  onToggle,
  searchQuery,
  accentColor,
}) {
  const Icon = SECTION_ICONS[title] || Info;

  const filteredRows = searchQuery
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(r.value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rows;

  if (filteredRows.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-[var(--muted)]/50"
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            accentColor || "bg-[var(--muted)]"
          }`}
        >
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <span className="flex-1 text-sm font-semibold text-[var(--foreground)]">
          {title}
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted-foreground)]">
          {filteredRows.length}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--border)]">
          <div className="divide-y divide-[var(--border)]">
            {filteredRows.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="flex items-start justify-between gap-4 px-5 py-3"
              >
                <span className="shrink-0 text-xs font-semibold text-[var(--muted-foreground)]">
                  {row.name}
                </span>
                <span className="break-all text-right font-mono text-xs text-[var(--foreground)]">
                  {String(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

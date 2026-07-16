"use client";

import { useMemo } from "react";
import { ChevronRight, Loader2, Inbox } from "lucide-react";
import { breadcrumb, dayLabel, formatClock, kindMeta, timeAgo } from "./helpers";

function EventRow({ ev, onSelect }) {
  const meta = kindMeta(ev.actionKind);
  const Icon = meta.icon;
  const crumbs = breadcrumb(ev);
  return (
    <button
      type="button"
      onClick={() => onSelect(ev)}
      className="flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-[var(--border)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
    >
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${meta.tone} 14%, transparent)`, color: meta.tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
              <span className={i === 0 ? "text-[var(--foreground)]" : ""}>{c}</span>
            </span>
          ))}
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
          {ev.summary || ev.action || meta.label}
        </p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
          {meta.label}
          {ev.actorEmail ? <> · by <span className="font-medium text-[var(--foreground)]">{ev.actorEmail}</span></> : null}
          {ev.entityName ? <> · {ev.entityName}</> : null}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium text-[var(--muted)]">{formatClock(ev.createdAtMs)}</p>
        <p className="text-[10px] text-[var(--muted)]">{timeAgo(ev.createdAtMs)}</p>
      </div>
    </button>
  );
}

export default function ActivityTimeline({ events, loading, hasMore, onLoadMore, loadingMore, onSelectEvent }) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const key = dayLabel(ev.createdAtMs);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return [...map.entries()];
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="grid place-items-center gap-2 py-16 text-center">
        <Inbox className="h-7 w-7 text-[var(--muted)]" />
        <p className="text-sm font-semibold text-[var(--foreground)]">No activity here yet</p>
        <p className="max-w-sm text-xs text-[var(--muted)]">
          Actions in this part of the workspace will appear here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([day, rows]) => (
        <section key={day}>
          <h3 className="sticky top-0 z-[1] bg-[var(--surface)] py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            {day}
          </h3>
          <div className="mt-1 space-y-0.5">
            {rows.map((ev) => <EventRow key={ev.id} ev={ev} onSelect={onSelectEvent} />)}
          </div>
        </section>
      ))}

      {hasMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-60"
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

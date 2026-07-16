"use client";

import { useEffect } from "react";
import { ChevronRight, History, X } from "lucide-react";
import { breadcrumb, formatDateTime, kindMeta } from "./helpers";

function Row({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function EventDetailDrawer({ event, onClose, onViewEntity }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!event) return null;
  const meta = kindMeta(event.actionKind);
  const Icon = meta.icon;
  const crumbs = breadcrumb(event);
  const changes = event.changes;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Activity detail">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
        style={{ animation: "wsDrawerIn .25s cubic-bezier(.4,0,.2,1)" }}
      >
        <style>{`@keyframes wsDrawerIn{from{transform:translateX(16px);opacity:.6}to{transform:none;opacity:1}}@media (prefers-reduced-motion:reduce){[style*="wsDrawerIn"]{animation:none!important}}`}</style>

        <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-4">
          <div className="flex items-start gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: `color-mix(in srgb, ${meta.tone} 14%, transparent)`, color: meta.tone }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--foreground)]">{event.summary || event.action || meta.label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-1 text-[11px] font-semibold text-[var(--muted)]">
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}{c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <dl className="divide-y divide-[var(--border)]">
            <Row label="Action" value={event.action} />
            <Row label="Type" value={meta.label} />
            <Row label="Path" value={<code className="text-xs text-[var(--muted)]">{event.hierarchyPath}</code>} />
            <Row label="Entity" value={[event.entityName, event.entityType && `(${event.entityType})`, event.entityId].filter(Boolean).join(" ")} />
            <Row label="Actor" value={event.actorEmail} />
            <Row label="Role" value={event.actorRole} />
            <Row label="When" value={formatDateTime(event.createdAtMs)} />
            <Row label="Route" value={event.route} />
            <Row label="Browser" value={[event.browser, event.os].filter(Boolean).join(" · ")} />
            <Row label="Device" value={event.deviceLabel} />
            <Row label="IP" value={event.ipMasked} />
            <Row label="Location" value={[event.city, event.region, event.country].filter(Boolean).join(", ")} />
            <Row label="Resolved by" value={event.resolvedBy} />
          </dl>

          {changes != null && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Changes</p>
              <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--foreground)]">
                {typeof changes === "string" ? changes : JSON.stringify(changes, null, 2)}
              </pre>
            </div>
          )}

          {onViewEntity && event.entityId ? (
            <button
              type="button"
              onClick={onViewEntity}
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <History className="h-4 w-4" /> View this entity's history
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

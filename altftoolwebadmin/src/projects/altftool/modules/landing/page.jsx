"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, Plus, Search, Copy, Trash2, Pencil, ExternalLink, Loader2, X,
} from "lucide-react";
import {
  subscribeLanders, createLander, duplicateLander, deleteLander, slugify, isSlugTaken,
} from "./services/landersService";
import { LANDER_STATUSES, STATUS_META } from "./lib/schema";

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ color: meta.tone, background: `color-mix(in srgb, ${meta.tone} 14%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tone }} />
      {meta.label}
    </span>
  );
}

function fmtTime(ts) {
  const ms = ts?.toMillis?.() ?? (typeof ts === "number" ? ts : null);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CreateModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const effectiveSlug = touchedSlug ? slugify(slug) : slugify(title);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!effectiveSlug) { setError("Enter a valid slug."); return; }
    setBusy(true); setError("");
    try {
      if (await isSlugTaken(effectiveSlug)) { setError("That slug is already taken."); setBusy(false); return; }
      const id = await createLander({ title: title.trim(), slug: effectiveSlug });
      onCreated(id);
    } catch {
      setError("Could not create the page. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-[var(--foreground)]">New landing page</h3>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
        </div>
        <label className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Title</label>
        <input
          autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Canva Landing Page"
          className="mb-3 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
        <label className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Slug</label>
        <div className="mb-1 flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3">
          <span className="text-sm text-[var(--muted)]">/lander/</span>
          <input
            value={touchedSlug ? slug : effectiveSlug}
            onChange={(e) => { setTouchedSlug(true); setSlug(e.target.value); }}
            placeholder="canva"
            className="h-11 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none"
          />
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[var(--danger,#EF4444)]">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface,var(--card))] px-4 text-sm font-bold text-[var(--foreground)]">Cancel</button>
          <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LandingPagesModule() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => subscribeLanders(setItems, () => setItems([])), []);

  const goEdit = useCallback((id) => router.push(`/altftool/landing/edit/${id}`), [router]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q) return `${p.title} ${p.slug}`.toLowerCase().includes(q);
      return true;
    });
  }, [items, search, statusFilter]);

  const onDuplicate = async (id) => { setBusyId(id); try { const nid = await duplicateLander(id); goEdit(nid); } finally { setBusyId(""); } };
  const onDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title || "this page"}"? This cannot be undone.`)) return;
    setBusyId(id); try { await deleteLander(id); } finally { setBusyId(""); }
  };

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[var(--foreground)]">
              <LayoutTemplate className="h-6 w-6 text-[var(--primary)]" strokeWidth={1.9} /> Landing Pages
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Build unlimited SEO landing pages — no code, fully dynamic.</p>
          </div>
          <button onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] transition hover:brightness-95">
            <Plus className="h-4 w-4" /> New landing page
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or slug…"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface,var(--card))] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface,var(--card))] p-0.5">
            {["all", ...LANDER_STATUSES].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition ${statusFilter === s ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] shadow-[var(--shadow-sm)]">
          <div className="hidden grid-cols-[1fr_140px_120px_150px] gap-3 border-b border-[var(--border)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] sm:grid">
            <span>Page</span><span>Status</span><span>Updated</span><span className="text-right">Actions</span>
          </div>

          {filtered === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--muted)]">
              {items?.length ? "No pages match your filter." : "No landing pages yet — create your first one."}
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-1 items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0 sm:grid-cols-[1fr_140px_120px_150px]">
                <button onClick={() => goEdit(p.id)} className="min-w-0 text-left">
                  <p className="truncate text-sm font-bold text-[var(--foreground)]">{p.title || "Untitled"}</p>
                  <p className="truncate text-xs text-[var(--muted)]">/lander/{p.slug}</p>
                </button>
                <div><StatusPill status={p.status} /></div>
                <p className="text-xs text-[var(--muted)]">{fmtTime(p.updatedAt)}</p>
                <div className="flex items-center justify-end gap-1">
                  <a href={`/lander/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Open" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--primary)]"><ExternalLink className="h-4 w-4" /></a>
                  <button onClick={() => goEdit(p.id)} title="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--primary)]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDuplicate(p.id)} disabled={busyId === p.id} title="Duplicate" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-50"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(p.id, p.title)} disabled={busyId === p.id} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--danger,#EF4444)] disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); goEdit(id); }} />}
    </div>
  );
}

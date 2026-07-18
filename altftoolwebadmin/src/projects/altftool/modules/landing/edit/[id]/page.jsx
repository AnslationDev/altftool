"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Save, ExternalLink, ChevronRight, Copy, Check,
  Rocket, ChevronDown, BarChart3, MousePointerClick, Eye,
} from "lucide-react";
import { fetchLander, updateLander, isSlugTaken, slugify } from "../../services/landersService";
import { LANDER_STATUSES, STATUS_META, newLanderDoc } from "../../lib/schema";
import SectionBuilder from "../../components/SectionBuilder";
import { SeoSettings, DesignSettings } from "../../components/SettingsPanels";
import PageStatusCard from "../../components/PageStatusCard";
import PageInfoCards from "../../components/PageInfoCards";
import HistoryList from "../../components/HistoryList";

const toMs = (v) => (v?.toMillis ? v.toMillis() : typeof v === "number" ? v : null);

function metaFrom(doc) {
  const d = newLanderDoc({ title: doc.title || "" });
  return {
    seo: { ...d.seo, ...(doc.seo || {}) },
    theme: { ...d.theme, ...(doc.theme || {}) },
    schema: { ...d.schema, ...(doc.schema || {}) },
    ads: { placements: {}, ...(doc.ads || {}) },
    publishAt: toMs(doc.publishAt),
    expireAt: toMs(doc.expireAt),
  };
}

const TABS = [
  { key: "sections", label: "Sections" },
  { key: "seo", label: "SEO" },
  { key: "settings", label: "Settings" },
  { key: "analytics", label: "Analytics" },
  { key: "history", label: "History" },
];

export default function EditLanderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lander, setLander] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", status: "draft" });
  const [sections, setSections] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState("sections");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchLander(id).then((doc) => {
      if (!alive) return;
      if (!doc) { setError("Landing page not found."); setLoading(false); return; }
      setLander(doc);
      setForm({ title: doc.title || "", slug: doc.slug || "", status: doc.status || "draft" });
      setSections(Array.isArray(doc.sections) ? doc.sections : []);
      setMeta(metaFrom(doc));
      setLoading(false);
    });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dirty = useMemo(() => {
    if (!lander) return false;
    return (
      form.title !== (lander.title || "") ||
      form.slug !== (lander.slug || "") ||
      form.status !== (lander.status || "draft") ||
      JSON.stringify(sections) !== JSON.stringify(lander.sections || []) ||
      JSON.stringify(meta) !== JSON.stringify(metaFrom(lander))
    );
  }, [form, sections, meta, lander]);

  const save = async (overrides = {}) => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    const slug = slugify(form.slug || form.title);
    if (!slug) { setError("Enter a valid slug."); return; }
    const status = overrides.status || form.status;
    setSaving(true); setError(""); setMenuOpen(false);
    try {
      if (await isSlugTaken(slug, id)) { setError("That slug is already taken."); setSaving(false); return; }
      const patch = {
        title: form.title.trim(), slug, status, sections,
        seo: meta.seo, theme: meta.theme, schema: meta.schema, ads: meta.ads,
        publishAt: meta.publishAt ?? null, expireAt: meta.expireAt ?? null,
      };
      await updateLander(id, patch, { revisionReason: overrides.reason || "edit" });
      setForm((f) => ({ ...f, slug, status }));
      setLander((l) => ({ ...l, ...patch }));
      setSavedAt(Date.now());
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const applyRevision = (snap) => {
    if (snap.title != null || snap.slug != null || snap.status != null) {
      setForm({ title: snap.title ?? form.title, slug: snap.slug ?? form.slug, status: snap.status ?? form.status });
    }
    if (Array.isArray(snap.sections)) setSections(snap.sections);
    setMeta((m) => ({
      seo: snap.seo ?? m.seo, theme: snap.theme ?? m.theme, schema: snap.schema ?? m.schema,
      ads: snap.ads ?? m.ads, publishAt: toMs(snap.publishAt) ?? m.publishAt, expireAt: toMs(snap.expireAt) ?? m.expireAt,
    }));
    setTab("sections");
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`https://altftool.com/lander/${form.slug}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-24 text-sm text-[var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (!lander) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--muted)]">{error || "Not found."}</p>
        <button onClick={() => router.push("/altftool/landing")} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold text-[var(--foreground)]"><ArrowLeft className="h-4 w-4" /> Back to list</button>
      </div>
    );
  }

  const input = "h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";
  const statusMeta = STATUS_META[form.status] || STATUS_META.draft;
  const analytics = lander.analytics || {};

  return (
    <div className="min-h-full bg-[var(--background)] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Breadcrumb + actions */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <button onClick={() => router.push("/altftool/landing")} className="font-bold hover:text-[var(--foreground)]">Landing Pages</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-[var(--foreground)]">Edit: {form.title || "Untitled"}</span>
          </nav>
          <div className="flex items-center gap-2">
            <a href={`/lander/${lander.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 text-sm font-bold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"><ExternalLink className="h-4 w-4" /> Preview</a>
            <div ref={menuRef} className="relative inline-flex">
              <button onClick={() => save({ status: "published", reason: "publish" })} disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-l-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] hover:brightness-95 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} {form.status === "published" ? "Update" : "Publish"}
              </button>
              <button onClick={() => setMenuOpen((o) => !o)} disabled={saving} className="inline-flex h-10 items-center rounded-r-lg border-l border-white/20 bg-[var(--primary)] px-2 text-[var(--primary-foreground)] hover:brightness-95 disabled:opacity-60"><ChevronDown className="h-4 w-4" /></button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface,var(--card))] py-1 shadow-[var(--shadow-lg)]">
                  <button onClick={() => save({ status: "draft" })} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]">Save as draft</button>
                  <button onClick={() => save({ status: "scheduled" })} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]">Save as scheduled</button>
                  <button onClick={() => save({ status: "archived" })} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]">Archive</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title / status */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Edit Landing Page</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: statusMeta.tone, background: `color-mix(in srgb, ${statusMeta.tone} 14%, transparent)` }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusMeta.tone }} /> {statusMeta.label}
          </span>
          <span className="ml-auto text-xs text-[var(--muted)]">{saving ? "Saving…" : savedAt && !dirty ? "All changes saved" : dirty ? "Unsaved changes" : "Up to date"}</span>
        </div>

        {/* Title + slug */}
        <div className="mb-5 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)] sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Page title</span>
            <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Slug</span>
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3">
              <span className="text-sm text-[var(--muted)]">/lander/</span>
              <input className="h-11 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <button onClick={copyUrl} title="Copy URL" className="grid h-8 w-8 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--primary)]">{copied ? <Check className="h-4 w-4 text-[var(--success,#10B981)]" /> : <Copy className="h-4 w-4" />}</button>
            </div>
          </label>
          {error ? <p className="text-sm font-semibold text-[var(--danger,#EF4444)] sm:col-span-2">{error}</p> : null}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative -mb-px whitespace-nowrap px-4 py-2.5 text-sm font-bold transition ${tab === t.key ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab bodies */}
        {tab === "sections" && (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
              <SectionBuilder sections={sections} onChange={setSections} landerId={id} />
              <div className="xl:sticky xl:top-4 xl:self-start">
                <PageStatusCard form={form} setForm={setForm} meta={meta} setMeta={setMeta} />
              </div>
            </div>
            <PageInfoCards />
          </div>
        )}

        {tab === "seo" && <SeoSettings meta={meta} onChange={setMeta} landerId={id} title={form.title} slug={form.slug} />}
        {tab === "settings" && <DesignSettings meta={meta} onChange={setMeta} landerId={id} />}

        {tab === "analytics" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-2 flex items-center gap-2 text-[var(--muted)]"><Eye className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wide">Views</span></div>
              <p className="text-3xl font-black text-[var(--foreground)]">{Number(analytics.views || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-2 flex items-center gap-2 text-[var(--muted)]"><MousePointerClick className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wide">Clicks</span></div>
              <p className="text-3xl font-black text-[var(--foreground)]">{Number(analytics.clicks || 0).toLocaleString()}</p>
            </div>
            <p className="text-xs text-[var(--muted)] sm:col-span-2"><BarChart3 className="mr-1 inline h-3.5 w-3.5" /> Traffic accrues once the page is published and visited.</p>
          </div>
        )}

        {tab === "history" && <HistoryList landerId={id} onRestore={applyRevision} />}
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--border)] bg-[var(--surface,var(--card))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-xs text-[var(--muted)]">{saving ? "Saving…" : savedAt && !dirty ? "All changes saved" : dirty ? "Unsaved changes" : "Up to date"}</span>
          <button onClick={() => save()} disabled={saving || !dirty} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, ExternalLink, Layers } from "lucide-react";
import { fetchLander, updateLander, isSlugTaken, slugify } from "../../services/landersService";
import { LANDER_STATUSES, STATUS_META } from "../../lib/schema";

export default function EditLanderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lander, setLander] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", status: "draft" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchLander(id).then((doc) => {
      if (!alive) return;
      if (!doc) { setError("Landing page not found."); setLoading(false); return; }
      setLander(doc);
      setForm({ title: doc.title || "", slug: doc.slug || "", status: doc.status || "draft" });
      setLoading(false);
    });
    return () => { alive = false; };
  }, [id]);

  const dirty = useMemo(
    () => lander && (form.title !== (lander.title || "") || form.slug !== (lander.slug || "") || form.status !== (lander.status || "draft")),
    [form, lander],
  );

  const save = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    const slug = slugify(form.slug || form.title);
    if (!slug) { setError("Enter a valid slug."); return; }
    setSaving(true); setError("");
    try {
      if (await isSlugTaken(slug, id)) { setError("That slug is already taken."); setSaving(false); return; }
      await updateLander(id, { title: form.title.trim(), slug, status: form.status }, { revisionReason: "edit" });
      setLander((l) => ({ ...l, title: form.title.trim(), slug, status: form.status }));
      setForm((f) => ({ ...f, slug }));
      setSavedAt(Date.now());
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-full bg-[var(--background)] pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <button onClick={() => router.push("/altftool/landing")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)]"><ArrowLeft className="h-4 w-4" /> Landing Pages</button>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-4 text-base font-black text-[var(--foreground)]">Page settings</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Title</span>
                <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Slug</span>
                <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3">
                  <span className="text-sm text-[var(--muted)]">/lander/</span>
                  <input className="h-11 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--foreground)]">Status</span>
                <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {LANDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                </select>
              </label>
            </div>
            {error ? <p className="mt-3 text-sm font-semibold text-[var(--danger,#EF4444)]">{error}</p> : null}
          </section>

          <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface,var(--card))] p-8 text-center">
            <Layers className="mx-auto mb-2 h-7 w-7 text-[var(--primary)]" strokeWidth={1.7} />
            <p className="text-sm font-bold text-[var(--foreground)]">Section Builder</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-[var(--muted)]">Drag-and-drop sections (Hero, Features, FAQ, CTA and more) arrive in the next phase. Page settings above are live now.</p>
          </section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--border)] bg-[var(--surface,var(--card))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-xs text-[var(--muted)]">
            {saving ? "Saving…" : savedAt ? "All changes saved" : dirty ? "Unsaved changes" : "Up to date"}
          </span>
          <div className="flex items-center gap-2">
            <a href={`/lander/${lander.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 text-sm font-bold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"><ExternalLink className="h-4 w-4" /> Preview</a>
            <button onClick={save} disabled={saving || !dirty} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

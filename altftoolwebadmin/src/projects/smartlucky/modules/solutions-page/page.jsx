"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Plus } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { getModuleDocRef } from "../shared/collectionService";
import { getDoc, setDoc } from "firebase/firestore";
import { Field, TextArea } from "../shared/fields";

const clone = (v) => JSON.parse(JSON.stringify(v));

function ItemListEditor({ items, onChange, fields }) {
  const list = items || [];
  const update = (i, v) => { const n = list.slice(); n[i] = v; onChange(n); };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  return (
    <div>
      {list.map((item, i) => (
        <div key={i} className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-[var(--muted)]">Item {i + 1}</span>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
          {fields.map((f) =>
            f.type === "textarea"
              ? <TextArea key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, { ...item, [f.key]: v })} />
              : <Field key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, { ...item, [f.key]: v })} />
          )}
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10">
        <Plus size={15} /> Add item
      </button>
    </div>
  );
}

export default function SolutionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(getModuleDocRef("solutions"));
        if (active) setItems(snap.exists() ? (snap.data().items || []) : []);
      } catch {} finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(getModuleDocRef("solutions"), { items, updatedAt: new Date() }, { merge: true });
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Solutions updated." });
    } catch (err) { emitAlert({ type: "error", title: "Save failed", message: err?.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading solutions…</div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Solutions</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Manage solution items shown on the Solutions page.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>
      </div>
      <Section title="Solution Items" desc="Individual solution pages (e.g. /solutions/enterprise).">
        <ItemListEditor items={items} onChange={(v) => { setItems(v); setDirty(true); }}
          fields={[
            { key: "slug", label: "Slug" },
            { key: "title", label: "Title" },
            { key: "subtitle", label: "Subtitle" },
            { key: "industry", label: "Industry" },
            { key: "overview", label: "Overview", type: "textarea" },
          ]} />
      </Section>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <header className="mb-4">
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
        {desc ? <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p> : null}
      </header>
      {children}
    </section>
  );
}

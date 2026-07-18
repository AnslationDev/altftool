"use client";

// Compact "Page Status" card shown alongside the Sections tab — the quick
// controls an editor reaches for most: status, publish date, visibility and
// colour mode. Reads/writes the same form + meta state the edit page owns.

import { Field, Select, Input } from "./fields";
import { LANDER_STATUSES, STATUS_META } from "../lib/schema";

const toLocalInput = (ms) => {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (s) => (s ? new Date(s).getTime() : null);

export default function PageStatusCard({ form, setForm, meta, setMeta }) {
  const seo = meta.seo || {};
  const theme = meta.theme || {};
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
      <h3 className="mb-4 text-sm font-black text-[var(--foreground)]">Page Status</h3>
      <div className="space-y-3">
        <Field label="Status">
          <Select value={form.status} onChange={(v) => setForm({ ...form, status: v })}
            options={LANDER_STATUSES.map((s) => ({ value: s, label: STATUS_META[s]?.label || s }))} />
        </Field>
        <Field label="Publish date" hint="Used when status is Scheduled.">
          <Input type="datetime-local" value={toLocalInput(meta.publishAt)} onChange={(v) => setMeta({ ...meta, publishAt: fromLocalInput(v) })} />
        </Field>
        <Field label="Visibility">
          <Select value={seo.noIndex ? "unlisted" : "public"} onChange={(v) => setMeta({ ...meta, seo: { ...seo, noIndex: v === "unlisted" } })}
            options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted (noindex)" }]} />
        </Field>
        <Field label="Theme">
          <Select value={theme.mode || "auto"} onChange={(v) => setMeta({ ...meta, theme: { ...theme, mode: v } })}
            options={[{ value: "auto", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        </Field>
      </div>
    </div>
  );
}

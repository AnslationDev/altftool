"use client";

import { useMemo, useState } from "react";

export default function PrivateRecordWorkspace({ title, description, fields = ["Title", "Notes"], exportName = "record" }) {
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field, ""])));
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const add = () => { if (!Object.values(values).some(Boolean)) return; setRows((current) => [...current, { ...values, id: crypto.randomUUID() }]); setValues(Object.fromEntries(fields.map((field) => [field, ""]))); };
  const download = () => { const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${exportName}.json`; anchor.click(); URL.revokeObjectURL(url); };
  return <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
    <header><p className="text-sm font-semibold text-primary">Private, local workspace</p><h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1><p className="mt-2 max-w-3xl text-muted-foreground">{description} Data stays in this browser until you choose to export it.</p></header>
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm"><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field} className="block"><span className="text-sm font-semibold text-foreground">{field}</span><textarea value={values[field]} onChange={(event) => update(field, event.target.value)} rows={field === fields[fields.length - 1] ? 4 : 2} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" /></label>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={add} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">Add record</button><button type="button" onClick={download} disabled={!rows.length} className="rounded-lg border border-border px-4 py-2 font-semibold text-foreground disabled:opacity-50">Export JSON</button></div></section>
    <section className="rounded-xl border border-border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-foreground">Saved records ({filtered.length})</h2><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></div><div className="mt-4 space-y-3">{filtered.map((row) => <article key={row.id} className="rounded-lg border border-border bg-background p-4"><div className="grid gap-2 sm:grid-cols-2">{fields.map((field) => <div key={field}><p className="text-xs font-semibold uppercase text-muted-foreground">{field}</p><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{row[field] || "—"}</p></div>)}</div></article>)}{!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">No records yet. Add one above.</p>}</div></section>
  </main>;
}

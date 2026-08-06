"use client";

import { useEffect, useMemo, useState } from "react";

export default function PrivateRecordWorkspace({ title, description, fields = ["Title", "Notes"], exportName = "record" }) {
  const storageKey = `altftool-private-records:${exportName}`;
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field, ""])));
  const [query, setQuery] = useState("");
  // Both effects below fire on mount, so without this flag the save effect's
  // first run would persist the initial empty `rows` (and delete whatever
  // was in localStorage) before the load effect's setRows has been
  // reflected in a render. Tracked via state, not a ref: the load effect's
  // setRows/setHasLoaded calls are batched into one render, so by the time
  // hasLoaded flips true, `rows` has already updated too.
  const [hasLoaded, setHasLoaded] = useState(false);
  // Set when the saved JSON for this tool exists but couldn't be parsed
  // (corrupted, hand-edited, truncated by a prior bug, etc). While this is
  // true the save effect below must NOT treat the resulting empty `rows` as
  // "the user has no records" -- otherwise the very next render silently
  // and permanently wipes the original (possibly still-recoverable) raw
  // string from localStorage with no warning. It clears itself again once
  // the user adds a real record, since that's an explicit signal they're
  // starting fresh.
  const [loadError, setLoadError] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  useEffect(() => {
    setLoadError(false);
    try {
      setRows(JSON.parse(window.localStorage.getItem(storageKey) || "[]"));
    } catch {
      setRows([]);
      setLoadError(true);
    }
    setHasLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (rows.length) {
      window.localStorage.setItem(storageKey, JSON.stringify(rows));
      if (loadError) setLoadError(false);
    } else if (!loadError) {
      window.localStorage.removeItem(storageKey);
    }
  }, [rows, storageKey, hasLoaded, loadError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    // Search only the visible fields the user actually typed into -- not
    // every key on the row object. Rows also carry an internal `id`
    // (crypto.randomUUID()), and joining that in meant short/hex-ish
    // queries ("a", "3", ...) matched most records via the invisible id
    // instead of the field text the user can see.
    return rows.filter((row) => fields.map((field) => row[field] ?? "").join(" ").toLowerCase().includes(q));
  }, [rows, query, fields]);

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const add = () => { if (!Object.values(values).some(Boolean)) return; setRows((current) => [...current, { ...values, id: crypto.randomUUID() }]); setValues(Object.fromEntries(fields.map((field) => [field, ""]))); };
  const remove = (id) => { if (!window.confirm("Delete this record? This cannot be undone.")) return; setRows((current) => current.filter((row) => row.id !== id)); };
  const download = () => { const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${exportName}.json`; anchor.click(); URL.revokeObjectURL(url); };

  const importFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Import will replace every record currently saved here. Continue?")) { event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!Array.isArray(imported)) {
          setImportMessage({ tone: "error", text: "Import failed: the file must contain a JSON array of records, not a single object." });
          return;
        }
        const safeRows = imported.map((row) => {
          if (!row || typeof row !== "object") throw new Error("Malformed record in import file");
          return { ...row, id: row.id || crypto.randomUUID() };
        });
        setRows(safeRows);
        setImportMessage({ tone: "success", text: `Imported ${safeRows.length} record${safeRows.length === 1 ? "" : "s"}.` });
      } catch {
        setImportMessage({ tone: "error", text: "Import failed: the file isn't valid JSON in the expected format. Your existing records were left unchanged." });
      }
    };
    reader.onerror = () => setImportMessage({ tone: "error", text: "Import failed: the file could not be read. Your existing records were left unchanged." });
    reader.readAsText(file);
    event.target.value = "";
  };

  return <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
    <header><p className="text-sm font-semibold text-primary">Private, local workspace</p><h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1><p className="mt-2 max-w-3xl text-muted-foreground">{description} Data stays in this browser until you choose to export it.</p></header>
    {loadError && <p role="alert" className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger-text)]">Your saved records for this tool could not be read (the stored data looks corrupted). Nothing has been deleted yet -- it&apos;s been left untouched in browser storage. Reload to try again, or add a new record below to start fresh.</p>}
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm"><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field} className="block"><span className="text-sm font-semibold text-foreground">{field}</span><textarea value={values[field]} onChange={(event) => update(field, event.target.value)} rows={field === fields[fields.length - 1] ? 4 : 2} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" /></label>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={add} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">Add record</button><button type="button" onClick={download} disabled={!rows.length} className="rounded-lg border border-border px-4 py-2 font-semibold text-foreground disabled:opacity-50">Export JSON</button></div></section>
    <section className="rounded-xl border border-border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-foreground" aria-live="polite" role="status">Saved records ({filtered.length})</h2><div className="flex flex-wrap gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" aria-label="Search records" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">Import JSON<input type="file" accept="application/json" onChange={importFile} className="sr-only" /></label></div></div>
      {importMessage && <p role="status" aria-live="polite" className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${importMessage.tone === "error" ? "border border-[var(--danger)]/40 bg-[var(--danger-soft)] text-[var(--danger-text)]" : "border border-[var(--success)]/40 bg-[var(--success-soft)] text-[var(--success-text)]"}`}>{importMessage.text}</p>}
      <div className="mt-4 space-y-3" aria-live="polite" role="status">{filtered.map((row) => <article key={row.id} className="rounded-lg border border-border bg-background p-4"><div className="grid gap-2 sm:grid-cols-2">{fields.map((field) => <div key={field}><p className="text-xs font-semibold uppercase text-muted-foreground">{field}</p><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{row[field] || "—"}</p></div>)}</div><button type="button" onClick={() => remove(row.id)} className="mt-3 rounded-md border border-danger/40 px-3 py-1 text-xs font-semibold text-danger">Delete</button></article>)}{!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">No records yet. Add one above.</p>}</div></section>
  </main>;
}

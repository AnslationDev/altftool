"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { listDocs, saveDoc, removeDoc } from "../lib/firebase";
import { validate } from "../lib/schemas";
import { Button, Modal, Field } from "./ui";

function Cell({ value }) {
  if (typeof value === "boolean" || value === undefined || value === null || value === "") {
    return value === true
      ? <span className="mla-pill mla-pill-on">Yes</span>
      : <span className="mla-pill mla-pill-off">{value === false ? "No" : "—"}</span>;
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/** First list column rendered with a thumbnail / initial tile. */
function MainCell({ row, col }) {
  const img = row.imageUrl || row.coverImage || row.logoUrl;
  const label = row[col] ?? row.id;
  const initial = String(label || "?").trim().charAt(0).toUpperCase();
  return (
    <span className="mla-rowmain">
      {img
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={img} alt="" className="mla-thumb" />
        : <span className="mla-thumb-empty">{initial}</span>}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 }}>{String(label)}</span>
    </span>
  );
}

function SkeletonRows({ cols }) {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j}><span className="mla-skel" style={{ display: "block", height: 14, width: j === 0 ? "70%" : "50%" }} /></td>
      ))}
    </tr>
  ));
}

export default function CollectionManager({ schema, lookups, notify }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // { values, isNew }
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const idKey = schema.fields.find((f) => f.isId)?.key || "id";

  const load = useCallback(async () => {
    try { setRows(await listDocs(schema.collection)); }
    catch (e) { notify(`Load failed: ${e.message}`, "error"); setRows([]); }
  }, [schema.collection, notify]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state set after await
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [rows, q]);

  const startNew = () => {
    const values = {};
    schema.fields.forEach((f) => { if (f.default !== undefined) values[f.key] = f.default; });
    setErrors({}); setEditing({ values, isNew: true });
  };

  const startEdit = (row) => { setErrors({}); setEditing({ values: { ...row }, isNew: false }); };

  const save = async () => {
    const v = editing.values;
    const errs = validate(schema.fields, v);
    const docId = v[idKey];
    if (!docId) errs[idKey] = "Required";
    if (editing.isNew && rows?.some((r) => r.id === docId)) errs[idKey] = "Already exists — must be unique";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const clean = {};
      schema.fields.forEach((f) => { if (v[f.key] !== undefined && v[f.key] !== "") clean[f.key] = v[f.key]; });
      clean[idKey] = docId;
      await saveDoc(schema.collection, docId, clean, { isNew: editing.isNew });
      notify(`${schema.label}: "${docId}" saved ✓`);
      setEditing(null);
      load();
    } catch (e) {
      notify(`Save failed: ${e.message}`, "error");
    } finally { setBusy(false); }
  };

  const del = async (row) => {
    // Reference guards (block deleting docs other collections point at)
    for (const g of schema.guards || []) {
      try {
        const refs = await listDocs(g.collection);
        if (refs.some((r) => r[g.field] === row.id)) {
          return notify(`Cannot delete — ${g.message}.`, "error");
        }
      } catch { /* guard is best-effort */ }
    }
    if (!window.confirm(`Delete "${row.id}" permanently?`)) return;
    try {
      await removeDoc(schema.collection, row.id);
      notify(`Deleted "${row.id}"`);
      load();
    } catch (e) { notify(`Delete failed: ${e.message}`, "error"); }
  };

  return (
    <div>
      <div className="mla-toolbar">
        <input className="mla-search" placeholder={`Search ${schema.label.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        {rows !== null && <span className="mla-count">{filtered.length} of {rows.length}</span>}
        <Button onClick={startNew}>+ Add {schema.label.replace(/s$/, "")}</Button>
      </div>

      {rows !== null && rows.length === 0 ? (
        <div className="mla-empty">
          <span className="mla-empty-icon" aria-hidden="true">📄</span>
          <p style={{ margin: 0, fontWeight: 700 }}>No documents in <code>{schema.collection}</code> yet</p>
          <p className="mla-muted" style={{ marginTop: 6 }}>
            The website is using seed fallback for this section. Add a record here — or run Seed Migration — to take control.
          </p>
          <div style={{ marginTop: 16 }}>
            <Button onClick={startNew}>+ Add {schema.label.replace(/s$/, "")}</Button>
          </div>
        </div>
      ) : (
        <div className="mla-tablewrap">
          <table className="mla-table">
            <thead>
              <tr>
                {schema.listColumns.map((c, i) => <th key={c}>{i === 0 ? schema.label.replace(/s$/, "") : c}</th>)}
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <SkeletonRows cols={schema.listColumns.length + 2} />
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    {schema.listColumns.map((c, i) => (
                      <td key={c}>{i === 0 ? <MainCell row={r} col={c} /> : <Cell value={r[c]} />}</td>
                    ))}
                    <td><span className="mla-mono">{r.id}</span></td>
                    <td className="mla-rowactions">
                      <Button small kind="ghost" onClick={() => startEdit(r)}>Edit</Button>
                      <Button small kind="danger" onClick={() => del(r)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal wide title={`${editing.isNew ? "Add" : "Edit"} — ${schema.label}`} onClose={() => setEditing(null)}>
          <div className="mla-form">
            {schema.fields.map((f) => (
              <div key={f.key} className={`mla-field${["textarea", "list", "keyvalue", "image", "objectlist", "group"].includes(f.type) ? " mla-field-full" : ""}`}>
                <label>
                  {f.label}{f.required && <em> *</em>}
                  {f.isId && !editing.isNew && <span className="mla-muted"> (immutable)</span>}
                </label>
                {f.isId && !editing.isNew ? (
                  <input value={editing.values[f.key] || ""} disabled />
                ) : (
                  <Field field={f} value={editing.values[f.key]} lookups={lookups}
                    onChange={(v) => setEditing((s) => ({ ...s, values: { ...s.values, [f.key]: v } }))} />
                )}
                {f.hint && <p className="mla-hint">{f.hint}</p>}
                {errors[f.key] && <p className="mla-err">{errors[f.key]}</p>}
              </div>
            ))}
          </div>
          <div className="mla-modal-foot">
            <Button kind="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

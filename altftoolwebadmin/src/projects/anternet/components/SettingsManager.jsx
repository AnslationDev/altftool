"use client";

import { useEffect, useState, useCallback } from "react";
import { getDocById, saveDoc } from "../lib/firebase";
import { Button, Field } from "./ui";

/** Editor for a single settings/{docId} document. */
export default function SettingsManager({ schema, defaults = {}, lookups, notify }) {
  const [values, setValues] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const doc = await getDocById("settings", schema.docId);
      setValues({ ...defaults, ...(doc || {}) });
    } catch (e) {
      notify(`Load failed: ${e.message}`, "error");
      setValues({ ...defaults });
    }
  }, [schema.docId, defaults, notify]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state set after await
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const clean = {};
      schema.fields.forEach((f) => { if (values[f.key] !== undefined) clean[f.key] = values[f.key]; });
      await saveDoc("settings", schema.docId, clean);
      notify(`settings/${schema.docId} saved ✓`);
    } catch (e) {
      notify(`Save failed: ${e.message}`, "error");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <header className="mla-pagehead">
        <div>
          <h1>{schema.label}</h1>
          <p>Configure <code>settings/{schema.docId}</code>.</p>
        </div>
      </header>

      <div className="mla-settings" aria-busy={!values}>
        {!values ? (
          <p className="mla-muted" role="status">Loading…</p>
        ) : (
          <>
            <div className="mla-form">
              {schema.fields.map((f) => (
                <div key={f.key} className="mla-field mla-field-full">
                  <label>{f.label}</label>
                  <Field field={f} value={values[f.key]} lookups={lookups}
                    onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
                  {f.hint && <p className="mla-hint">{f.hint}</p>}
                </div>
              ))}
            </div>
            <div className="mla-modal-foot">
              <Button kind="ghost" onClick={load} disabled={busy}>Reset</Button>
              <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

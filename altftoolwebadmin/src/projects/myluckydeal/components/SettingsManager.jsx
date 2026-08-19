"use client";

import { useEffect, useState, useCallback } from "react";
import { getDocById, saveDoc } from "../lib/firebase";
import { validate } from "../lib/schemas";
import { Button, Field } from "./ui";

/** Editor for a single settings/{docId} document. */
export default function SettingsManager({ schema, defaults = {}, lookups, notify }) {
  const [values, setValues] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    try {
      const doc = await getDocById("settings", schema.docId);
      setValues({ ...defaults, ...(doc || {}) });
      setErrors({});
    } catch (e) {
      notify(`Load failed: ${e.message}`, "error");
      setValues({ ...defaults });
      setErrors({});
    }
  }, [schema.docId, defaults, notify]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state set after await
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const errs = validate(schema.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

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

  if (!values) return <p className="mla-muted">Loading…</p>;

  return (
    <div className="mla-settings">
      <div className="mla-form">
        {schema.fields.map((f) => (
          <div key={f.key} className="mla-field mla-field-full">
            <label>{f.label}{f.required && <em> *</em>}</label>
            <Field field={f} value={values[f.key]} lookups={lookups}
              onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
            {f.hint && <p className="mla-hint">{f.hint}</p>}
            {errors[f.key] && <p className="mla-err">{errors[f.key]}</p>}
          </div>
        ))}
      </div>
      <div className="mla-modal-foot">
        <Button kind="ghost" onClick={load} disabled={busy}>Reset</Button>
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { listDocs, saveDoc } from "../lib/firebase";
import { Button } from "./ui";
import {
  BANNERS, TASKS, QUIZ_CATEGORIES, QUESTIONS, SPIN_PRIZES,
  VIDEO_SECTIONS, EARNING_TASKS, APP_CONFIG, FEATURE_FLAGS, REWARD_RULES,
  ADS, PAGES, INTEGRATIONS, ARENAS,
} from "../lib/seed-data";

const PLAN = [
  { col: "banners", data: BANNERS, idKey: "id" },
  { col: "tasks", data: TASKS, idKey: "id" },
  { col: "quizcategories", data: QUIZ_CATEGORIES, idKey: "id" },
  { col: "questions", data: QUESTIONS, idKey: "id" },
  { col: "spinprizes", data: SPIN_PRIZES, idKey: "id" },
  { col: "videosections", data: VIDEO_SECTIONS, idKey: "id" },
  { col: "earningtasks", data: EARNING_TASKS, idKey: "id" },
  { col: "ads", data: ADS, idKey: "id" },
  { col: "pages", data: PAGES, idKey: "id" },
  { col: "arenas", data: ARENAS, idKey: "id" },
];

const SETTINGS_PLAN = [
  { docId: "app", data: APP_CONFIG },
  { docId: "features", data: FEATURE_FLAGS },
  { docId: "rewards", data: REWARD_RULES },
  { docId: "integrations", data: INTEGRATIONS },
];

export default function SeedMigration({ notify }) {
  const [status, setStatus] = useState({});
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const s = {};
    for (const p of PLAN) {
      try { s[p.col] = (await listDocs(p.col)).length; } catch { s[p.col] = "?"; }
    }
    setStatus(s);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect -- run once; async fetch
  useEffect(() => { refresh(); }, []);

  const append = (m) => setLog((l) => [...l, m]);

  const run = async (overwrite) => {
    if (!window.confirm(overwrite
      ? "Overwrite ALL collections with seed data? Existing edits will be merged over."
      : "Import seed data into EMPTY collections only?")) return;
    setBusy(true); setLog([]);
    try {
      for (const p of PLAN) {
        const existing = await listDocs(p.col);
        if (existing.length > 0 && !overwrite) { append(`↷ ${p.col}: skipped (${existing.length} docs exist)`); continue; }
        for (const item of p.data) {
          const id = item[p.idKey] || item.id;
          await saveDoc(p.col, id, { ...item }, { isNew: true });
        }
        append(`✓ ${p.col}: ${p.data.length} docs written`);
      }
      for (const s of SETTINGS_PLAN) {
        await saveDoc("settings", s.docId, { ...s.data });
        append(`✓ settings/${s.docId} written`);
      }
      notify("Seed migration complete ✓");
      refresh();
    } catch (e) {
      append(`✗ FAILED: ${e.message}`);
      notify(`Migration failed: ${e.message}`, "error");
    } finally { setBusy(false); }
  };

  return (
    <div className="mla-panelcard">
      <h3>Seed Migration</h3>
      <p className="mla-muted">
        Copies the app&apos;s built-in seed content into Firestore so this panel becomes the single
        source of truth. Safe mode only fills empty collections; overwrite re-writes everything
        (merge — panel edits to other fields survive).
      </p>

      <table className="mla-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Collection</th><th>Seed docs</th><th>In Firestore now</th></tr></thead>
        <tbody>
          {PLAN.map((p) => (
            <tr key={p.col}>
              <td className="mla-mono">{p.col}</td>
              <td>{p.data.length}</td>
              <td>{status[p.col] ?? "…"}</td>
            </tr>
          ))}
          <tr><td className="mla-mono">settings/*</td><td>{SETTINGS_PLAN.length} docs</td><td>—</td></tr>
        </tbody>
      </table>

      <div className="mla-modal-foot">
        <Button kind="ghost" onClick={refresh} disabled={busy}>Refresh counts</Button>
        <Button onClick={() => run(false)} disabled={busy}>{busy ? "Working…" : "Import (empty only)"}</Button>
        <Button kind="danger" onClick={() => run(true)} disabled={busy}>Overwrite all</Button>
      </div>

      {log.length > 0 && <pre className="mla-log">{log.join("\n")}</pre>}
    </div>
  );
}

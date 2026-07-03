"use client";

import { useEffect, useState } from "react";
import { listDocs, saveDoc } from "../lib/firebase";
import { Button } from "./ui";
import {
  DEALS, CATEGORIES, STORES, COUPONS, BLOGS, FAQS, HERO_SLIDES, ADS,
  FEATURED_OFFERS, TRENDING_COLLECTIONS, TRENDING_SEARCHES, HOME_CONFIG, SITE, UI_CONTENT,
} from "../lib/seed-data";

const PLAN = [
  { col: "categories", data: CATEGORIES, idKey: "slug" },
  { col: "stores", data: STORES, idKey: "slug" },
  { col: "deals", data: DEALS, idKey: "slug" },
  { col: "coupons", data: COUPONS, idKey: "id" },
  { col: "blogs", data: BLOGS, idKey: "slug" },
  { col: "faqs", data: FAQS, idKey: "id" },
  { col: "hero", data: HERO_SLIDES, idKey: "id" },
  { col: "ads", data: ADS, idKey: "id" },
  { col: "featuredOffers", data: FEATURED_OFFERS, idKey: "id" },
  { col: "collections", data: TRENDING_COLLECTIONS, idKey: "id" },
];

const SETTINGS_PLAN = [
  { docId: "site", data: SITE },
  { docId: "trendingSearches", data: { terms: TRENDING_SEARCHES } },
  { docId: "home", data: HOME_CONFIG },
  { docId: "ui", data: UI_CONTENT },
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
        Copies the frontend&apos;s seed content into Firestore so this panel becomes the single
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

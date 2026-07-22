"use client";

import { useEffect, useState } from "react";
import { listDocs, saveDoc } from "../lib/firebase";
import { Button } from "./ui";
import {
  BANNERS, TASKS, QUIZ_CATEGORIES, QUESTIONS, SPIN_PRIZES,
  VIDEO_SECTIONS, EARNING_TASKS, APP_CONFIG, FEATURE_FLAGS, REWARD_RULES,
  ADS, PAGES, INTEGRATIONS, ARENAS,
  WINNERS, QUICK_EARN, TRENDING_TASKS, EXPLORE_CARDS, HOME_CATEGORIES,
  BONUS_LADDER_TIERS, WATCH_AND_EARN, MYSTERY_GIFT, BONUS_LADDER,
  KHOKHO_RULES, KHOKHO_BANNERS,
  KHOKHO_LIVESESSIONS, KHOKHO_LIVEQUESTIONS,
  KHOKHO_SPLASH, KHOKHO_HOME, KHOKHO_REWARDS, KHOKHO_LEADERBOARD, KHOKHO_SETTINGS,
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
  { col: "winners", data: WINNERS, idKey: "id" },
  { col: "quickearn", data: QUICK_EARN, idKey: "id" },
  { col: "trendingtasks", data: TRENDING_TASKS, idKey: "id" },
  { col: "explorecards", data: EXPLORE_CARDS, idKey: "id" },
  { col: "homecategories", data: HOME_CATEGORIES, idKey: "id" },
  { col: "bonusladdertiers", data: BONUS_LADDER_TIERS, idKey: "id" },
  { col: "khokho_rules", data: KHOKHO_RULES, idKey: "id" },
  { col: "khokho_banners", data: KHOKHO_BANNERS, idKey: "id" },
  { col: "khokho_livesessions", data: KHOKHO_LIVESESSIONS, idKey: "id" },
  { col: "khokho_livequestions", data: KHOKHO_LIVEQUESTIONS, idKey: "id" },
];

const SETTINGS_PLAN = [
  { docId: "app", data: APP_CONFIG },
  { docId: "features", data: FEATURE_FLAGS },
  { docId: "rewards", data: REWARD_RULES },
  { docId: "integrations", data: INTEGRATIONS },
  { docId: "watchandearn", data: WATCH_AND_EARN },
  { docId: "mysterygift", data: MYSTERY_GIFT },
  { docId: "bonusladder", data: BONUS_LADDER },
  { docId: "khokho_splash", data: KHOKHO_SPLASH },
  { docId: "khokho_home", data: KHOKHO_HOME },
  { docId: "khokho_rewards", data: KHOKHO_REWARDS },
  { docId: "khokho_leaderboard", data: KHOKHO_LEADERBOARD },
  { docId: "khokho_settings", data: KHOKHO_SETTINGS },
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

  // One-time fix: earlier questions live in the legacy `khokho_questions`
  // collection; the new Featured Arenas form reads each arena's nested
  // `questions`. This moves them in (grouped by category name → arena title),
  // MERGING so every other arena field is preserved and duplicates are skipped.
  const migrateQuestionsToArenas = async () => {
    if (!window.confirm(
      "Move existing Kho Kho questions into their matching Featured Arenas? Arenas keep all other fields; duplicates are skipped."
    )) return;
    setBusy(true); setLog([]);
    try {
      const [questions, arenas] = await Promise.all([
        listDocs("khokho_questions"),
        listDocs("arenas"),
      ]);
      append(`Found ${questions.length} legacy questions, ${arenas.length} arenas.`);
      const byCat = {};
      for (const q of questions) {
        const key = String(q.category || "").trim();
        if (!key) continue;
        (byCat[key] = byCat[key] || []).push({
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer,
        });
      }
      let updated = 0;
      for (const a of arenas) {
        const group = byCat[String(a.title || "").trim()];
        if (!group || !group.length) continue;
        const existing = Array.isArray(a.questions) ? a.questions : [];
        const seen = new Set(existing.map((q) => String(q.question || "").trim()));
        const merged = [
          ...existing,
          ...group.filter((q) => !seen.has(String(q.question || "").trim())),
        ];
        await saveDoc("arenas", a.id, { questions: merged });
        append(`✓ ${a.title}: ${merged.length} questions (added ${merged.length - existing.length})`);
        updated++;
      }
      if (!updated) append("⚠ No arenas matched — arena titles must equal the questions' category names.");
      notify("Questions migrated into arenas ✓");
      refresh();
    } catch (e) {
      append(`✗ FAILED: ${e.message}`);
      notify(`Migration failed: ${e.message}`, "error");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <header className="mla-pagehead">
        <div>
          <h1>Seed Migration</h1>
          <p>Move built-in content into the shared Firestore collections.</p>
        </div>
      </header>
      <div className="mla-panelcard">
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

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--mla-border, #e5e7eb)" }}>
        <h3 style={{ marginTop: 0 }}>Kho Kho — move questions into Arenas</h3>
        <p className="mla-muted">
          Questions added earlier live in the legacy <code>khokho_questions</code> collection.
          The new <strong>Featured Arenas</strong> form stores each arena&apos;s questions inside the
          arena itself. Run this once to move them in — matched by category name → arena title,
          merged so all other arena fields are kept and duplicates are skipped.
        </p>
        <div className="mla-modal-foot">
          <Button onClick={migrateQuestionsToArenas} disabled={busy}>
            {busy ? "Working…" : "Migrate questions → Arenas"}
          </Button>
        </div>
      </div>

      {log.length > 0 && <pre className="mla-log">{log.join("\n")}</pre>}
      </div>
    </div>
  );
}

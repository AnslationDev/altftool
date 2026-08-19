"use client";

/**
 * Kho Kho — a single tabbed CMS module. Each tab reuses the generic
 * CollectionManager (Firestore sub-collections) or SettingsManager (single
 * settings docs) driven by the shared Anternet schemas. Mirrors ModuleShell's
 * chrome (Firebase guard, toast, lookups, settings-tab bar) so it stays part of
 * the same design system without touching any existing module.
 */

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured, listDocs } from "../../lib/firebase";
import { COLLECTIONS, SETTINGS } from "../../lib/schemas";
import CollectionManager from "../../components/CollectionManager";
import SettingsManager from "../../components/SettingsManager";
import { Toast } from "../../components/ui";
import css from "../../styles";

/** Settings-doc fallback defaults (kept in sync with the app-side fallbacks). */
const KHOKHO_DEFAULTS = {
  khokho_splash: { tagline: "Play. Win. Earn.", subtitle: "", durationSec: 5, logoUrl: "" },
  khokho_home: { liveQuizLabel: "NEXT LIVE QUIZ", joinButtonText: "JOIN THE ARENA", featuredTitle: "FEATURED ARENAS" },
  khokho_rewards: { prizePool: "", winnerReward: 0, livesPerGame: 1, shareReward: 1 },
  khokho_leaderboard: { title: "Leaderboard", subtitle: "Real-time Arena" },
  khokho_settings: { questionDurationSec: 10, revealDelaySec: 4, defaultLives: 1 },
};

/**
 * Tab order — each tab mirrors an app SCREEN so related fields live together in
 * one form. `col` renders a CollectionManager for that COLLECTIONS key; `set`
 * renders a SettingsManager for that SETTINGS key. Arenas now nest their own
 * Questions (replacing the old Categories + Question Bank tabs) and Live
 * Streaming nests its Live Questions (replacing the old Live Questions tab).
 */
const TABS = [
  { id: "splash", label: "Splash Screen", set: "khokho_splash" },
  { id: "home", label: "Home Screen", set: "khokho_home" },
  { id: "arenas", label: "Featured Arenas", col: "arenas" },
  { id: "rules", label: "Rules Screen", col: "khokho_rules" },
  { id: "livesessions", label: "Live Streaming", col: "khokho_livesessions" },
  { id: "rewards", label: "Rewards", set: "khokho_rewards" },
  { id: "leaderboard", label: "Leaderboard", set: "khokho_leaderboard" },
  { id: "banners", label: "Banners", col: "khokho_banners" },
  { id: "settings", label: "Settings", set: "khokho_settings" },
  // Superseded by Arenas'/Live Streaming's nested Questions, but the API still
  // accepts writes/deletes here and legacy Firestore docs may still exist —
  // kept reachable so they aren't stranded outside the CMS entirely.
  { id: "categories", label: "Categories (legacy)", col: "khokho_categories" },
  { id: "questionbank", label: "Question Bank (legacy)", col: "khokho_questions" },
  { id: "livequestions", label: "Live Questions (legacy)", col: "khokho_livequestions" },
];

export default function Page() {
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("splash");
  const [lookups, setLookups] = useState({ khokho_categories: [] });

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshLookups = useCallback(async () => {
    try {
      const cats = await listDocs("khokho_categories");
      setLookups({
        khokho_categories: cats.map((c) => ({ value: c.name || c.id, label: c.name || c.id })),
      });
    } catch { /* lookups fill once data exists */ }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state set after await
  useEffect(() => { if (isFirebaseConfigured) refreshLookups(); }, [refreshLookups]);

  if (!isFirebaseConfigured) {
    return (
      <div className="mla-root mla-embed">
        <style>{css}</style>
        <div className="mla-panelcard">
          <header className="mla-pagehead"><div><h1>Firebase not configured</h1></div></header>
          <p className="mla-muted">
            Set the host app&apos;s <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables and restart.
          </p>
        </div>
      </div>
    );
  }

  const active = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="mla-root mla-embed">
      <style>{css}</style>

      <div className="mla-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {active.id === "livesessions" && (
        <div className="mla-panelcard" style={{ marginBottom: 16 }}>
          <p className="mla-muted" style={{ margin: 0 }}>
            Live quiz content is managed here; real-time question control during a session is
            driven by the host app.
          </p>
        </div>
      )}

      {active.col && (
        <CollectionManager key={active.col} schema={COLLECTIONS[active.col]} lookups={lookups} notify={notify} />
      )}

      {active.set && (
        <SettingsManager key={active.set} schema={SETTINGS[active.set]}
          defaults={KHOKHO_DEFAULTS[active.set]} lookups={lookups} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}

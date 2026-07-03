"use client";

/**
 * ModuleShell — renders one Anternet admin view inside the ALTFTool chrome
 * (host provides sidebar/header/auth; this only renders the module body).
 * Used by every modules/<key>/page.jsx wrapper.
 */

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured, listDocs } from "./lib/firebase";
import { COLLECTIONS, SETTINGS } from "./lib/schemas";
import { APP_CONFIG, FEATURE_FLAGS, REWARD_RULES, INTEGRATIONS } from "./lib/seed-data";
import CollectionManager from "./components/CollectionManager";
import SettingsManager from "./components/SettingsManager";
import SeedMigration from "./components/SeedMigration";
import UsersDashboard from "./components/UsersDashboard";
import { Toast } from "./components/ui";
import css from "./styles";

const SETTINGS_DEFAULTS = {
  app: APP_CONFIG,
  features: FEATURE_FLAGS,
  rewards: REWARD_RULES,
  integrations: INTEGRATIONS,
};

/** Module key → collection schema key (1:1 for Anternet). */
const VIEW_TO_COLLECTION = {
  banners: "banners",
  tasks: "tasks",
  quizcategories: "quizcategories",
  questions: "questions",
  spinprizes: "spinprizes",
  videosections: "videosections",
  earningtasks: "earningtasks",
  ads: "ads",
  notifications: "notifications",
  pages: "pages",
  arenas: "arenas",
};

export default function ModuleShell({ view }) {
  const [toast, setToast] = useState(null);
  const [lookups, setLookups] = useState({ quizcategories: [] });
  const [settingsTab, setSettingsTab] = useState("app");

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshLookups = useCallback(async () => {
    try {
      const cats = await listDocs("quizcategories");
      setLookups({
        quizcategories: cats.map((c) => ({ value: c.id, label: c.name || c.id })),
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
          <h3>Firebase not configured</h3>
          <p className="mla-muted">
            Set the host app&apos;s <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables and restart.
          </p>
        </div>
      </div>
    );
  }

  const collectionKey = VIEW_TO_COLLECTION[view];

  return (
    <div className="mla-root mla-embed">
      <style>{css}</style>

      {view === "migration" && <SeedMigration notify={notify} />}

      {view === "users" && <UsersDashboard notify={notify} />}

      {collectionKey && (
        <CollectionManager key={collectionKey} schema={COLLECTIONS[collectionKey]} lookups={lookups} notify={notify} />
      )}

      {view === "settings" && (
        <div>
          <div className="mla-tabs">
            {Object.entries(SETTINGS).map(([id, s]) => (
              <button key={id} className={settingsTab === id ? "on" : ""} onClick={() => setSettingsTab(id)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <SettingsManager key={settingsTab} schema={SETTINGS[settingsTab]}
            defaults={SETTINGS_DEFAULTS[settingsTab]} lookups={lookups} notify={notify} />
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

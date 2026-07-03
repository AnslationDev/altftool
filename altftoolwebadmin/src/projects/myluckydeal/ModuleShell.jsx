"use client";

/**
 * ModuleShell — renders one admin view inside the ALTFTool chrome
 * (host provides sidebar/header/auth; this only renders the module body).
 * Used by every modules/<key>/page.jsx wrapper.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured, listDocs } from "./lib/firebase";
import { COLLECTIONS, SETTINGS } from "./lib/schemas";
import { SITE, TRENDING_SEARCHES, HOME_CONFIG, UI_CONTENT } from "./lib/seed-data";
import CollectionManager from "./components/CollectionManager";
import SettingsManager from "./components/SettingsManager";
import Dashboard from "./components/Dashboard";
import SeedMigration from "./components/SeedMigration";
import { Toast } from "./components/ui";
import css from "./styles";

const SETTINGS_DEFAULTS = {
  site: SITE,
  trendingSearches: { terms: TRENDING_SEARCHES },
  home: HOME_CONFIG,
  ui: UI_CONTENT,
  seo: {},
};

/** Module key → collection schema key (where they differ). */
const VIEW_TO_COLLECTION = {
  deals: "deals", categories: "categories", stores: "stores", coupons: "coupons",
  blogs: "blogs", faqs: "faqs", hero: "hero", ads: "ads",
  offers: "featuredOffers", collections: "collections",
};

export default function ModuleShell({ view }) {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [lookups, setLookups] = useState({ categories: [], stores: [] });
  const [settingsTab, setSettingsTab] = useState("site");

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshLookups = useCallback(async () => {
    try {
      const [cats, stores] = await Promise.all([listDocs("categories"), listDocs("stores")]);
      setLookups({
        categories: cats.map((c) => ({ value: c.slug || c.id, label: c.name || c.id })),
        stores: stores.map((s) => ({ value: s.slug || s.id, label: s.name || s.id })),
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
            Set the host app&apos;s <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables
            (see <code>src/projects/myluckydeal/README.md</code>) and restart.
          </p>
        </div>
      </div>
    );
  }

  const collectionKey = VIEW_TO_COLLECTION[view];

  return (
    <div className="mla-root mla-embed">
      <style>{css}</style>

      {view === "dashboard" && (
        <Dashboard notify={notify} onNavigate={(col) => router.push(`/myluckydeal/${col === "featuredOffers" ? "offers" : col}`)} />
      )}

      {view === "migration" && <SeedMigration notify={notify} />}

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

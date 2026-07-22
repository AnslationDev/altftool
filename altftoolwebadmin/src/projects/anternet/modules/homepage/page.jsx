"use client";

/**
 * Home Page — a tabbed CMS module for the Anternet app's Home screen.
 * Mirrors Kho Kho's self-contained tab-bar pattern. One tab today (Trendy
 * Tasks, same underlying `trendingtasks` collection the app already reads);
 * room to add more Home sections (banners, explore cards, …) as tabs later
 * without re-architecting.
 */

import { useCallback, useState } from "react";
import { isFirebaseConfigured } from "../../lib/firebase";
import { COLLECTIONS } from "../../lib/schemas";
import CollectionManager from "../../components/CollectionManager";
import { Toast } from "../../components/ui";
import css from "../../styles";

const TABS = [
  { id: "trendytasks", label: "Trendy Tasks", col: "trendingtasks" },
];

export default function Page() {
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("trendytasks");

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

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

      {active.col && (
        <CollectionManager key={active.col} schema={COLLECTIONS[active.col]} lookups={{}} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}

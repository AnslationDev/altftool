"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { Check, DatabaseZap, Loader2, X } from "lucide-react";

// One-time backfill: import historical admin_audit_logs into the Workspace
// activity_events so the explorer shows full history. Loops the resumable
// migration API until done. Safe to run repeatedly (idempotent server-side).
export default function MigrationBanner() {
  const [state, setState] = useState("idle"); // idle | running | done | error
  const [migrated, setMigrated] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const run = async () => {
    setState("running");
    setMigrated(0);
    let cursor = null;
    let total = 0;
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) throw new Error("no session");
      for (let guard = 0; guard < 2000; guard++) {
        const params = new URLSearchParams({ batch: "200" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/activity/migrate?${params}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`http ${res.status}`);
        const data = await res.json();
        total += data.migrated || 0;
        setMigrated(total);
        if (!data.hasMore) break;
        cursor = data.nextCursor;
        if (!cursor) break;
      }
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (dismissed) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
          <DatabaseZap className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Import historical activity</p>
          <p className="text-xs text-[var(--muted)]">
            {state === "done"
              ? `Imported ${migrated} historical event${migrated === 1 ? "" : "s"} into the explorer.`
              : state === "error"
                ? "Import hit an error — you can retry; it resumes where it left off."
                : "Backfill past audit logs so older activity appears here too. Safe to re-run."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {state === "done" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm font-bold text-[var(--success)]">
            <Check className="h-4 w-4" /> Done
          </span>
        ) : (
          <button
            type="button"
            onClick={run}
            disabled={state === "running"}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] transition hover:brightness-95 disabled:opacity-60"
          >
            {state === "running" ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing… {migrated}</> : "Import history"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

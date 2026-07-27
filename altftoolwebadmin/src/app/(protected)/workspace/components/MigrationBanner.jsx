"use client";

import { useEffect, useRef, useState } from "react";
import { Check, DatabaseZap, Loader2, X } from "lucide-react";
import { Button, IconButton } from "@altftool/ui";
import { SectionCard } from "@/ansets";
import { getAdminIdToken } from "@/lib/adminIdToken";

// One-time backfill: import historical admin_audit_logs into the Workspace
// activity_events so the explorer shows full history. Loops the resumable
// migration API until done. Safe to run repeatedly (idempotent server-side).
export default function MigrationBanner() {
  const [state, setState] = useState("idle"); // idle | running | done | error
  const [migrated, setMigrated] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  // Guard against setState-after-unmount: the import can run for many sequential
  // round-trips and the user may navigate away mid-loop.
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const run = async () => {
    setState("running");
    setMigrated(0);
    let cursor = null;
    let total = 0;
    let complete = false;
    try {
      const token = await getAdminIdToken();
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
        if (mountedRef.current) setMigrated(total);
        if (!data.hasMore) { complete = true; break; } // genuinely finished
        cursor = data.nextCursor;
        if (!cursor) break; // hasMore but no cursor → stuck; stop as incomplete
        if (!mountedRef.current) return; // user left the page — stop the loop
      }
      // Only report "done" when the server actually said there was no more. If
      // we bailed on the safety cap / a missing cursor, surface it as an error
      // so the user knows the import is incomplete and can resume.
      if (mountedRef.current) setState(complete ? "done" : "error");
    } catch {
      if (mountedRef.current) setState("error");
    }
  };

  if (dismissed) return null;

  return (
    <SectionCard
      className="mb-5"
      bodyClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
          <DatabaseZap className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Import historical activity</p>
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
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm font-semibold text-[var(--success)]">
            <Check className="h-4 w-4" aria-hidden="true" /> Done
          </span>
        ) : (
          <Button size="sm" onClick={run} disabled={state === "running"}>
            {state === "running" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Importing… {migrated}
              </>
            ) : (
              "Import history"
            )}
          </Button>
        )}
        <IconButton variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <X className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
    </SectionCard>
  );
}

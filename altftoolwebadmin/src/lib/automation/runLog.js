// ALTF Engine — Content Automation: run logging + daily budget accounting.
// Every lane execution writes one doc to projects/altftool/blogAutomationRuns
// (kind: "blog" | "seo" | "trending"), which also powers the daily limits.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { RUNS_COLLECTION, fsPath } from "./constants";

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** How many items each lane has already produced today (for daily limits). */
export async function countProducedToday(kind) {
  const snap = await adminDb
    .collection(fsPath(RUNS_COLLECTION))
    .where("startedAt", ">=", startOfTodayUtc())
    .get();

  let produced = 0;
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.kind !== kind) return;
    produced += Array.isArray(data.created) ? data.created.length : Number(data.createdCount || 0);
  });
  return produced;
}

/** Total estimated OpenAI spend across ALL lanes today (for the daily cost cap). */
export async function sumCostToday() {
  const snap = await adminDb
    .collection(fsPath(RUNS_COLLECTION))
    .where("startedAt", ">=", startOfTodayUtc())
    .get();

  let total = 0;
  snap.forEach((doc) => {
    total += Number(doc.data()?.costEstimate) || 0;
  });
  return total;
}

/** Create a run doc up-front so crashes still leave a visible trace. */
export async function startRun({ kind, trigger = "cron", startedBy = "" }) {
  const ref = adminDb.collection(fsPath(RUNS_COLLECTION)).doc();
  await ref.set({
    kind,
    trigger,
    startedBy,
    status: "running",
    created: [],
    failed: [],
    tokensUsed: 0,
    costEstimate: 0,
    startedAt: FieldValue.serverTimestamp(),
    finishedAt: null,
  });
  return ref;
}

export async function finishRun(ref, { created = [], failed = [], tokensUsed = 0, costEstimate = 0, error = "" }) {
  await ref.set(
    {
      status: error ? "error" : "done",
      error: error || "",
      created,
      failed,
      createdCount: created.length,
      failedCount: failed.length,
      tokensUsed,
      costEstimate: Number(costEstimate.toFixed ? costEstimate.toFixed(4) : costEstimate),
      finishedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

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

/**
 * How many items a lane has produced today (for daily limits) plus total
 * estimated spend across ALL lanes today (for the daily cost cap), in one
 * query — every lane run (blogLane, seoLane) needs both back-to-back, so
 * fetching the same day's run docs once avoids a duplicate read.
 */
export async function getTodayUsage(kind) {
  const snap = await adminDb
    .collection(fsPath(RUNS_COLLECTION))
    .where("startedAt", ">=", startOfTodayUtc())
    .get();

  let produced = 0;
  let totalCost = 0;
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.kind === kind) {
      produced += Array.isArray(data.created) ? data.created.length : Number(data.createdCount || 0);
    }
    totalCost += Number(data?.costEstimate) || 0;
  });
  return { produced, totalCost };
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

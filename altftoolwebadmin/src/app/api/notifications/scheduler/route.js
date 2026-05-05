/**
 * scheduler.js
 *
 * Reusable function to process due scheduled broadcasts.
 * Call this from a cron job, Cloud Scheduler, or Cloud Function trigger.
 *
 * Example Cloud Function usage:
 *
 *   import { processDueScheduledBroadcasts } from "@/lib/broadcastScheduler";
 *
 *   export const scheduledBroadcast = functions.pubsub
 *     .schedule("every 1 minutes")
 *     .onRun(async () => {
 *       await processDueScheduledBroadcasts();
 *     });
 */

import { adminDb } from "@/lib/firebaseAdmin";
import { deliverBroadcast } from "@/app/api/notifications/broadcast/route";

/**
 * Finds all broadcasts with status="scheduled" and scheduledAt <= now,
 * then delivers each one using the same logic as the instant send path.
 */
export async function processDueScheduledBroadcasts() {
  const now = Date.now();

  const snap = await adminDb
    .collection("notification_broadcasts")
    .where("status", "==", "scheduled")
    .where("scheduledAt", "<=", now)
    .get();

  if (snap.empty) {
    return { processed: 0 };
  }

  let processed = 0;
  for (const doc of snap.docs) {
    try {
      await deliverBroadcast(doc.id, doc.data());
      processed++;
    } catch (err) {
      console.error(`[scheduler] Failed to deliver broadcast ${doc.id}:`, err.message);
    }
  }

  return { processed };
}

/**
 * Next.js API Route handler — for manual triggering or cron ping.
 *
 * GET /api/notifications/scheduler
 * Secured by CRON_SECRET env var (set same secret in your cron service).
 */
export async function GET(request) {
  const { NextResponse } = await import("next/server");

  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, verify it
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueScheduledBroadcasts();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[scheduler/GET]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

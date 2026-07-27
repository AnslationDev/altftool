import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

// Firestore rejects batches with more than 500 operations.
const BATCH_CHUNK_SIZE = 450;

function secretsMatch(provided, expected) {
  const a = Buffer.from(String(provided ?? ""));
  const b = Buffer.from(String(expected ?? ""));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function findExpiredTickets(now) {
  return adminDb
    .collection("support_tickets")
    .where("status", "==", "closed")
    .where("autoDeleteAt", "<=", now)
    .where("isDeleted", "!=", true)
    .orderBy("isDeleted")
    .orderBy("autoDeleteAt")
    .get();
}

async function softDeleteDocs(docs, now) {
  for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
    const batch = adminDb.batch();
    docs.slice(i, i + BATCH_CHUNK_SIZE).forEach((doc) => {
      batch.update(doc.ref, { isDeleted: true, updatedAt: now });
    });
    await batch.commit();
  }
}

/**
 * POST /api/support/auto-delete
 *
 * Soft-deletes tickets where:
 *   - status = "closed"
 *   - autoDeleteAt <= now
 *   - isDeleted !== true
 *
 * Call this from a cron job or scheduled function.
 * Protected by the CRON_SECRET env var (sent as `Authorization: Bearer <secret>`).
 */
export async function POST(request) {
  try {
    const secret = process.env.CRON_SECRET;

    // Fail closed: a missing/empty CRON_SECRET must NOT leave this endpoint
    // open. Previously the check was skipped entirely when CRON_SECRET was
    // unset, which let anyone mass-delete closed tickets.
    if (!secret) {
      console.error("[support/auto-delete] CRON_SECRET is not configured — refusing to run.");
      return NextResponse.json({ error: "Auto-delete is not configured" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization") || "";
    if (!secretsMatch(authHeader, `Bearer ${secret}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const snap = await findExpiredTickets(now);

    if (snap.empty) {
      return NextResponse.json({ deleted: 0 });
    }

    await softDeleteDocs(snap.docs, now);

    return NextResponse.json({ deleted: snap.size });
  } catch (err) {
    console.error("AUTO_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Reusable function for use in other server contexts (e.g. Firebase scheduled functions)
 */
export async function runAutoDelete() {
  const now = Date.now();
  const snap = await findExpiredTickets(now);

  if (snap.empty) return 0;

  await softDeleteDocs(snap.docs, now);
  return snap.size;
}

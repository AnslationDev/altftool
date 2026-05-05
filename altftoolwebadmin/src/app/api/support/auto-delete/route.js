import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * POST /api/support/auto-delete
 *
 * Soft-deletes tickets where:
 *   - status = "closed"
 *   - autoDeleteAt <= now
 *   - isDeleted !== true
 *
 * Call this from a cron job or scheduled function.
 * Optionally protect with a shared secret via CRON_SECRET env var.
 */
export async function POST(request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = Date.now();

    const snap = await adminDb
      .collection("support_tickets")
      .where("status", "==", "closed")
      .where("autoDeleteAt", "<=", now)
      .where("isDeleted", "!=", true)
      .orderBy("isDeleted")
      .orderBy("autoDeleteAt")
      .get();

    if (snap.empty) {
      return NextResponse.json({ deleted: 0 });
    }

    const batch = adminDb.batch();
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, { isDeleted: true, updatedAt: now });
    });

    await batch.commit();

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

  const snap = await adminDb
    .collection("support_tickets")
    .where("status", "==", "closed")
    .where("autoDeleteAt", "<=", now)
    .where("isDeleted", "!=", true)
    .orderBy("isDeleted")
    .orderBy("autoDeleteAt")
    .get();

  if (snap.empty) return 0;

  const batch = adminDb.batch();
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, { isDeleted: true, updatedAt: now });
  });

  await batch.commit();
  return snap.size;
}
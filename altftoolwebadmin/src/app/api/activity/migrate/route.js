// Zero-downtime backfill: classify historical admin_audit_logs into the
// Workspace activity_events + rollups, preserving original timestamps.
//
//   POST /api/activity/migrate?cursor=<lastDocId>&batch=200
//
// Super-admin only. Batched + resumable (scans by document id, returns a cursor)
// and idempotent (marks each source doc `migratedToActivity: true`; skips docs
// that already carry a hierarchyPath — those are post-migration mirrors whose
// activity_events already exist). Non-destructive: the source docs are kept.
import { NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";
import { writeActivityEvent } from "@/lib/activity/writeActivityEvent";

const LEGACY = "admin_audit_logs";

function entryFromLegacy(d) {
  return {
    action: d.action,
    module: d.module || null,
    actorUid: d.actorUid || null,
    actorEmail: d.actorEmail || null,
    actorRole: d.actorRole || null,
    targetUid: d.targetUid || null,
    targetEmail: d.targetEmail || null,
    status: d.status || "success",
    summary: d.summary || null,
    changes: d.changes ?? null,
    entityType: d.metadata?.entityType || null,
    entityId: d.metadata?.entityId || null,
    route: d.metadata?.route || null,
    projectId: d.metadata?.projectId || null,
    application: d.metadata?.application || null,
    ipMasked: d.ipMasked || null,
    ipEncrypted: d.ipEncrypted || null,
    country: d.country || null,
    region: d.region || null,
    city: d.city || null,
    deviceLabel: d.deviceLabel || null,
    browser: d.browser || null,
    os: d.os || null,
    deviceId: d.deviceId || null,
    sessionId: d.sessionId || null,
  };
}

export async function POST(request) {
  try {
    await verifySuperAdminRequest(request);
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor") || null;
    const sizeParam = Number(url.searchParams.get("batch") || 200);
    const batchSize = Math.min(Math.max(Number.isFinite(sizeParam) ? sizeParam : 200, 20), 400);

    let q = adminDb.collection(LEGACY).orderBy(FieldPath.documentId()).limit(batchSize);
    if (cursor) q = q.startAfter(cursor);
    const snap = await q.get();

    let migrated = 0;
    let skipped = 0;

    for (const doc of snap.docs) {
      const d = doc.data() || {};
      if (d.migratedToActivity === true || d.metadata?.hierarchyPath) {
        skipped++; // already migrated, or a post-Phase-3 mirror (event exists)
        continue;
      }
      if (!d.action) { skipped++; continue; }
      const atMs = d.createdAtMs || d.createdAt?.toMillis?.() || Date.now();
      // Deterministic event id keyed on the source doc → a re-run OVERWRITES the
      // same event instead of creating a duplicate.
      const written = await writeActivityEvent(entryFromLegacy(d), {
        mirrorLegacy: false,
        atMs,
        eventId: `legacy_${doc.id}`,
      });
      if (!written) { skipped++; continue; } // write failed — leave unflagged, retried next run
      // Flag THIS doc immediately (not batched to the end). If the request dies
      // mid-run only the single in-flight doc can be reprocessed, and the
      // deterministic id makes that reprocess idempotent for the event doc.
      await doc.ref.set({ migratedToActivity: true }, { merge: true });
      migrated++;
    }

    const scanned = snap.size;
    const hasMore = scanned === batchSize;
    const nextCursor = hasMore && scanned ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json({ scanned, migrated, skipped, hasMore, nextCursor });
  } catch (error) {
    console.error("ACTIVITY_MIGRATE_ERROR:", error?.message || error);
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Migration failed" },
      { status },
    );
  }
}

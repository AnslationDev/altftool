import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

async function verifySuperAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const token = authHeader.split("Bearer ")[1];
  const decoded = await adminAuth.verifyIdToken(token);

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  const data = snap.data();
  if (!snap.exists || data?.roleType !== "superadmin" || !data?.isActive) {
    throw new Error("Unauthorized");
  }

  return decoded;
}

function toFirestoreTimestamp(isoOrMs) {
  if (!isoOrMs) return null;
  const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (isNaN(ms)) return null;
  return new Date(ms);
}

function normalizeLog(doc) {
  const data = doc.data();
  const createdAt = data.createdAt;
  const createdAtMs =
    typeof createdAt?.toMillis === "function"
      ? createdAt.toMillis()
      : createdAt?.seconds
        ? createdAt.seconds * 1000
        : null;

  // Only return fields the frontend needs — keeps payload lean
  return {
    id: doc.id,
    action: data.action ?? null,
    module: data.module ?? null,
    summary: data.summary ?? null,
    actorUid: data.actorUid ?? null,
    actorEmail: data.actorEmail ?? null,
    targetUid: data.targetUid ?? null,
    targetEmail: data.targetEmail ?? null,
    createdAtMs,
  };
}

export async function GET(request) {
  try {
    await verifySuperAdmin(request);

    const url = new URL(request.url);
    const pageSizeParam = Number(url.searchParams.get("pageSize") || 30);
    const pageSize = Math.min(Math.max(Number.isFinite(pageSizeParam) ? pageSizeParam : 30, 10), 100);

    // Date range — default to last 10 days
    const now = Date.now();
    const defaultStart = now - 10 * 24 * 60 * 60 * 1000;

    const startDateRaw = url.searchParams.get("startDate");
    const endDateRaw = url.searchParams.get("endDate");

    const startDate = toFirestoreTimestamp(startDateRaw ? startDateRaw : defaultStart);
    const endDate = toFirestoreTimestamp(endDateRaw ? endDateRaw : now);

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Cursor-based pagination: cursor is the createdAtMs of the last doc
    const cursorMs = url.searchParams.get("cursor")
      ? Number(url.searchParams.get("cursor"))
      : null;

    let query = adminDb
      .collection("admin_audit_logs")
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .orderBy("createdAt", "desc")
      .limit(pageSize + 1); // fetch one extra to determine hasMore

    // If cursor provided, fetch the cursor document first then use startAfter
    if (cursorMs) {
      const cursorDate = new Date(cursorMs);
      // Use a timestamp-based cursor via startAfter on the createdAt field
      // We add 1ms offset to avoid re-fetching the boundary doc
      const cursorTs = new Date(cursorMs - 1); // slightly before so startAfter works correctly
      query = adminDb
        .collection("admin_audit_logs")
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", cursorTs)
        .orderBy("createdAt", "desc")
        .limit(pageSize + 1);
    }

    const snap = await query.get();
    const docs = snap.docs;

    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const logs = pageDocs.map(normalizeLog);

    // nextCursor is the createdAtMs of the last doc returned
    const lastDoc = pageDocs[pageDocs.length - 1];
    const nextCursor = hasMore && lastDoc ? normalizeLog(lastDoc).createdAtMs : null;

    return NextResponse.json({
      logs,
      nextCursor,
      hasMore,
      meta: {
        startDateMs: startDate.getTime(),
        endDateMs: endDate.getTime(),
        pageSize,
        count: logs.length,
      },
    });
  } catch (err) {
    console.error("[audit/list]", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
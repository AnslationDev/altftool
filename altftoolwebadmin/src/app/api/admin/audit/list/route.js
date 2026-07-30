import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { createLocalDevAdminActor, isLocalDevAdminRequest } from "@/lib/adminAccess";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";

// Local variant of lib/adminAccess.js's verifySuperAdminRequest that keeps the
// same RBAC + legacy + local-dev-bypass resolution, but — like the
// requireSuperAdmin() in src/app/api/rbac/bootstrap/route.js — distinguishes
// "no/invalid token" (Unauthorized) from "valid token, insufficient role"
// (Forbidden) via the thrown error's message. verifySuperAdminRequest itself
// throws "Unauthorized" for both cases, which is fine for the routes that
// already collapse every authz failure to 401 — but this route's catch below
// needs the distinction, so it gets its own resolver rather than changing the
// shared one (other routes' catch blocks treat any non-"Unauthorized" message
// as a 500, so widening verifySuperAdminRequest's vocabulary would misclassify
// their errors).
async function requireSuperAdmin(request) {
  if (isLocalDevAdminRequest(request)) {
    return createLocalDevAdminActor();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);

  const rbacAdmin = await getRbacAdminDoc(decoded);
  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isSuperAdmin || !profile.isActive) throw new Error("Forbidden");
    return decoded;
  }

  let snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists && decoded.email) {
    const emailSnap = await adminDb
      .collection("admins")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();
    if (!emailSnap.empty) snap = emailSnap.docs[0];
  }

  if (!snap.exists) throw new Error("Forbidden");
  const data = snap.data();
  if (data?.roleType !== "superadmin" || data?.isActive === false) throw new Error("Forbidden");

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
    // requireSuperAdmin() (above) covers RBAC + legacy + the dev bypass, same
    // as lib/adminAccess.js's verifySuperAdminRequest, but throws a distinct
    // "Forbidden" for a valid-but-insufficient-role caller so the catch below
    // can answer 403 instead of a blanket 401.
    await requireSuperAdmin(request);

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

    // Cursor-based pagination: cursor is the Firestore doc id of the last log
    // returned on the previous page.
    const cursorId = url.searchParams.get("cursor") || null;

    // Server-side "filter by admin" — actorUid/targetUid scope the query to a
    // single admin's full history within the date range, instead of forcing
    // callers to page through everything and filter client-side. `module`
    // does the same for a single module (e.g. "admin-management") — this
    // collection is a cross-app activity sink (SEO, blogs, tickets, RBAC
    // bootstrap, etc. all write into it via their own `module`), so without
    // this a burst of unrelated activity in the date window can push the
    // admin-management events an operator is looking for onto a later page.
    const actorUidParam = url.searchParams.get("actorUid");
    const targetUidParam = url.searchParams.get("targetUid");
    const moduleParam = url.searchParams.get("module");

    const collectionRef = adminDb.collection("admin_audit_logs");

    const buildQuery = () => {
      let q = collectionRef
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", endDate);
      if (actorUidParam) q = q.where("actorUid", "==", actorUidParam);
      if (targetUidParam) q = q.where("targetUid", "==", targetUidParam);
      if (moduleParam) q = q.where("module", "==", moduleParam);
      return q.orderBy("createdAt", "desc").limit(pageSize + 1); // fetch one extra to determine hasMore
    };

    let query = buildQuery();

    // Fetch the cursor document itself, then paginate with a real
    // `startAfter(docSnapshot)` — Firestore Timestamps carry nanosecond
    // precision, but the previous implementation truncated the cursor to
    // milliseconds and re-ran the same `<=` inequality query, which could
    // permanently drop any entry sharing the exact millisecond of the page
    // boundary (e.g. a bulk "Deactivate 5 admins" action firing near-
    // simultaneous writes). A real document cursor cannot have this gap.
    if (cursorId) {
      const cursorSnap = await collectionRef.doc(cursorId).get();
      if (cursorSnap.exists) {
        query = query.startAfter(cursorSnap);
      }
      // If the cursor doc is gone (e.g. deleted), fall back to the
      // unmodified query rather than erroring the whole page out.
    }

    const snap = await query.get();
    const docs = snap.docs;

    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const logs = pageDocs.map(normalizeLog);

    // nextCursor is the doc id of the last doc returned on this page.
    const lastDoc = pageDocs[pageDocs.length - 1];
    const nextCursor = hasMore && lastDoc ? lastDoc.id : null;

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
    // Mirrors src/app/api/rbac/bootstrap/route.js: "Unauthorized" (no/invalid
    // token) -> 401, "Forbidden" (valid token, insufficient role) -> 403,
    // anything else (a genuine Firestore/infra fault) -> 500. Previously every
    // branch — including a legitimate non-superadmin's Forbidden case and
    // unrelated infra errors — collapsed to 401 "Unauthorized", which the
    // client always rendered as "Your session has expired. Sign in again."
    //
    // Also treats any raw `auth/*` Firebase error (expired/malformed/revoked
    // token — thrown by adminAuth.verifyIdToken() itself, before it reaches
    // requireSuperAdmin's own explicit throws) as Unauthorized rather than a
    // bucket-of-last-resort 500 — confirmed by hitting this route with a
    // garbage bearer token, which otherwise reported "Internal Server Error"
    // for what is, from the operator's chair, an expired-session case. Same
    // classification src/app/api/audit/log/route.js already uses.
    const message = err?.message || "";
    const code = err?.code || err?.errorInfo?.code || "";
    console.error("[audit/list]", message || err);
    let status;
    if (message === "Forbidden") {
      status = 403;
    } else if (message === "Unauthorized" || (typeof code === "string" && code.startsWith("auth/"))) {
      status = 401;
    } else {
      status = 500;
    }
    const error = status === 403 ? "Forbidden" : status === 401 ? "Unauthorized" : "Internal Server Error";
    return NextResponse.json({ error }, { status });
  }
}
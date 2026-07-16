// Activity feed for the Workspace Explorer.
//
//   GET /api/activity/events?path=<hierarchyPath>&pageSize&cursor&from&to
//
// Returns events in the SELECTED SUBTREE, newest first. Subtree membership uses
// the denormalized `pathAncestors` array so the query stays time-ordered
// (array-contains composes with orderBy, unlike a string range). Empty path =
// the whole workspace. Cursor is the createdAtMs of the last row.
import { NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";

const COLLECTION = "activity_events";

// Parse a numeric query param, treating "" / missing / non-numeric as absent
// (a NaN would silently pass a `!= null` guard and match zero documents).
function numParam(url, key) {
  const raw = url.searchParams.get(key);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function serialize(data) {
  const { createdAt, ...rest } = data || {};
  return rest; // createdAtMs (number) is already present; drop the Timestamp
}

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "";
    const sizeParam = Number(url.searchParams.get("pageSize") || 40);
    const pageSize = Math.min(Math.max(Number.isFinite(sizeParam) ? sizeParam : 40, 10), 100);
    // Cursor is composite: "<createdAtMs>_<docId>" (a bare timestamp cursor
    // dropped every event that shared the last row's millisecond — common after
    // a bulk backfill assigns many events the same ms).
    const rawCursor = url.searchParams.get("cursor") || "";
    let cursorMs = null;
    let cursorId = null;
    const cutIdx = rawCursor.lastIndexOf("_");
    if (cutIdx > 0) {
      const ms = Number(rawCursor.slice(0, cutIdx));
      if (Number.isFinite(ms)) { cursorMs = ms; cursorId = rawCursor.slice(cutIdx + 1); }
    }
    const from = numParam(url, "from");
    const to = numParam(url, "to");
    // Scoped views (alternative primary filters): User Activity + Entity History.
    const actorUid = url.searchParams.get("actorUid") || null;
    const entityType = url.searchParams.get("entityType") || null;
    const entityId = url.searchParams.get("entityId") || null;

    let q = adminDb.collection(COLLECTION);
    if (entityId) {
      // Entity History — one entity's lifecycle across the workspace.
      if (entityType) q = q.where("entityType", "==", entityType);
      q = q.where("entityId", "==", entityId);
    } else if (actorUid) {
      // User Activity — everything one actor did.
      q = q.where("actorUid", "==", actorUid);
    } else if (path) {
      // Subtree feed.
      q = q.where("pathAncestors", "array-contains", path);
    }
    if (from != null) q = q.where("createdAtMs", ">=", from);
    if (to != null) q = q.where("createdAtMs", "<=", to);
    // Document id is the tiebreaker so ties on createdAtMs paginate correctly.
    // Existing composite indexes end in `createdAtMs DESC`, whose implicit
    // __name__ ordering matches this, so no new index is required.
    q = q.orderBy("createdAtMs", "desc").orderBy(FieldPath.documentId(), "desc").limit(pageSize + 1);
    if (cursorMs != null && cursorId) q = q.startAfter(cursorMs, cursorId);

    const snap = await q.get();
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const returned = docs.slice(0, pageSize);
    const events = returned.map((d) => ({ id: d.id, ...serialize(d.data()) }));
    const last = returned[returned.length - 1];
    const nextCursor = hasMore && last ? `${last.data().createdAtMs}_${last.id}` : null;

    return NextResponse.json({ path, events, hasMore, nextCursor });
  } catch (error) {
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load activity" },
      { status },
    );
  }
}

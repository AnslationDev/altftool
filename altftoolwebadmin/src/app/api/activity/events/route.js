// Activity feed for the Workspace Explorer.
//
//   GET /api/activity/events?path=<hierarchyPath>&pageSize&cursor&from&to
//
// Returns events in the SELECTED SUBTREE, newest first. Subtree membership uses
// the denormalized `pathAncestors` array so the query stays time-ordered
// (array-contains composes with orderBy, unlike a string range). Empty path =
// the whole workspace. Cursor is the createdAtMs of the last row.
import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";

const COLLECTION = "activity_events";

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
    const cursor = url.searchParams.get("cursor") ? Number(url.searchParams.get("cursor")) : null;
    const from = url.searchParams.get("from") ? Number(url.searchParams.get("from")) : null;
    const to = url.searchParams.get("to") ? Number(url.searchParams.get("to")) : null;

    let q = adminDb.collection(COLLECTION);
    if (path) q = q.where("pathAncestors", "array-contains", path);
    if (from != null) q = q.where("createdAtMs", ">=", from);
    if (to != null) q = q.where("createdAtMs", "<=", to);
    q = q.orderBy("createdAtMs", "desc").limit(pageSize + 1);
    if (cursor != null) q = q.startAfter(cursor);

    const snap = await q.get();
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const events = docs.slice(0, pageSize).map((d) => ({ id: d.id, ...serialize(d.data()) }));
    const nextCursor = hasMore && events.length ? events[events.length - 1].createdAtMs : null;

    return NextResponse.json({ path, events, hasMore, nextCursor });
  } catch (error) {
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load activity" },
      { status },
    );
  }
}

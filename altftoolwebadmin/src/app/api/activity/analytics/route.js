// Analytics for a Workspace node (any level: workspace/project/application/
// module/section/feature).
//
//   GET /api/activity/analytics?path=<hierarchyPath>&days=30
//
// Totals + action distribution come from O(1) rollups; growth-over-time, top
// actors, and most-modified entities are computed from a bounded recent-events
// window. Everything is RBAC-verified (super admin).
import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";
import { getWorkspaceChildren } from "@/lib/workspace";

const EVENTS = "activity_events";
const ROLLUPS = "activity_rollups";
const rid = (p) => String(p || "unclassified").replace(/\//g, "~");
const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "";
    const days = Math.min(Math.max(Number(url.searchParams.get("days") || 30), 7), 90);
    const children = getWorkspaceChildren(path);

    // Totals + byAction (O(1) rollups). Root has no single rollup → aggregate projects.
    let total = 0;
    const byAction = {};
    const childSnaps = await Promise.all(
      children.map((c) => adminDb.collection(ROLLUPS).doc(rid(c.hierarchyPath)).get().catch(() => null)),
    );
    if (path) {
      const snap = await adminDb.collection(ROLLUPS).doc(rid(path)).get().catch(() => null);
      if (snap?.exists) {
        const d = snap.data();
        total = d.count || 0;
        Object.assign(byAction, d.byAction || {});
      }
    } else {
      for (const s of childSnaps) {
        if (s?.exists) {
          const d = s.data();
          total += d.count || 0;
          for (const [k, v] of Object.entries(d.byAction || {})) byAction[k] = (byAction[k] || 0) + v;
        }
      }
    }

    const childBreakdown = children
      .map((c, i) => ({
        label: c.label, hierarchyPath: c.hierarchyPath, level: c.level,
        count: childSnaps[i]?.exists ? childSnaps[i].data().count || 0 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent window → growth, top actors, most-modified entities.
    const cutoff = Date.now() - days * 86400000;
    let q = adminDb.collection(EVENTS);
    if (path) q = q.where("pathAncestors", "array-contains", path);
    q = q.where("createdAtMs", ">=", cutoff).orderBy("createdAtMs", "desc").limit(1500);
    const evSnap = await q.get();
    const events = evSnap.docs.map((d) => d.data());

    const bucket = new Map();
    for (let i = days - 1; i >= 0; i--) bucket.set(dayKey(Date.now() - i * 86400000), 0);
    const actors = new Map();
    const entities = new Map();
    for (const e of events) {
      const k = dayKey(e.createdAtMs);
      if (bucket.has(k)) bucket.set(k, bucket.get(k) + 1);
      if (e.actorEmail) {
        const a = actors.get(e.actorEmail) || { email: e.actorEmail, uid: e.actorUid || null, count: 0 };
        a.count++;
        actors.set(e.actorEmail, a);
      }
      if (e.entityId) {
        const ek = `${e.entityType || "item"}:${e.entityId}`;
        const en = entities.get(ek) || { entityType: e.entityType || null, entityId: e.entityId, name: e.entityName || null, count: 0 };
        en.count++;
        if (!en.name && e.entityName) en.name = e.entityName;
        entities.set(ek, en);
      }
    }

    return NextResponse.json({
      path, days, total, windowTotal: events.length,
      byAction,
      childBreakdown,
      growth: [...bucket.entries()].map(([date, count]) => ({ date, count })),
      topActors: [...actors.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      topEntities: [...entities.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      uniqueActors: actors.size,
    });
  } catch (error) {
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load analytics" },
      { status },
    );
  }
}

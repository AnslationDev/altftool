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

// Run async tasks with a bounded fan-out (keeps per-day count() queries cheap
// without hammering Firestore with 90 simultaneous requests).
async function mapWithConcurrency(items, fn, limit = 10) {
  const results = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

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

    // Growth over time — EXACT per-day counts via cheap count() aggregations.
    // (A single bounded doc-read window read only the newest N events, so once a
    // busy node exceeded the cap older days falsely dropped to zero.)
    const now = Date.now();
    const dayMs = 86400000;
    const startOfUtcDay = (ms) => { const d = new Date(ms); d.setUTCHours(0, 0, 0, 0); return d.getTime(); };
    const scoped = (col) => (path ? col.where("pathAncestors", "array-contains", path) : col);
    const dayStarts = [];
    for (let i = days - 1; i >= 0; i--) dayStarts.push(startOfUtcDay(now - i * dayMs));

    const dayCounts = await mapWithConcurrency(dayStarts, async (ds) => {
      const agg = await scoped(adminDb.collection(EVENTS))
        .where("createdAtMs", ">=", ds)
        .where("createdAtMs", "<", ds + dayMs)
        .count().get();
      return agg.data().count || 0;
    });
    const growth = dayStarts.map((ds, i) => ({ date: dayKey(ds), count: dayCounts[i] }));
    const windowTotal = dayCounts.reduce((a, b) => a + b, 0);

    // Top actors / most-modified entities — from a bounded recent SAMPLE (exact
    // top-N would require reading every event). The counts above are exact;
    // these lists are "recent activity" approximations for very busy nodes.
    const sampleSnap = await scoped(adminDb.collection(EVENTS))
      .where("createdAtMs", ">=", dayStarts[0] ?? now - days * dayMs)
      .orderBy("createdAtMs", "desc")
      .limit(1500)
      .get();
    const actors = new Map();
    const entities = new Map();
    for (const e of sampleSnap.docs.map((d) => d.data())) {
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
      path, days, total, windowTotal,
      byAction,
      childBreakdown,
      growth,
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

// altftoolwebadmin/src/app/api/seo/health/route.js
//
// ALTF Engine — SEO health analyzer (Phase 4).
// POST runs analyzeSeoHealth over the current config and stores a snapshot;
// GET returns recent snapshots for the dashboard trend.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { enforceRateLimit } from "@altftool/core/http";
import { analyzeSeoHealth } from "@altftool/core/seo";
import { emptySeoConfig } from "@altftool/core/seo/schemas";

const SEO_DOC = "projects/altftool/seo/runtime";
const HEALTH_COLLECTION = "projects/altftool/seo_health";

function authErrorResponse(error) {
  const message = String(error?.message || "Unauthorized");
  const status = /forbidden|inactive/i.test(message) ? 403 : 401;
  return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
}

export async function GET(request) {
  try {
    await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }
  try {
    const snap = await adminDb
      .collection(HEALTH_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    const history = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        generatedAt: data.generatedAt || null,
        metrics: data.metrics || null,
        actorEmail: data.actorEmail || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    });
    return NextResponse.json({ history });
  } catch (error) {
    console.error("[seo/health GET]", error);
    return NextResponse.json({ error: "Failed to load health history" }, { status: 500 });
  }
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 20,
    windowMs: 60_000,
    scope: "seo-health-run",
  });
  if (limited) return limited;

  let auth;
  try {
    auth = await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  try {
    const docSnap = await adminDb.doc(SEO_DOC).get();
    const config = docSnap.exists ? docSnap.data() : emptySeoConfig();

    let body = {};
    try {
      body = await request.json();
    } catch {
      /* routes optional */
    }
    const routes = Array.isArray(body?.routes) ? body.routes : [];

    const report = analyzeSeoHealth(config, { routes });

    const stored = {
      generatedAt: report.generatedAt,
      metrics: report.metrics,
      findings: report.findings.slice(0, 500),
      actorEmail: auth.admin.email || null,
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await adminDb.collection(HEALTH_COLLECTION).add(stored);

    await writeAdminAuditLog({
      action: "seo.health.run",
      module: "seo",
      actorUid: auth.admin.uid,
      actorEmail: auth.admin.email,
      summary: `Ran SEO health check (score ${report.metrics.score}, ${report.metrics.errors} errors)`,
      metadata: { snapshotId: ref.id, ...report.metrics },
    }).catch(() => {});

    return NextResponse.json({ id: ref.id, ...report });
  } catch (error) {
    console.error("[seo/health POST]", error);
    return NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
  }
}

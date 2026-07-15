// altftoolwebadmin/src/app/api/seo/health/route.js
//
// ALTF Engine — SEO health analyzer (Phase 4).
// POST runs analyzeSeoHealth over the current config and stores a snapshot;
// GET returns recent snapshots for the dashboard trend.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { seoRuntimeDocPath, seoHealthCollectionPath } from "@/lib/seoProject";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { enforceRateLimit } from "@altftool/core/http";
import { analyzeSeoHealth } from "@altftool/core/seo";
import { emptySeoConfig } from "@altftool/core/seo/schemas";

export async function GET(request) {
  let projectId;
  try {
    ({ projectId } = await authorizeSeoRequest(request, "read"));
  } catch (error) {
    return seoAccessErrorResponse(error);
  }
  try {
    const snap = await adminDb
      .collection(seoHealthCollectionPath(projectId))
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

  let auth, projectId;
  try {
    auth = await authorizeSeoRequest(request, "read");
    projectId = auth.projectId;
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  try {
    const docSnap = await adminDb.doc(seoRuntimeDocPath(projectId)).get();
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
    const ref = await adminDb.collection(seoHealthCollectionPath(projectId)).add(stored);

    await writeAdminAuditLog({
      action: "seo.health.run",
      module: "seo",
      project: projectId,
      actorUid: auth.admin.uid,
      actorEmail: auth.admin.email,
      summary: `Ran SEO health check for ${projectId} (score ${report.metrics.score}, ${report.metrics.errors} errors)`,
      metadata: { project: projectId, snapshotId: ref.id, ...report.metrics },
    }).catch(() => {});

    return NextResponse.json({ id: ref.id, ...report });
  } catch (error) {
    console.error("[seo/health POST]", error);
    return NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
  }
}

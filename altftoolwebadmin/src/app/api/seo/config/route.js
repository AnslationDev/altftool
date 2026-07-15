// altftoolwebadmin/src/app/api/seo/config/route.js
//
// ALTF Engine — central SEO config control-plane API.
// Follows the admin API convention: rate-limit -> auth -> validate -> Admin SDK
// write -> audit log -> cross-app revalidation. Writes use the Admin SDK
// (bypasses Firestore rules) so all mutations are authenticated + audited here.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { DEFAULT_SEO_PROJECT, seoRuntimeDocPath } from "@/lib/seoProject";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { enforceRateLimit } from "@altftool/core/http";
import { validateSeoConfig, emptySeoConfig } from "@altftool/core/seo/schemas";

export async function GET(request) {
  let projectId;
  try {
    ({ projectId } = await authorizeSeoRequest(request, "read"));
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  try {
    const snap = await adminDb.doc(seoRuntimeDocPath(projectId)).get();
    const config = snap.exists ? snap.data() : emptySeoConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error("[seo/config GET]", error);
    return NextResponse.json({ error: "Failed to load SEO config" }, { status: 500 });
  }
}

export async function PUT(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    windowMs: 60_000,
    scope: "seo-config-write",
  });
  if (limited) return limited;

  let auth, projectId;
  try {
    auth = await authorizeSeoRequest(request, "write");
    projectId = auth.projectId;
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const force = body?.force === true;
  const { ok, value, errors } = validateSeoConfig(body?.config ?? body);
  if (!ok && !force) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  try {
    const ref = adminDb.doc(seoRuntimeDocPath(projectId));
    const prev = await ref.get();
    const prevVersion = prev.exists ? Number(prev.data()?.version || 0) : 0;

    const next = {
      ...value,
      version: prevVersion + 1,
      enabled: Boolean(value.enabled),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: auth.admin.email || auth.admin.uid,
    };

    await ref.set(next); // full replace; config is a single authoritative doc

    await writeAdminAuditLog({
      action: "seo.config.update",
      module: "seo",
      project: projectId,
      actorUid: auth.admin.uid,
      actorEmail: auth.admin.email,
      summary: `Updated SEO config to v${next.version} (${projectId})`,
      metadata: { project: projectId, version: next.version, enabled: next.enabled, warnings: errors },
    }).catch(() => {});

    // Cross-app cache revalidation targets altftool.com specifically (its env
    // vars); only fire it for the altftool project so no other project can bust
    // altftool's cache. Per-project revalidation is future per-project wiring.
    if (projectId === DEFAULT_SEO_PROJECT) {
      const revalidatePaths = Array.isArray(body?.paths)
        ? body.paths.filter((p) => typeof p === "string" && p.startsWith("/"))
        : [];
      triggerWebRevalidate(revalidatePaths).catch(() => {});
    }

    return NextResponse.json({ ok: true, version: next.version, warnings: errors });
  } catch (error) {
    console.error("[seo/config PUT]", error);
    return NextResponse.json({ error: "Failed to save SEO config" }, { status: 500 });
  }
}

// Best-effort: ask the public web app to revalidate the seo-config cache tag so
// changes go live within seconds (no deploy). Failure never blocks the save.
async function triggerWebRevalidate(paths = []) {
  const url = process.env.ALTFT_WEB_REVALIDATE_URL;
  const secret = process.env.ALTFT_REVALIDATE_SECRET;
  if (!url || !secret) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify({ tag: "seo-config", paths: Array.isArray(paths) ? paths : [] }),
  });
}

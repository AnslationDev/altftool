// altftoolwebadmin/src/app/api/seo/config/route.js
//
// ALTF Engine — central SEO config control-plane API.
// Follows the admin API convention: rate-limit -> auth -> validate -> Admin SDK
// write -> audit log -> cross-app revalidation. Writes use the Admin SDK
// (bypasses Firestore rules) so all mutations are authenticated + audited here.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { enforceRateLimit } from "@altftool/core/http";
import { validateSeoConfig, emptySeoConfig } from "@altftool/core/seo/schemas";

const SEO_DOC = "projects/altftool/seo/runtime";

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
    const snap = await adminDb.doc(SEO_DOC).get();
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

  let auth;
  try {
    auth = await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
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
    const ref = adminDb.doc(SEO_DOC);
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
      actorUid: auth.admin.uid,
      actorEmail: auth.admin.email,
      summary: `Updated SEO config to v${next.version}`,
      metadata: { version: next.version, enabled: next.enabled, warnings: errors },
    }).catch(() => {});

    const revalidatePaths = Array.isArray(body?.paths)
      ? body.paths.filter((p) => typeof p === "string" && p.startsWith("/"))
      : [];
    triggerWebRevalidate(revalidatePaths).catch(() => {});

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

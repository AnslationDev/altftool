// altftoolwebadmin/src/app/api/blogs/revalidate/route.js
//
// Admin → public revalidation bridge. The admin app holds the shared secret
// server-side and forwards a path revalidation to the PUBLIC site's
// /api/revalidate after a blog is published/updated, so changes go live
// without waiting for ISR. Inert (returns { skipped }) until the public URL
// and secret are configured.

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";

function getBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return "";
  return header.split("Bearer ")[1];
}

async function verifyAdminRequest(request) {
  const token = getBearerToken(request);

  if (process.env.NODE_ENV === "development" && token === LOCAL_ADMIN_TOKEN) {
    return { uid: "local-dev-admin", email: "admin@altftool.local" };
  }
  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const decoded = await adminAuth.verifyIdToken(token);
  let snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists && decoded.email) {
    const byEmail = await adminDb.collection("admins").where("email", "==", decoded.email).limit(1).get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }
  if (!snap.exists || snap.data()?.isActive === false) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
  return decoded;
}

function normalizeSlug(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(request) {
  try {
    await verifyAdminRequest(request);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: error.status || 401 });
  }

  // ALTFT_WEB_REVALIDATE_URL (the env deployments already set) also works as
  // the base — previously only the two SITE_URL vars were read, so configured
  // environments silently skipped every revalidation.
  const bridgeBase = (process.env.ALTFT_WEB_REVALIDATE_URL || "").replace(/\/api\/revalidate\/?$/, "");
  const siteUrl = process.env.ALTFT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || bridgeBase;
  const secret = process.env.ALTFT_REVALIDATE_SECRET;

  // Inert by default — no config means no-op (backward compatible).
  if (!siteUrl || !secret) {
    return NextResponse.json({ ok: true, skipped: true, reason: "revalidation not configured" });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const slug = normalizeSlug(body?.slug);
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const base = siteUrl.replace(/\/+$/, "");
  const paths = [`/blogs/${slug}`, "/blogs", "/sitemap.xml"];

  // Archive pages (category/tag) previously stayed stale for up to an hour
  // after publish. Derive them from the blog doc so filtered views update too.
  // Slug rules mirror the public app's blogTaxonomySlug().
  const taxonomySlug = (value = "") =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  try {
    const snap = await adminDb
      .collection("projects/altftool/blogs")
      .where("slugLower", "==", slug)
      .limit(1)
      .get();
    const blog = snap.empty ? null : snap.docs[0].data();
    const categorySlug = taxonomySlug(blog?.category);
    if (categorySlug) paths.push(`/blogs/category/${categorySlug}`);
    for (const tag of (Array.isArray(blog?.tags) ? blog.tags : []).slice(0, 6)) {
      const tagSlug = taxonomySlug(tag);
      if (tagSlug) paths.push(`/blogs/tag/${tagSlug}`);
    }
  } catch {
    // Archive paths are best-effort; slug + listing still revalidate below.
  }

  try {
    // One batched request — the public /api/revalidate accepts a paths[] array.
    const response = await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ paths: [...new Set(paths)] }),
    });
    if (!response.ok) throw new Error(`Public revalidate responded ${response.status}`);
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json({ ok: true, revalidated: payload.paths || paths });
  } catch (error) {
    console.error("[blogs/revalidate]", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 502 });
  }
}

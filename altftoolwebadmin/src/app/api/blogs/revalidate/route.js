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

  const siteUrl = process.env.ALTFT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
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

  try {
    const results = await Promise.allSettled(
      paths.map((path) =>
        fetch(`${base}/api/revalidate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
          body: JSON.stringify({ path }),
        }),
      ),
    );
    const revalidated = paths.filter((_, i) => results[i].status === "fulfilled" && results[i].value?.ok);
    return NextResponse.json({ ok: true, revalidated });
  } catch (error) {
    console.error("[blogs/revalidate]", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 502 });
  }
}

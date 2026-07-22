import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

async function isAuthorized(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
      const legacy = await adminDb.collection("admins").doc(decoded.uid).get();
      if (legacy.exists && legacy.data()?.isActive) {
        return { ok: true, email: decoded.email || "panel" };
      }
      const rbac = await adminDb
        .collection("super_admin_dashboard").doc("main")
        .collection("admin_users").doc(decoded.uid).get();
      if (rbac.exists && rbac.data()?.status === "active") {
        return { ok: true, email: decoded.email || "panel" };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }
  // No token — only allow in local development (NODE_ENV !== "production"),
  // matching the localhost-only "Continue as Local Admin" shortcut but
  // enforced server-side so it can never work on a real deployment.
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, email: "local-dev-admin" };
  }
  return { ok: false };
}

export async function POST(request) {
  try {
    const auth = await isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const body = await request.json();
    const { collection: colName, id } = body || {};
    if (!colName || !id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await adminDb.collection("projects").doc("anternet").collection(colName).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ANTERNET_DELETE_ERROR:", err);
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}

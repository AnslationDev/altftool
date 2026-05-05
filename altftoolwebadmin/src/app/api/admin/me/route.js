import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/**
 * GET /api/admin/me
 *
 * Status codes:
 *   200 → valid active admin
 *   401 → no / invalid token
 *   403 → inactive admin  (body: { error: "Inactive admin" })
 *         rejected request (body: { error: "Access denied" })  ← must stay this exact string
 *   404 → valid token, no admin doc, pending request           ← DO NOT sign out on this
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    /* ── Look up by UID first ── */
    let snap = await adminDb.collection("admins").doc(decoded.uid).get();

    /* ── Fallback: look up by email (Google ↔ password UID mismatch) ── */
    if (!snap.exists && decoded.email) {
      const byEmail = await adminDb
        .collection("admins")
        .where("email", "==", decoded.email)
        .limit(1)
        .get();

      if (!byEmail.empty) {
        snap = byEmail.docs[0];
      }
    }

    /* ── No admin doc found → inspect access request ── */
    if (!snap.exists) {
      const reqSnap = await adminDb
        .collection("accessRequests")
        .where("uid", "==", decoded.uid)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!reqSnap.empty) {
        const latest = reqSnap.docs[0].data();

        if (latest.status === "rejected") {
          // Must return exactly "Access denied" — AuthContext keys on this string
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        if (latest.status === "pending") {
          return NextResponse.json({ error: "Pending approval" }, { status: 404 });
        }
      }

      // No request at all → treat as pending (just logged in via Google for first time)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const data = snap.data();

    if (!data?.isActive) {
      return NextResponse.json({ error: "Inactive admin" }, { status: 403 });
    }

    return NextResponse.json({
      email: data.email,
      roleType: data.roleType ?? "admin",
      permissions: data.permissions ?? {},
      projectAccess: data.projectAccess ?? {},
      // Profile fields — included if present, omitted if not set yet
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.team !== undefined && { team: data.team }),
      ...(data.designation !== undefined && { designation: data.designation }),
      ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
      ...(data.bio !== undefined && { bio: data.bio }),
    });
  } catch (err) {
    console.error("ADMIN_ME_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
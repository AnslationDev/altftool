import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import {
  buildRbacAdminProfile,
  getLatestRbacAccessRequest,
  getRbacAdminDoc,
} from "@/lib/serverRbac";

/**
 * GET /api/admin/me
 *
 * Resolves admin identity in this order:
 * 1. New enterprise RBAC path:
 *    super_admin_dashboard/main/admin_users/{uid}
 * 2. Legacy admins collection:
 *    admins/{uid}
 *
 * This lets us migrate safely without breaking existing admin accounts.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // A malformed, expired or revoked token is a CLIENT error. Letting it fall
    // through to the generic 500 handler was actively harmful: the client
    // treats 5xx as a transient server hiccup and retries while preserving the
    // session, so a permanently invalid token produced a retry storm and then a
    // signed-in-but-profile-less dead end, instead of a clean sign-out.
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (verifyErr) {
      console.warn("ADMIN_ME_TOKEN_REJECTED:", verifyErr?.code ?? verifyErr?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rbacAdmin = await getRbacAdminDoc(decoded);
    if (rbacAdmin) {
      const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
      if (!profile.isActive) {
        return NextResponse.json({ error: "Inactive admin" }, { status: 403 });
      }
      return NextResponse.json(profile);
    }

    let snap = await adminDb.collection("admins").doc(decoded.uid).get();

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

    if (!snap.exists) {
      const latestRbacRequest = await getLatestRbacAccessRequest(decoded);
      if (latestRbacRequest?.status === "rejected") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      if (latestRbacRequest?.status === "pending") {
        return NextResponse.json({ error: "Pending approval" }, { status: 404 });
      }

      const reqSnap = await adminDb
        .collection("accessRequests")
        .where("uid", "==", decoded.uid)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!reqSnap.empty) {
        const latest = reqSnap.docs[0].data();

        if (latest.status === "rejected") {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        if (latest.status === "pending") {
          return NextResponse.json({ error: "Pending approval" }, { status: 404 });
        }
      }

      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const data = snap.data();

    if (!data?.isActive) {
      return NextResponse.json({ error: "Inactive admin" }, { status: 403 });
    }

    return NextResponse.json({
      uid: snap.id,
      email: data.email,
      roleType: data.roleType ?? "admin",
      roleId: data.roleType === "superadmin" ? "super_admin" : "admin",
      status: data.isActive === false ? "suspended" : "active",
      isActive: data.isActive !== false,
      isSuperAdmin: data.roleType === "superadmin",
      rbacVersion: 1,
      permissions: data.permissions ?? {},
      projectAccess: data.projectAccess ?? {},
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

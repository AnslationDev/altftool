import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";

async function getBearerToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  return authHeader.split("Bearer ")[1];
}

export async function verifyActiveAdmin(request) {
  const token = await getBearerToken(request);
  const decoded = await adminAuth.verifyIdToken(token);
  const rbacAdmin = await getRbacAdminDoc(decoded);

  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isActive) throw new Error("Inactive admin");
    return {
      decoded,
      admin: profile,
    };
  }

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!snap.exists) {
    throw new Error("Forbidden");
  }

  const data = snap.data();
  if (!data?.isActive) {
    throw new Error("Inactive admin");
  }

  return {
    decoded,
    admin: {
      uid: decoded.uid,
      email: data?.email ?? decoded.email ?? null,
      roleType: data?.roleType ?? "admin",
      ...data,
    },
  };
}

export async function verifySuperAdmin(request) {
  const { decoded, admin } = await verifyActiveAdmin(request);

  if (admin.roleType !== "superadmin" && admin.isSuperAdmin !== true) {
    throw new Error("Forbidden");
  }

  return { decoded, admin };
}

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

function toContact(id, data) {
  return {
    id,
    email: data.email ?? null,
    fullName: data.fullName ?? null,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    photoURL: data.photoURL ?? null,
    team: data.team ?? null,
    designation: data.designation ?? null,
  };
}

export async function GET(request) {
  try {
    await verifyActiveAdmin(request);

    // Read BOTH stores. Super admins created through the RBAC path have no
    // legacy `admins` document, so a legacy-only query returned an empty list
    // and the support screen told the user there was nobody to contact.
    const [legacySnap, rbacSnap] = await Promise.all([
      adminDb
        .collection("admins")
        .where("roleType", "==", "superadmin")
        .where("isActive", "==", true)
        .get()
        .catch(() => null),
      getRbacRootRef()
        .collection(RBAC_COLLECTIONS.adminUsers)
        .get()
        .catch(() => null),
    ]);

    const byEmail = new Map();
    const push = (contact) => {
      const key = (contact.email || contact.id).toLowerCase();
      if (!byEmail.has(key)) byEmail.set(key, contact);
    };

    legacySnap?.docs.forEach((doc) => push(toContact(doc.id, doc.data() || {})));

    rbacSnap?.docs.forEach((doc) => {
      const data = doc.data() || {};
      const isSuper = data.roleType === "superadmin" || data.isSuperAdmin === true;
      const isActive = data.status ? data.status === "active" : data.isActive !== false;
      if (isSuper && isActive) push(toContact(doc.id, data));
    });

    return NextResponse.json({ superadmins: [...byEmail.values()] });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Inactive admin" ? 401 : 500 },
    );
  }
}

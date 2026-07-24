import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { listRbacAdminProfiles } from "@/lib/serverRbac";

function privateJson(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Vary", "Authorization");
  return NextResponse.json(payload, { ...init, headers });
}

export async function GET(request) {
  try {
    const actor = await verifySuperAdminRequest(request);

    if (actor.isLocalAdmin) {
      return privateJson({
        admins: [
          {
            id: actor.uid,
            uid: actor.uid,
            email: actor.email,
            fullName: "Local Super Admin",
            roleType: "superadmin",
            isActive: true,
            source: "local",
            createdAt: null,
          },
        ],
      });
    }

    const snapshot = await adminDb.collection("admins").get();
    const legacyAdmins = snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        uid: data.uid || doc.id,
        source: "legacy",
        ...data,
        createdAt: data.createdAt?.toMillis?.() || null,
      };
    });

    const rbacAdmins = await listRbacAdminProfiles().catch((error) => {
      console.warn("RBAC_ADMIN_LIST_FALLBACK:", error?.message);
      return [];
    });

    const mergedAdmins = new Map();
    legacyAdmins.forEach((admin) => mergedAdmins.set(admin.id, admin));
    rbacAdmins.forEach((admin) => {
      const existing = mergedAdmins.get(admin.id) || {};
      mergedAdmins.set(admin.id, {
        ...existing,
        ...admin,
        projectAccess: Object.keys(admin.projectAccess || {}).length
          ? admin.projectAccess
          : existing.projectAccess || {},
        permissions: Object.keys(admin.permissions || {}).length
          ? admin.permissions
          : existing.permissions || {},
      });
    });

    const admins = Array.from(mergedAdmins.values()).sort((a, b) =>
      String(a.email || "").localeCompare(String(b.email || "")),
    );

    return privateJson({ admins });
  } catch (err) {
    console.error("ADMIN LIST ERROR:", err);

    return privateJson(
      { error: err.message === "Unauthorized" ? "Unauthorized" : err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

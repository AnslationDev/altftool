import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { PROJECTS } from "@/projects";
import { RBAC_COLLECTIONS, SUPER_ADMIN_DASHBOARD_COLLECTION, SUPER_ADMIN_DASHBOARD_DOC } from "@/lib/rbacPaths";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";

const DEFAULT_ROLES = {
  super_admin: {
    name: "Super Admin",
    level: 100,
    description: "Full access to every project, user, security log, and system setting.",
    defaultActions: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      publish: true,
      export: true,
      manageUsers: true,
    },
  },
  admin: {
    name: "Admin",
    level: 80,
    description: "Can manage assigned projects and most operational workflows.",
    defaultActions: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      publish: true,
      export: true,
      manageUsers: false,
    },
  },
  manager: {
    name: "Manager",
    level: 60,
    description: "Can review, edit, publish, and follow operational activity.",
    defaultActions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      publish: true,
      export: true,
      manageUsers: false,
    },
  },
  editor: {
    name: "Editor",
    level: 40,
    description: "Can create and edit assigned content modules.",
    defaultActions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      publish: false,
      export: false,
      manageUsers: false,
    },
  },
  viewer: {
    name: "Viewer",
    level: 10,
    description: "Can view assigned project modules without write access.",
    defaultActions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      publish: false,
      export: false,
      manageUsers: false,
    },
  },
};

async function requireSuperAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);

  const rbacAdmin = await getRbacAdminDoc(decoded);
  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isSuperAdmin || !profile.isActive) throw new Error("Forbidden");
    return { decoded, profile };
  }

  let legacySnap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!legacySnap.exists && decoded.email) {
    const emailSnap = await adminDb
      .collection("admins")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();
    if (!emailSnap.empty) {
      legacySnap = emailSnap.docs[0];
    }
  }

  if (!legacySnap.exists) throw new Error("Forbidden");
  const legacy = legacySnap.data();
  if (legacy?.roleType !== "superadmin" || legacy?.isActive === false) throw new Error("Forbidden");
  return { decoded, profile: { ...legacy, uid: decoded.uid, email: legacy.email || decoded.email, isSuperAdmin: true } };
}

export async function POST(request) {
  try {
    const { decoded, profile } = await requireSuperAdmin(request);
    const root = adminDb.collection(SUPER_ADMIN_DASHBOARD_COLLECTION).doc(SUPER_ADMIN_DASHBOARD_DOC);
    const batch = adminDb.batch();
    const now = new Date();

    batch.set(root, {
      name: "Super Admin Dashboard",
      version: 1,
      status: "active",
      updatedAt: now,
    }, { merge: true });

    Object.entries(DEFAULT_ROLES).forEach(([roleId, role]) => {
      batch.set(root.collection(RBAC_COLLECTIONS.adminRoles).doc(roleId), {
        ...role,
        roleId,
        updatedAt: now,
      }, { merge: true });
    });

    batch.set(root.collection(RBAC_COLLECTIONS.settings).doc("main"), {
      maintenanceMode: false,
      requireTwoFactor: false,
      sessionTimeoutMinutes: 120,
      allowAccessRequests: true,
      auditLogRetentionDays: 180,
      updatedAt: now,
    }, { merge: true });

    batch.set(root.collection(RBAC_COLLECTIONS.adminUsers).doc(decoded.uid), {
      uid: decoded.uid,
      email: profile.email || decoded.email || "",
      fullName: profile.fullName || profile.name || decoded.name || "",
      roleId: "super_admin",
      roleType: "superadmin",
      status: "active",
      isSuperAdmin: true,
      updatedAt: now,
      createdAt: profile.createdAt || now,
    }, { merge: true });

    Object.entries(PROJECTS).forEach(([projectId, project]) => {
      Object.entries(project.modules || {}).forEach(([moduleId, moduleConfig], index) => {
        batch.set(adminDb.collection("projects").doc(projectId).collection("admin_modules").doc(moduleId), {
          moduleId,
          label: moduleConfig.label || moduleId,
          route: `/${projectId}/${moduleConfig.routeSegment || moduleId}`,
          active: true,
          order: index + 1,
          actions: ["view", "create", "edit", "delete", "publish", "export"],
          updatedAt: now,
        }, { merge: true });
      });
    });

    batch.set(root.collection(RBAC_COLLECTIONS.auditLogs).doc(), {
      actorUid: decoded.uid,
      actorEmail: profile.email || decoded.email || "",
      action: "rbac.bootstrap",
      targetType: "super_admin_dashboard",
      targetId: SUPER_ADMIN_DASHBOARD_DOC,
      message: "Initialized RBAC foundation collections and project module registry.",
      createdAt: now,
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      root: `${SUPER_ADMIN_DASHBOARD_COLLECTION}/${SUPER_ADMIN_DASHBOARD_DOC}`,
      roles: Object.keys(DEFAULT_ROLES).length,
      projects: Object.keys(PROJECTS).length,
    });
  } catch (error) {
    const message = error?.message || "Bootstrap failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

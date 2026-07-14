import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";
import { PROJECTS } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef, listRbacAdminProfiles } from "@/lib/serverRbac";

function toMillis(value) {
  return value?.toMillis?.() || (value instanceof Date ? value.getTime() : value || null);
}

async function safeCount(collectionRef) {
  try {
    const snap = await collectionRef.count().get();
    return snap.data().count || 0;
  } catch {
    const snap = await collectionRef.get();
    return snap.size;
  }
}

async function readProject(projectId, project) {
  const moduleKeys = Object.keys(project.modules || {});
  const projectDoc = await adminDb.collection("projects").doc(projectId).get().catch(() => null);
  const moduleCount = await adminDb
    .collection("projects")
    .doc(projectId)
    .collection("admin_modules")
    .count()
    .get()
    .then((snap) => snap.data().count || 0)
    .catch(() => 0);

  const dbData = projectDoc?.exists ? projectDoc.data() || {} : {};
  const firstModuleKey = moduleKeys[0];

  return {
    projectId,
    projectName: dbData.projectName || dbData.name || project.name,
    status: dbData.status || "active",
    description: dbData.description || "",
    moduleCount: moduleCount || moduleKeys.length,
    adminRoute: firstModuleKey ? getProjectModuleRoute(projectId, firstModuleKey) : `/${projectId}`,
    updatedAt: toMillis(dbData.updatedAt),
  };
}

export async function GET(request) {
  try {
    const actor = await verifySuperAdminRequest(request);

    if (actor.isLocalAdmin) {
      const projects = Object.entries(PROJECTS).map(([projectId, project]) => ({
        projectId,
        projectName: project.name,
        status: "active",
        description: "",
        moduleCount: Object.keys(project.modules || {}).length,
        adminRoute: `/${projectId}`,
        updatedAt: null,
      }));

      return NextResponse.json({
        root: "local-dev",
        generatedAt: Date.now(),
        counts: {
          adminUsers: 1,
          activeAdmins: 1,
          inactiveAdmins: 0,
          superAdmins: 1,
          roles: 0,
          auditLogs: 0,
          sessions: 0,
          securityEvents: 0,
          accessRequests: 0,
          pendingAccessRequests: 0,
          settings: 0,
          projects: projects.length,
          modules: projects.reduce((sum, project) => sum + project.moduleCount, 0),
        },
        projects,
        settings: {},
      });
    }

    const root = getRbacRootRef();
    const rootSnap = await root.get();
    const [
      adminProfiles,
      roles,
      auditLogs,
      sessions,
      securityEvents,
      accessRequests,
      pendingAccessRequests,
      settingsSnap,
    ] = await Promise.all([
      listRbacAdminProfiles(),
      safeCount(root.collection(RBAC_COLLECTIONS.adminRoles)),
      safeCount(root.collection(RBAC_COLLECTIONS.auditLogs)),
      safeCount(root.collection(RBAC_COLLECTIONS.sessions)),
      safeCount(root.collection(RBAC_COLLECTIONS.securityEvents)),
      safeCount(root.collection(RBAC_COLLECTIONS.accessRequests)),
      root
        .collection(RBAC_COLLECTIONS.accessRequests)
        .where("status", "==", "pending")
        .count()
        .get()
        .then((snap) => snap.data().count || 0)
        .catch(() => 0),
      root.collection(RBAC_COLLECTIONS.settings).doc("main").get().catch(() => null),
    ]);

    const projects = await Promise.all(
      Object.entries(PROJECTS).map(([projectId, project]) => readProject(projectId, project)),
    );

    const activeAdmins = adminProfiles.filter((admin) => admin.isActive).length;
    const superAdmins = adminProfiles.filter((admin) => admin.roleType === "superadmin").length;

    return NextResponse.json({
      root: "super_admin_dashboard/main",
      generatedAt: Date.now(),
      rootStatus: rootSnap.exists ? rootSnap.data()?.status || "active" : "missing",
      counts: {
        adminUsers: adminProfiles.length,
        activeAdmins,
        inactiveAdmins: Math.max(0, adminProfiles.length - activeAdmins),
        superAdmins,
        roles,
        auditLogs,
        sessions,
        securityEvents,
        accessRequests,
        pendingAccessRequests,
        settings: settingsSnap?.exists ? 1 : 0,
        projects: projects.length,
        modules: projects.reduce((sum, project) => sum + project.moduleCount, 0),
      },
      projects,
      settings: settingsSnap?.exists ? settingsSnap.data() || {} : {},
    });
  } catch (error) {
    const message = error?.message || "Failed to load Super Admin summary";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : message },
      { status: message === "Unauthorized" ? 401 : 500 },
    );
  }
}

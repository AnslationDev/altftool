import { adminDb } from "@/lib/firebaseAdmin";
import {
  RBAC_COLLECTIONS,
  RBAC_PATHS,
  SUPER_ADMIN_DASHBOARD_COLLECTION,
  SUPER_ADMIN_DASHBOARD_DOC,
} from "@/lib/rbacPaths";

export function getRbacRootRef() {
  return adminDb.collection(SUPER_ADMIN_DASHBOARD_COLLECTION).doc(SUPER_ADMIN_DASHBOARD_DOC);
}

function isSuperRole(data = {}) {
  return data.isSuperAdmin === true || data.roleType === "superadmin" || data.roleId === "super_admin";
}

function normalizeStatus(data = {}) {
  if (data.status) return data.status;
  if (data.isActive === false) return "suspended";
  return "active";
}

export async function getRbacAdminDoc(decoded) {
  const usersRef = rootRef().collection(RBAC_COLLECTIONS.adminUsers);
  let snap = await usersRef.doc(decoded.uid).get();

  if (!snap.exists && decoded.email) {
    const byEmail = await usersRef.where("email", "==", decoded.email).limit(1).get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }

  return snap.exists ? { id: snap.id, data: snap.data() } : null;
}

export async function getLatestRbacAccessRequest(decoded) {
  const requestsRef = rootRef().collection(RBAC_COLLECTIONS.accessRequests);
  const byUid = await requestsRef
    .where("uid", "==", decoded.uid)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get()
    .catch(() => null);

  if (byUid && !byUid.empty) return byUid.docs[0].data();

  if (!decoded.email) return null;
  const byEmail = await requestsRef
    .where("email", "==", decoded.email)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get()
    .catch(() => null);

  return byEmail && !byEmail.empty ? byEmail.docs[0].data() : null;
}

export async function readRbacProjectAccess(uid) {
  const accessSnap = await rootRef()
    .collection(RBAC_COLLECTIONS.adminUsers)
    .doc(uid)
    .collection(RBAC_COLLECTIONS.projectAccess)
    .get();

  const projectAccess = {};

  await Promise.all(
    accessSnap.docs.map(async (projectDoc) => {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data() || {};
      const modulesSnap = await projectDoc.ref.collection(RBAC_COLLECTIONS.modules).get();
      const permissions = {};
      const modules = {};

      modulesSnap.docs.forEach((moduleDoc) => {
        const moduleData = moduleDoc.data() || {};
        const actions = moduleData.actions || {};
        modules[moduleDoc.id] = {
          ...moduleData,
          access: moduleData.access !== false,
          actions,
        };
        permissions[moduleDoc.id] = {
          ...actions,
          read: actions.read === true || actions.view === true,
          write: actions.write === true || actions.edit === true || actions.create === true || actions.publish === true,
          delete: actions.delete === true,
        };
      });

      projectAccess[projectId] = {
        ...projectData,
        access: projectData.access !== false,
        roleId: projectData.roleId || null,
        modules,
        permissions,
      };
    }),
  );

  return projectAccess;
}

export async function buildRbacAdminProfile(decoded, rbacAdmin) {
  const data = rbacAdmin.data || {};
  const status = normalizeStatus(data);
  const superAdmin = isSuperRole(data);
  const projectAccess = superAdmin ? {} : await readRbacProjectAccess(rbacAdmin.id);

  return {
    uid: rbacAdmin.id,
    email: data.email || decoded.email || "",
    roleType: superAdmin ? "superadmin" : "admin",
    roleId: data.roleId || (superAdmin ? "super_admin" : "admin"),
    status,
    isActive: status === "active",
    isSuperAdmin: superAdmin,
    rbacVersion: 2,
    rbacRoot: RBAC_PATHS.adminUsers.join("/"),
    permissions: data.permissions || {},
    projectAccess,
    ...(data.firstName !== undefined && { firstName: data.firstName }),
    ...(data.lastName !== undefined && { lastName: data.lastName }),
    ...(data.fullName !== undefined && { fullName: data.fullName }),
    ...(data.name !== undefined && { fullName: data.name }),
    ...(data.team !== undefined && { team: data.team }),
    ...(data.designation !== undefined && { designation: data.designation }),
    ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
    ...(data.bio !== undefined && { bio: data.bio }),
  };
}

export async function writeRbacAuditLog(payload = {}) {
  await getRbacRootRef().collection(RBAC_COLLECTIONS.auditLogs).add({
    ...payload,
    createdAt: new Date(),
  });
}

function rootRef() {
  return getRbacRootRef();
}

function toMillis(value) {
  return value?.toMillis?.() || (value instanceof Date ? value.getTime() : value || null);
}

export async function listRbacAdminProfiles() {
  const usersSnap = await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).get();

  return Promise.all(
    usersSnap.docs.map(async (doc) => {
      const data = doc.data() || {};
      const status = normalizeStatus(data);
      const superAdmin = isSuperRole(data);
      const projectAccess = superAdmin ? {} : await readRbacProjectAccess(doc.id);

      return {
        id: doc.id,
        uid: data.uid || doc.id,
        email: data.email || "",
        fullName: data.fullName || data.name || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        photoURL: data.photoURL || null,
        roleType: superAdmin ? "superadmin" : "admin",
        roleId: data.roleId || (superAdmin ? "super_admin" : "admin"),
        status,
        isActive: status === "active",
        isSuperAdmin: superAdmin,
        source: "rbac",
        permissions: data.permissions || {},
        projectAccess,
        createdAt: toMillis(data.createdAt),
        updatedAt: toMillis(data.updatedAt),
      };
    }),
  );
}

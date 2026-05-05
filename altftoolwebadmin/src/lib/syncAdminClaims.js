import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function syncAdminClaims(uid) {
  const snap = await adminDb.collection("admins").doc(uid).get();

  if (!snap.exists || !snap.data().isActive) {
    await adminAuth.setCustomUserClaims(uid, {});
    return;
  }

  const data = snap.data();

  const claims = {
    role: data.roleType,
    ...flattenProjectPermissions(data.projectAccess),
    ...flattenLegacyPermissions(data.permissions),
  };

  await adminAuth.setCustomUserClaims(uid, claims);
}

// { altftool: { permissions: { blogs: { read, write, delete } } } }
// → { altftool_blogs_read: true, ... }
function flattenProjectPermissions(projectAccess = {}) {
  const flat = {};
  for (const [projectId, projectData] of Object.entries(projectAccess)) {
    const perms = projectData?.permissions ?? {};
    for (const [module, actions] of Object.entries(perms)) {
      for (const action of ["read", "write", "delete"]) {
        flat[`${projectId}_${module}_${action}`] = !!actions?.[action];
      }
    }
  }
  return flat;
}

// { blogs: { read, write, delete } } → { blogs_read: true, ... }
function flattenLegacyPermissions(permissions = {}) {
  const flat = {};
  for (const [module, perms] of Object.entries(permissions)) {
    for (const action of ["read", "write", "delete"]) {
      flat[`${module}_${action}`] = !!perms?.[action];
    }
  }
  return flat;
}

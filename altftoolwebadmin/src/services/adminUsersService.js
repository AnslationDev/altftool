import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RBAC_PATHS } from "@/lib/rbacPaths";

const adminUsersCollection = collection(db, ...RBAC_PATHS.adminUsers);

function normalizeAdminUser(id, data = {}) {
  const rawRole = data.roleType || data.role || data.roleId;
  const roleType = data.isSuperAdmin || rawRole === "super_admin" || rawRole === "superadmin"
    ? "superadmin"
    : rawRole || "admin";
  const status = String(data.status || (data.isActive === false ? "inactive" : "active")).toLowerCase();

  return {
    ...data,
    id,
    uid: data.uid || id,
    fullName: data.fullName || data.name || "",
    roleType,
    isActive: data.isActive ?? status === "active",
    status,
  };
}

function mapSnapshot(snapshot) {
  return snapshot.docs
    .map((doc) => normalizeAdminUser(doc.id, doc.data()))
    .sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")));
}

/**
 * Admin Management's only data source: super_admin_dashboard/main/admin_users.
 */
export function subscribeToAdminUsers(onData, onError) {
  return onSnapshot(
    adminUsersCollection,
    (snapshot) => onData(mapSnapshot(snapshot)),
    onError,
  );
}

/** Reload this collection without reloading the page. */
export async function refreshAdminUsers() {
  return mapSnapshot(await getDocs(adminUsersCollection));
}

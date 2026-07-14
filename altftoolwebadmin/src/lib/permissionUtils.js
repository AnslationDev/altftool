import { PROJECTS } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";
import { RBAC_ACTION_ALIASES } from "@/lib/rbacPaths";

export const SUPERADMIN_ONLY_GLOBAL_MODULES = new Set([
  "super-admin",
  "admin-management",
  "audit-logs",
  "analytics",
  "notification-broadcast",
  "rbac",
  "tickets",
]);

/**
 * Check if an admin has access to a specific action on a module.
 */
export function hasModuleAccess({ adminData, projectId, moduleKey, action = "read" }) {
  if (!adminData) return false;
  if (adminData.roleType === "superadmin" || adminData.isSuperAdmin === true) return true;
  if (adminData.isActive === false) return false;
  if (adminData.status && adminData.status !== "active") return false;

  if (!projectId && SUPERADMIN_ONLY_GLOBAL_MODULES.has(moduleKey)) {
    return false;
  }

  // 1. New: project-scoped permissions
  if (projectId) {
    const projectAccess = adminData.projectAccess?.[projectId];
    if (projectAccess?.access === false) return false;

    const rbacModule = projectAccess?.modules?.[moduleKey];
    if (rbacModule != null) {
      if (rbacModule.access === false) return false;
      return hasAction(rbacModule.actions || rbacModule, action);
    }

    const projectPerm = projectAccess?.permissions?.[moduleKey];
    if (projectPerm != null) return hasAction(projectPerm, action);
  }

  // 2. Legacy: flat permissions fallback
  const legacyPerm = adminData.permissions?.[moduleKey];
  if (legacyPerm != null) return hasAction(legacyPerm, action);

  return false;
}

/**
 * Returns the first route an admin is allowed to visit after login.
 * Superadmin → /admin-management
 * Admin → first module they have read access to (by project registry order)
 */
export function getFirstAllowedRoute(adminData) {
  if (!adminData) return null;
  if (adminData.roleType === "superadmin" || adminData.isSuperAdmin === true) return "/super-admin";

  for (const [projectId, project] of Object.entries(PROJECTS)) {
    for (const moduleKey of Object.keys(project.modules)) {
      if (hasModuleAccess({ adminData, projectId, moduleKey, action: "read" })) {
        return getProjectModuleRoute(projectId, moduleKey);
      }
    }
  }

  // Legacy flat permissions fallback
  for (const [moduleKey, perms] of Object.entries(adminData.permissions ?? {})) {
    if (perms?.read) return `/${moduleKey}`;
  }

  return null;
}

export function hasProjectAccess({ adminData, projectId }) {
  if (!adminData || !projectId) return false;
  if (adminData.roleType === "superadmin" || adminData.isSuperAdmin === true) return true;
  if (adminData.isActive === false || (adminData.status && adminData.status !== "active")) return false;

  const projectAccess = adminData.projectAccess?.[projectId];
  if (!projectAccess || projectAccess.access === false) return false;

  const modules = projectAccess.modules || projectAccess.permissions || {};
  return Object.keys(modules).some((moduleKey) =>
    hasModuleAccess({ adminData, projectId, moduleKey, action: "read" }),
  );
}

export function hasAction(permission = {}, action = "read") {
  if (!permission) return false;
  const aliases = RBAC_ACTION_ALIASES[action] || [action];
  return aliases.some((key) => permission[key] === true);
}

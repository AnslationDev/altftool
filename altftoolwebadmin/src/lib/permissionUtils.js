import { PROJECTS } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";

export const SUPERADMIN_ONLY_GLOBAL_MODULES = new Set([
  "admin-management",
  "analytics",
  "notification-broadcast",
  "tickets",
]);

/**
 * Check if an admin has access to a specific action on a module.
 */
export function hasModuleAccess({ adminData, projectId, moduleKey, action = "read" }) {
  if (!adminData) return false;
  if (adminData.roleType === "superadmin") return true;
  if (adminData.isActive === false) return false;

  if (!projectId && SUPERADMIN_ONLY_GLOBAL_MODULES.has(moduleKey)) {
    return false;
  }

  // 1. New: project-scoped permissions
  if (projectId) {
    const projectPerm = adminData.projectAccess?.[projectId]?.permissions?.[moduleKey];
    if (projectPerm != null) return !!projectPerm[action];
  }

  // 2. Legacy: flat permissions fallback
  const legacyPerm = adminData.permissions?.[moduleKey];
  if (legacyPerm != null) return !!legacyPerm[action];

  return false;
}

/**
 * Returns the first route an admin is allowed to visit after login.
 * Superadmin → /admin-management
 * Admin → first module they have read access to (by project registry order)
 */
export function getFirstAllowedRoute(adminData) {
  if (!adminData) return null;
  if (adminData.roleType === "superadmin") return "/admin-management";

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

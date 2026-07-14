import {
  Activity,
  BarChart3,
  Bell,
  FolderKanban,
  Headset,
  ShieldAlert,
  ShieldCheck,
  ShieldIcon,
  SlidersHorizontal,
  UserCircle,
} from "lucide-react";
import { getProject } from "@/projects";

export const ADMIN_HOME_ROUTE = "/";

export const GLOBAL_ADMIN_MODULES = {
  "super-admin": {
    label: "Project",
    icon: FolderKanban,
    path: "/super-admin",
    superadminOnly: true,
  },
  "admin-management": {
    label: "Admin Management",
    icon: ShieldIcon,
    path: "/admin-management",
    superadminOnly: true,
  },
  analytics: {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    superadminOnly: true,
  },
  health: {
    label: "Health",
    icon: Activity,
    path: "/health",
    superadminOnly: true,
  },
  security: {
    label: "Security",
    icon: ShieldCheck,
    path: "/security",
    superadminOnly: true,
  },
  "audit-logs": {
    label: "Audit Logs",
    icon: ShieldAlert,
    path: "/audit-logs",
    superadminOnly: true,
  },
  rbac: {
    label: "RBAC Foundation",
    icon: SlidersHorizontal,
    path: "/rbac",
    superadminOnly: true,
  },
  "notification-broadcast": {
    label: "Broadcasts",
    icon: Bell,
    path: "/notification-broadcast",
    superadminOnly: true,
  },
  tickets: {
    label: "Tickets",
    icon: ShieldAlert,
    path: "/tickets",
    superadminOnly: true,
  },
  support: {
    label: "Support Center",
    icon: Headset,
    path: "/support",
    allAdmins: true,
  },
  profile: {
    label: "My Profile",
    icon: UserCircle,
    path: "/profile",
    allAdmins: true,
  },
};

export const FLAT_ADMIN_ROUTE_KEYS = new Set([
  ...Object.keys(GLOBAL_ADMIN_MODULES),
  "access-denied",
  "access-requested",
  "admin",
  "login",
]);

export const OPEN_GLOBAL_ROUTE_KEYS = new Set(
  Object.entries(GLOBAL_ADMIN_MODULES)
    .filter(([, config]) => config.allAdmins)
    .map(([key]) => key),
);

export function formatAdminSegment(segment = "") {
  if (!segment) return "";
  // Only treat a segment as an opaque record ID when it does NOT read like
  // hyphen/underscore-separated words (e.g. "admin-management"). IDs are
  // numeric, UUID-like, or a single long alphanumeric token.
  const isNumericId = !Number.isNaN(Number(segment));
  const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
  const isOpaqueToken = /^[a-z0-9]{16,}$/i.test(segment) && /\d/.test(segment);
  if (isNumericId || isUuidLike || isOpaqueToken) {
    return "Details";
  }

  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getModuleRouteSegment(moduleKey, moduleConfig = {}) {
  return moduleConfig.routeSegment || moduleKey;
}

export function resolveProjectModule(projectId, segment) {
  const project = getProject(projectId);
  if (!project || !segment) return null;

  const entry = Object.entries(project.modules).find(([moduleKey, config]) => {
    const routeSegment = getModuleRouteSegment(moduleKey, config);
    return moduleKey === segment || routeSegment === segment;
  });

  if (!entry) return null;

  const [moduleKey, moduleConfig] = entry;
  return {
    project,
    projectId,
    moduleKey,
    moduleConfig,
    routeSegment: getModuleRouteSegment(moduleKey, moduleConfig),
  };
}

export function getProjectModuleRoute(projectId, moduleKey, subPath = []) {
  const project = getProject(projectId);
  const moduleConfig = project?.modules?.[moduleKey];
  const routeSegment = getModuleRouteSegment(moduleKey, moduleConfig);
  const parts = Array.isArray(subPath) ? subPath : String(subPath).split("/");
  const suffix = parts.filter(Boolean).join("/");
  return `/${projectId}/${routeSegment}${suffix ? `/${suffix}` : ""}`;
}

export function getCanonicalModuleRoute(resolvedModule, subPath = []) {
  if (!resolvedModule) return ADMIN_HOME_ROUTE;
  return getProjectModuleRoute(
    resolvedModule.projectId,
    resolvedModule.moduleKey,
    subPath,
  );
}

export function isSafeAdminPathSegment(segment = "") {
  return Boolean(segment) && !segment.includes("/") && segment !== "." && segment !== "..";
}

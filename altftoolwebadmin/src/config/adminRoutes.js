import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  FolderKanban,
  Headset,
  Layers,
  Mail,
  Palette,
  ShieldAlert,
  ShieldCheck,
  ShieldIcon,
  SlidersHorizontal,
  UserCircle,
  Wrench,
} from "lucide-react";
import { getProject } from "@/projects";

export const ADMIN_HOME_ROUTE = "/";

/**
 * Ordered sections for the global (non-project) admin navigation.
 *
 * All fifteen global modules used to render as one flat "System" list, which
 * made the console hard to scan and gave no sense of what belonged together.
 * Each module now declares a `group`, and the sidebar renders these sections
 * in this order. A group with no accessible modules is simply not rendered,
 * so an admin only ever sees the sections they can actually use.
 */
export const GLOBAL_MODULE_GROUPS = [
  { key: "overview", label: "Overview", order: ["super-admin", "analytics", "health", "workspace"] },
  {
    key: "access",
    label: "Access & Security",
    // Reads as a flow: who has access -> how access is defined -> current
    // posture -> the history. Declaration order in the map below is incidental,
    // so the intended reading order is stated here instead.
    order: ["admin-management", "rbac", "security", "audit-logs"],
  },
  {
    key: "content",
    label: "Content & Catalog",
    order: ["tool-catalog", "newsletter", "notification-broadcast"],
  },
  { key: "support", label: "Support", order: ["tickets", "support"] },
  { key: "platform", label: "Platform", order: ["design-system"] },
  { key: "account", label: "Account", order: ["profile"] },
];

const DEFAULT_MODULE_GROUP = "platform";

export const GLOBAL_ADMIN_MODULES = {
  "super-admin": {
    group: "overview",
    label: "Projects",
    icon: FolderKanban,
    path: "/super-admin",
    superadminOnly: true,
  },
  "admin-management": {
    group: "access",
    label: "Admin Management",
    icon: ShieldIcon,
    path: "/admin-management",
    children: [
      { label: "Admins", path: "/admin-management" },
      { label: "Full Audit Log", path: "/admin-management/audit" },
    ],
    superadminOnly: true,
  },
  analytics: {
    group: "overview",
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    superadminOnly: true,
  },
  health: {
    group: "overview",
    label: "Health",
    icon: Activity,
    path: "/health",
    children: [
      { label: "Overview", path: "/health" },
      { label: "Tool Readiness", path: "/health/tools" },
    ],
    superadminOnly: true,
  },
  "design-system": {
    group: "platform",
    label: "Design System",
    icon: Palette,
    path: "/design-system",
    superadminOnly: true,
  },
  security: {
    group: "access",
    label: "Security",
    icon: ShieldCheck,
    path: "/security",
    // Deep-linkable sections. These were in-page useState tabs, so a super admin
    // could not bookmark or share "Sessions & Devices" and the back button did
    // nothing inside the screen.
    children: [
      { label: "Overview", path: "/security?tab=overview" },
      { label: "Sessions & Devices", path: "/security?tab=sessions" },
      { label: "Recent Security Actions", path: "/security?tab=audit" },
      { label: "Security Events", path: "/security?tab=events" },
      { label: "Settings", path: "/security?tab=settings" },
    ],
    superadminOnly: true,
  },
  workspace: {
    group: "overview",
    label: "Workspace",
    icon: Layers,
    path: "/workspace",
    superadminOnly: true,
  },
  rbac: {
    group: "access",
    label: "RBAC Foundation",
    icon: SlidersHorizontal,
    path: "/rbac",
    superadminOnly: true,
  },
  "audit-logs": {
    group: "access",
    label: "Audit Logs",
    icon: ClipboardList,
    path: "/audit-logs",
    // This module entry was accidentally dropped from the registry while
    // disambiguating this app's other two audit surfaces (Security's
    // "Recent Security Actions" tab and Admin Management's "Full Audit
    // Log"). Losing it here silently removed /audit-logs from
    // SUPERADMIN_ONLY_GLOBAL_MODULES (it's derived from this registry) even
    // though the route itself was still live — restoring the hard
    // superadmin-only gate, not just the nav entry.
    superadminOnly: true,
  },
  "tool-catalog": {
    group: "content",
    label: "Tool Catalog",
    icon: Wrench,
    path: "/tool-catalog",
    superadminOnly: true,
  },
  newsletter: {
    group: "content",
    label: "Newsletter",
    icon: Mail,
    path: "/newsletter",
    superadminOnly: true,
  },
  "notification-broadcast": {
    group: "content",
    label: "Broadcasts",
    icon: Bell,
    path: "/notification-broadcast",
    superadminOnly: true,
  },
  tickets: {
    group: "support",
    label: "Tickets",
    icon: ShieldAlert,
    path: "/tickets",
    superadminOnly: true,
  },
  support: {
    group: "support",
    label: "Support Center",
    icon: Headset,
    path: "/support",
    allAdmins: true,
  },
  profile: {
    group: "account",
    label: "My Profile",
    icon: UserCircle,
    path: "/profile",
    allAdmins: true,
  },
};

/**
 * Bucket a list of global module keys into the ordered groups above.
 * Unknown/untagged modules fall into DEFAULT_MODULE_GROUP rather than
 * disappearing from the navigation.
 */
export function groupGlobalModules(moduleKeys = []) {
  const byGroup = new Map(GLOBAL_MODULE_GROUPS.map((g) => [g.key, []]));
  for (const key of moduleKeys) {
    const group = GLOBAL_ADMIN_MODULES[key]?.group ?? DEFAULT_MODULE_GROUP;
    (byGroup.get(group) ?? byGroup.get(DEFAULT_MODULE_GROUP)).push(key);
  }
  return GLOBAL_MODULE_GROUPS
    .map((g) => {
      const keys = byGroup.get(g.key) ?? [];
      const rank = (key) => {
        const i = g.order?.indexOf(key) ?? -1;
        // Anything not named in `order` sorts after the named entries, keeping
        // a newly added module visible instead of silently jumping to the top.
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
      };
      return { ...g, moduleKeys: [...keys].sort((a, b) => rank(a) - rank(b)) };
    })
    .filter((g) => g.moduleKeys.length > 0);
}

export const FLAT_ADMIN_ROUTE_KEYS = new Set([
  ...Object.keys(GLOBAL_ADMIN_MODULES),
  "access-denied",
  "access-requested",
  "account-inactive",
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

import { getProject } from "@/projects";
import {
  ADMIN_HOME_ROUTE,
  FLAT_ADMIN_ROUTE_KEYS,
  formatAdminSegment,
  getProjectModuleRoute,
  resolveProjectModule,
} from "@/config/adminRoutes";

// Understands two URL shapes:
//   NEW: /[project]/[module]/...  → e.g. /altftool/blogs
//   OLD: /[module]/...            → e.g. /blogs  (legacy, still works)
//   SPECIAL: /admin-management/... → always treated as its own section

export function getAdminRouteInfo(pathname) {
  const parts = pathname.split("/").filter(Boolean);

  if (!parts.length) {
    return { projectId: null, section: null, sectionConfig: null, subPath: [], full: parts, isLegacy: false };
  }

  // If first segment is a known flat section
  if (FLAT_ADMIN_ROUTE_KEYS.has(parts[0])) {
    return {
      projectId: null,
      section: parts[0],
      sectionConfig: null,
      subPath: parts.slice(1),
      full: parts,
      isLegacy: true,
    };
  }

  // If first segment matches a known project → new architecture
  const project = getProject(parts[0]);
  if (project) {
    const resolvedModule = parts[1] ? resolveProjectModule(parts[0], parts[1]) : null;
    const moduleKey = resolvedModule?.moduleKey || parts[1] || null;
    const moduleConfig = resolvedModule?.moduleConfig || null;
    return {
      projectId: parts[0],
      section: moduleKey,
      sectionConfig: moduleConfig,
      subPath: parts.slice(2),
      full: parts,
      isLegacy: false,
      routeSegment: resolvedModule?.routeSegment || parts[1] || null,
    };
  }

  // Otherwise treat as legacy flat route (e.g. /blogs, /ads)
  return {
    projectId: null,
    section: parts[0],
    sectionConfig: null,
    subPath: parts.slice(1),
    full: parts,
    isLegacy: true,
  };
}

export function buildAdminBreadcrumbs(routeInfo) {
  const { projectId, section, sectionConfig, subPath } = routeInfo;
  const crumbs = [{ label: "Admin Panel", href: ADMIN_HOME_ROUTE }];

  if (projectId) {
    const project = getProject(projectId);
    crumbs.push({ label: project?.name ?? projectId, href: `/${projectId}` });
  }

  if (section && sectionConfig) {
    crumbs.push({
      label: sectionConfig.label,
      href: projectId ? getProjectModuleRoute(projectId, section) : `/${section}`,
    });
  } else if (section) {
    crumbs.push({
      label: formatAdminSegment(section),
      href: projectId ? `/${projectId}/${section}` : `/${section}`,
    });
  }

  subPath.forEach((segment, index) => {
    const isLast = index === subPath.length - 1;
    const href =
      !isLast && projectId && section
        ? getProjectModuleRoute(projectId, section, subPath.slice(0, index + 1))
        : null;

    crumbs.push({ label: formatAdminSegment(segment), href });
  });

  return crumbs;
}

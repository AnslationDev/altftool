import { getProject } from "@/projects";

// Understands two URL shapes:
//   NEW: /[project]/[module]/...  → e.g. /altftool/blogs
//   OLD: /[module]/...            → e.g. /blogs  (legacy, still works)
//   SPECIAL: /admin-management/... → always treated as its own section

export function getAdminRouteInfo(pathname) {
  const parts = pathname.split("/").filter(Boolean);

  // Special flat routes that are never project-scoped
  const FLAT_SECTIONS = [
    "admin-management",
    "analytics",
    "login",
    "profile",
    "notification-broadcast",
    "support",
    "tickets" // ← added
  ];

  if (!parts.length) {
    return { projectId: null, section: null, sectionConfig: null, subPath: [], full: parts, isLegacy: false };
  }

  // If first segment is a known flat section
  if (FLAT_SECTIONS.includes(parts[0])) {
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
    const moduleKey = parts[1] || null;
    const moduleConfig = moduleKey ? (project.modules[moduleKey] ?? null) : null;
    return {
      projectId: parts[0],
      section: moduleKey,
      sectionConfig: moduleConfig,
      subPath: parts.slice(2),
      full: parts,
      isLegacy: false,
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
  const crumbs = [{ label: "Admin Panel", href: "/" }];

  if (projectId) {
    const project = getProject(projectId);
    crumbs.push({ label: project?.name ?? projectId, href: `/${projectId}` });
  }

  if (section && sectionConfig) {
    crumbs.push({
      label: sectionConfig.label,
      href: projectId ? `/${projectId}/${section}` : `/${section}`,
    });
  } else if (section) {
    crumbs.push({
      label: formatSegment(section),
      href: projectId ? `/${projectId}/${section}` : `/${section}`,
    });
  }

  if (subPath.length > 0) {
    crumbs.push({ label: formatSegment(subPath[subPath.length - 1]), href: null });
  }

  return crumbs;
}

function formatSegment(segment) {
  if (!isNaN(segment)) return "Details";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { PROJECTS, getProject } from "@/projects";
import {
  getProjectModuleRoute,
  GLOBAL_ADMIN_MODULES,
  resolveProjectModule,
} from "@/config/adminRoutes";

function getLogoSrc(logo) {
  return typeof logo === "string" ? logo : logo?.src;
}

function ProjectLogo({ project, size, className = "" }) {
  const src = getLogoSrc(project?.logo);
  if (!src) return null;

  return (
    <img
      src={src}
      alt={project.name}
      width={size}
      height={size}
      className={`rounded-sm object-contain ${className}`}
      style={{ maxWidth: size, maxHeight: size, width: "auto", height: "auto" }}
    />
  );
}

const normalizeModuleQuery = (value = "") => String(value).trim().toLowerCase();

export default function AdminSidebar({ adminData, mobileOpen = false, onCloseMobile = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const closeButtonRef = useRef(null);
  const getDefaultModule = (project) => {
    return Object.keys(project.modules)[0];
  };

  const projects = Object.values(PROJECTS);
  const [collapsed, setCollapsed] = useState(false);
  const compact = collapsed && !isMobile;
  const pathParts = pathname.split("/").filter(Boolean);

  const maybeProjectId = pathParts[0];
  const maybeProject = getProject(maybeProjectId);

  let projectId = null;
  let currentModule = null;
  let project = null;

  if (maybeProject) {
    const resolvedModule = resolveProjectModule(maybeProjectId, pathParts[1]);
    projectId = maybeProjectId;
    currentModule = resolvedModule?.moduleKey || pathParts[1];
    project = maybeProject;
  } else {
    const savedProjectId =
      typeof window !== "undefined"
        ? localStorage.getItem("last-project-id")
        : null;
    const savedProject = savedProjectId ? getProject(savedProjectId) : null;
    project = savedProject || Object.values(PROJECTS)[0];
    projectId = project.id;
    currentModule = null;
  }

  const globalModules = Object.keys(GLOBAL_ADMIN_MODULES);

  useEffect(() => {
    if (maybeProject) {
      localStorage.setItem("last-project-id", maybeProjectId);
    }
  }, [maybeProject, maybeProjectId]);

  const handleProjectSwitch = (newProjectId) => {
    const newProject = getProject(newProjectId);
    if (!newProject) return;
    let targetModule = currentModule;
    if (!targetModule || !newProject.modules[targetModule]) {
      targetModule = getDefaultModule(newProject);
    }
    router.push(getProjectModuleRoute(newProjectId, targetModule));
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth < 1024);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (mobileOpen && isMobile) {
      closeButtonRef.current?.focus();
    }
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  if (!adminData) return null;

  const normalizedModuleFilter = normalizeModuleQuery(moduleFilter);
  const allowedTabs = Object.keys(project.modules).filter((moduleKey) =>
    hasModuleAccess({ adminData, projectId, moduleKey, action: "read" })
  );
  const visibleTabs = allowedTabs.filter((key) => {
    if (!normalizedModuleFilter) return true;
    const moduleConfig = project.modules[key];
    const haystack = normalizeModuleQuery(`${key} ${moduleConfig?.label || ""}`);
    return haystack.includes(normalizedModuleFilter);
  });
  const accessibleGlobalModules = globalModules.filter((key) => {
    const moduleConfig = GLOBAL_ADMIN_MODULES[key];

    if (moduleConfig.allAdmins) return true;
    if (moduleConfig.superadminOnly) return adminData.roleType === "superadmin";

    return adminData.roleType === "superadmin" || adminData.permissions?.[key]?.read;
  });
  const visibleGlobalModules = accessibleGlobalModules.filter((key) => {
    if (!normalizedModuleFilter) return true;
    const moduleConfig = GLOBAL_ADMIN_MODULES[key];
    const haystack = normalizeModuleQuery(`${key} ${moduleConfig?.label || ""} system`);
    return haystack.includes(normalizedModuleFilter);
  });
  const hasVisibleModules = visibleTabs.length > 0 || visibleGlobalModules.length > 0;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,var(--background))] shadow-[var(--shadow-lg)] transition-all duration-200 lg:relative lg:z-auto lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${compact ? "lg:w-16" : "lg:w-60"}`}
    >
      <div
        className={`h-14 flex items-center border-b border-[var(--border)] shrink-0 ${
          compact ? "justify-center px-0" : "justify-between px-4"
        }`}
      >
        <div className="relative w-full">
          {!compact ? (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-transparent px-2 py-1.5 text-[var(--foreground)] transition hover:border-[var(--border)] hover:bg-[var(--surface-soft)]"
            >
              <div className="flex items-center gap-2 truncate">
                <ProjectLogo project={project} size={18} />
                <span className="font-semibold text-[var(--foreground)] text-sm truncate">
                  {project?.name || "Select Project"}
                </span>
              </div>
              <span className={`text-xs transition ${open ? "rotate-180" : ""}`}>▼</span>
            </button>
          ) : (
            <div
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-center w-full cursor-pointer"
            >
              {project?.logo ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <ProjectLogo project={project} size={22} />
                </div>
              ) : (
                <span className="text-sm font-semibold">{project?.name?.[0]}</span>
              )}
            </div>
          )}

          {open && (
            <div className="absolute left-0 top-10 z-50 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-md)]">
              {projects.map((proj) => {
                const isActive = proj.id === projectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      handleProjectSwitch(proj.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-soft)] ${
                      isActive ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ProjectLogo project={proj} size={16} />
                      <span>{proj.name}</span>
                    </div>
                    {isActive && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          ref={closeButtonRef}
          onClick={onCloseMobile}
          className="ml-2 inline-flex rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:hidden"
          aria-label="Close admin navigation"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="hidden rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:inline-flex"
          aria-label={compact ? "Expand admin navigation" : "Collapse admin navigation"}
        >
          {compact ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {!compact && (
        <div className="border-b border-[var(--border)] px-3 py-3">
          <label className="sr-only" htmlFor="admin-module-filter">
            Filter modules
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              id="admin-module-filter"
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              placeholder="Filter modules"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-9 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
            />
            {moduleFilter ? (
              <button
                type="button"
                onClick={() => setModuleFilter("")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                aria-label="Clear module filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {!hasVisibleModules && !compact ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-5 text-center text-xs font-medium text-[var(--muted)]">
            No modules match this filter.
          </div>
        ) : null}

        <nav className="space-y-0.5" aria-label={`${project?.name || "Project"} modules`}>
        {visibleTabs.map((key) => {
          const moduleConfig = project.modules[key];
          if (!moduleConfig) return null;
          const Icon = moduleConfig.icon;
          const href = getProjectModuleRoute(projectId, key);
          const isActive = currentModule === key;
          return (
            <Link
              key={key}
              href={href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              } ${compact ? "justify-center" : ""}`}
              title={compact ? moduleConfig.label : undefined}
              onClick={onCloseMobile}
            >
              <Icon size={16} className="shrink-0" />
              {!compact && (
                <span className="text-sm font-medium truncate">{moduleConfig.label}</span>
              )}
              {compact && isActive && (
                <span className="absolute right-2 w-1 h-1 rounded-full bg-[var(--primary-foreground)]" />
              )}
            </Link>
          );
        })}
        </nav>

      {/* GLOBAL MODULES */}
      {visibleGlobalModules.length > 0 && (
        <>
          {!compact && (
            <div className="mt-2 px-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
              System
            </div>
          )}

          <div className="py-2 px-2 space-y-0.5">
            {visibleGlobalModules.map((key) => {
              const moduleConfig = GLOBAL_ADMIN_MODULES[key];
              const Icon = moduleConfig.icon;
              const isActive = pathname.startsWith(moduleConfig.path);

              return (
                <Link
                  key={key}
                  href={moduleConfig.path}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  } ${compact ? "justify-center" : ""}`}
                  title={compact ? moduleConfig.label : undefined}
                  onClick={onCloseMobile}
                >
                  <Icon size={16} className="shrink-0" />
                  {!compact && (
                    <span className="text-sm font-medium truncate">{moduleConfig.label}</span>
                  )}
                  {compact && isActive && (
                    <span className="absolute right-2 w-1 h-1 rounded-full bg-[var(--primary-foreground)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
      </div>

      {!compact && (
        <div className="px-4 py-3 border-t border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                adminData.isActive !== false ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider capitalize">
              {adminData.roleType === "superadmin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

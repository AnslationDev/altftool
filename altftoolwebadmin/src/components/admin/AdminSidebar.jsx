"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
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

function SidebarNavLink({ href, label, icon: Icon, isActive, compact, onNavigate }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
        isActive
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
      } ${compact ? "justify-center px-0 py-2.5" : ""}`}
      title={compact ? label : undefined}
      onClick={onNavigate}
    >
      <Icon size={16} className="shrink-0" strokeWidth={1.75} />
      {!compact && <span className="truncate">{label}</span>}
      {compact && isActive && (
        <span className="absolute right-1.5 h-1 w-1 rounded-full bg-[var(--primary-foreground)]" />
      )}
    </Link>
  );
}

function SidebarSectionLabel({ children }) {
  return (
    <p className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
      {children}
    </p>
  );
}

export default function AdminSidebar({ adminData, mobileOpen = false, onCloseMobile = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const closeButtonRef = useRef(null);
  const switcherRef = useRef(null);
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
    router.push(targetModule ? getProjectModuleRoute(newProjectId, targetModule) : `/${newProjectId}`);
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

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  // Access-based lists (independent of the filter text): memoized so we do NOT
  // re-run hasModuleAccess per module on every render / filter keystroke — same
  // deterministic result, identical authorization outcome, pure render perf.
  // Hooks live ABOVE the early return below to satisfy the Rules of Hooks; each
  // memo guards the null-adminData case internally.
  const allowedTabs = useMemo(() => {
    if (!adminData || !project) return [];
    return Object.keys(project.modules).filter((moduleKey) =>
      hasModuleAccess({ adminData, projectId, moduleKey, action: "read" }),
    );
  }, [adminData, project, projectId]);

  const accessibleGlobalModules = useMemo(() => {
    if (!adminData) return [];
    return Object.keys(GLOBAL_ADMIN_MODULES).filter((key) => {
      const moduleConfig = GLOBAL_ADMIN_MODULES[key];
      if (moduleConfig.allAdmins) return true;
      if (moduleConfig.superadminOnly) return adminData.roleType === "superadmin";
      return adminData.roleType === "superadmin" || adminData.permissions?.[key]?.read;
    });
  }, [adminData]);

  // Filter-based lists: only re-filter the already-computed access lists when the
  // query changes — the per-module access check is not recomputed per keystroke.
  const normalizedModuleFilter = useMemo(
    () => normalizeModuleQuery(moduleFilter),
    [moduleFilter],
  );

  const visibleTabs = useMemo(() => {
    if (!normalizedModuleFilter) return allowedTabs;
    return allowedTabs.filter((key) => {
      const moduleConfig = project?.modules?.[key];
      const haystack = normalizeModuleQuery(`${key} ${moduleConfig?.label || ""}`);
      return haystack.includes(normalizedModuleFilter);
    });
  }, [allowedTabs, normalizedModuleFilter, project]);

  const visibleGlobalModules = useMemo(() => {
    if (!normalizedModuleFilter) return accessibleGlobalModules;
    return accessibleGlobalModules.filter((key) => {
      const moduleConfig = GLOBAL_ADMIN_MODULES[key];
      const haystack = normalizeModuleQuery(`${key} ${moduleConfig?.label || ""} system`);
      return haystack.includes(normalizedModuleFilter);
    });
  }, [accessibleGlobalModules, normalizedModuleFilter]);

  if (!adminData) return null;

  const hasVisibleModules = visibleTabs.length > 0 || visibleGlobalModules.length > 0;
  const isSuperAdmin = adminData.roleType === "superadmin";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,var(--background))] shadow-[var(--shadow-lg)] transition-all duration-200 lg:relative lg:z-auto lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${compact ? "lg:w-16" : "lg:w-60"}`}
    >
      {/* Project switcher */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-[var(--border)] ${
          compact ? "justify-center px-0" : "justify-between gap-1 px-3"
        }`}
      >
        <div className="relative min-w-0 flex-1" ref={switcherRef}>
          {!compact ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-[var(--border)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                  {project?.logo ? (
                    <ProjectLogo project={project} size={18} />
                  ) : (
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {project?.name?.[0]}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold leading-tight text-[var(--foreground)]">
                    {project?.name || "Select Project"}
                  </span>
                  <span className="block text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                    Project
                  </span>
                </span>
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label="Switch project"
              className="mx-auto grid h-9 w-9 place-items-center rounded-lg border border-transparent transition hover:border-[var(--border)] hover:bg-[var(--surface-soft)]"
            >
              {project?.logo ? (
                <ProjectLogo project={project} size={20} />
              ) : (
                <span className="text-sm font-semibold">{project?.name?.[0]}</span>
              )}
            </button>
          )}

          {open && (
            <div
              role="listbox"
              aria-label="Projects"
              className={`absolute top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-md)] ${
                compact ? "left-0 w-52" : "left-0 w-full"
              }`}
            >
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                Switch project
              </p>
              {projects.map((proj) => {
                const isActive = proj.id === projectId;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      handleProjectSwitch(proj.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition hover:bg-[var(--surface-soft)] ${
                      isActive
                        ? "font-semibold text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ProjectLogo project={proj} size={16} />
                      <span className="truncate">{proj.name}</span>
                    </span>
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          ref={closeButtonRef}
          onClick={onCloseMobile}
          className="inline-flex shrink-0 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:hidden"
          aria-label="Close admin navigation"
        >
          <X className="h-4 w-4" />
        </button>
        {!compact && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden shrink-0 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:inline-flex"
            aria-label="Collapse admin navigation"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {compact && (
        <div className="border-b border-[var(--border)] py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto hidden rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:grid"
            aria-label="Expand admin navigation"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Module filter */}
      {!compact && (
        <div className="px-3 pb-1 pt-3">
          <label className="sr-only" htmlFor="admin-module-filter">
            Filter modules
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              id="admin-module-filter"
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              placeholder="Filter modules…"
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-8 text-[13px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
            />
            {moduleFilter ? (
              <button
                type="button"
                onClick={() => setModuleFilter("")}
                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                aria-label="Clear module filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={`admin-thin-scroll flex-1 overflow-y-auto pb-3 ${compact ? "px-2 pt-3" : "px-3"}`}>
        {!hasVisibleModules && !compact ? (
          <div className="mt-3 rounded-lg border border-dashed border-[var(--border-strong,var(--border))] px-3 py-6 text-center text-xs font-medium text-[var(--muted)]">
            No modules match this filter.
          </div>
        ) : null}

        {visibleTabs.length > 0 && (
          <>
            {!compact && <SidebarSectionLabel>{project?.name || "Project"} modules</SidebarSectionLabel>}
            <nav className="space-y-0.5" aria-label={`${project?.name || "Project"} modules`}>
              {visibleTabs.map((key) => {
                const moduleConfig = project.modules[key];
                if (!moduleConfig) return null;
                return (
                  <SidebarNavLink
                    key={key}
                    href={getProjectModuleRoute(projectId, key)}
                    label={moduleConfig.label}
                    icon={moduleConfig.icon}
                    isActive={currentModule === key}
                    compact={compact}
                    onNavigate={onCloseMobile}
                  />
                );
              })}
            </nav>
          </>
        )}

        {visibleGlobalModules.length > 0 && (
          <>
            {!compact ? (
              <SidebarSectionLabel>System</SidebarSectionLabel>
            ) : (
              <div className="mx-2 my-3 border-t border-[var(--border)]" aria-hidden="true" />
            )}
            <nav className="space-y-0.5" aria-label="System modules">
              {visibleGlobalModules.map((key) => {
                const moduleConfig = GLOBAL_ADMIN_MODULES[key];
                return (
                  <SidebarNavLink
                    key={key}
                    href={moduleConfig.path}
                    label={moduleConfig.label}
                    icon={moduleConfig.icon}
                    isActive={pathname.startsWith(moduleConfig.path)}
                    compact={compact}
                    onNavigate={onCloseMobile}
                  />
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className={`shrink-0 border-t border-[var(--border)] ${
          compact ? "flex justify-center px-0 py-3" : "px-4 py-3"
        }`}
      >
        <div className="flex items-center gap-2" title={adminData.isActive !== false ? "Account active" : "Account inactive"}>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              adminData.isActive !== false ? "bg-[var(--success)]" : "bg-[var(--danger)]"
            }`}
          />
          {!compact && (
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, PanelLeftClose, PanelLeftOpen, UserCircle, Bell, Headset, ShieldAlert } from "lucide-react";
import { hasModuleAccess, SUPERADMIN_ONLY_GLOBAL_MODULES } from "@/lib/permissionUtils";
import { PROJECTS, getProject } from "@/projects";
import Image from "next/image";
import { ShieldIcon } from "lucide-react";

export default function AdminSidebar({ adminData }) {
  if (!adminData) return null;

  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const getDefaultModule = (project) => {
    return Object.keys(project.modules)[0];
  };

  const projects = Object.values(PROJECTS);
  const [collapsed, setCollapsed] = useState(false);
  const pathParts = pathname.split("/").filter(Boolean);

  const maybeProjectId = pathParts[0];
  const maybeProject = getProject(maybeProjectId);

  let projectId = null;
  let currentModule = null;
  let project = null;

  if (maybeProject) {
    projectId = maybeProjectId;
    currentModule = pathParts[1];
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

  // ── GLOBAL_MODULES ──────────────────────────────────────────────────────────
  // Add "notification-broadcast" here alongside the existing entries.
  const GLOBAL_MODULES = {
    "admin-management": {
      label: "Admin Management",
      icon: ShieldIcon,
      path: "/admin-management",
    },
    analytics: {
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    "notification-broadcast": {
      label: "Broadcasts",
      icon: Bell,
      path: "/notification-broadcast",
    },
    profile: {
      label: "My Profile",
      icon: UserCircle,
      path: "/profile",
      // available to all authenticated admins
      allAdmins: true,
    },
    
tickets: {
label: "Tickets",
icon: ShieldAlert,
path: "/tickets",
},
  };

  const globalModules = Object.keys(GLOBAL_MODULES);

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
    router.push(`/${newProjectId}/${targetModule}`);
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const allowedTabs = Object.keys(project.modules).filter((moduleKey) =>
    hasModuleAccess({ adminData, projectId, moduleKey, action: "read" })
  );

  return (
    <aside
      className={`bg-[var(--surface)] border-r border-[var(--border)] h-full flex flex-col transition-all duration-200 shrink-0 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div
        className={`h-14 flex items-center border-b border-[var(--border)] shrink-0 ${
          collapsed ? "justify-center px-0" : "justify-between px-4"
        }`}
      >
        <div className="relative w-full">
          {!collapsed ? (
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
            >
              <div className="flex items-center gap-2 truncate">
                {project?.logo && (
                  <Image
                    src={project.logo}
                    alt={project.name}
                    width={18}
                    height={18}
                    className="rounded-sm object-contain"
                  />
                )}
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
                  <Image
                    src={project.logo}
                    alt={project.name}
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">{project?.name?.[0]}</span>
              )}
            </div>
          )}

          {open && (
            <div className="absolute top-10 left-0 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-md z-50 overflow-hidden">
              {projects.map((proj) => {
                const isActive = proj.id === projectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      handleProjectSwitch(proj.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-soft)] transition flex items-center justify-between ${
                      isActive ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {proj.logo && (
                        <Image
                          src={proj.logo}
                          alt={proj.name}
                          width={16}
                          height={16}
                          className="rounded-sm object-contain"
                        />
                      )}
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
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {allowedTabs.map((key) => {
          const moduleConfig = project.modules[key];
          if (!moduleConfig) return null;
          const Icon = moduleConfig.icon;
          const href = `/${projectId}/${key}`;
          const isActive = currentModule === key;
          return (
            <Link
              key={key}
              href={href}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? moduleConfig.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{moduleConfig.label}</span>
              )}
              {collapsed && isActive && (
                <span className="absolute right-2 w-1 h-1 rounded-full bg-[var(--primary-foreground)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* GLOBAL MODULES */}
      {globalModules.length > 0 && (
        <>
          {!collapsed && (
            <div className="mt-2 px-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
              System
            </div>
          )}

          <div className="py-2 px-2 space-y-0.5">
            {globalModules.map((key) => {
              const moduleConfig = GLOBAL_MODULES[key];

              // Profile is available to all admins; others follow existing logic
              const hasAccess = moduleConfig.allAdmins
                ? true
                : SUPERADMIN_ONLY_GLOBAL_MODULES.has(key)
                ? adminData.roleType === "superadmin"
                : adminData.roleType === "superadmin" ||
                  adminData.permissions?.[key]?.read;

              if (!hasAccess) return null;

              const Icon = moduleConfig.icon;
              const isActive = pathname.startsWith(moduleConfig.path);

              return (
                <Link
                  key={key}
                  href={moduleConfig.path}
                  className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? moduleConfig.label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{moduleConfig.label}</span>
                  )}
                  {collapsed && isActive && (
                    <span className="absolute right-2 w-1 h-1 rounded-full bg-[var(--primary-foreground)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {!collapsed && (
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

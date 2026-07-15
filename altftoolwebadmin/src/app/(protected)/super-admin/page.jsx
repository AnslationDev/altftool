"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Globe2,
  Grid2X2,
  Headset,
  LayoutDashboard,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShieldPlus,
  SlidersHorizontal,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PROJECTS } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";
import { hasProjectAccess } from "@/lib/permissionUtils";

const PROJECT_META = {
  leadtree: {
    description: "Manage blogs, categories, teams, credit cards, videos, and LeadTree content.",
    accent: "#16a34a",
    icon: FolderKanban,
  },
  carrerbook: {
    description: "Manage navbar, footer, pages, blogs, clients, policy, teams, and request forms.",
    accent: "#2563eb",
    icon: BriefcaseBusiness,
  },
  altftool: {
    description: "Manage ads, BuySmart, blogs, deals, extensions, media, SEO, and rules.",
    accent: "#7c3aed",
    icon: Wrench,
  },
  anternet: {
    description: "Manage d Anternet project modules, pages, and website content.",
    accent: "#0891b2",
    icon: Globe2,
  },
  myluckydeal: {
    description: "Manage stores, offers, categories, banners, coupons, and deal content.",
    accent: "#f59e0b",
    icon: Grid2X2,
  },
  growvibe: {
    description: "Manage growth marketing content, insights, services, and team sections.",
    accent: "#0d9488",
    icon: BarChart3,
  },
};

const QUICK_ACTIONS = [
  { label: "Admin Access", href: "/admin-management", icon: UsersRound },
  { label: "RBAC Foundation", href: "/rbac", icon: SlidersHorizontal },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
  { label: "Security", href: "/security", icon: LockKeyhole },
  { label: "Support", href: "/support", icon: Headset },
];

function ProjectLogo({ project, Icon, accent }) {
  const logoSrc = typeof project.logo === "string" ? project.logo : project.logo?.src;

  return (
    <span
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-white shadow-sm"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 30%, var(--border))`,
        color: accent,
      }}
    >
      {logoSrc ? (
        <img src={logoSrc} alt="" className="h-7 w-7 object-contain" />
      ) : (
        <Icon className="h-6 w-6" strokeWidth={2} />
      )}
    </span>
  );
}

function ProjectCard({ project, href, accessible, projectSummary }) {
  const meta = PROJECT_META[project.id] || {};
  const Icon = meta.icon || LayoutDashboard;
  const accent = meta.accent || project.color || "var(--primary)";
  const modules = Object.keys(project.modules || {});
  const status = projectSummary?.status || "active";
  const moduleCount = projectSummary?.moduleCount || modules.length;
  const description = projectSummary?.description || meta.description || `Manage ${project.name} modules and admin content.`;


  console.log(project.length , "project data")

  return (
    <Link
      href={accessible ? href : "/access-denied"}
      className="group flex min-h-[220px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
    >
      <div className="flex items-start justify-between gap-4">
        <ProjectLogo project={project} Icon={Icon} accent={accent} />
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            accessible && status !== "inactive"
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : "bg-[var(--surface-soft)] text-[var(--muted)]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {accessible ? status.charAt(0).toUpperCase() + status.slice(1) : "No Access"}
        </span>
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h2 className="text-lg font-black tracking-tight text-[var(--foreground)]">{project.projectName}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Modules</p>
          <p className="mt-1 text-xl font-black text-[var(--foreground)]">{project.moduleCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Open</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold" style={{ color: accent }}>
            <Link  href={project.adminRoute}>
            Admin Panel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link>
            
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SuperAdminDashboardPage() {
  const { user, adminData, isSuperAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const projects = useMemo(() => {
    const preferredOrder = ["leadtree", "carrerbook", "altftool", "anternet", "myluckydeal", "growvibe"];
    return preferredOrder.map((id) => PROJECTS[id]).filter(Boolean);
  }, []);

  const activeProjects = projects.filter((project) =>
    isSuperAdmin || hasProjectAccess({ adminData, projectId: project.id }),
  );

  const summaryProjectsById = useMemo(() => {
    const map = new Map();
    (summary?.projects || []).forEach((project) => map.set(project.projectId, project));
    return map;
  }, [summary]);



  const fallbackModules = activeProjects.reduce(
    (count, project) => count + Object.keys(project.modules || {}).length,
    0,
  );

  const loadSummary = useCallback(async (silent = false) => {
    if (!silent) setLoadingSummary(true);
    setSummaryError("");
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return;
      const response = await fetch("/api/super-admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load Super Admin data");
      setSummary(data);
    } catch (error) {
      setSummaryError(error?.message || "Failed to load Super Admin data");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  console.log("summary project data is comming" , summary)

  const counts = summary?.counts || {};
  const totalProjects = counts.projects || activeProjects.length;
  const totalModules = counts.modules || fallbackModules;
  const totalAdmins = counts.adminUsers || 0;
  const pendingRequests = counts.pendingAccessRequests || 0;

  const displayName = adminData?.fullName || adminData?.name || user?.displayName || "Super Admin";
  const email = adminData?.email || user?.email || "";

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
                <ShieldPlus className="h-4 w-4" />
                Central Super Admin Console
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
                Manage every project from one dashboard
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
                Select a project to open its dedicated admin panel. Each panel keeps its own modules, data,
                permissions, and CRUD screens separated from the others.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadSummary(true)}
                  disabled={loadingSummary}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingSummary ? "animate-spin" : ""}`} />
                  Refresh Data
                </button>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Source: {summary?.root || "super_admin_dashboard/main"}
                </span>
                {summaryError ? (
                  <span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]">
                    {summaryError}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--foreground)]">{displayName}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="text-xl font-black text-[var(--foreground)]">{totalProjects}</p>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Projects</p>
                </div>
                <div className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="text-xl font-black text-[var(--foreground)]">{totalModules}</p>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Modules</p>
                </div>
                <div className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="text-xl font-black text-[var(--success)]">{totalAdmins}</p>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Admins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-4 lg:px-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Roles", value: counts.roles || 0 },
                { label: "Pending Requests", value: pendingRequests },
                { label: "Audit Logs", value: counts.auditLogs || 0 },
                { label: "Security Events", value: counts.securityEvents || 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-[var(--foreground)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">Projects</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Open the correct admin panel based on the selected project.
              </p>
            </div>
            <Link
              href="/analytics"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Grid2X2 className="h-4 w-4" />
              All Projects
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
             { summary?.projects?.map((project) => {
              const firstModuleKey = Object.keys(project.modules || {})[0];
              const href = firstModuleKey ? getProjectModuleRoute(project.id, firstModuleKey) : `/${project.id}`;
              const accessible = isSuperAdmin || hasProjectAccess({ adminData, projectId: project.id });
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  href={href}
                  accessible={accessible}
                  projectSummary={summaryProjectsById.get(project.id)}
                />
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
            <h3 className="mt-3 text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
              Project Isolation
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Opening LeadTree, CareerBook, AltFtool, or another project loads only that project modules and data.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-[var(--primary)]" />
            <h3 className="mt-3 text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
              RBAC Controlled
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Super admins can manage access centrally while project admins stay inside assigned projects.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <Clock3 className="h-6 w-6 text-[var(--warning,#f59e0b)]" />
            <h3 className="mt-3 text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
              Operational Flow
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use Admin Management, Audit Logs, Security, and Support from the same console sidebar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

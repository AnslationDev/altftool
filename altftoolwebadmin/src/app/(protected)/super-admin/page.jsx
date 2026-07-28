"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { DataState, EmptyState, PageHeader, SectionCard, StatGrid } from "@/ansets";
import { useAuth } from "@/context/AuthContext";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { PROJECTS } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";
import { hasProjectAccess } from "@/lib/permissionUtils";

const PROJECT_META = {
  leadtree: {
    description: "Manage blogs, categories, teams, credit cards, videos, and LeadTree content.",
    accent: "var(--success)",
    icon: FolderKanban,
  },
  carrerbook: {
    description: "Manage navbar, footer, pages, blogs, clients, policy, teams, and request forms.",
    accent: "var(--info)",
    icon: BriefcaseBusiness,
  },
  altftool: {
    description: "Manage ads, BuySmart, blogs, deals, extensions, media, SEO, and rules.",
    accent: "var(--accent)",
    icon: Wrench,
  },
  anternet: {
    description: "Manage Anternet project modules, pages, and website content.",
    accent: "var(--secondary)",
    icon: Globe2,
  },
  myluckydeal: {
    description: "Manage stores, offers, categories, banners, coupons, and deal content.",
    accent: "var(--warning)",
    icon: Grid2X2,
  },
  growvibe: {
    description: "Manage growth marketing content, insights, services, and team sections.",
    accent: "var(--primary)",
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

const CAPABILITY_CARDS = [
  {
    title: "Project Isolation",
    icon: CheckCircle2,
    iconClass: "text-[var(--success)]",
    body: "Opening LeadTree, CareerBook, AltFtool, or another project loads only that project modules and data.",
  },
  {
    title: "RBAC Controlled",
    icon: ShieldCheck,
    iconClass: "text-[var(--primary)]",
    body: "Super admins can manage access centrally while project admins stay inside assigned projects.",
  },
  {
    title: "Operational Flow",
    icon: Clock3,
    iconClass: "text-[var(--warning)]",
    body: "Use Admin Management, Audit Logs, Security, and Support from the same console sidebar.",
  },
];

function ProjectLogo({ project, Icon, accent }) {
  const logoSrc = typeof project.logo === "string" ? project.logo : project.logo?.src;

  return (
    <span
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-[var(--surface)] shadow-sm"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 30%, var(--border))`,
        color: accent,
      }}
    >
      {logoSrc ? (
        <img src={logoSrc} alt="" className="h-7 w-7 object-contain" />
      ) : (
        <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
      )}
    </span>
  );
}

/**
 * Stays local: the whole tile is a single <Link>, which SectionCard (a
 * <section>) cannot express without nesting interactive content inside a
 * non-interactive shell. Radius/border/shadow are matched to SectionCard.
 */
function ProjectCard({ project, href, accessible, projectSummary }) {
  const meta = PROJECT_META[project.id] || {};
  const Icon = meta.icon || LayoutDashboard;
  const accent = meta.accent || project.color || "var(--primary)";
  const modules = Object.keys(project.modules || {});
  const status = projectSummary?.status || "active";
  const moduleCount = projectSummary?.moduleCount || modules.length;
  const description = projectSummary?.description || meta.description || `Manage ${project.name} modules and admin content.`;
  const live = accessible && status !== "inactive";

  return (
    <Link
      href={accessible ? href : "/access-denied"}
      className="group flex min-h-[220px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <div className="flex items-start justify-between gap-4">
        <ProjectLogo project={project} Icon={Icon} accent={accent} />
        {/* Label text is --foreground, not the status hue: --success at 12px
            semibold on --success-soft is 3.1:1 and fails AA. The dot keeps the
            colour, and a dot only needs 3:1. */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] ${
            live ? "bg-[var(--success-soft)]" : "bg-[var(--surface-soft)]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              live ? "bg-[var(--success)]" : "bg-[var(--muted)]"
            }`}
            aria-hidden="true"
          />
          {accessible ? status.charAt(0).toUpperCase() + status.slice(1) : "No Access"}
        </span>
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {project.projectName}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Modules</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
            {project.moduleCount ?? moduleCount}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Open</p>
          {/* Uses --foreground, not the project `accent`: the raw status/brand
              hues fail AA (1.81:1 - 4.23:1) as 14px bold text on --surface.
              The accent stays on the ProjectLogo border/icon, which is
              non-text and only needs 3:1. */}
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]">
            {/* The whole card is already a <Link> to `href`; a nested <Link>
                here produced invalid <a>-in-<a> markup and made clicks land on
                the wrong target intermittently. Render as plain text instead. */}
            Admin Panel
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
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
      const token = await getAdminIdToken();
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

  const counts = summary?.counts || {};
  const totalProjects = counts.projects || activeProjects.length;
  const totalModules = counts.modules || fallbackModules;
  const totalAdmins = counts.adminUsers || 0;
  const pendingRequests = counts.pendingAccessRequests || 0;

  const displayName = adminData?.fullName || adminData?.name || user?.displayName || "Super Admin";
  const email = adminData?.email || user?.email || "";

  const summaryProjects = summary?.projects || [];
  // The registry fallback keeps the console usable when the summary API fails,
  // so "we have nothing to show" is narrower than "the request failed".
  const hasProjects = summaryProjects.length > 0 || activeProjects.length > 0;

  const statItems = [
    { key: "projects", label: "Projects", value: totalProjects },
    { key: "modules", label: "Modules", value: totalModules },
    { key: "admins", label: "Admins", value: totalAdmins, tone: "success" },
    {
      key: "pending",
      label: "Pending Requests",
      value: pendingRequests,
      tone: pendingRequests > 0 ? "warning" : "default",
    },
    { key: "roles", label: "Roles", value: counts.roles || 0 },
    { key: "auditLogs", label: "Audit Logs", value: counts.auditLogs || 0 },
    { key: "securityEvents", label: "Security Events", value: counts.securityEvents || 0 },
  ];

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      {/* PageHeader owns its own bottom margin; only the body below it is
          spaced, so the gap under the title stays the console standard. */}
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Central Super Admin Console"
          icon={ShieldPlus}
          title="Manage every project from one dashboard"
          description="Select a project to open its dedicated admin panel. Each panel keeps its own modules, data, permissions, and CRUD screens separated from the others."
          actions={
            <button
              type="button"
              onClick={() => loadSummary(true)}
              disabled={loadingSummary}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingSummary ? "animate-spin motion-reduce:animate-none" : ""}`}
                aria-hidden="true"
              />
              Refresh Data
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--muted)]">
            <span>
              Signed in as{" "}
              <span className="font-semibold text-[var(--foreground)]">{displayName}</span>
              {email ? ` · ${email}` : ""}
            </span>
            <span>Source: {summary?.root || "super_admin_dashboard/main"}</span>
          </div>
        </PageHeader>

        <div className="space-y-6">
          {/* A failed summary used to appear as a small pill with no way to retry,
              and its message doubled as the "no projects" copy. Now it is a real
              alert whenever there is still fallback content behind it, and a full
              ErrorState (below) when there is nothing to fall back to. */}
          {summaryError && hasProjects ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]"
            >
              <span>{summaryError} Showing the projects this console already knows about.</span>
              <button
                type="button"
                onClick={() => loadSummary()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : null}

          <StatGrid items={statItems} columns={4} />

          <SectionCard
            title="Quick actions"
            description="Jump straight to the central controls that sit outside a single project."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Projects"
            description="Open the correct admin panel based on the selected project."
            actions={
              <Link
                href="/analytics"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                All Projects
              </Link>
            }
          >
            <DataState
              loading={loadingSummary && !summaryProjects.length}
              error={hasProjects ? null : summaryError}
              onRetry={() => loadSummary()}
              isEmpty={!hasProjects}
              loadingVariant="cards"
              rows={activeProjects.length || 3}
              empty={
                <EmptyState
                  icon={LayoutDashboard}
                  title="No projects available"
                  description="You do not have access to any project yet."
                />
              }
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summaryProjects.length
                  ? summaryProjects.map((summaryProject) => {
                      // The summary API returns { projectId, projectName, adminRoute, ... }
                      // (NOT { id, modules }). Merge it with the local project registry so
                      // the card has both the registry meta (id, modules, logo, name) and
                      // the server-computed route. Reading project.id / project.modules
                      // straight off the API object left them undefined, which made the
                      // href fall through to `/undefined`.
                      const projectId = summaryProject.projectId;
                      const registry = PROJECTS[projectId];
                      const firstModuleKey = Object.keys(registry?.modules || {})[0];
                      const href =
                        summaryProject.adminRoute ||
                        (registry && firstModuleKey
                          ? getProjectModuleRoute(projectId, firstModuleKey)
                          : `/${projectId}`);
                      const accessible = isSuperAdmin || hasProjectAccess({ adminData, projectId });
                      return (
                        <ProjectCard
                          key={projectId}
                          project={{ ...registry, ...summaryProject, id: projectId }}
                          href={href}
                          accessible={accessible}
                          projectSummary={summaryProjectsById.get(projectId)}
                        />
                      );
                    })
                  : // Summary failed or came back empty — fall back to the local
                    // project registry so the console stays usable.
                    activeProjects.map((project) => {
                      const firstModuleKey = Object.keys(project.modules || {})[0];
                      const href = firstModuleKey
                        ? getProjectModuleRoute(project.id, firstModuleKey)
                        : `/${project.id}`;
                      return (
                        <ProjectCard
                          key={project.id}
                          project={{
                            ...project,
                            projectName: project.projectName || project.name,
                            moduleCount: Object.keys(project.modules || {}).length,
                          }}
                          href={href}
                          accessible
                          projectSummary={summaryProjectsById.get(project.id)}
                        />
                      );
                    })}
              </div>
            </DataState>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-3">
            {CAPABILITY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <SectionCard key={card.title} title={card.title}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 shrink-0 ${card.iconClass}`} aria-hidden="true" />
                    <p className="text-sm leading-6 text-[var(--muted)]">{card.body}</p>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

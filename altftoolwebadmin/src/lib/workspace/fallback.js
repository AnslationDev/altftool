// Fallback registration for projects that have NOT shipped their own
// *.workspace.js yet. Ensures every project in the platform registry (@/projects)
// appears in the Workspace Registry automatically — so nothing silently
// disappears, and onboarding a project needs zero audit-core changes.
//
// Note on applications: a project that needs multiple/custom applications
// (Public Website, Mobile, Extension, API, …) declares them in its own
// *.workspace.js. This fallback only applies to projects that have NOT done so
// yet, and gives them a single default application built from their real admin
// modules. The default descriptor lives here (one place), never scattered.

import { PROJECTS } from "@/projects";
import { workspaceRegistry } from "./registry";
import { titleize } from "./slug";

// The ONLY default application descriptor, used solely when a project hasn't
// declared its own applications. Every module in the admin app is, by
// definition, part of its admin application — so this is a fact, not an
// assumption about what applications a project has.
export const FALLBACK_APPLICATION = { id: "admin-panel", label: "Admin Panel" };

export function registerFallbackProjects() {
  for (const [projectId, project] of Object.entries(PROJECTS || {})) {
    if (workspaceRegistry.hasProject(projectId)) continue; // explicit registration wins

    const moduleKeys = Object.keys(project?.modules || {});
    const modules = {};
    for (const key of moduleKeys) {
      const cfg = project.modules[key] || {};
      modules[key] = { label: cfg.label || titleize(key) };
    }

    workspaceRegistry.registerProject({
      id: projectId,
      name: project?.name || titleize(projectId),
      applications: {
        [FALLBACK_APPLICATION.id]: {
          label: FALLBACK_APPLICATION.label,
          default: true,
          modules,
        },
      },
    });
  }
}

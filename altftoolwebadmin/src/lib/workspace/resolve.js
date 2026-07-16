// Workspace Metadata Resolver.
//
// Resolves an activity's place in the hierarchy using a STRICT priority chain:
//   1. Explicit metadata  — caller passed { project, application, module, … }
//   2. Registry lookup    — a bare module key that is UNIQUE across the workspace
//   3. Route resolver     — a known admin route (/<project>/<module>/…)
//   4. URL fallback        — window.location (BACKWARD-COMPAT ONLY, client)
//
// The result is always denormalized (labels from the registry where known,
// titleized from the slug otherwise) and never loses data — an unresolvable
// input yields the `unclassified` node instead of being dropped.

import { titleize, joinPath } from "./slug";
import { workspaceRegistry } from "./registry";
import { ensureWorkspaceBootstrapped } from "./bootstrap";
import { resolveProjectModule } from "@/config/adminRoutes";

export const UNCLASSIFIED_PROJECT = "unclassified";

// Find a module node under a project by key, preferring the default application
// (admin routes live in the project's default/admin application).
function findModuleNode(projectId, moduleKey) {
  if (!projectId || !moduleKey) return null;
  const apps = workspaceRegistry.getChildren(projectId); // application nodes
  const ordered = [...apps].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  for (const app of ordered) {
    const node = workspaceRegistry.getNode(`${projectId}/${app.id}/${moduleKey}`);
    if (node) return node;
  }
  return null;
}

// Build a full, denormalized resolution result from resolved parts.
function assemble(source, parts) {
  ensureWorkspaceBootstrapped();
  const projectId = parts.projectId || null;
  let application = parts.application || null;
  const moduleKey = parts.moduleKey || null;
  const section = parts.section || null;
  const feature = parts.feature || null;

  const project = projectId ? workspaceRegistry.getProject(projectId) : null;

  // Resolve the module node (drives application inference when app not given).
  let moduleNode = null;
  if (projectId && moduleKey) {
    moduleNode = application
      ? workspaceRegistry.getNode(`${projectId}/${application}/${moduleKey}`)
      : findModuleNode(projectId, moduleKey);
    if (moduleNode && !application) application = moduleNode.applicationId;
  }

  // Application: explicit → module's app → project default → first app → null.
  let appNode = application ? workspaceRegistry.getNode(`${projectId}/${application}`) : null;
  if (!application && project) {
    const apps = workspaceRegistry.getChildren(projectId);
    const defApp = apps.find((a) => a.isDefault) || apps[0] || null;
    if (defApp) { application = defApp.id; appNode = defApp; }
  }

  const sectionPath = section && projectId && application && moduleKey
    ? `${projectId}/${application}/${moduleKey}/${section}` : null;
  const sectionNode = sectionPath ? workspaceRegistry.getNode(sectionPath) : null;
  const featurePath = feature && sectionPath ? `${sectionPath}/${feature}` : null;
  const featureNode = featurePath ? workspaceRegistry.getNode(featurePath) : null;

  const deepest = featureNode || sectionNode || moduleNode || appNode || project || null;

  // A section/feature cannot exist without its module. If moduleKey is absent,
  // do NOT let a section slug slide up into the module slot of the path (that
  // would make "project/app/drafts" look like a module named "drafts" and
  // disagree with nodePath). Only append section/feature when their parent
  // level is actually present.
  const pathParts = [projectId, application, moduleKey];
  if (moduleKey && section) {
    pathParts.push(section);
    if (feature) pathParts.push(feature);
  }

  return {
    resolved: Boolean(projectId),
    source,
    workspace: workspaceRegistry.workspace.id,
    projectId: projectId || UNCLASSIFIED_PROJECT,
    projectName: project?.label || (projectId ? titleize(projectId) : "Unclassified"),
    application: application || null,
    applicationName: appNode?.label || (application ? titleize(application) : null),
    moduleKey: moduleKey || null,
    moduleName: moduleNode?.label || (moduleKey ? titleize(moduleKey) : null),
    section: section || null,
    sectionName: sectionNode?.label || (section ? titleize(section) : null),
    feature: feature || null,
    featureName: featureNode?.label || (feature ? titleize(feature) : null),
    hierarchyPath: joinPath(...pathParts) || UNCLASSIFIED_PROJECT,
    nodePath: deepest?.hierarchyPath || null,
  };
}

// Parse an admin route (/<project>/<module>/…) into { projectId, moduleKey }.
// Uses the canonical route→module resolver so routeSegment aliases
// (e.g. consumer-rating → consumerrating) are honored.
function parseRoute(route) {
  if (!route || typeof route !== "string") return null;
  const segs = route.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (!segs.length) return null;
  const projectId = segs[0];
  ensureWorkspaceBootstrapped();
  if (!workspaceRegistry.hasProject(projectId)) return null;
  let moduleKey = segs[1] || null;
  if (moduleKey) {
    try {
      const rm = resolveProjectModule(projectId, moduleKey);
      if (rm?.moduleKey) moduleKey = rm.moduleKey;
    } catch { /* keep raw segment */ }
  }
  return { projectId, moduleKey };
}

/**
 * Resolve an input to a workspace node via the priority chain.
 * @param {{project?:string, projectId?:string, application?:string, module?:string,
 *          moduleKey?:string, section?:string, feature?:string, route?:string}} input
 */
export function resolveWorkspaceNode(input = {}) {
  ensureWorkspaceBootstrapped();
  // A default parameter only fills in for `undefined`, not `null`. Guard here so
  // a caller forwarding a nullable value (e.g. event.workspace) can never crash
  // the resolver — this module must never throw and never drop an activity.
  if (input == null) input = {};
  const section = input.section || null;
  const feature = input.feature || null;

  // 1. Explicit metadata
  const explicitProject = input.projectId || input.project;
  if (explicitProject) {
    return assemble("explicit", {
      projectId: explicitProject,
      application: input.application || null,
      moduleKey: input.moduleKey || input.module || null,
      section, feature,
    });
  }

  // 2. Registry lookup — a bare module key unique across the whole workspace.
  // Count EVERY matching module node (across all projects AND applications), so
  // the same module under two applications of one project is treated as
  // genuinely ambiguous and falls through — never silently guessed.
  const bareModule = input.moduleKey || input.module;
  if (bareModule) {
    const matches = workspaceRegistry.findModuleNodes(bareModule);
    if (matches.length === 1) {
      const m = matches[0];
      return assemble("registry", {
        projectId: m.projectId, application: m.applicationId, moduleKey: m.moduleKey, section, feature,
      });
    }
    // ambiguous (same module in many projects/apps) or none → fall through
  }

  // 3. Route resolver
  const routed = parseRoute(input.route);
  if (routed) return assemble("route", { ...routed, section, feature });

  // 4. URL fallback (client only, backward-compat)
  if (typeof window !== "undefined" && window.location?.pathname) {
    const urlRouted = parseRoute(window.location.pathname);
    if (urlRouted) return assemble("url", { ...urlRouted, section, feature });
  }

  // Nothing resolved — never drop the activity.
  return assemble("unclassified", { projectId: null });
}

// Workspace Registry — the single source of truth for the platform hierarchy
// Workspace → Project → Application → Module → Section → Feature.
//
// Design principles honored here:
//  - Applications are FULLY DYNAMIC. The core hardcodes NO application name;
//    every application comes from a project's own registration.
//  - Registration is additive and idempotent (re-registering a project replaces it).
//  - Everything is addressable by a stable `hierarchyPath`.
//  - Read-only queries return plain, serializable data (safe for APIs).
//
// This module is consumer-agnostic: Audit, Analytics, Permissions, etc. all read
// from the same registry. Phase 1 only builds the registry — no consumer wiring.

import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_LABEL } from "./types";
import { joinPath, titleize } from "./slug";
import { toEntryArray, validateProjectDef } from "./validate";

function normalizeFeature(feat, parentPath, projectId, applicationId, moduleKey, section) {
  const id = feat.key;
  const hierarchyPath = joinPath(parentPath, id);
  return {
    level: "feature",
    id,
    label: feat.label || titleize(id),
    hierarchyPath,
    parentPath,
    projectId,
    applicationId,
    moduleKey,
    section,
    feature: id,
    childPaths: [],
    meta: feat.meta || {},
  };
}

function normalizeSection(sec, parentPath, projectId, applicationId, moduleKey, sink) {
  const id = sec.key;
  const hierarchyPath = joinPath(parentPath, id);
  const node = {
    level: "section",
    id,
    label: sec.label || titleize(id),
    hierarchyPath,
    parentPath,
    projectId,
    applicationId,
    moduleKey,
    section: id,
    feature: null,
    childPaths: [],
    meta: sec.meta || {},
  };
  for (const feat of toEntryArray(sec.features, "key")) {
    const child = normalizeFeature(feat, hierarchyPath, projectId, applicationId, moduleKey, id);
    node.childPaths.push(child.hierarchyPath);
    sink.set(child.hierarchyPath, child);
  }
  return node;
}

function normalizeModule(mod, parentPath, projectId, applicationId, sink) {
  const key = mod.key;
  const hierarchyPath = joinPath(parentPath, key);
  const node = {
    level: "module",
    id: key,
    label: mod.label || titleize(key),
    hierarchyPath,
    parentPath,
    projectId,
    applicationId,
    moduleKey: key,
    section: null,
    feature: null,
    childPaths: [],
    meta: mod.meta || {},
  };
  for (const sec of toEntryArray(mod.sections, "key")) {
    const child = normalizeSection(sec, hierarchyPath, projectId, applicationId, key, sink);
    node.childPaths.push(child.hierarchyPath);
    sink.set(child.hierarchyPath, child);
  }
  return node;
}

function normalizeApplication(app, parentPath, projectId, sink) {
  const id = app.id;
  const hierarchyPath = joinPath(parentPath, id);
  const node = {
    level: "application",
    id,
    label: app.label || titleize(id),
    hierarchyPath,
    parentPath,
    projectId,
    applicationId: id,
    moduleKey: null,
    section: null,
    feature: null,
    isDefault: Boolean(app.default),
    childPaths: [],
    meta: app.meta || {},
  };
  for (const mod of toEntryArray(app.modules, "key")) {
    const child = normalizeModule(mod, hierarchyPath, projectId, id, sink);
    node.childPaths.push(child.hierarchyPath);
    sink.set(child.hierarchyPath, child);
  }
  return node;
}

export class WorkspaceRegistry {
  constructor(workspace = { id: DEFAULT_WORKSPACE_ID, label: DEFAULT_WORKSPACE_LABEL }) {
    this.workspace = workspace;
    /** @type {Map<string, object>} projectId → project node */
    this._projects = new Map();
    /** @type {Map<string, object>} hierarchyPath → node (all levels below project) */
    this._nodes = new Map();
    /** @type {{projectId:string, errors:string[], warnings:string[]}[]} */
    this._issues = [];
  }

  /**
   * Register (or replace) a project. Returns the validation result. Never throws
   * on a bad registration — it records issues and skips, so one malformed project
   * can't take down the whole registry at import time.
   * @param {import("./types").ProjectDef} def
   */
  registerProject(def) {
    const result = validateProjectDef(def);
    if (!result.valid) {
      this._issues.push({ projectId: def?.id ?? "(unknown)", ...result });
      return result;
    }
    if (result.warnings.length) {
      this._issues.push({ projectId: def.id, errors: [], warnings: result.warnings });
    }

    // Remove any previous registration of this project (idempotent replace).
    this._removeProject(def.id);

    const projectPath = def.id;
    const projectNode = {
      level: "project",
      id: def.id,
      label: def.name || titleize(def.id),
      hierarchyPath: projectPath,
      parentPath: null,
      projectId: def.id,
      applicationId: null,
      moduleKey: null,
      section: null,
      feature: null,
      childPaths: [],
      meta: def.meta || {},
    };

    for (const app of toEntryArray(def.applications, "id")) {
      const child = normalizeApplication(app, projectPath, def.id, this._nodes);
      projectNode.childPaths.push(child.hierarchyPath);
      this._nodes.set(child.hierarchyPath, child);
    }

    this._projects.set(def.id, projectNode);
    return result;
  }

  _removeProject(projectId) {
    if (!this._projects.has(projectId)) return;
    for (const path of [...this._nodes.keys()]) {
      if (path === projectId || path.startsWith(projectId + "/")) this._nodes.delete(path);
    }
    this._projects.delete(projectId);
    // Drop this project's previously-recorded diagnostics too, so an idempotent
    // re-registration doesn't leave stale errors or duplicate warnings behind.
    this._issues = this._issues.filter((issue) => issue.projectId !== projectId);
  }

  /**
   * Every MODULE-level node whose key matches `moduleKey`, across all projects
   * AND all applications. The resolver uses this to detect genuine ambiguity:
   * the same module under two applications yields two matches, so a bare module
   * name is only resolved when there is exactly one match anywhere.
   */
  findModuleNodes(moduleKey) {
    if (!moduleKey) return [];
    const out = [];
    for (const node of this._nodes.values()) {
      if (node.level === "module" && (node.moduleKey === moduleKey || node.id === moduleKey)) {
        out.push(node);
      }
    }
    return out;
  }

  hasProject(projectId) {
    return this._projects.has(projectId);
  }

  /** @returns {object[]} project nodes in registration order */
  listProjects() {
    return [...this._projects.values()];
  }

  getProject(projectId) {
    return this._projects.get(projectId) || null;
  }

  /** Any node by hierarchyPath (project path returns the project node). */
  getNode(hierarchyPath) {
    if (!hierarchyPath) return null;
    if (this._projects.has(hierarchyPath)) return this._projects.get(hierarchyPath);
    return this._nodes.get(hierarchyPath) || null;
  }

  /** Direct children of a node (or top-level projects when path is empty). */
  getChildren(hierarchyPath) {
    if (!hierarchyPath) return this.listProjects();
    const node = this.getNode(hierarchyPath);
    if (!node) return [];
    return node.childPaths.map((p) => this.getNode(p)).filter(Boolean);
  }

  /** Ancestors from project → …→ the node's parent (inclusive of the node). */
  getAncestry(hierarchyPath) {
    const segments = String(hierarchyPath || "").split("/").filter(Boolean);
    const chain = [];
    let acc = "";
    for (const seg of segments) {
      acc = acc ? `${acc}/${seg}` : seg;
      const node = this.getNode(acc);
      if (node) chain.push(node);
    }
    return chain;
  }

  /** Nested tree (each node includes a `children` array). Optional root path. */
  tree(rootPath = "") {
    const build = (node) => ({
      level: node.level,
      id: node.id,
      label: node.label,
      hierarchyPath: node.hierarchyPath,
      ...(node.isDefault ? { isDefault: true } : {}),
      children: node.childPaths.map((p) => build(this.getNode(p))).filter(Boolean),
    });
    if (rootPath) {
      const root = this.getNode(rootPath);
      return root ? build(root) : null;
    }
    return {
      level: "workspace",
      id: this.workspace.id,
      label: this.workspace.label,
      hierarchyPath: "",
      children: this.listProjects().map(build),
    };
  }

  /** Registration issues collected during discovery (for the validation API/logs). */
  getIssues() {
    return this._issues;
  }

  /** Counts for quick diagnostics. */
  stats() {
    let applications = 0, modules = 0, sections = 0, features = 0;
    for (const node of this._nodes.values()) {
      if (node.level === "application") applications++;
      else if (node.level === "module") modules++;
      else if (node.level === "section") sections++;
      else if (node.level === "feature") features++;
    }
    return { projects: this._projects.size, applications, modules, sections, features };
  }

  reset() {
    this._projects.clear();
    this._nodes.clear();
    this._issues = [];
  }
}

// Platform-wide singleton. Consumers import THIS.
export const workspaceRegistry = new WorkspaceRegistry();

export function registerProject(def) {
  return workspaceRegistry.registerProject(def);
}

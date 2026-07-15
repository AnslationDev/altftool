// Workspace Registry — public entry point (bootstrap + API surface).
//
// Importing this module guarantees the registry is fully populated:
//   1. every project's own *.workspace.js has self-registered (generated manifest)
//   2. any project without one is auto-registered from @/projects (fallback)
//
// Consumers (Audit, Analytics, Permissions, …) import from here.

import { ensureWorkspaceBootstrapped } from "./bootstrap";

// Bootstrap eagerly on first import so consumers get a ready registry.
ensureWorkspaceBootstrapped();

export { ensureWorkspaceBootstrapped } from "./bootstrap";

export { workspaceRegistry } from "./registry";
export { WorkspaceRegistry, registerProject } from "./registry";
export { FALLBACK_APPLICATION } from "./fallback";
export { WORKSPACE_LEVELS, DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_LABEL } from "./types";

// Convenience re-exports of the read API bound to the singleton.
export const getWorkspaceTree = (rootPath = "") => ensureWorkspaceBootstrapped().tree(rootPath);
export const listWorkspaceProjects = () => ensureWorkspaceBootstrapped().listProjects();
export const getWorkspaceNode = (hierarchyPath) => ensureWorkspaceBootstrapped().getNode(hierarchyPath);
export const getWorkspaceChildren = (hierarchyPath) => ensureWorkspaceBootstrapped().getChildren(hierarchyPath);
export const getWorkspaceAncestry = (hierarchyPath) => ensureWorkspaceBootstrapped().getAncestry(hierarchyPath);
export const getWorkspaceStats = () => ensureWorkspaceBootstrapped().stats();
export const getWorkspaceIssues = () => ensureWorkspaceBootstrapped().getIssues();

// Phase 2 — metadata resolver + context builder.
export { resolveWorkspaceNode, UNCLASSIFIED_PROJECT } from "./resolve";
export { buildWorkspaceContext } from "./context";

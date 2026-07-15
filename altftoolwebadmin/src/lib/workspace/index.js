// Workspace Registry — public entry point (bootstrap + API surface).
//
// Importing this module guarantees the registry is fully populated:
//   1. every project's own *.workspace.js has self-registered (generated manifest)
//   2. any project without one is auto-registered from @/projects (fallback)
//
// Consumers (Audit, Analytics, Permissions, …) import from here.

import { workspaceRegistry } from "./registry";
import { registerFallbackProjects } from "./fallback";
import "./registrations.generated"; // side-effect: explicit self-registrations

let bootstrapped = false;

// Idempotent: safe to call from anywhere; only does work once per process.
export function ensureWorkspaceBootstrapped() {
  if (bootstrapped) return workspaceRegistry;
  registerFallbackProjects();
  bootstrapped = true;
  return workspaceRegistry;
}

// Bootstrap eagerly on first import so consumers get a ready registry.
ensureWorkspaceBootstrapped();

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

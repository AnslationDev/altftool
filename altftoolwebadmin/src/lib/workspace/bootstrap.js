// Workspace bootstrap — populates the registry exactly once.
//   1. every project's own *.workspace.js self-registers (generated manifest)
//   2. any project without one is auto-registered from @/projects (fallback)
// Kept separate from index.js so both index and resolve can depend on it without
// an import cycle.

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

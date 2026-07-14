// altftoolwebadmin/src/lib/seoAuth.js
//
// ALTF Engine — per-project authorization for the SEO control-plane.
//
// STRICT ISOLATION: the SEO Engine is one shared codebase serving every
// project, but its data and access are 100% project-scoped. Every SEO API route
// must authorize the caller against the ACTIVE project (the ?project= context),
// using the exact same RBAC check the frontend uses (hasModuleAccess). An admin
// with access to project A can never read or write project B's SEO data — even
// by hand-crafting a request with a different ?project= value — because the
// server re-derives the project and re-checks module access here.

import { NextResponse } from "next/server";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import {
  DEFAULT_SEO_PROJECT,
  resolveSeoProjectId,
  seoProjectFromRequest,
} from "@/lib/seoProject";

export const SEO_MODULE_KEY = "seo";

export class SeoAccessError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "SeoAccessError";
    this.status = status;
    this.publicMessage = message;
  }
}

// Verify the caller is an active admin, resolve the active project, and confirm
// the caller has the requested SEO action on THAT project. Returns the verified
// admin profile + the resolved projectId. Throws SeoAccessError (401/403).
//
// opts.forceProject pins the project (used for altftool-global surfaces such as
// Google Search Console, whose single connection must only be reachable by
// admins with altftool SEO access — never by another project's admin).
export async function authorizeSeoRequest(request, action = "read", opts = {}) {
  let admin;
  try {
    ({ admin } = await verifyActiveAdmin(request));
  } catch (error) {
    const message = String(error?.message || "Unauthorized");
    const status = /forbidden|inactive/i.test(message) ? 403 : 401;
    throw new SeoAccessError(status, status === 403 ? "Forbidden" : "Unauthorized");
  }

  const projectId = opts.forceProject
    ? resolveSeoProjectId(opts.forceProject)
    : seoProjectFromRequest(request);

  const allowed = hasModuleAccess({
    adminData: admin,
    projectId,
    moduleKey: SEO_MODULE_KEY,
    action,
  });
  if (!allowed) {
    throw new SeoAccessError(403, "Forbidden");
  }

  return { admin, projectId };
}

// Map any thrown error to a safe JSON response for SEO routes.
export function seoAccessErrorResponse(error) {
  if (error instanceof SeoAccessError) {
    return NextResponse.json({ error: error.publicMessage }, { status: error.status });
  }
  const message = String(error?.message || "Unauthorized");
  const status = /forbidden|inactive/i.test(message) ? 403 : 401;
  return NextResponse.json(
    { error: status === 403 ? "Forbidden" : "Unauthorized" },
    { status },
  );
}

export { DEFAULT_SEO_PROJECT };

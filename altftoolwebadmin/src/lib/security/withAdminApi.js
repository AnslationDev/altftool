/**
 * Centralized admin API wrapper: rate limit → auth (RBAC) → security context →
 * handler → automatic audit logging. Use for every admin/security route so
 * auditing + access control are consistent and not re-implemented per route.
 *
 *   export const POST = withAdminApi(handler, {
 *     requireSuperAdmin: true,
 *     rateLimit: { limit: 20, windowMs: 60_000, scope: "security:settings" },
 *     audit: { action: "security.settings.update", module: "security" },
 *     mutating: true,
 *   });
 *
 * The handler receives ({ request, params, principal, ctx, audit }) and returns
 * a Response. `audit(details)` logs with actor + security context pre-filled.
 */
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { buildSecurityContext } from "./store";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// verifyActiveAdmin/verifySuperAdminRequest throw distinct errors for distinct
// situations — a missing/invalid token ("Unauthorized" or a Firebase `auth/*`
// code) is genuinely 401, but "Forbidden" (no admin doc) and "Inactive admin"
// are 403s, and anything else (a Firestore/Auth infra fault) is a 500. This
// previously collapsed all three into a flat 401 across every route wrapped
// by withAdminApi (security/audit, security/events, security/session/*,
// security/sessions*, security/settings, security/consent, ...).
function classifyAuthError(err) {
  if (err?.message === "Forbidden" || err?.message === "Inactive admin") return 403;
  if (err?.message === "Unauthorized") return 401;
  const code = err?.code || err?.errorInfo?.code || "";
  if (typeof code === "string" && code.startsWith("auth/")) return 401;
  return 500;
}

export function withAdminApi(handler, options = {}) {
  const {
    requireSuperAdmin = false,
    // Enforce project-scoped RBAC: { project, moduleKey, action } — the caller
    // must have that action on that project's module (superadmin bypasses). Used
    // to lock project-scoped surfaces (e.g. GSC → altftool SEO) so one project's
    // admin can never reach another project's data via a direct API call.
    requireProjectModule = null,
    rateLimit = null,
    audit = null,
    mutating = undefined,
  } = options;

  return async function wrapped(request, routeCtx = {}) {
    // 1. Rate limit
    if (rateLimit) {
      const limited = enforceRateLimit(NextResponse, request, rateLimit);
      if (limited) return limited;
    }

    // 2. Auth + RBAC
    let principal;
    try {
      if (requireSuperAdmin) {
        const decoded = await verifySuperAdminRequest(request);
        principal = { uid: decoded.uid, email: decoded.email ?? null, superAdmin: true, decoded };
      } else {
        const { decoded, admin } = await verifyActiveAdmin(request);
        principal = {
          uid: decoded.uid,
          email: decoded.email ?? admin?.email ?? null,
          superAdmin: admin?.roleType === "superadmin" || admin?.isSuperAdmin === true,
          admin,
          decoded,
        };
        // Project-scoped RBAC gate (superadmin bypasses inside hasModuleAccess).
        if (
          requireProjectModule &&
          !hasModuleAccess({
            adminData: admin,
            projectId: requireProjectModule.project,
            moduleKey: requireProjectModule.moduleKey,
            action: requireProjectModule.action || "read",
          })
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    } catch (err) {
      const status = classifyAuthError(err);
      if (status === 500) console.error("withAdminApi auth error", err);
      return NextResponse.json(
        { error: status === 403 ? "Forbidden" : status === 401 ? "Unauthorized" : "Internal error" },
        { status },
      );
    }

    // 3. Security context
    const ctx = buildSecurityContext(request, { uid: principal.uid });

    const isMutating = mutating ?? MUTATING.has(request.method);
    const auditFn = async (details = {}) => {
      try {
        await writeAdminAuditLog({
          action: details.action || audit?.action || `${request.method.toLowerCase()}.${audit?.module || "admin"}`,
          module: details.module || audit?.module || "admin",
          actorUid: principal.uid,
          actorEmail: principal.email,
          targetUid: details.targetUid ?? null,
          targetEmail: details.targetEmail ?? null,
          status: details.status || "success",
          summary: details.summary ?? null,
          changes: details.changes ?? null,
          metadata: details.metadata ?? null,
          sessionId: details.sessionId ?? null,
          context: ctx,
        });
      } catch (err) {
        console.error("withAdminApi audit failed", err);
      }
    };

    // 4. Handler
    let response;
    try {
      response = await handler({ request, params: routeCtx?.params, principal, ctx, audit: auditFn });
    } catch (err) {
      console.error("withAdminApi handler error", err);
      await auditFn({ status: "error", summary: err?.message || "handler error" }).catch(() => {});
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    // 5. Automatic audit on successful mutations (if an action is configured)
    if (audit?.action && isMutating) {
      const ok = !response || (response.status ?? 200) < 400;
      if (ok && !response?.__auditedManually) {
        await auditFn({ status: "success" });
      }
    }

    return response ?? NextResponse.json({ ok: true });
  };
}

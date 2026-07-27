import { createLocalDevAdminActor, isLocalDevAdminRequest } from "@/lib/adminAccess";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";

export const PROJECT_ID = "anternet";

/**
 * Collections the Anternet admin UI writes, mapped to the module(s) that own
 * them (see src/projects/anternet/config.js + lib/schemas.js). Anything not
 * listed here is rejected, which also guarantees `collection` is a single path
 * segment — a crafted value can never reach a nested sub-collection or another
 * project's data.
 *
 * Shared by BOTH /api/anternet/save and /api/anternet/delete. Keeping one copy
 * is the point: while the list lived only in the save route, delete had no
 * whitelist at all and accepted an arbitrary collection segment.
 */
export const COLLECTION_OWNERS = {
  banners: ["banners"],
  tasks: ["tasks"],
  quizcategories: ["quizcategories"],
  questions: ["questions"],
  spinprizes: ["spinprizes"],
  videosections: ["videosections"],
  earningtasks: ["earningtasks"],
  ads: ["ads"],
  notifications: ["notifications"],
  pages: ["pages"],
  winners: ["winners"],
  quickearn: ["quickearn"],
  explorecards: ["explorecards"],
  homecategories: ["homecategories"],
  bonusladdertiers: ["bonusladdertiers"],
  trendingtasks: ["homepage"],
  wallet_earnmore: ["walletpage"],
  // Featured Arenas are editable from the Arenas module and from the Kho Kho tabs.
  arenas: ["arenas", "khokho"],
  khokho_rules: ["khokho"],
  khokho_categories: ["khokho"],
  khokho_questions: ["khokho"],
  khokho_banners: ["khokho"],
  khokho_livesessions: ["khokho"],
  khokho_livequestions: ["khokho"],
  settings: ["settings"],
};

/**
 * `settings` is a single collection shared by several screens: the Settings
 * module lists every doc, while some docs are also edited from the module that
 * owns that screen (Kho Kho tabs, Wallet Page). Extra owners per doc id.
 */
export const SETTINGS_DOC_OWNERS = {
  khokho_splash: ["khokho"],
  khokho_home: ["khokho"],
  khokho_rewards: ["khokho"],
  khokho_leaderboard: ["khokho"],
  khokho_settings: ["khokho"],
  wallet: ["walletpage"],
};

// The Seed Migration module bulk-writes every collection above, so a write
// grant on it authorizes any whitelisted target.
export const BULK_WRITE_MODULE = "migration";

export function ownersFor(colName, id) {
  const owners = COLLECTION_OWNERS[colName];
  if (!owners) return null;
  if (colName === "settings") return [...owners, ...(SETTINGS_DOC_OWNERS[id] || [])];
  return owners;
}

// Firestore document-id constraints (no "/", not "."/"..", not __reserved__),
// enforced here so an id from the request body can never change the target path.
export function isValidDocId(id) {
  if (typeof id !== "string") return false;
  if (!id.trim() || id.length > 1500) return false;
  if (id.includes("/")) return false;
  if (id === "." || id === "..") return false;
  if (/^__.*__$/.test(id)) return false;
  return true;
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Identity only — resolves the caller against the RBAC store first and the
 * legacy `admins` collection second (verifyActiveAdmin handles both), so
 * RBAC-era admins are not locked out. The no-token path is the local-dev
 * shortcut, which requires BOTH a development build and the well-known
 * LOCAL_ADMIN_TOKEN bearer (lib/adminAccess.js) — a bare unauthenticated
 * request is never accepted, not even on a dev server.
 */
export async function authenticate(request) {
  if (isLocalDevAdminRequest(request)) {
    const local = createLocalDevAdminActor();
    return { ok: true, uid: local.uid, email: local.email, admin: null, isLocalAdmin: true };
  }

  try {
    const { decoded, admin } = await verifyActiveAdmin(request);
    return {
      ok: true,
      uid: decoded.uid,
      email: decoded.email || admin?.email || "panel",
      admin,
      isLocalAdmin: false,
    };
  } catch {
    return { ok: false };
  }
}

/** Project-scoped RBAC: superadmin bypasses inside hasModuleAccess. */
export function hasAnyModuleAccess(actor, moduleKeys, action) {
  return moduleKeys.some((moduleKey) =>
    hasModuleAccess({
      adminData: actor.admin,
      projectId: PROJECT_ID,
      moduleKey,
      action,
    }),
  );
}

export function canWrite(actor, moduleKeys) {
  if (actor.isLocalAdmin) return true;
  return hasAnyModuleAccess(actor, [...moduleKeys, BULK_WRITE_MODULE], "write");
}

/** Deleting content requires the same grant as writing it. */
export function canDelete(actor, moduleKeys) {
  return canWrite(actor, moduleKeys);
}

/**
 * The sidebar and AdminLayout gate module visibility on `read`, so an admin
 * with a read-only grant still sees the Add/Edit/Save controls. Telling them
 * the grant is read-only turns a generic "Not authorized" dead end into an
 * actionable message. This only ever describes the caller's own grant, so it
 * leaks nothing.
 */
export function isReadOnly(actor, moduleKeys) {
  if (actor.isLocalAdmin) return false;
  return hasAnyModuleAccess(actor, moduleKeys, "read");
}

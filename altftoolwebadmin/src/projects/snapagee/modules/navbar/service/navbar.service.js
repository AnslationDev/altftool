import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Navbar module data layer.
 *
 * Collection `projects/snapagee/navbarPrimary` ONLY. See CONTRACT.md.
 *
 * Differences vs the TheStyleLife template:
 *   - no navbar-level settings doc — Snapagee has no separate navbar CTA;
 *     the Header/mobile-drawer CTA button reads `site.ctaPrimaryLabel`
 *     directly from the site-settings module
 *   - primary links carry a `megaMenu` boolean — controls whether a
 *     dropdown chevron/panel opens under that item (the panel content
 *     itself is always derived from the `services` module)
 */

const PROJECT_ID = "snapagee";
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

/* ------------------------------- normalize ------------------------------- */

function normalize(payload = {}) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    megaMenu: Boolean(payload.megaMenu),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- service --------------------------------- */

const primaryService = createCollectionCrudService(PRIMARY_PATH, { normalize });

export const subscribeNavItems = primaryService.subscribe;
export const createNavItem = primaryService.create;
export const updateNavItem = primaryService.update;
export const deleteNavItem = primaryService.remove;
export const toggleNavItemStatus = primaryService.toggleActive;

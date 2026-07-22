import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const NAV_ITEMS_PATH = ["projects", PROJECT_ID, "navItems"];

function normalizeNavItem(payload = {}) {
  return {
    href: String(payload.href || "").trim(),
    label: String(payload.label || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const navItemsService = createCollectionCrudService(NAV_ITEMS_PATH, {
  normalize: normalizeNavItem,
  orderByField: "order",
});

export const subscribeNavItems = navItemsService.subscribe;
export const createNavItem = navItemsService.create;
export const updateNavItem = navItemsService.update;
export const deleteNavItem = navItemsService.remove;
export const toggleNavItemStatus = navItemsService.toggleActive;

import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

/**
 * Destinations offered by the floating AltFTool launcher inside Business Ops.
 *
 * Hrefs come from the site's own route registry rather than being hardcoded,
 * so they can never drift from the main navigation. Only {label, href} is kept
 * — `match` and icon references are dropped because this data is passed into a
 * client component.
 */

const pick = ({ label, href }, overrides = {}) => ({
  label,
  href,
  ...overrides,
});

export const ALTF_LAUNCHER_LINKS = [
  pick(SITE_ROUTES.home, { label: "AltFTool home", icon: "home" }),
  pick(SITE_ROUTES.tools, { icon: "tools" }),
  pick(SITE_ROUTES.extensions, { icon: "extensions" }),
  pick(SITE_ROUTES.exclusiveDeals, { label: "Deals", icon: "deals" }),
];

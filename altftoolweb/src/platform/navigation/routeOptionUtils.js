import { canonicalizePublicPath } from "./publicRouteTaxonomy.js";

export function canonicalRouteOption(option) {
  const href = canonicalizePublicPath(option.href);
  if (href === option.href) return option;

  return {
    ...option,
    href,
    match: [...new Set([...(option.match || []), option.href])],
  };
}

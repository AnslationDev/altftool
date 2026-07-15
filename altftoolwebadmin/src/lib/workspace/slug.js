// Slug + label helpers for the Workspace Registry.
// A slug is the stable identifier used in a hierarchyPath segment. It must never
// contain "/" (the path separator) and is lower-kebab by convention.

export function isValidSlug(value) {
  return typeof value === "string" && value.length > 0 && !value.includes("/") && value.trim() === value;
}

// Normalize an arbitrary key into a safe slug (lower-kebab, no slashes/spaces).
export function toSlug(value) {
  return String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// Human label from a slug/key when none is provided.
export function titleize(value) {
  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Join path segments into a hierarchyPath, skipping empties.
export function joinPath(...segments) {
  return segments.filter((s) => s != null && s !== "").join("/");
}

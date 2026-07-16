// Workspace Registry — validation.
//
// Validates a project registration BEFORE it is normalized into the registry.
// Returns a structured result; the registry decides whether to warn or throw.
// Applications are dynamic, so validation checks structure/uniqueness only —
// it never checks against a fixed list of application names.

import { isValidSlug } from "./slug";

// Coerce an array-or-keyed-object collection into an array of entries that each
// carry their id/key, so authors can write EITHER form.
export function toEntryArray(collection, idField) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection.filter(Boolean);
  return Object.entries(collection).map(([k, v]) => ({ [idField]: v?.[idField] ?? k, ...v }));
}

/**
 * @param {import("./types").ProjectDef} def
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateProjectDef(def) {
  const errors = [];
  const warnings = [];

  if (!def || typeof def !== "object") {
    return { valid: false, errors: ["Project registration must be an object"], warnings };
  }
  if (!isValidSlug(def.id)) {
    errors.push(`Project id must be a slug with no "/": got ${JSON.stringify(def.id)}`);
  }
  if (def.name != null && typeof def.name !== "string") {
    warnings.push(`Project ${def.id}: name should be a string`);
  }

  const apps = toEntryArray(def.applications, "id");
  if (apps.length === 0) {
    // Dynamic-first: a project MAY register with no applications yet, but flag it
    // so it doesn't silently disappear from the explorer.
    warnings.push(`Project ${def.id}: no applications defined`);
  }

  const seenApp = new Set();
  for (const app of apps) {
    if (!isValidSlug(app.id)) {
      errors.push(`Project ${def.id}: application id must be a slug: ${JSON.stringify(app.id)}`);
      continue;
    }
    if (seenApp.has(app.id)) errors.push(`Project ${def.id}: duplicate application "${app.id}"`);
    seenApp.add(app.id);

    const modules = toEntryArray(app.modules, "key");
    const seenMod = new Set();
    for (const mod of modules) {
      if (!isValidSlug(mod.key)) {
        errors.push(`Project ${def.id}/${app.id}: module key must be a slug: ${JSON.stringify(mod.key)}`);
        continue;
      }
      if (seenMod.has(mod.key)) errors.push(`Project ${def.id}/${app.id}: duplicate module "${mod.key}"`);
      seenMod.add(mod.key);

      const sections = toEntryArray(mod.sections, "key");
      const seenSec = new Set();
      for (const sec of sections) {
        if (!isValidSlug(sec.key)) {
          errors.push(`Project ${def.id}/${app.id}/${mod.key}: section key must be a slug: ${JSON.stringify(sec.key)}`);
          continue;
        }
        if (seenSec.has(sec.key)) errors.push(`Project ${def.id}/${app.id}/${mod.key}: duplicate section "${sec.key}"`);
        seenSec.add(sec.key);

        const features = toEntryArray(sec.features, "key");
        const seenFeat = new Set();
        for (const feat of features) {
          if (!isValidSlug(feat.key)) {
            errors.push(`Project ${def.id}/${app.id}/${mod.key}/${sec.key}: feature key must be a slug: ${JSON.stringify(feat.key)}`);
            continue;
          }
          if (seenFeat.has(feat.key)) errors.push(`…/${sec.key}: duplicate feature "${feat.key}"`);
          seenFeat.add(feat.key);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

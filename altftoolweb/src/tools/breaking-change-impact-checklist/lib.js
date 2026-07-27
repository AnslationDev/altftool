/**
 * Breaking-change consumer impact checklist and risk model.
 *
 * Grounding rules:
 *  - SemVer 2.0.0 item 8: any backwards-incompatible change to the public API
 *    requires a MAJOR version bump (item 4 relaxes this for 0.x packages).
 *  - Deprecate-before-remove is the standard API evolution practice (SemVer
 *    item 7 makes deprecation itself at least a MINOR release; e.g. the Google
 *    API deprecation policies and Node.js deprecation lifecycle both stage
 *    warn -> disable -> remove).
 *  - The risk weights below are this tool's own editorial model, exposed as
 *    named constants so the scoring is transparent and reproducible.
 */

export const CHANGE_TYPES = [
  { id: "removal", label: "Removing an API, endpoint, flag or field", weight: 30 },
  { id: "rename", label: "Renaming something public (alias possible)", weight: 15 },
  { id: "behavior", label: "Changing documented behaviour or defaults", weight: 25 },
  { id: "signature", label: "Changing a signature, type or response shape", weight: 20 },
  { id: "config", label: "Changing configuration file format or keys", weight: 15 },
  { id: "wire", label: "Changing a wire protocol / serialisation format", weight: 30 },
  { id: "platform", label: "Raising runtime or dependency requirements", weight: 10 },
];

export const SURFACES = [
  { id: "publicApi", label: "Library / SDK public API" },
  { id: "httpApi", label: "HTTP / RPC API consumed by others" },
  { id: "cli", label: "CLI commands or flags" },
  { id: "configFile", label: "Configuration files" },
  { id: "storedData", label: "Stored data / database schema" },
];

export const AUDIENCES = [
  // Multipliers reflect blast radius: unknown external consumers cannot be migrated for you.
  { id: "internal", label: "Internal — one team, all call sites known", multiplier: 0.5 },
  { id: "company", label: "Company-wide — several teams", multiplier: 0.8 },
  { id: "public", label: "Public — external, unknown consumers", multiplier: 1.0 },
];

/** Mitigation credits (points subtracted from the raw risk score). */
export const MITIGATIONS = [
  { id: "deprecationPeriod", label: "Deprecation period with warnings before removal", credit: 15 },
  { id: "migrationGuide", label: "Written migration guide with before/after examples", credit: 10 },
  { id: "codemod", label: "Codemod / automated migration available", credit: 10 },
  { id: "telemetry", label: "Usage telemetry identifies affected consumers", credit: 8 },
  { id: "dualSupport", label: "Old and new paths supported side by side for a release", credit: 12 },
];

/** Score floor/ceiling and band edges for the risk label. */
export const SCORE_MIN = 5;
export const SCORE_MAX = 100;
export const RISK_BANDS = [
  { max: 25, level: "Low", note: "Routine breaking change — standard process is enough." },
  { max: 50, level: "Moderate", note: "Plan the rollout; announce ahead and monitor adoption." },
  { max: 75, level: "High", note: "Needs a deprecation period, migration guide and staged rollout." },
  { max: 100, level: "Critical", note: "Treat as a project: comms plan, dual support and telemetry before shipping." },
];

function checklistFor({ types, surfaces, mitigations, audienceId }) {
  const items = [];
  const add = (phase, text) => items.push({ phase, text });

  // Before shipping
  add("Before", "Confirm the change really cannot be delivered in a backwards-compatible way (adapter, overload, new endpoint).");
  add("Before", "Inventory affected consumers" + (mitigations.telemetry ? " using your usage telemetry." : " — without telemetry, assume every consumer is affected."));
  add("Before", "Write the CHANGELOG entry now: what breaks, why, and the exact migration steps.");
  if (!mitigations.migrationGuide) add("Before", "Produce a migration guide with before/after code samples — none exists yet.");
  if (!mitigations.deprecationPeriod) add("Before", "Add a deprecation release that warns on the old path before any removal (SemVer item 7: deprecation itself needs at least a minor release).");
  if (types.rename) add("Before", "For renames, ship the new name first and keep the old name as a warning alias for one deprecation cycle.");
  if (types.signature) add("Before", "Publish updated type definitions so consumers see the break at compile time, not runtime.");
  if (types.wire) add("Before", "Version the wire format explicitly and keep readers able to parse the previous version.");
  if (types.config) add("Before", "Ship a config migrator or accept both formats for one release, warning on the legacy one.");
  if (surfaces.storedData) add("Before", "Write and test a reversible data migration; take a rollback path seriously — schema breaks cannot be hot-fixed.");
  if (surfaces.httpApi) add("Before", "Expose the new behaviour under a new API version or header so old clients keep working during migration.");
  if (audienceId === "public") add("Before", "Announce with a dated timeline in release notes, docs banners and any mailing list or Discord your consumers watch.");

  // Release
  add("Release", "Bump the MAJOR version (SemVer item 8) — never smuggle a breaking change into a minor or patch.");
  add("Release", "Mark the release notes with a BREAKING CHANGE section listing every incompatibility.");
  if (mitigations.dualSupport) add("Release", "Keep the old path functional behind its warning for this release; schedule the removal release now.");
  if (surfaces.cli) add("Release", "Make removed/renamed CLI flags fail with a message that names the replacement, not a generic 'unknown flag'.");
  if (mitigations.codemod) add("Release", "Link the codemod in the release notes and verify it runs cleanly on a real downstream project.");

  // After
  add("After", "Monitor issue trackers and support channels for migration failures during the first weeks.");
  if (mitigations.telemetry) add("After", "Watch telemetry for remaining old-path usage before removing any compatibility shim.");
  add("After", "Backport critical security fixes to the previous major for the support window you promised.");

  return items;
}

/**
 * Build the checklist and risk assessment.
 * @param {object} input
 * @param {object} input.types       Map of CHANGE_TYPES id -> boolean.
 * @param {object} input.surfaces    Map of SURFACES id -> boolean.
 * @param {string} input.audienceId  One of AUDIENCES ids.
 * @param {object} input.mitigations Map of MITIGATIONS id -> boolean.
 * @returns {{items:Array, riskScore:number, riskLevel:string, riskNote:string, requiredBump:string, markdown:string}|{error:string}}
 */
export function buildChecklist({ types = {}, surfaces = {}, audienceId, mitigations = {} }) {
  const pickedTypes = CHANGE_TYPES.filter((type) => types[type.id] === true);
  const pickedSurfaces = SURFACES.filter((surface) => surfaces[surface.id] === true);
  const audience = AUDIENCES.find((option) => option.id === audienceId);

  if (pickedTypes.length === 0) return { error: "Tick at least one kind of change you are making." };
  if (pickedSurfaces.length === 0) return { error: "Tick at least one surface the change touches." };
  if (!audience) return { error: "Choose who consumes this surface." };

  // Raw risk: sum of type weights, +5 per extra surface beyond the first, scaled by audience.
  const EXTRA_SURFACE_WEIGHT = 5;
  const typeWeight = pickedTypes.reduce((sum, type) => sum + type.weight, 0);
  const surfaceWeight = (pickedSurfaces.length - 1) * EXTRA_SURFACE_WEIGHT;
  const credit = MITIGATIONS.reduce(
    (sum, mitigation) => sum + (mitigations[mitigation.id] === true ? mitigation.credit : 0),
    0,
  );
  const raw = (typeWeight + surfaceWeight) * audience.multiplier - credit;
  const riskScore = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(raw)));
  const band = RISK_BANDS.find((entry) => riskScore <= entry.max) ?? RISK_BANDS[RISK_BANDS.length - 1];

  const items = checklistFor({
    types: Object.fromEntries(pickedTypes.map((type) => [type.id, true])),
    surfaces: Object.fromEntries(pickedSurfaces.map((surface) => [surface.id, true])),
    mitigations,
    audienceId,
  });

  const phases = ["Before", "Release", "After"];
  const markdownLines = ["# Breaking change impact checklist", ""];
  markdownLines.push(`Risk: ${band.level} (${riskScore}/100) — ${band.note}`, "");
  markdownLines.push(`Required version bump: MAJOR (SemVer 2.0.0 item 8; on 0.x, bump minor per item 4 convention)`, "");
  for (const phase of phases) {
    markdownLines.push(`## ${phase}`, "");
    for (const item of items.filter((entry) => entry.phase === phase)) {
      markdownLines.push(`- [ ] ${item.text}`);
    }
    markdownLines.push("");
  }

  return {
    items,
    riskScore,
    riskLevel: band.level,
    riskNote: band.note,
    requiredBump: "MAJOR",
    markdown: markdownLines.join("\n").trimEnd() + "\n",
  };
}

/**
 * NuGet PackageReference builder.
 *
 * Rules implemented from the NuGet documentation
 * (learn.microsoft.com/nuget/concepts/package-versioning and
 *  learn.microsoft.com/nuget/consume-packages/package-references-in-project-files):
 *
 *  - Version range notation:
 *      1.0        minimum, inclusive  ->  x >= 1.0
 *      [1.0]      exact               ->  x == 1.0
 *      (1.0,)     exclusive minimum   ->  x >  1.0
 *      [1.0,2.0)  mixed               ->  1.0 <= x < 2.0
 *      (,1.0]     maximum, inclusive  ->  x <= 1.0
 *      (,)        invalid — NuGet rejects an unbounded open range.
 *    A square bracket is inclusive, a round bracket is exclusive.
 *  - Asset flags (IncludeAssets / ExcludeAssets / PrivateAssets) take a
 *    semicolon-separated list from a fixed vocabulary. Defaults are
 *    IncludeAssets=all, ExcludeAssets=none, PrivateAssets=contentFiles;analyzers;build.
 *  - PrivateAssets="all" stops the reference flowing to consumers of your
 *    package — the convention for build-only and analyzer packages.
 *  - Central Package Management: set ManagePackageVersionsCentrally to true in
 *    Directory.Packages.props, declare PackageVersion items there, and drop the
 *    Version attribute from every PackageReference in the project files.
 */

/** Asset groups NuGet understands in Include/Exclude/PrivateAssets. */
export const ASSET_KINDS = [
  "compile",
  "runtime",
  "contentFiles",
  "build",
  "buildMultitargeting",
  "buildTransitive",
  "analyzers",
  "native",
  "none",
  "all",
];

/** The PrivateAssets value NuGet applies when the attribute is absent. */
export const DEFAULT_PRIVATE_ASSETS = "contentFiles;analyzers;build";

/** NuGet package IDs: alphanumeric segments joined by . _ or -, max 100 chars. */
const PACKAGE_ID_RE = /^\w+([_.-]\w+)*$/;
export const MAX_PACKAGE_ID_LENGTH = 100;

/** A NuGet version: up to four numeric parts plus optional pre-release/metadata. */
const VERSION_RE = /^\d+(\.\d+){0,3}(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

/** A floating version such as 6.0.* or 8.* or *-* . */
const FLOATING_RE = /^(\d+(\.\d+)*\.\*|\*)(-\*)?$/;

/** Validate a NuGet package id. */
export function validatePackageId(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Package id is required." };
  if (value.length > MAX_PACKAGE_ID_LENGTH) {
    return { ok: false, reason: `Package ids are limited to ${MAX_PACKAGE_ID_LENGTH} characters.` };
  }
  if (!PACKAGE_ID_RE.test(value)) {
    return { ok: false, reason: `"${value}" is not a valid package id — use letters, digits and . _ - separators.` };
  }
  return { ok: true };
}

/**
 * Parse a NuGet version range into its bounds and a plain-language reading.
 * @returns {{ok:true,min?:string,minInclusive?:boolean,max?:string,maxInclusive?:boolean,floating?:boolean,notation:string,meaning:string}|{ok:false,reason:string}}
 */
export function parseVersionRange(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Version is required." };

  const bracketed = /^([[(])(.*)([\])])$/.exec(value);
  if (!bracketed) {
    if (FLOATING_RE.test(value)) {
      return {
        ok: true,
        floating: true,
        notation: value,
        meaning:
          value.endsWith("-*")
            ? "highest version matching the pattern, pre-release versions included — resolved at restore time"
            : "highest stable version matching the pattern — resolved at restore time",
      };
    }
    if (!VERSION_RE.test(value)) {
      return { ok: false, reason: `"${value}" is not a valid NuGet version.` };
    }
    return {
      ok: true,
      min: value,
      minInclusive: true,
      notation: value,
      meaning: `version ${value} or higher (NuGet still picks the lowest version that satisfies every constraint)`,
    };
  }

  const [, open, body, close] = bracketed;
  const minInclusive = open === "[";
  const maxInclusive = close === "]";

  if (!body.includes(",")) {
    const single = body.trim();
    if (!single) return { ok: false, reason: "An empty bracketed range has no meaning." };
    if (!VERSION_RE.test(single)) return { ok: false, reason: `"${single}" is not a valid NuGet version.` };
    if (!minInclusive || !maxInclusive) {
      return { ok: false, reason: `An exact version must use square brackets, as in [${single}].` };
    }
    return {
      ok: true,
      min: single,
      max: single,
      minInclusive: true,
      maxInclusive: true,
      notation: value,
      meaning: `exactly ${single} — no other version will restore`,
    };
  }

  const [rawMin, rawMax, ...rest] = body.split(",");
  if (rest.length > 0) return { ok: false, reason: "A range has at most one comma." };

  const min = rawMin.trim();
  const max = rawMax.trim();

  if (!min && !max) return { ok: false, reason: "(,) is not a valid range — give at least one bound." };
  if (min && !VERSION_RE.test(min)) return { ok: false, reason: `"${min}" is not a valid NuGet version.` };
  if (max && !VERSION_RE.test(max)) return { ok: false, reason: `"${max}" is not a valid NuGet version.` };
  if (!min && minInclusive) {
    return { ok: false, reason: "An open lower bound must use a round bracket, as in (,1.0]." };
  }
  if (!max && maxInclusive) {
    return { ok: false, reason: "An open upper bound must use a round bracket, as in [1.0,)." };
  }
  if (min && max && compareVersions(min, max) > 0) {
    return { ok: false, reason: `The lower bound ${min} is above the upper bound ${max}.` };
  }
  if (min && max && min === max && !(minInclusive && maxInclusive)) {
    return { ok: false, reason: `[${min},${max}) can never match any version.` };
  }

  const parts = [];
  if (min) parts.push(`${minInclusive ? ">=" : ">"} ${min}`);
  if (max) parts.push(`${maxInclusive ? "<=" : "<"} ${max}`);

  return {
    ok: true,
    min: min || undefined,
    max: max || undefined,
    minInclusive,
    maxInclusive,
    notation: value,
    meaning: `any version ${parts.join(" and ")}`,
  };
}

/** Numeric comparison of two dotted NuGet versions (pre-release suffix ignored). */
export function compareVersions(a, b) {
  const left = String(a).split("-")[0].split(".").map(Number);
  const right = String(b).split("-")[0].split(".").map(Number);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const x = left[index] ?? 0;
    const y = right[index] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/** Validate a semicolon-separated asset list. */
export function validateAssets(raw, field) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: true, empty: true };
  const tokens = value.split(";").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0) return { ok: true, empty: true };
  for (const token of tokens) {
    if (!ASSET_KINDS.includes(token)) {
      return { ok: false, reason: `${field}: "${token}" is not a NuGet asset group.` };
    }
  }
  if (tokens.includes("all") && tokens.length > 1) {
    return { ok: false, reason: `${field}: "all" already covers every group — drop the others.` };
  }
  if (tokens.includes("none") && tokens.length > 1) {
    return { ok: false, reason: `${field}: "none" cannot be combined with other groups.` };
  }
  return { ok: true, empty: false, tokens };
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build PackageReference XML (and the Directory.Packages.props file when
 * central package management is on).
 *
 * @param {object} input
 * @param {Array<object>} input.packages
 * @param {boolean} [input.centralManagement]
 * @param {boolean} [input.transitivePinning]
 * @param {number}  [input.indentSpaces]
 * @returns {{projectXml:string,propsXml:string,rows:Array,warnings:string[],packageCount:number}|{error:string}}
 */
export function buildPackageReferences(input = {}) {
  const {
    packages = [],
    centralManagement = false,
    transitivePinning = false,
    indentSpaces = 2,
  } = input;

  const indentWidth = Number(indentSpaces);
  if (!Number.isFinite(indentWidth) || indentWidth < 0 || indentWidth > 8) {
    return { error: "Indent must be between 0 and 8 spaces." };
  }
  const pad = " ".repeat(indentWidth);

  const rows = [];
  const warnings = [];
  const seen = new Set();

  for (const item of packages) {
    const id = String(item?.id ?? "").trim();
    if (!id) continue;

    const idCheck = validatePackageId(id);
    if (!idCheck.ok) return { error: idCheck.reason };
    const key = id.toLowerCase();
    if (seen.has(key)) {
      return { error: `"${id}" is referenced twice — NuGet package ids are case-insensitive.` };
    }
    seen.add(key);

    const range = parseVersionRange(item?.version);
    if (!range.ok) return { error: `${id}: ${range.reason}` };

    const privateAssets = String(item?.privateAssets ?? "").trim();
    const includeAssets = String(item?.includeAssets ?? "").trim();
    const excludeAssets = String(item?.excludeAssets ?? "").trim();

    for (const [field, value] of [
      ["PrivateAssets", privateAssets],
      ["IncludeAssets", includeAssets],
      ["ExcludeAssets", excludeAssets],
    ]) {
      const check = validateAssets(value, field);
      if (!check.ok) return { error: `${id}: ${check.reason}` };
    }

    if (includeAssets === "none") {
      warnings.push(`${id} has IncludeAssets="none", so nothing from the package is used at all.`);
    }
    if (range.floating && !centralManagement) {
      warnings.push(`${id} uses the floating version ${range.notation} — restores are not reproducible unless a lock file is committed.`);
    }

    rows.push({ id, range, privateAssets, includeAssets, excludeAssets });
  }

  if (rows.length === 0) return { error: "Add at least one package reference." };

  const attributesFor = (row, withVersion) => {
    const attributes = [`Include="${escapeAttribute(row.id)}"`];
    if (withVersion) attributes.push(`Version="${escapeAttribute(row.range.notation)}"`);
    if (row.includeAssets) attributes.push(`IncludeAssets="${escapeAttribute(row.includeAssets)}"`);
    if (row.excludeAssets) attributes.push(`ExcludeAssets="${escapeAttribute(row.excludeAssets)}"`);
    if (row.privateAssets) attributes.push(`PrivateAssets="${escapeAttribute(row.privateAssets)}"`);
    return attributes.join(" ");
  };

  const projectLines = ["<ItemGroup>"];
  for (const row of rows) {
    projectLines.push(`${pad}<PackageReference ${attributesFor(row, !centralManagement)} />`);
  }
  projectLines.push("</ItemGroup>");

  let propsXml = "";
  if (centralManagement) {
    const propsLines = [
      "<Project>",
      `${pad}<PropertyGroup>`,
      `${pad}${pad}<ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>`,
    ];
    if (transitivePinning) {
      propsLines.push(`${pad}${pad}<CentralPackageTransitivePinningEnabled>true</CentralPackageTransitivePinningEnabled>`);
    }
    propsLines.push(`${pad}</PropertyGroup>`, `${pad}<ItemGroup>`);
    for (const row of rows) {
      propsLines.push(
        `${pad}${pad}<PackageVersion Include="${escapeAttribute(row.id)}" Version="${escapeAttribute(row.range.notation)}" />`,
      );
    }
    propsLines.push(`${pad}</ItemGroup>`, "</Project>");
    propsXml = `${propsLines.join("\n")}\n`;

    for (const row of rows) {
      if (row.range.floating) {
        warnings.push(`Central Package Management rejects floating versions — replace ${row.id}'s ${row.range.notation} with a concrete version.`);
      }
    }
  }

  return {
    projectXml: `${projectLines.join("\n")}\n`,
    propsXml,
    rows,
    warnings,
    packageCount: rows.length,
  };
}

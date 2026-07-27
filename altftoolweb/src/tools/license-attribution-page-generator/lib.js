/**
 * Third-party license attribution page builder.
 *
 * Why such a page exists: MIT, BSD and ISC require the copyright and permission
 * notice to be included in copies or substantial portions of the software;
 * Apache-2.0 section 4 requires carrying attribution notices; MPL/LGPL/GPL add
 * source-availability duties. Publishing a "Third-Party Licenses" page is the
 * standard way products satisfy the notice-preservation part of those licenses.
 *
 * License family classification follows the common SPDX/OSI grouping:
 * permissive, weak copyleft (file/library level), strong copyleft (work level),
 * and public-domain-equivalent.
 */

export const LICENSE_CATEGORIES = {
  // Permissive: notice preservation only.
  MIT: "permissive",
  ISC: "permissive",
  "BSD-2-Clause": "permissive",
  "BSD-3-Clause": "permissive",
  "Apache-2.0": "permissive",
  Zlib: "permissive",
  "Python-2.0": "permissive",
  "BlueOak-1.0.0": "permissive",
  // Public-domain equivalent: no conditions.
  "0BSD": "public-domain",
  Unlicense: "public-domain",
  "CC0-1.0": "public-domain",
  WTFPL: "public-domain",
  // Weak copyleft: changes to the component itself must stay open.
  "MPL-2.0": "weak-copyleft",
  "EPL-1.0": "weak-copyleft",
  "EPL-2.0": "weak-copyleft",
  "LGPL-2.1-only": "weak-copyleft",
  "LGPL-2.1-or-later": "weak-copyleft",
  "LGPL-3.0-only": "weak-copyleft",
  "LGPL-3.0-or-later": "weak-copyleft",
  "CDDL-1.0": "weak-copyleft",
  // Strong copyleft: the combined work must be released under the same license.
  "GPL-2.0-only": "strong-copyleft",
  "GPL-2.0-or-later": "strong-copyleft",
  "GPL-3.0-only": "strong-copyleft",
  "GPL-3.0-or-later": "strong-copyleft",
  "AGPL-3.0-only": "strong-copyleft",
  "AGPL-3.0-or-later": "strong-copyleft",
  "EUPL-1.2": "strong-copyleft",
};

export const CATEGORY_LABELS = {
  permissive: "Permissive",
  "public-domain": "Public-domain equivalent",
  "weak-copyleft": "Weak copyleft",
  "strong-copyleft": "Strong copyleft",
  unknown: "Unrecognised",
};

/** Normalise loose spellings (gpl3, GPLv3, lgpl-3.0) onto SPDX ids before classifying. */
const LICENSE_ALIASES = {
  "apache 2.0": "Apache-2.0",
  apache2: "Apache-2.0",
  "apache-2": "Apache-2.0",
  "bsd-2": "BSD-2-Clause",
  "bsd-3": "BSD-3-Clause",
  bsd: "BSD-3-Clause",
  "gpl-2.0": "GPL-2.0-only",
  gplv2: "GPL-2.0-only",
  "gpl-3.0": "GPL-3.0-only",
  gplv3: "GPL-3.0-only",
  "lgpl-2.1": "LGPL-2.1-only",
  "lgpl-3.0": "LGPL-3.0-only",
  lgplv3: "LGPL-3.0-only",
  "agpl-3.0": "AGPL-3.0-only",
  agplv3: "AGPL-3.0-only",
  "mpl 2.0": "MPL-2.0",
  cc0: "CC0-1.0",
  unlicensed: "Unlicense",
};

export function normalizeLicenseId(license) {
  const raw = typeof license === "string" ? license.trim() : "";
  if (raw === "") return "";
  const exact = Object.keys(LICENSE_CATEGORIES).find((id) => id.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const alias = LICENSE_ALIASES[raw.toLowerCase()];
  return alias ?? raw;
}

export function classifyLicense(license) {
  const id = normalizeLicenseId(license);
  return LICENSE_CATEGORIES[id] ?? "unknown";
}

/** True when a version token looks like a version (1.2.3, v2, 2024.1). */
function looksLikeVersion(token) {
  return /^v?\d[\w.+-]*$/.test(token);
}

/**
 * Parse a pasted manifest, one dependency per line. Accepted forms:
 *   name | version | license | url
 *   name@version license
 *   name version license
 *   name license
 * Scoped npm names (@scope/pkg@1.2.3) are handled. Blank and # lines ignored.
 * @returns {{entries:Array<{name,version,license,url,category}>, skipped:number}}
 */
export function parseManifest(text) {
  const entries = [];
  let skipped = 0;
  const lines = typeof text === "string" ? text.split("\n") : [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;

    let name = "";
    let version = "";
    let license = "";
    let url = "";

    if (line.includes("|")) {
      const parts = line.split("|").map((part) => part.trim());
      [name = "", version = "", license = "", url = ""] = parts;
    } else {
      const tokens = line.split(/\s+/);
      let nameToken = tokens.shift() ?? "";
      // Split trailing @version off the name; index > 0 keeps @scope/ prefixes intact.
      const atIndex = nameToken.lastIndexOf("@");
      if (atIndex > 0) {
        version = nameToken.slice(atIndex + 1);
        nameToken = nameToken.slice(0, atIndex);
      }
      name = nameToken;
      if (version === "" && tokens.length >= 2 && looksLikeVersion(tokens[0])) {
        version = tokens.shift();
      }
      license = tokens.join(" ");
    }

    if (name === "") {
      skipped += 1;
      continue;
    }
    const normalized = normalizeLicenseId(license);
    entries.push({
      name,
      version,
      license: normalized === "" ? "Unknown" : normalized,
      url,
      category: normalized === "" ? "unknown" : classifyLicense(normalized),
    });
  }
  return { entries, skipped };
}

function groupByLicense(entries) {
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.license)) groups.set(entry.license, []);
    groups.get(entry.license).push(entry);
  }
  // Alphabetical license order; components alphabetical inside each group.
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([license, list]) => [license, [...list].sort((a, b) => a.name.localeCompare(b.name))]);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export const OUTPUT_FORMATS = [
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML fragment" },
  { id: "text", label: "Plain text" },
];

/**
 * Build the attribution page.
 * @param {object} input
 * @param {Array} input.entries       Parsed entries from parseManifest.
 * @param {string} input.projectName  Product name for the heading.
 * @param {string} [input.format]     "markdown" | "html" | "text".
 * @returns {{page:string, total:number, licenseCount:number, byCategory:object, copyleftCount:number, unknownCount:number}|{error:string}}
 */
export function generateAttributionPage({ entries, projectName, format = "markdown" }) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Paste at least one dependency line to build the page." };
  }
  if (!OUTPUT_FORMATS.some((option) => option.id === format)) {
    return { error: "Choose an output format from the list." };
  }
  const project = typeof projectName === "string" && projectName.trim() !== "" ? projectName.trim() : "this product";

  const groups = groupByLicense(entries);
  const byCategory = {};
  for (const entry of entries) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
  }
  const copyleftCount = (byCategory["weak-copyleft"] ?? 0) + (byCategory["strong-copyleft"] ?? 0);
  const unknownCount = byCategory.unknown ?? 0;

  const lines = [];
  if (format === "markdown") {
    lines.push("# Third-Party Licenses", "");
    lines.push(`${project} includes the following open source components. Each is used under the license shown; the full license texts are available from the linked projects.`, "");
    for (const [license, list] of groups) {
      lines.push(`## ${license} (${CATEGORY_LABELS[list[0].category]})`, "");
      for (const entry of list) {
        const version = entry.version ? ` ${entry.version}` : "";
        const link = entry.url ? ` — [website](${entry.url})` : "";
        lines.push(`- **${entry.name}**${version}${link}`);
      }
      lines.push("");
    }
  } else if (format === "html") {
    lines.push("<h1>Third-Party Licenses</h1>");
    lines.push(`<p>${escapeHtml(project)} includes the following open source components. Each is used under the license shown; the full license texts are available from the linked projects.</p>`);
    for (const [license, list] of groups) {
      lines.push(`<h2>${escapeHtml(license)} (${CATEGORY_LABELS[list[0].category]})</h2>`);
      lines.push("<ul>");
      for (const entry of list) {
        const version = entry.version ? ` ${escapeHtml(entry.version)}` : "";
        const nameHtml = entry.url
          ? `<a href="${escapeHtml(entry.url)}" rel="noopener">${escapeHtml(entry.name)}</a>`
          : escapeHtml(entry.name);
        lines.push(`  <li>${nameHtml}${version}</li>`);
      }
      lines.push("</ul>");
    }
  } else {
    lines.push("THIRD-PARTY LICENSES", "");
    lines.push(`${project} includes the following open source components.`, "");
    for (const [license, list] of groups) {
      lines.push(`${license} (${CATEGORY_LABELS[list[0].category]})`);
      for (const entry of list) {
        const version = entry.version ? ` ${entry.version}` : "";
        const link = entry.url ? ` <${entry.url}>` : "";
        lines.push(`  - ${entry.name}${version}${link}`);
      }
      lines.push("");
    }
  }

  return {
    page: lines.join("\n").trimEnd() + "\n",
    total: entries.length,
    licenseCount: groups.length,
    byCategory,
    copyleftCount,
    unknownCount,
  };
}

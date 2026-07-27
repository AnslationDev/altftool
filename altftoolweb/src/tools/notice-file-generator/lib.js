/**
 * Apache-style NOTICE file builder.
 *
 * Format rules come from the Apache License 2.0, section 4(d) (a derivative work
 * must carry readable attribution notices from the NOTICE file of the work it
 * includes) and the ASF "Licensing How-To" / assembling-notice guidance
 * (infra.apache.org/licensing-howto.html):
 *   - line 1: product name
 *   - line 2: "Copyright <years> <owner>"
 *   - then one "This product includes software developed at/by ..." block per
 *     attribution, plus any notice text a bundled dependency itself requires.
 * NOTICE must contain only required attribution, not the license texts themselves.
 */

/** Sanity bounds for the copyright years — not a legal rule. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2999;

/** Field separator for one-line dependency entries: Name | Copyright holder | URL | required notice. */
export const DEP_FIELD_SEPARATOR = "|";

/**
 * Parse a pasted dependency/attribution list, one entry per line:
 *   Name | Copyright holder | URL (optional) | required notice text (optional)
 * Blank lines and lines starting with # are ignored.
 * @returns {{deps:Array<{name:string,holder:string,url:string,notice:string}>, skipped:number}}
 */
export function parseDependencyLines(text) {
  const deps = [];
  let skipped = 0;
  const lines = typeof text === "string" ? text.split("\n") : [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const parts = line.split(DEP_FIELD_SEPARATOR).map((part) => part.trim());
    const [name = "", holder = "", url = "", notice = ""] = parts;
    if (name === "") {
      skipped += 1;
      continue;
    }
    deps.push({ name, holder, url, notice });
  }
  return { deps, skipped };
}

function formatYears(yearFrom, yearTo) {
  return yearFrom === yearTo ? String(yearFrom) : `${yearFrom}-${yearTo}`;
}

/**
 * Build the NOTICE file text.
 *
 * @param {object} input
 * @param {string} input.productName        Product the NOTICE belongs to.
 * @param {string} input.copyrightHolder    Owner named on the copyright line.
 * @param {number|string} input.yearFrom    First copyright year.
 * @param {number|string} input.yearTo      Last copyright year (same as yearFrom for a single year).
 * @param {string} [input.developedAt]      Organisation for the lead "developed at" block ("" to omit).
 * @param {string} [input.developedAtUrl]   URL for that organisation.
 * @param {Array}  [input.deps]             Parsed entries from parseDependencyLines.
 * @returns {{notice:string, lineCount:number, depCount:number, years:string}|{error:string}}
 */
export function buildNoticeFile({
  productName,
  copyrightHolder,
  yearFrom,
  yearTo,
  developedAt = "",
  developedAtUrl = "",
  deps = [],
}) {
  const product = typeof productName === "string" ? productName.trim() : "";
  const holder = typeof copyrightHolder === "string" ? copyrightHolder.trim() : "";
  if (product === "") return { error: "Enter the product name for the first line of the NOTICE file." };
  if (holder === "") return { error: "Enter the copyright holder for the copyright line." };

  const from = Number(yearFrom);
  const to = Number(yearTo);
  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    return { error: "Enter the copyright years as 4-digit numbers." };
  }
  if (from < MIN_YEAR || to > MAX_YEAR) {
    return { error: `Copyright years must fall between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (to < from) return { error: "The last copyright year cannot be before the first." };

  const years = formatYears(from, to);
  const lines = [product, `Copyright ${years} ${holder}`];

  const devAt = typeof developedAt === "string" ? developedAt.trim() : "";
  if (devAt !== "") {
    const devUrl = typeof developedAtUrl === "string" ? developedAtUrl.trim() : "";
    lines.push("", "This product includes software developed at", devUrl !== "" ? `${devAt} (${devUrl}).` : `${devAt}.`);
  }

  let depCount = 0;
  for (const dep of deps) {
    if (!dep || typeof dep.name !== "string" || dep.name.trim() === "") continue;
    depCount += 1;
    lines.push("", "---", "");
    const name = dep.name.trim();
    const depHolder = typeof dep.holder === "string" ? dep.holder.trim() : "";
    const depUrl = typeof dep.url === "string" ? dep.url.trim() : "";
    const depNotice = typeof dep.notice === "string" ? dep.notice.trim() : "";

    if (depHolder !== "") {
      lines.push(`This product includes ${name}, software developed by`);
      lines.push(depUrl !== "" ? `${depHolder} (${depUrl}).` : `${depHolder}.`);
    } else {
      lines.push(depUrl !== "" ? `This product includes ${name} (${depUrl}).` : `This product includes ${name}.`);
    }
    if (depNotice !== "") {
      lines.push("", depNotice);
    }
  }

  return {
    notice: lines.join("\n"),
    lineCount: lines.length,
    depCount,
    years,
  };
}

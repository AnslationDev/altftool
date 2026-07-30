// Citation strings for the page families that publish original, dated research:
// /exam-photo/[exam], /deals/[slug] and /alternatives/[incumbent].
//
// Pure string work. No imports, no clock, no I/O — everything here is a
// transform over values the calling page already renders, which is the only way
// a citation block can be trusted: what a reader copies must be what the page
// shows.
//
// WHAT THIS FILE MUST NEVER DO
//
//   Stamp today's date. `asOf` is the date carried by the page's own record —
//   SPECS_READ_ON for an exam spec, `checkedOn` for a price or a vendor
//   comparison. A build-time date would silently re-date every page on every
//   deploy and turn a dated fact into a false one. A family with no data date
//   gets no date field: `buildCitations` drops it and APA falls back to the
//   standard "n.d.", rather than inventing one.
//
//   Invent an author. There is no named author on these pages, so the author is
//   the organisation and nothing else. No DOI, no ISSN, no editor, no "cited by"
//   count, no version number: none of those exist for this content.
//
// The underlying documents travel with the citation on purpose. Someone quoting
// the SSC CGL signature box should be pointed at the SSC notice that prints it,
// not only at us, so `sources` is carried into the visible block and into the
// BibTeX `note`.

/** Author and publisher for every page in these families. */
export const CITATION_PUBLISHER = "AltFTool";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Full month names — APA spells the month out. */
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * MLA 9 abbreviates every month longer than four letters and leaves May, June
 * and July alone.
 */
const MONTHS_MLA = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

/** BibTeX month macros. */
const MONTHS_BIBTEX = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * @typedef {object} CitationSource
 * @property {string} title The document, as it is named on the page.
 * @property {string[]} [urls] Where it lives. The first is treated as primary.
 * @property {string} [issued] ISO date printed on the document itself.
 * @property {string} [checked] ISO date the document was read.
 */

/**
 * @typedef {object} CitationInput
 * @property {string} title Page title as it should be cited (its H1).
 * @property {string} url Absolute canonical URL.
 * @property {string} [asOf] ISO date carried by the page's own data.
 * @property {string} [asOfLabel] What that date means, e.g. "Prices checked".
 * @property {CitationSource[]} [sources] Documents the figures were read from.
 */

/**
 * @typedef {object} CitationSet
 * @property {string} apa
 * @property {string} mla
 * @property {string} bibtex
 */

/**
 * Split an ISO date, or return null. Anything that is not exactly YYYY-MM-DD is
 * treated as absent rather than guessed at.
 *
 * @param {string} [iso]
 * @returns {{year: string, monthIndex: number, day: number}|null}
 */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = iso.match(ISO_DATE);
  if (!match) return null;
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  const dayNumber = Number(day);
  if (dayNumber < 1 || dayNumber > 31) return null;
  return { year, monthIndex, day: dayNumber };
}

/**
 * Human-readable day for the rendered block: "29 July 2026". Empty string when
 * the date is missing, so the caller can drop the row instead of printing a
 * placeholder.
 *
 * @param {string} [iso]
 * @returns {string}
 */
export function formatCitationDay(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  return `${parts.day} ${MONTHS_FULL[parts.monthIndex]} ${parts.year}`;
}

/** APA date: "2026, July 29", or "n.d." when the page carries no data date. */
function apaDate(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "n.d.";
  return `${parts.year}, ${MONTHS_FULL[parts.monthIndex]} ${parts.day}`;
}

/** MLA date: "29 July 2026". Empty when there is no date to print. */
function mlaDate(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return "";
  return `${parts.day} ${MONTHS_MLA[parts.monthIndex]} ${parts.year}`;
}

/** MLA 9 prints the URL without its scheme. */
function bareUrl(url) {
  return String(url || "").replace(/^https?:\/\//i, "");
}

/** Sentence-final period, unless the title already ends in its own punctuation. */
function endSentence(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

/**
 * Escape the characters that break a LaTeX build. Applied to prose fields only
 * — a URL goes inside \url{}, where the url package handles _ ~ % and # itself,
 * and escaping it there would corrupt the link.
 *
 * @param {string} value
 * @returns {string}
 */
export function escapeLatex(value) {
  return String(value || "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_])/g, "\\$1")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * BibTeX key derived from the canonical path, so two pages can never collide and
 * nobody has to invent one: /exam-photo/ssc-cgl -> altftool-exam-photo-ssc-cgl.
 *
 * @param {string} url Absolute canonical URL.
 * @returns {string}
 */
export function bibtexKey(url) {
  const path = String(url || "")
    .replace(/^https?:\/\/[^/]*/i, "")
    .replace(/[?#].*$/, "");
  const slug = path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `altftool-${slug}` : "altftool-page";
}

/** "SSC CGL 2026 Notice (issued 2026-05-21, read 2026-07-25)" */
function describeSource(source, asOf) {
  const qualifiers = [];
  if (parseIsoDate(source.issued)) qualifiers.push(`issued ${source.issued}`);
  if (parseIsoDate(source.checked) && source.checked !== asOf) {
    qualifiers.push(`read ${source.checked}`);
  }
  const title = String(source.title || "").trim();
  const suffix = qualifiers.length ? ` (${qualifiers.join(", ")})` : "";
  return `${title}${suffix}`;
}

/** Normalise and drop the empties, so a half-filled record cannot render. */
function usableSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources
    .filter((source) => source && String(source.title || "").trim())
    .map((source) => ({
      title: String(source.title).trim(),
      urls: (Array.isArray(source.urls) ? source.urls : []).filter(Boolean),
      issued: parseIsoDate(source.issued) ? source.issued : "",
      checked: parseIsoDate(source.checked) ? source.checked : "",
    }));
}

/**
 * APA 7, group author. The site name is omitted because the author and the site
 * are the same organisation, which is what APA asks for in that case.
 *
 * @param {CitationInput} input
 * @returns {string}
 */
export function buildApa({ title, url, asOf }) {
  return `${CITATION_PUBLISHER}. (${apaDate(asOf)}). ${endSentence(title)} ${url}`;
}

/**
 * MLA 9. No author element: the organisation is the container, which is how MLA
 * handles a page with no named writer.
 *
 * @param {CitationInput} input
 * @returns {string}
 */
export function buildMla({ title, url, asOf }) {
  const date = mlaDate(asOf);
  const parts = [CITATION_PUBLISHER, date, bareUrl(url)].filter(Boolean);
  return `"${endSentence(title)}" ${parts.join(", ")}.`;
}

/**
 * BibTeX @misc. The double braces keep the author and title capitalisation
 * exactly as published; `note` carries the data date and the documents the
 * figures were read from, because both are part of the claim being cited.
 *
 * @param {CitationInput} input
 * @returns {string}
 */
export function buildBibtex({ title, url, asOf, asOfLabel, sources }) {
  const parts = parseIsoDate(asOf);
  const entries = usableSources(sources);

  const noteParts = [];
  if (parts) noteParts.push(`${escapeLatex(asOfLabel || "Data as of")} ${asOf}.`);
  if (entries.length) {
    const described = entries.map((source) => {
      const text = escapeLatex(describeSource(source, asOf));
      return source.urls[0] ? `${text}: \\url{${source.urls[0]}}` : text;
    });
    noteParts.push(`${entries.length > 1 ? "Sources" : "Source"}: ${described.join("; ")}.`);
  }

  const fields = [
    ["author", `{{${escapeLatex(CITATION_PUBLISHER)}}}`],
    ["title", `{{${escapeLatex(String(title || "").trim())}}}`],
    parts ? ["year", `{${parts.year}}`] : null,
    parts ? ["month", `{${MONTHS_BIBTEX[parts.monthIndex]}}`] : null,
    ["howpublished", `{\\url{${url}}}`],
    noteParts.length ? ["note", `{${noteParts.join(" ")}}`] : null,
  ].filter(Boolean);

  const width = Math.max(...fields.map(([name]) => name.length));
  const body = fields
    .map(([name, value]) => `  ${name.padEnd(width)} = ${value}`)
    .join(",\n");

  return `@misc{${bibtexKey(url)},\n${body}\n}`;
}

/**
 * The three forms a citing writer actually needs, from one record.
 *
 * @param {CitationInput} input
 * @returns {CitationSet}
 */
export function buildCitations(input) {
  const record = {
    ...input,
    title: String(input?.title || "").trim(),
    url: String(input?.url || "").trim(),
    asOf: parseIsoDate(input?.asOf) ? input.asOf : "",
  };
  return {
    apa: buildApa(record),
    mla: buildMla(record),
    bibtex: buildBibtex(record),
  };
}

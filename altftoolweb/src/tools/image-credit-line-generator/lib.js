/**
 * Photo credit line + IPTC metadata builder.
 *
 * Encoded conventions:
 *  - House styles below follow long-standing publishing practice: wire services set a credit as
 *    "Photographer/Agency" with no spaces around the slash, magazines spell it out as
 *    "Photograph by …", broadcast uses "Courtesy of …", and museums lead with the collection.
 *  - The metadata block follows the IPTC Photo Metadata Standard, where Creator, Credit Line,
 *    Source and Copyright Notice are four DIFFERENT fields:
 *      * Creator      — the photographer who made the image (IIM By-line, 2:80).
 *      * Credit Line  — who must be credited when the image is published (IIM Credit, 2:110).
 *      * Source       — the original owner or archive the image came from (IIM Source, 2:115).
 *      * Copyright Notice — the rights statement (IIM Copyright Notice, 2:116).
 *    Filling all four with the same string is the commonest metadata mistake in a newsroom.
 *
 * Pure module: no DOM, no React, no clock. Informational, not legal advice.
 */

/**
 * Each style renders an ordered list of parts. A part appears only when its field has a value;
 * `sep` is inserted before it when an earlier part already rendered, and `before`/`after` wrap
 * that part's own value.
 */
export const CREDIT_STYLES = {
  wire: {
    label: "Wire service — Jane Doe/Agency",
    leader: "",
    trailer: "",
    parts: [{ field: "photographer" }, { field: "agency", sep: "/" }],
    note: "The compact form used on newswire captions: no spaces around the slash.",
  },
  wirePhoto: {
    label: "Caption prefix — Photo: Jane Doe/Agency",
    leader: "Photo: ",
    trailer: "",
    parts: [{ field: "photographer" }, { field: "agency", sep: "/" }],
    note: "Reads clearly under an image where the caption text sits directly above it.",
  },
  parenthetical: {
    label: "Parenthetical — (Jane Doe/Agency)",
    leader: "(",
    trailer: ")",
    parts: [{ field: "photographer" }, { field: "agency", sep: "/" }],
    note: "Set at the end of a caption sentence, the house style of several newspapers.",
  },
  magazine: {
    label: "Magazine — Photograph by Jane Doe / Agency",
    leader: "Photograph by ",
    trailer: "",
    parts: [{ field: "photographer" }, { field: "agency", sep: " / " }],
    note: "Spelled out for long-form and print features where the credit sits in the margin.",
  },
  creditLabel: {
    label: "Labelled — Credit: Jane Doe/Agency",
    leader: "Credit: ",
    trailer: "",
    parts: [{ field: "photographer" }, { field: "agency", sep: "/" }],
    note: "Explicit label, useful in press kits and documents where context is thin.",
  },
  courtesy: {
    label: "Courtesy — Courtesy of Agency",
    leader: "Courtesy of ",
    trailer: "",
    parts: [{ field: "agency" }, { field: "photographer", sep: " / " }],
    note: "Used when a company or institution supplied the image rather than licensing it to you.",
  },
  social: {
    label: "Social post — Photo: Jane Doe (@handle)",
    leader: "Photo: ",
    trailer: "",
    parts: [{ field: "photographer" }, { field: "handle", sep: " ", before: "(", after: ")" }],
    note: "Tag the handle as well as the name so the credit is clickable and traceable.",
  },
  museum: {
    label: "Museum / archive — Collection. Photograph by Jane Doe, 2024.",
    leader: "",
    trailer: ".",
    parts: [
      { field: "owner" },
      { field: "photographer", sep: ". ", before: "Photograph by " },
      { field: "year", sep: ", " },
    ],
    note: "Collection first, then the maker — the order archives and galleries use on wall labels.",
  },
  academic: {
    label: "Academic figure — Photograph by Jane Doe, 2024. Reproduced with permission of Owner.",
    leader: "",
    trailer: ".",
    parts: [
      { field: "photographer", before: "Photograph by " },
      { field: "year", sep: ", " },
      { field: "owner", sep: ". ", before: "Reproduced with permission of " },
    ],
    note: "Figure captions need the permission statement as well as the maker.",
  },
};

export const RIGHTS_TERMS = {
  none: { label: "No usage restriction stated", text: "" },
  editorial: {
    label: "Editorial use only",
    text: "Editorial use only. Not cleared for advertising, promotional or commercial use.",
  },
  oneTime: {
    label: "One-time use in this article",
    text: "Licensed for one-time use in the named article. Any further use requires a new licence.",
  },
  webOnly: {
    label: "Web use only",
    text: "Licensed for online use only. Print, broadcast and out-of-home use are not included.",
  },
  handout: {
    label: "Handout / supplied image",
    text: "Handout image supplied by the subject. No archival use, no resale.",
  },
};

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function partValue(part, fields) {
  const raw = clean(fields[part.field]);
  if (!raw) return "";
  return `${part.before || ""}${raw}${part.after || ""}`;
}

function renderStyle(style, fields) {
  let out = "";
  let rendered = 0;
  style.parts.forEach((part) => {
    const value = partValue(part, fields);
    if (!value) return;
    if (rendered > 0 && part.sep) out += part.sep;
    out += value;
    rendered += 1;
  });
  if (rendered === 0) return "";
  return `${style.leader}${out}${style.trailer}`;
}

/**
 * Build a credit line plus the four IPTC fields it maps to.
 * Pure: same input always gives the same output.
 *
 * @returns {{error: string} | {creditLine: string, iptc: object[], warnings: string[],
 *   styleNote: string, allStyles: Array<[string, string]>}}
 */
export function buildCreditLine(input = {}) {
  const styleKey = clean(input.style) || "wire";
  const style = CREDIT_STYLES[styleKey];
  if (!style) return { error: "Pick a credit style." };

  const rightsKey = clean(input.rights) || "none";
  const rights = RIGHTS_TERMS[rightsKey];
  if (!rights) return { error: "Pick a usage-terms option, or choose 'No usage restriction stated'." };

  const photographer = clean(input.photographer);
  const agency = clean(input.agency);
  const owner = clean(input.owner);
  const source = clean(input.source);
  const rawHandle = clean(input.handle);
  const handle = rawHandle ? (rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`) : "";
  const year = clean(input.year);

  if (!photographer && !agency && !owner) {
    return { error: "Enter at least a photographer, an agency or a collection — a credit needs someone to credit." };
  }
  if (year && !/^\d{4}$/.test(year)) {
    return { error: "Year should be four digits, for example 2024." };
  }

  const fields = { photographer, agency, owner, handle, year, source };
  const creditLine = renderStyle(style, fields);
  if (!creditLine) {
    return {
      error: `The ${style.label.split(" — ")[0]} style needs at least one of the fields it uses. Fill in the photographer, agency or collection.`,
    };
  }

  // The four IPTC fields are deliberately different values, not four copies of one string.
  const creditField = agency || owner || photographer;
  const sourceField = source || owner || agency || photographer;
  const copyrightHolder = owner || agency || photographer;
  const copyrightNotice = year ? `© ${year} ${copyrightHolder}` : `© ${copyrightHolder}`;

  const iptc = [
    ["Creator (By-line)", photographer || "Unknown photographer", "The person who actually made the image."],
    ["Credit Line", creditField, "Who must be named when the image is published."],
    ["Source", sourceField, "The original owner or archive the file came from."],
    ["Copyright Notice", copyrightNotice, "The rights statement travelling with the file."],
    ["Rights Usage Terms", rights.text || "Not stated", "Any limits on how the image may be used."],
  ].map(([field, value, purpose]) => ({ field, value, purpose }));

  const warnings = [];
  if (!photographer) {
    warnings.push("No photographer named. The IPTC Creator field should carry the individual maker, not the agency — an unnamed creator is how photographers lose their attribution.");
  }
  if (creditField && sourceField && creditField === sourceField) {
    warnings.push("Credit Line and Source are identical. They are different IPTC fields: Credit is who to name in print, Source is where the file came from.");
  }
  if (rightsKey === "editorial") {
    warnings.push("Editorial-only images must not be reused in ads, sponsored posts or promotional material later — carry the restriction into your asset manager, not just the caption.");
  }
  if (!year) {
    warnings.push("Add the year so the copyright notice is complete and the image can be dated later.");
  }
  if (styleKey === "social" && !handle) {
    warnings.push("The social style is built around a handle — add one so the credit is clickable.");
  }

  const allStyles = Object.values(CREDIT_STYLES)
    .map((entry) => [entry.label.split(" — ")[0], renderStyle(entry, fields)])
    .filter(([, line]) => Boolean(line));

  return {
    creditLine,
    styleNote: style.note,
    iptc,
    warnings,
    allStyles,
  };
}

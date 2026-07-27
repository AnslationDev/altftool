/**
 * Copyright notice builder.
 *
 * Rules encoded here:
 *  - A copyright notice under US law (17 U.S.C. §401(b)) has three elements: the symbol ©
 *    (or the word "Copyright" or the abbreviation "Copr."), the year of first publication,
 *    and the name of the copyright owner.
 *  - Sound recordings use the separate ℗ (phonogram) symbol under 17 U.S.C. §402; the
 *    underlying composition still takes ©.
 *  - Under the Berne Convention copyright arises automatically on creation, so no notice is
 *    required for protection in any Berne member state. It is still worth adding: in the US,
 *    a proper notice on a published copy removes an innocent-infringement plea in mitigation
 *    of damages (17 U.S.C. §401(d)).
 *  - "All rights reserved" originates in the 1910 Buenos Aires Convention and is no longer
 *    legally required anywhere; it survives purely as convention.
 *  - The year shown is the year of first publication. A range such as 2019–2026 is a
 *    publishing convention for works that are updated continuously, not a statutory form.
 *
 * Informational only — not legal advice.
 */

/** Notice symbol styles permitted by 17 U.S.C. §401(b)(1). */
export const SYMBOL_STYLES = {
  symbol: { label: "© (symbol)", text: "©", html: "&copy;" },
  word: { label: "Copyright (word)", text: "Copyright", html: "Copyright" },
  both: { label: "Copyright © (both)", text: "Copyright ©", html: "Copyright &copy;" },
  abbrev: { label: "Copr. (abbreviation)", text: "Copr.", html: "Copr." },
};

export const RIGHTS_PHRASES = {
  all: { label: "All rights reserved", text: "All rights reserved." },
  none: { label: "No phrase", text: "" },
  ccby: {
    label: "Licensed CC BY 4.0",
    text: "Licensed under CC BY 4.0.",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  ccbysa: {
    label: "Licensed CC BY-SA 4.0",
    text: "Licensed under CC BY-SA 4.0.",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  ccbync: {
    label: "Licensed CC BY-NC 4.0",
    text: "Licensed under CC BY-NC 4.0.",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
  unauthorised: {
    label: "Unauthorised reproduction prohibited",
    text: "Unauthorised reproduction or distribution of this work is prohibited.",
  },
};

export const MEDIA_TYPES = {
  website: {
    label: "Website or app footer",
    rangeByDefault: true,
    phonogram: false,
    placement: "Put it in the site footer on every page, in readable body-text size — not in a 4px grey caption.",
  },
  software: {
    label: "Software / source code",
    rangeByDefault: true,
    phonogram: false,
    placement: "Add it as a header comment in each source file and in the LICENSE file at the repository root.",
  },
  book: {
    label: "Book or print publication",
    rangeByDefault: false,
    phonogram: false,
    placement: "Print it on the copyright page, on the reverse of the title page, together with the edition and printing history.",
  },
  photo: {
    label: "Photograph or illustration",
    rangeByDefault: false,
    phonogram: false,
    placement: "Write it into the IPTC copyright notice and creator fields as well as any visible watermark — metadata travels with the file.",
  },
  video: {
    label: "Video or film",
    rangeByDefault: false,
    phonogram: false,
    placement: "Show it in the end credits and repeat it in the description or the file's metadata.",
  },
  music: {
    label: "Sound recording / music release",
    rangeByDefault: false,
    phonogram: true,
    placement: "Use ℗ for the recording and © for the artwork and composition, on the release page and in the file tags.",
  },
  podcast: {
    label: "Podcast episode",
    rangeByDefault: true,
    phonogram: true,
    placement: "Put it in the show notes and the feed's copyright tag so it travels to every podcast app.",
  },
  newsletter: {
    label: "Newsletter or PDF",
    rangeByDefault: true,
    phonogram: false,
    placement: "Place it in the footer of the email and on the last page of the PDF.",
  },
  deck: {
    label: "Presentation or slide deck",
    rangeByDefault: false,
    phonogram: false,
    placement: "Put it on the title slide or in the master footer so it appears on every exported page.",
  },
};

const MIN_YEAR = 1000;
const MAX_YEAR = 3000;

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseYear(raw) {
  const text = clean(raw);
  if (!/^\d{1,4}$/.test(text)) return NaN;
  return Number(text);
}

/**
 * Build a copyright notice.
 * Pure: the current year is an argument, never read from the clock inside this module.
 *
 * @param {object} input
 * @param {string} input.owner            Name of the copyright owner.
 * @param {number|string} input.startYear Year of first publication.
 * @param {number|string} input.currentYear Year to end the range at (pass the real current year).
 * @returns {{error: string} | {plain: string, html: string, markdown: string, sourceComment: string,
 *   metaTag: string, phonogramLine: string, yearText: string, notes: string[], placement: string}}
 */
export function buildCopyrightNotice(input = {}) {
  const owner = clean(input.owner);
  if (!owner) return { error: "Enter the name of the person or company that owns the copyright." };
  if (owner.length > 120) return { error: "Owner name is too long for a notice. Use the legal name, under 120 characters." };

  const mediaKey = clean(input.mediaType) || "website";
  const media = MEDIA_TYPES[mediaKey];
  if (!media) return { error: "Pick what the notice is going on." };

  const styleKey = clean(input.symbolStyle) || "symbol";
  const style = SYMBOL_STYLES[styleKey];
  if (!style) return { error: "Pick how the copyright symbol should be written." };

  const phraseKey = clean(input.rightsPhrase) || "all";
  const phrase = RIGHTS_PHRASES[phraseKey];
  if (!phrase) return { error: "Pick a rights phrase, or choose 'No phrase'." };

  const currentYear = parseYear(input.currentYear);
  if (!Number.isFinite(currentYear) || currentYear < MIN_YEAR || currentYear > MAX_YEAR) {
    return { error: "The current year is missing or out of range." };
  }

  const startYear = parseYear(input.startYear);
  if (!Number.isFinite(startYear)) return { error: "Enter the year of first publication as four digits, e.g. 2019." };
  if (startYear < MIN_YEAR) return { error: `Year of first publication must be ${MIN_YEAR} or later.` };
  if (startYear > currentYear) {
    return { error: "Year of first publication cannot be in the future — a notice must state the year the work was actually published." };
  }

  const useRange = input.useRange === undefined ? media.rangeByDefault : Boolean(input.useRange);
  const showRange = useRange && startYear < currentYear;
  const yearText = showRange ? `${startYear}–${currentYear}` : String(startYear);
  const yearHtml = showRange ? `${startYear}&ndash;${currentYear}` : String(startYear);
  const yearAscii = showRange ? `${startYear}-${currentYear}` : String(startYear);

  const tail = phrase.text ? ` ${phrase.text}` : "";
  const plain = `${style.text} ${yearText} ${owner}.${tail}`;
  const html = `${style.html} ${yearHtml} ${escapeHtml(owner)}.${tail ? ` ${escapeHtml(phrase.text)}` : ""}`;
  const markdown = plain;
  const sourceComment = `/* Copyright (c) ${yearAscii} ${owner}.${tail} */`;
  const metaTag = `<meta name="copyright" content="${escapeHtml(`${style.text} ${yearText} ${owner}`)}" />`;
  const phonogramLine = media.phonogram ? `℗ ${yearText} ${owner}.${tail}` : "";

  const notes = [
    "Copyright exists automatically on creation under the Berne Convention — a notice is not what creates the right.",
    "A notice on published copies still matters in the US: it removes an innocent-infringement plea in mitigation of damages under 17 U.S.C. §401(d).",
    media.placement,
  ];

  if (phraseKey === "all") {
    notes.push("'All rights reserved' comes from the 1910 Buenos Aires Convention and has no legal effect today — it is convention, not requirement.");
  }
  if (showRange) {
    notes.push("A year range is a publishing convention for continuously updated works. The statutory element is the year of first publication, which is the first number in the range.");
  }
  if (media.phonogram) {
    notes.push("Use ℗ for the sound recording itself and © for the artwork, sleeve notes and underlying composition — they are separate copyrights with separate owners.");
  }
  if (phraseKey.startsWith("cc")) {
    notes.push("A Creative Commons licence sits on top of your copyright; you still own the work, you are just granting permissions in advance. CC licences are not revocable once granted.");
  }
  if (mediaKey === "software") {
    notes.push("A notice is not a licence. Without a LICENSE file granting permissions, the default position is that nobody may copy, modify or redistribute your code.");
  }

  return {
    plain,
    html,
    markdown,
    sourceComment,
    metaTag,
    phonogramLine,
    yearText,
    showRange,
    owner,
    notes,
    placement: media.placement,
    licenseUrl: phrase.url || "",
  };
}

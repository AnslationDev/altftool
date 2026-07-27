/**
 * Stock photo / Creative Commons attribution builder.
 *
 * Rules encoded here come from published licence text and platform credit guidance:
 *  - Creative Commons recommends the TASL pattern: Title, Author, Source, Licence.
 *  - CC 4.0 licence text, section 3(a)(1)(B): a licensee must indicate if the work was
 *    modified and retain an indication of previous modifications.
 *  - CC0 1.0 and the Public Domain Mark 1.0 impose no attribution obligation; a credit
 *    line is courtesy only.
 *  - Platform credit wording follows the phrasing each service publishes for its own
 *    contributors (Unsplash, Pexels, Pixabay, Adobe Stock) and the editorial credit
 *    format used by wire/editorial libraries (Shutterstock, Getty Images).
 *
 * Nothing here is legal advice; a licence page always overrides a generated string.
 */

/** Licence catalogue. `url` values are the canonical deed URLs published by Creative Commons. */
export const LICENSES = {
  "cc-by-4.0": {
    code: "CC BY 4.0",
    name: "Creative Commons Attribution 4.0 International",
    url: "https://creativecommons.org/licenses/by/4.0/",
    attributionRequired: true,
    commercial: true,
    derivatives: true,
    shareAlike: false,
    publicDomain: false,
  },
  "cc-by-sa-4.0": {
    code: "CC BY-SA 4.0",
    name: "Creative Commons Attribution-ShareAlike 4.0 International",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
    attributionRequired: true,
    commercial: true,
    derivatives: true,
    shareAlike: true,
    publicDomain: false,
  },
  "cc-by-nd-4.0": {
    code: "CC BY-ND 4.0",
    name: "Creative Commons Attribution-NoDerivatives 4.0 International",
    url: "https://creativecommons.org/licenses/by-nd/4.0/",
    attributionRequired: true,
    commercial: true,
    derivatives: false,
    shareAlike: false,
    publicDomain: false,
  },
  "cc-by-nc-4.0": {
    code: "CC BY-NC 4.0",
    name: "Creative Commons Attribution-NonCommercial 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
    attributionRequired: true,
    commercial: false,
    derivatives: true,
    shareAlike: false,
    publicDomain: false,
  },
  "cc-by-nc-sa-4.0": {
    code: "CC BY-NC-SA 4.0",
    name: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    attributionRequired: true,
    commercial: false,
    derivatives: true,
    shareAlike: true,
    publicDomain: false,
  },
  "cc-by-nc-nd-4.0": {
    code: "CC BY-NC-ND 4.0",
    name: "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    attributionRequired: true,
    commercial: false,
    derivatives: false,
    shareAlike: false,
    publicDomain: false,
  },
  // 2.0 is still the licence stamped on a large share of older Flickr uploads.
  "cc-by-2.0": {
    code: "CC BY 2.0",
    name: "Creative Commons Attribution 2.0 Generic",
    url: "https://creativecommons.org/licenses/by/2.0/",
    attributionRequired: true,
    commercial: true,
    derivatives: true,
    shareAlike: false,
    publicDomain: false,
  },
  "cc-by-sa-2.0": {
    code: "CC BY-SA 2.0",
    name: "Creative Commons Attribution-ShareAlike 2.0 Generic",
    url: "https://creativecommons.org/licenses/by-sa/2.0/",
    attributionRequired: true,
    commercial: true,
    derivatives: true,
    shareAlike: true,
    publicDomain: false,
  },
  "cc0-1.0": {
    code: "CC0 1.0",
    name: "CC0 1.0 Universal Public Domain Dedication",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    attributionRequired: false,
    commercial: true,
    derivatives: true,
    shareAlike: false,
    publicDomain: true,
  },
  "pdm-1.0": {
    code: "Public Domain Mark 1.0",
    name: "Public Domain Mark 1.0",
    url: "https://creativecommons.org/publicdomain/mark/1.0/",
    attributionRequired: false,
    commercial: true,
    derivatives: true,
    shareAlike: false,
    publicDomain: true,
  },
  "stock-standard": {
    code: "Standard stock licence",
    name: "Standard royalty-free stock licence (not Creative Commons)",
    url: "",
    attributionRequired: false,
    commercial: true,
    derivatives: true,
    shareAlike: false,
    publicDomain: false,
  },
};

/**
 * Credit styles.
 *  - style "cc"      -> full TASL sentence, licence named in the line.
 *  - style "pattern" -> the short house format the platform publishes.
 * `creditRequired` records whether the platform itself asks for a credit line even when
 * the licence does not.
 */
export const PLATFORMS = {
  generic: {
    label: "Generic / Creative Commons (TASL)",
    style: "cc",
    creditRequired: "licence",
    needsAuthor: false,
    sourceName: "",
    sourceUrl: "",
    note: "Full Title-Author-Source-Licence sentence recommended by Creative Commons.",
  },
  flickr: {
    label: "Flickr (Creative Commons)",
    style: "cc",
    creditRequired: "licence",
    needsAuthor: false,
    sourceName: "Flickr",
    sourceUrl: "https://www.flickr.com/",
    note: "Most CC photos on Flickr carry a 2.0 licence — check the sidebar before assuming 4.0.",
  },
  wikimedia: {
    label: "Wikimedia Commons",
    style: "cc",
    creditRequired: "licence",
    needsAuthor: false,
    sourceName: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/",
    note: "Copy the author string exactly as it appears in the file's licensing box.",
  },
  unsplash: {
    label: "Unsplash",
    style: "pattern",
    pattern: "Photo by {author} on {source}",
    creditRequired: "courtesy",
    needsAuthor: true,
    sourceName: "Unsplash",
    sourceUrl: "https://unsplash.com/",
    note: "The Unsplash licence does not force a credit, but the published guideline is this exact wording with both names linked.",
  },
  pexels: {
    label: "Pexels",
    style: "pattern",
    pattern: "Photo by {author} from {source}",
    creditRequired: "courtesy",
    needsAuthor: true,
    sourceName: "Pexels",
    sourceUrl: "https://www.pexels.com/",
    note: "Credit is optional under the Pexels licence and appreciated by contributors.",
  },
  pixabay: {
    label: "Pixabay",
    style: "pattern",
    pattern: "Image by {author} from {source}",
    creditRequired: "courtesy",
    needsAuthor: true,
    sourceName: "Pixabay",
    sourceUrl: "https://pixabay.com/",
    note: "The Pixabay Content Licence does not require attribution; this is the courtesy format.",
  },
  adobe: {
    label: "Adobe Stock",
    style: "pattern",
    pattern: "© {author} / {source}",
    creditRequired: "required",
    needsAuthor: true,
    sourceName: "stock.adobe.com",
    sourceUrl: "https://stock.adobe.com/",
    note: "Editorial assets must carry the contributor credit next to the image.",
  },
  shutterstock: {
    label: "Shutterstock (editorial)",
    style: "pattern",
    pattern: "{author} / {source}",
    creditRequired: "required",
    needsAuthor: true,
    sourceName: "Shutterstock.com",
    sourceUrl: "https://www.shutterstock.com/",
    editorialOnly: true,
    note: "Editorial images need the contributor credit adjacent to the image and cannot be used in advertising.",
  },
  getty: {
    label: "Getty Images (editorial)",
    style: "pattern",
    pattern: "{author} / {source}",
    creditRequired: "required",
    needsAuthor: true,
    sourceName: "Getty Images",
    sourceUrl: "https://www.gettyimages.com/",
    editorialOnly: true,
    note: "Editorial licences require the credit line and prohibit commercial or promotional use.",
  },
};

/** Only http(s) links are ever emitted, so a pasted javascript: or data: URL can never become an href. */
const SAFE_URL_PATTERN = /^https?:\/\/[^\s<>"']+$/i;

export function isSafeUrl(value) {
  return SAFE_URL_PATTERN.test(String(value ?? "").trim());
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function linkify(text, url, format) {
  const label = clean(text);
  if (!label) return "";
  if (!isSafeUrl(url)) return format === "html" ? escapeHtml(label) : label;
  const href = clean(url);
  if (format === "html") {
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }
  if (format === "markdown") return `[${label}](${href})`;
  return label;
}

function plainOrEscaped(text, format) {
  const value = clean(text);
  return format === "html" ? escapeHtml(value) : value;
}

function renderCredit(format, ctx) {
  const { platform, license, title, titleUrl, author, authorUrl, sourceName, sourceUrl, year, modified, modificationNote } = ctx;

  if (platform.style === "pattern") {
    const line = platform.pattern
      .replace("{author}", linkify(author, authorUrl, format))
      .replace("{source}", linkify(sourceName, sourceUrl, format));
    const suffix = modified
      ? ` (${plainOrEscaped(modificationNote || "modified from the original", format)})`
      : "";
    return line + suffix;
  }

  // TASL sentence.
  const subject = title ? `“${linkify(title, titleUrl, format)}”` : "Photo";
  const parts = [subject];
  if (author) parts.push(`by ${linkify(author, authorUrl, format)}`);
  if (year) parts.push(`(${plainOrEscaped(year, format)})`);
  if (sourceName) parts.push(`via ${linkify(sourceName, sourceUrl, format)}`);

  const licenseLink = license.url
    ? linkify(license.code, license.url, format)
    : plainOrEscaped(license.code, format);

  let clause;
  if (license.publicDomain) {
    clause =
      license.code === "CC0 1.0"
        ? `is dedicated to the public domain under ${licenseLink}`
        : `is marked with the ${licenseLink}`;
  } else if (license.attributionRequired) {
    clause = `is licensed under ${licenseLink}`;
  } else {
    clause = `is used under a ${licenseLink}`;
  }

  let sentence = `${parts.join(" ")} ${clause}.`;
  if (modified) {
    const note = clean(modificationNote);
    sentence += note
      ? ` Modified from the original (${plainOrEscaped(note, format)}).`
      : " Modified from the original.";
  }
  return sentence;
}

/**
 * Build a credit line in plain text, HTML and Markdown.
 * Pure: no dates, no randomness, no DOM.
 *
 * @returns {{error: string} | {plain: string, html: string, markdown: string, notes: string[],
 *   licenseCode: string, licenseUrl: string, requirement: string, ignoredUrls: string[]}}
 */
export function buildAttribution(input = {}) {
  const platformKey = clean(input.platform) || "generic";
  const licenseKey = clean(input.license) || "cc-by-4.0";

  const platform = PLATFORMS[platformKey];
  if (!platform) return { error: "Pick a source platform from the list." };

  const license = LICENSES[licenseKey];
  if (!license) return { error: "Pick a licence from the list." };

  const author = clean(input.author);
  const title = clean(input.title);
  const sourceName = clean(input.sourceName) || platform.sourceName || "";
  const sourceUrl = clean(input.sourceUrl) || (clean(input.sourceName) ? "" : platform.sourceUrl || "");
  const authorUrl = clean(input.authorUrl);
  const titleUrl = clean(input.titleUrl);
  const year = clean(input.year);
  const modified = Boolean(input.modified);
  const modificationNote = clean(input.modificationNote);

  if (platform.needsAuthor && !author) {
    return { error: `The ${platform.label} credit format needs the photographer or contributor name.` };
  }
  if (!author && !title && !sourceName) {
    return { error: "Enter at least a creator name, an image title or a source so the credit says something." };
  }
  if (year && !/^\d{4}$/.test(year)) {
    return { error: "Year should be four digits, for example 2024." };
  }

  const ctx = {
    platform,
    license,
    title,
    titleUrl,
    author,
    authorUrl,
    sourceName,
    sourceUrl,
    year,
    modified,
    modificationNote,
  };

  const notes = [];
  if (platform.note) notes.push(platform.note);

  if (license.attributionRequired && !author) {
    notes.push(`${license.code} requires crediting the creator — add the author name before publishing.`);
  }
  if (!license.derivatives && modified) {
    notes.push(
      `${license.code} is a NoDerivatives licence: publishing a cropped, recoloured or otherwise adapted version is not permitted.`,
    );
  }
  if (license.shareAlike) {
    notes.push(
      `ShareAlike: any adaptation you publish has to carry the same ${license.code} licence as the original.`,
    );
  }
  if (!license.commercial) {
    notes.push(
      `NonCommercial licence — not cleared for ads, sponsored posts, paid products or other commercial use.`,
    );
  }
  if (license.publicDomain) {
    notes.push("No attribution is legally required here, but a courtesy credit still helps readers trace the source.");
  }
  if (platform.editorialOnly) {
    notes.push("Editorial licence: the credit must sit adjacent to the image and the photo cannot be used commercially.");
  }
  if (license.attributionRequired && !modified) {
    notes.push("If you crop or edit the image later, tick 'I modified this image' — CC 4.0 requires you to say so.");
  }

  const ignoredUrls = [];
  [
    ["Title link", titleUrl],
    ["Author link", authorUrl],
    ["Source link", sourceUrl],
  ].forEach(([label, url]) => {
    if (url && !isSafeUrl(url)) ignoredUrls.push(`${label} ignored — links must start with http:// or https://`);
  });

  const requirement =
    platform.creditRequired === "required"
      ? "Credit required by the licence agreement"
      : platform.creditRequired === "courtesy"
        ? "Credit optional — courtesy format shown"
        : license.attributionRequired
          ? "Credit required by the licence"
          : "Credit optional — public domain";

  return {
    plain: renderCredit("plain", ctx),
    html: renderCredit("html", ctx),
    markdown: renderCredit("markdown", ctx),
    notes,
    ignoredUrls,
    requirement,
    licenseCode: license.code,
    licenseName: license.name,
    licenseUrl: license.url,
  };
}

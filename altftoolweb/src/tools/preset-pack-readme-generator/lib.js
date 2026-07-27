/**
 * README builder for downloadable creative packs (presets, LUTs, actions, brushes, templates).
 *
 * Install steps are the documented paths in each host application. Licence text is a plain-language
 * template of the terms creators commonly sell under — it is informational, not legal advice, and
 * the generated document says so. Anyone selling at scale should have a lawyer review the terms.
 */

/**
 * Reading speed for silent reading of English non-fiction prose. 238 words per minute is the
 * mean reported in Brysbaert's 2019 meta-analysis of reading-rate studies.
 */
export const WORDS_PER_MINUTE = 238;

export const PRODUCT_TYPES = [
  {
    id: "lightroom-classic",
    label: "Lightroom Classic presets (.xmp)",
    extension: ".xmp",
    host: "Adobe Lightroom Classic 7.3 or later",
    steps: [
      "Unzip the download somewhere you can find it again.",
      "Open Lightroom Classic and switch to the Develop module.",
      "Right-click anywhere in the Presets panel on the left and choose Import Presets.",
      "Select the .xmp files (or the whole .zip) and confirm.",
      "The pack appears as a new group in the Presets panel.",
    ],
  },
  {
    id: "lightroom-mobile",
    label: "Lightroom Mobile presets (DNG)",
    extension: ".dng",
    host: "Lightroom mobile on iOS or Android",
    steps: [
      "Save the DNG files to your camera roll or Files app.",
      "In Lightroom mobile, tap Add Photos and import the DNG files.",
      "Open one, tap the three dots at the top right and choose Create Preset.",
      "Name it, pick or create a preset group, and save.",
      "Repeat for each DNG, then delete the DNG files from your library.",
    ],
  },
  {
    id: "photoshop-actions",
    label: "Photoshop actions (.atn)",
    extension: ".atn",
    host: "Adobe Photoshop CS6 or later",
    steps: [
      "Unzip the download.",
      "In Photoshop open Window > Actions to show the Actions panel.",
      "Click the panel menu (four lines, top right) and choose Load Actions.",
      "Select the .atn file.",
      "Expand the new action set and press Play on any action.",
    ],
  },
  {
    id: "capture-one",
    label: "Capture One styles (.costyle)",
    extension: ".costyle",
    host: "Capture One 12 or later",
    steps: [
      "Unzip the download.",
      "Open the Styles and Presets tool in the Adjustments tab.",
      "Click the three dots and choose Import Styles.",
      "Select the .costyle or .costylepack files.",
      "The pack appears under User Styles.",
    ],
  },
  {
    id: "luts",
    label: "Colour LUTs (.cube)",
    extension: ".cube",
    host: "Premiere Pro, DaVinci Resolve, Final Cut Pro and most NLEs",
    steps: [
      "Unzip the download.",
      "Premiere Pro: open the Lumetri Color panel, expand Creative, then Look > Browse and pick a .cube file.",
      "DaVinci Resolve: Project Settings > Color Management > Open LUT Folder, copy the files in, then click Update Lists.",
      "Final Cut Pro: add the Custom LUT effect to a clip and load the .cube file.",
      "Apply on an adjustment layer so you can dial the intensity back.",
    ],
  },
  {
    id: "procreate",
    label: "Procreate brushes (.brushset)",
    extension: ".brushset",
    host: "Procreate on iPad",
    steps: [
      "Download the .brushset file to your iPad using Files, AirDrop or iCloud Drive.",
      "Tap the file and choose Procreate when asked which app should open it.",
      "The set appears at the top of the Brush Library.",
      "Drag the set down the list to reorder it.",
    ],
  },
  {
    id: "figma",
    label: "Figma file (.fig)",
    extension: ".fig",
    host: "Figma, desktop app or browser",
    steps: [
      "Unzip the download.",
      "In the Figma files dashboard, click Import and select the .fig file, or drag it onto the dashboard.",
      "Open the imported file and duplicate it into your own project before editing.",
      "Publish the styles or components to your team library if you want to reuse them.",
    ],
  },
  {
    id: "notion",
    label: "Notion template",
    extension: " (shared link)",
    host: "Notion, any plan",
    steps: [
      "Open the template link included in this download.",
      "Click Duplicate at the top right to copy it into your own workspace.",
      "Choose the workspace and parent page you want it under.",
      "Rename the page and delete the sample rows before you start.",
    ],
  },
];

export const LICENCE_TIERS = [
  {
    id: "personal",
    label: "Personal use only",
    summary: "For your own photos and projects, with no commercial use and no sharing.",
    permissions: [
      "Use on an unlimited number of your own personal photos or projects.",
      "Install on devices you personally own.",
      "Modify the settings for your own use.",
    ],
    restrictions: [
      "No use in paid client work, advertising or any revenue-generating project.",
      "No sharing, lending, uploading or redistributing the files, in whole or in part.",
      "No reselling, sublicensing or bundling the files into another product.",
      "No claiming authorship of the pack itself.",
    ],
  },
  {
    id: "commercial",
    label: "Commercial use",
    summary: "Use on paid client work and monetised content; the files themselves stay yours alone.",
    permissions: [
      "Use on unlimited personal and paid client work.",
      "Use in monetised content, advertising and printed products.",
      "Install on devices you personally own or that your business owns.",
      "Modify the settings and save your own variants.",
    ],
    restrictions: [
      "No sharing, lending, uploading or redistributing the original files.",
      "No reselling, sublicensing or bundling the files into another product for sale.",
      "No distributing your modified variants as a competing pack.",
      "No claiming authorship of the pack itself.",
    ],
  },
  {
    id: "extended",
    label: "Extended / team",
    summary: "Adds installation across a named team and use inside products you ship.",
    permissions: [
      "Everything in the commercial licence.",
      "Install across the seats stated at purchase, for people in your organisation.",
      "Use inside a product, service or template that you sell, provided the pack files are not the product.",
    ],
    restrictions: [
      "No distributing the raw files to anyone outside the licensed seats.",
      "No reselling, sublicensing or bundling the files as a standalone download.",
      "Seat count is fixed at purchase; extra seats need an extra licence.",
    ],
  },
];

export const SECTION_KEYS = [
  "title",
  "whats-inside",
  "requirements",
  "installation",
  "tips",
  "licence",
  "support",
  "changelog",
];

const MAX_FILE_COUNT = 5000;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Lowercase, hyphenated, filesystem-safe version of a name. */
export function toSlug(text) {
  return String(text ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Words in a block of prose, ignoring markdown punctuation-only tokens. */
export function countWords(text) {
  const matches = String(text ?? "").match(/[A-Za-z0-9'’-]+/g);
  return matches ? matches.length : 0;
}

/** Estimated silent reading time in minutes at WORDS_PER_MINUTE. */
export function readingMinutes(words) {
  if (!Number.isFinite(words) || words <= 0) return 0;
  return round(words / WORDS_PER_MINUTE, 2);
}

/**
 * Build the README.
 * @returns {{ markdown: string, ... }} or { error } when required fields are missing.
 */
export function buildReadme(options = {}) {
  const {
    packName = "",
    creator = "",
    version = "1.0",
    productTypeId = "lightroom-classic",
    fileCount = 20,
    licenceId = "commercial",
    supportEmail = "",
    websiteUrl = "",
    purchaseNote = "",
    includeChangelog = true,
    year = 2026,
  } = options;

  const name = String(packName ?? "").trim();
  if (name === "") return { error: "Give the pack a name — it becomes the title of the README." };
  if (name.length > 120) return { error: "Pack name is over 120 characters; shorten it for the title." };

  const author = String(creator ?? "").trim();
  if (author === "") return { error: "Add the creator or studio name so the licence has a rights holder." };

  const count = Number(fileCount);
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 1 || count > MAX_FILE_COUNT) {
    return { error: `File count must be a whole number between 1 and ${MAX_FILE_COUNT}.` };
  }

  const yearNumber = Number(year);
  if (!Number.isFinite(yearNumber) || yearNumber < 1990 || yearNumber > 2200) {
    return { error: "Copyright year must be a sensible four-digit year." };
  }

  const product = PRODUCT_TYPES.find((item) => item.id === productTypeId) || PRODUCT_TYPES[0];
  const licence = LICENCE_TIERS.find((item) => item.id === licenceId) || LICENCE_TIERS[1];

  const slug = toSlug(name) || "preset-pack";
  const zipName = `${slug}-v${String(version).trim() || "1.0"}.zip`;

  const lines = [];
  lines.push(`# ${name}`);
  lines.push("");
  lines.push(`Version ${String(version).trim() || "1.0"} · by ${author}`);
  lines.push("");
  lines.push(`Thanks for downloading ${name}. Everything you need to install and use the pack is below.`);
  lines.push("");

  lines.push("## What's inside");
  lines.push("");
  lines.push(`- ${count} ${product.label.replace(/ \(.*\)$/, "").toLowerCase()}${count === 1 ? "" : ""}`);
  lines.push(`- Delivered as \`${zipName}\``);
  lines.push(`- File type: \`${product.extension}\``);
  if (purchaseNote.trim()) lines.push(`- ${purchaseNote.trim()}`);
  lines.push("");

  lines.push("## Requirements");
  lines.push("");
  lines.push(`- ${product.host}`);
  lines.push("- Enough disk space to unzip the download before installing");
  lines.push("- A desktop computer for the unzip step, if you bought a mobile pack");
  lines.push("");

  lines.push("## Installation");
  lines.push("");
  product.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  lines.push("");

  lines.push("## Getting the best results");
  lines.push("");
  lines.push("- Start from a correctly exposed, white-balanced file; a preset is a starting point, not a rescue.");
  lines.push("- Adjust exposure and white balance after applying, not before.");
  lines.push("- Dial the strength back if the look fights the subject — most packs are built slightly strong on purpose.");
  lines.push("- Save your own variant once you have tuned it for a particular camera or lighting setup.");
  lines.push("");

  lines.push("## Licence");
  lines.push("");
  lines.push(`**${licence.label}.** ${licence.summary}`);
  lines.push("");
  lines.push("You may:");
  lines.push("");
  for (const item of licence.permissions) lines.push(`- ${item}`);
  lines.push("");
  lines.push("Not permitted:");
  lines.push("");
  for (const item of licence.restrictions) lines.push(`- ${item}`);
  lines.push("");
  lines.push(
    `© ${yearNumber} ${author}. All rights reserved. This licence is granted to the original purchaser and is not transferable.`,
  );
  lines.push("");
  lines.push(
    "This summary is provided for convenience and is not legal advice. If the pack is a significant part of your business, have a lawyer draft or review your terms.",
  );
  lines.push("");

  lines.push("## Support");
  lines.push("");
  if (supportEmail.trim()) lines.push(`- Email: ${supportEmail.trim()}`);
  if (websiteUrl.trim()) lines.push(`- Web: ${websiteUrl.trim()}`);
  lines.push("- Include your order number and the app version you are using so we can help faster.");
  lines.push("- Installation problems are almost always a missing unzip step — try that first.");
  lines.push("");

  if (includeChangelog) {
    lines.push("## Changelog");
    lines.push("");
    lines.push(`### ${String(version).trim() || "1.0"}`);
    lines.push("");
    lines.push("- First public release.");
    lines.push("");
  }

  const markdown = lines.join("\n").trimEnd();
  const plainText = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

  const words = countWords(plainText);
  const headings = markdown.match(/^##\s+.+$/gm) || [];

  const warnings = [];
  if (!supportEmail.trim() && !websiteUrl.trim()) {
    warnings.push(
      "No support email or website was given. Marketplaces such as Etsy and Gumroad expect a contact route, and buyers who cannot reach you leave refund requests instead.",
    );
  }
  if (licence.id === "personal") {
    warnings.push(
      "A personal-use licence blocks client work entirely. Most buyers of photo packs are freelancers, so consider offering a commercial tier alongside it.",
    );
  }
  if (!includeChangelog) {
    warnings.push(
      "Without a changelog, buyers of a later version cannot tell what changed and will ask you directly.",
    );
  }
  if (count > 200) {
    warnings.push(
      `${count} files is a lot to install one at a time. Group them into folders inside the zip and say in the readme which folder to start with.`,
    );
  }

  return {
    markdown,
    plainText,
    zipName,
    slug,
    productLabel: product.label,
    licenceLabel: licence.label,
    stepCount: product.steps.length,
    sectionCount: headings.length,
    sections: headings.map((heading) => heading.replace(/^##\s+/, "")),
    characterCount: markdown.length,
    wordCount: words,
    readingMinutes: readingMinutes(words),
    warnings,
  };
}

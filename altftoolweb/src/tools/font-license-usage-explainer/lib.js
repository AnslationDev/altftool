/**
 * Font licence usage rules.
 *
 * The licence families below are the standard split used across commercial font
 * EULAs (Monotype/MyFonts, Fontspring, Adobe, Type Network and most independent
 * foundries): a Desktop licence buys installation on workstations, and every
 * other channel — web, app, ePub, server, broadcast — is sold as a separate
 * licence. The two open licences are the SIL Open Font Licence 1.1 (the licence
 * behind most Google Fonts families) and Apache License 2.0.
 *
 * Nothing here is legal advice and no EULA is identical. Statuses marked
 * "depends" are the clauses that genuinely differ between foundries — those are
 * the ones worth reading in your own licence file.
 */

/** Status values a single activity can resolve to. */
export const STATUS = {
  ALLOWED: "allowed",
  DEPENDS: "depends",
  BLOCKED: "blocked",
};

/**
 * Licence families. `metric` is the unit foundries meter that licence in;
 * `unlimited: true` means the licence is not metered at all.
 */
export const LICENCE_TYPES = [
  {
    id: "desktop",
    name: "Desktop licence",
    blurb:
      "Installs the font file on workstations so designers can set type in Illustrator, InDesign, Figma desktop, Word and so on.",
    metric: "workstations (seats)",
    unlimited: false,
  },
  {
    id: "webfont",
    name: "Webfont licence",
    blurb:
      "Self-hosted WOFF/WOFF2 served with @font-face. Almost always metered by monthly pageviews and tied to named domains.",
    metric: "monthly pageviews",
    unlimited: false,
  },
  {
    id: "app",
    name: "App licence",
    blurb:
      "Embeds the font inside an iOS, Android or desktop application binary. Usually sold per application title, sometimes per platform.",
    metric: "application titles",
    unlimited: false,
  },
  {
    id: "ebook",
    name: "ePub / eBook licence",
    blurb:
      "Embeds the font in an EPUB, Kindle or fixed-layout digital book. Normally sold per title, occasionally per print-run equivalent.",
    metric: "book titles",
    unlimited: false,
  },
  {
    id: "server",
    name: "Server licence",
    blurb:
      "Installs the font on a server that renders output on demand — PDF generation, personalisation engines, print-on-demand previews.",
    metric: "servers",
    unlimited: false,
  },
  {
    id: "broadcast",
    name: "Broadcast / OTT licence",
    blurb:
      "Covers type burned into film, TV, streaming or paid video advertising. Usually priced against production budget or audience size.",
    metric: "productions",
    unlimited: false,
  },
  {
    id: "ofl",
    name: "SIL Open Font Licence 1.1",
    blurb:
      "Free for any use including commercial. Derivatives must stay under the OFL, a Reserved Font Name must be changed, and the font cannot be sold on its own.",
    metric: "unlimited",
    unlimited: true,
  },
  {
    id: "apache",
    name: "Apache License 2.0",
    blurb:
      "Permissive open licence used by several Google-commissioned families. Use, modify and redistribute freely, keeping the licence text and NOTICE file.",
    metric: "unlimited",
    unlimited: true,
  },
];

/** The things people actually want to do with a font. */
export const ACTIVITIES = [
  {
    id: "desktop-artwork",
    name: "Set type in design software",
    detail: "Posters, packaging, decks and social artwork made on a designer's machine.",
  },
  {
    id: "logo",
    name: "Draw a logo or wordmark from the outlines",
    detail: "Converting glyphs to paths for a permanent brand mark, and filing it as a trade mark.",
  },
  {
    id: "pdf-print",
    name: "Send a print-ready PDF to a printer",
    detail: "Font embedded in the PDF for output only.",
  },
  {
    id: "pdf-public",
    name: "Publish a downloadable PDF",
    detail: "A brochure or report on your website with the font embedded.",
  },
  {
    id: "webfont",
    name: "Use @font-face on a public website",
    detail: "WOFF2 served from your own domain or CDN.",
  },
  {
    id: "web-app",
    name: "Use it in a web app behind a login",
    detail: "A SaaS dashboard or intranet where pageviews are hard to count.",
  },
  {
    id: "mobile-app",
    name: "Embed it in a mobile or desktop app",
    detail: "Font file shipped inside the .ipa, .apk or installer.",
  },
  {
    id: "ebook",
    name: "Embed it in an EPUB or Kindle title",
    detail: "Font packaged inside the eBook container.",
  },
  {
    id: "server",
    name: "Install it on a server that renders on demand",
    detail: "Automated PDF, certificate or personalised-image generation.",
  },
  {
    id: "broadcast",
    name: "Burn it into video, TV or a paid ad",
    detail: "Titles and lower thirds in film, streaming or advertising.",
  },
  {
    id: "merch",
    name: "Put the typeface on products you sell",
    detail: "T-shirts, mugs, prints and templates sold to the public.",
  },
  {
    id: "share-file",
    name: "Send the font file to a freelancer or printer",
    detail: "Handing the actual .otf/.woff2 to someone outside your licence.",
  },
  {
    id: "modify",
    name: "Modify the outlines and keep using it",
    detail: "Editing glyphs, changing metrics or subsetting beyond what the tooling does automatically.",
  },
  {
    id: "redistribute",
    name: "Redistribute or resell the font file itself",
    detail: "Bundling it in a template you sell, or putting it up for download.",
  },
];

/**
 * Which licence family normally covers each activity. Used to tell you what to
 * go and buy when an activity is blocked. `null` means no separate licence
 * exists — it is a clause inside whichever licence you already hold.
 */
export const ACTIVITY_LICENCE = {
  "desktop-artwork": "desktop",
  logo: "desktop",
  "pdf-print": "desktop",
  "pdf-public": "desktop",
  webfont: "webfont",
  "web-app": "webfont",
  "mobile-app": "app",
  ebook: "ebook",
  server: "server",
  broadcast: "broadcast",
  merch: "desktop",
  "share-file": null,
  modify: null,
  redistribute: null,
};

const A = STATUS.ALLOWED;
const D = STATUS.DEPENDS;
const B = STATUS.BLOCKED;

/** PERMISSIONS[licenceId][activityId] */
export const PERMISSIONS = {
  desktop: {
    "desktop-artwork": A,
    logo: D,
    "pdf-print": A,
    "pdf-public": D,
    webfont: B,
    "web-app": B,
    "mobile-app": B,
    ebook: B,
    server: B,
    broadcast: D,
    merch: D,
    "share-file": D,
    modify: D,
    redistribute: B,
  },
  webfont: {
    "desktop-artwork": B,
    logo: B,
    "pdf-print": B,
    "pdf-public": B,
    webfont: A,
    "web-app": D,
    "mobile-app": B,
    ebook: B,
    server: B,
    broadcast: B,
    merch: B,
    "share-file": D,
    modify: B,
    redistribute: B,
  },
  app: {
    "desktop-artwork": B,
    logo: B,
    "pdf-print": B,
    "pdf-public": B,
    webfont: B,
    "web-app": B,
    "mobile-app": A,
    ebook: B,
    server: B,
    broadcast: B,
    merch: B,
    "share-file": D,
    modify: B,
    redistribute: B,
  },
  ebook: {
    "desktop-artwork": B,
    logo: B,
    "pdf-print": B,
    "pdf-public": D,
    webfont: B,
    "web-app": B,
    "mobile-app": B,
    ebook: A,
    server: B,
    broadcast: B,
    merch: B,
    "share-file": D,
    modify: B,
    redistribute: B,
  },
  server: {
    "desktop-artwork": B,
    logo: B,
    "pdf-print": D,
    "pdf-public": D,
    webfont: B,
    "web-app": D,
    "mobile-app": B,
    ebook: B,
    server: A,
    broadcast: B,
    merch: B,
    "share-file": D,
    modify: B,
    redistribute: B,
  },
  broadcast: {
    "desktop-artwork": D,
    logo: B,
    "pdf-print": B,
    "pdf-public": B,
    webfont: B,
    "web-app": B,
    "mobile-app": B,
    ebook: B,
    server: B,
    broadcast: A,
    merch: B,
    "share-file": D,
    modify: B,
    redistribute: B,
  },
  ofl: {
    "desktop-artwork": A,
    logo: A,
    "pdf-print": A,
    "pdf-public": A,
    webfont: A,
    "web-app": A,
    "mobile-app": A,
    ebook: A,
    server: A,
    broadcast: A,
    merch: A,
    "share-file": A,
    modify: D,
    redistribute: D,
  },
  apache: {
    "desktop-artwork": A,
    logo: A,
    "pdf-print": A,
    "pdf-public": A,
    webfont: A,
    "web-app": A,
    "mobile-app": A,
    ebook: A,
    server: A,
    broadcast: A,
    merch: A,
    "share-file": A,
    modify: A,
    redistribute: A,
  },
};

/** Clause-level notes for the answers that are not a plain yes or no. */
export const NOTES = {
  "desktop:logo":
    "Most desktop EULAs allow a logo drawn from the outlines, but several foundries require an extended or logo licence once company turnover passes a stated threshold. Check the clause before you file a trade mark.",
  "desktop:pdf-public":
    "Embedding for viewing and printing is normally fine; embedding in an editable or extractable form usually is not. Some EULAs treat a public PDF as electronic publishing and want an ePub licence.",
  "desktop:broadcast":
    "Static artwork is covered. Type animated into film, TV or paid video is usually a separate broadcast licence, often only above an audience or budget threshold.",
  "desktop:merch":
    "Selling the typeface as the product — a print of the alphabet, a template, a font-led t-shirt — commonly needs an extended or merchandising licence.",
  "desktop:share-file":
    "Sending one copy to a service bureau purely to output your job is allowed by most EULAs, on condition they delete it afterwards. A freelancer who designs with it needs their own seat.",
  "desktop:modify":
    "Many EULAs forbid modification without written permission; others allow it for your own use only. Derivatives always stay bound by the original licence.",
  "webfont:web-app":
    "Logged-in pages still count as web use, but pageview metering breaks down. Ask the foundry for an app or unlimited-pageview tier rather than guessing.",
  "webfont:share-file":
    "You can normally hand the WOFF2 to the developer building that specific licensed site, and nowhere else.",
  "server:pdf-print":
    "Fine when the PDF is produced by the licensed server. A designer laying out that PDF by hand needs a desktop seat.",
  "server:pdf-public":
    "Covered when the licensed server generates the file; distributing the font itself is still prohibited.",
  "server:web-app":
    "Server-side rendering of images is covered. Sending the font to the browser with @font-face is web use and needs a webfont licence.",
  "broadcast:desktop-artwork":
    "Broadcast licences are usually sold as an add-on, so you still need a desktop seat for whoever opens the font in After Effects or Premiere.",
  "app:share-file":
    "The developers building the licensed app can hold a copy; anyone designing with it needs a desktop seat.",
  "ebook:pdf-public":
    "A fixed-layout PDF edition of the licensed title is normally included. An unrelated marketing PDF is not.",
  "ebook:share-file":
    "The production house typesetting the licensed title can hold a copy for that job only.",
  "ofl:modify":
    "The OFL allows modification, but if the family carries a Reserved Font Name you must rename your version, and the derivative must stay under the OFL.",
  "ofl:redistribute":
    "You may bundle and redistribute the font, including inside a commercial product. You may not sell the font on its own.",
  "webfont:modify":
    "Subsetting for delivery is normally allowed; editing outlines is not.",
};

const NO_SEPARATE_LICENCE_NOTE = {
  "share-file":
    "There is no licence you can buy for this. Each person or machine that uses the font needs to be covered by a seat of their own.",
  modify:
    "Modification is a clause in your licence, not a product. Ask the foundry in writing if the EULA is silent.",
  redistribute:
    "No commercial EULA lets you pass the font file on. Point people at the foundry instead.",
};

const licenceById = (id) => LICENCE_TYPES.find((item) => item.id === id) || null;
const activityById = (id) => ACTIVITIES.find((item) => item.id === id) || null;

/**
 * Evaluate a set of intended uses against one licence.
 *
 * @param {object} input
 * @param {string} input.licence        licence id from LICENCE_TYPES
 * @param {string[]} input.activities   activity ids from ACTIVITIES
 * @param {number} input.licensedUnits  units you have bought (seats, pageviews, titles...)
 * @param {number} input.neededUnits    units you actually need
 * @returns {object} verdicts, gaps and capacity — or { error }
 */
export function evaluateFontUsage({
  licence,
  activities = [],
  licensedUnits = 0,
  neededUnits = 0,
} = {}) {
  const licenceInfo = licenceById(licence);
  if (!licenceInfo) {
    return { error: "Choose one of the listed licence types." };
  }

  const chosen = (Array.isArray(activities) ? activities : [])
    .map((id) => activityById(id))
    .filter(Boolean);

  if (chosen.length === 0) {
    return { error: "Tick at least one thing you plan to do with the font." };
  }

  const table = PERMISSIONS[licenceInfo.id];
  const verdicts = chosen.map((activity) => {
    const status = table[activity.id] || STATUS.BLOCKED;
    const needsId = ACTIVITY_LICENCE[activity.id];
    const needs = needsId && needsId !== licenceInfo.id ? licenceById(needsId) : null;
    let note = NOTES[`${licenceInfo.id}:${activity.id}`] || "";
    if (!note && status === STATUS.BLOCKED) {
      note = needs
        ? `Not covered by a ${licenceInfo.name.toLowerCase()}. This is what a ${needs.name.toLowerCase()} is for.`
        : NO_SEPARATE_LICENCE_NOTE[activity.id] || "Not covered by this licence.";
    }
    if (!note && status === STATUS.ALLOWED) {
      note = "Covered by this licence as written in the standard EULA.";
    }
    return {
      id: activity.id,
      name: activity.name,
      detail: activity.detail,
      status,
      note,
      needsLicenceId: status === STATUS.BLOCKED && needs ? needs.id : null,
      needsLicenceName: status === STATUS.BLOCKED && needs ? needs.name : null,
    };
  });

  const allowedCount = verdicts.filter((v) => v.status === STATUS.ALLOWED).length;
  const dependsCount = verdicts.filter((v) => v.status === STATUS.DEPENDS).length;
  const blockedCount = verdicts.filter((v) => v.status === STATUS.BLOCKED).length;

  const extraLicences = [];
  verdicts.forEach((v) => {
    if (v.needsLicenceId && !extraLicences.some((l) => l.id === v.needsLicenceId)) {
      const info = licenceById(v.needsLicenceId);
      if (info) extraLicences.push({ id: info.id, name: info.name, metric: info.metric });
    }
  });

  const licensed = Number(licensedUnits);
  const needed = Number(neededUnits);
  if (!Number.isFinite(licensed) || !Number.isFinite(needed)) {
    return { error: "Licence quantities must be numbers." };
  }
  if (licensed < 0 || needed < 0) {
    return { error: "Licence quantities cannot be negative." };
  }

  const capacity = licenceInfo.unlimited
    ? {
        unlimited: true,
        metric: licenceInfo.metric,
        licensed: 0,
        needed: 0,
        shortfall: 0,
      }
    : {
        unlimited: false,
        metric: licenceInfo.metric,
        licensed,
        needed,
        shortfall: Math.max(0, needed - licensed),
      };

  return {
    licence: {
      id: licenceInfo.id,
      name: licenceInfo.name,
      blurb: licenceInfo.blurb,
      metric: licenceInfo.metric,
      unlimited: licenceInfo.unlimited,
    },
    verdicts,
    allowedCount,
    dependsCount,
    blockedCount,
    totalChecked: verdicts.length,
    extraLicences,
    capacity,
  };
}

/**
 * Font licence coverage checker.
 *
 * Type licensing is sold as separate *use categories*, not as one blanket right.
 * A retail foundry EULA normally covers Desktop only; Webfont, App, ePublication,
 * Server and (sometimes) Broadcast are sold as add-ons, each metered by a different
 * unit — workstations, monthly pageviews, application titles or servers.
 *
 * Open licences work differently: the SIL Open Font License 1.1 grants every use
 * category at once but forbids selling the font files on their own and requires
 * derivatives to stay under the OFL and to drop any Reserved Font Name. Apache
 * License 2.0 (used by a large part of the Google Fonts catalogue) grants all uses
 * including sale, subject to keeping the copyright and NOTICE material and stating
 * changes, and expressly grants no trademark rights.
 *
 * Nothing here is legal advice; the licence file that shipped with your font wins.
 */

export const VERDICT = Object.freeze({
  PERMITTED: "permitted",
  CONDITIONAL: "conditional",
  SEPARATE: "separate",
  PROHIBITED: "prohibited",
  UNCLEAR: "unclear",
});

export const VERDICT_LABEL = Object.freeze({
  permitted: "Covered",
  conditional: "Covered, with conditions",
  separate: "Needs a separate licence",
  prohibited: "Not permitted",
  unclear: "Read your EULA",
});

/** The unit each add-on licence is normally metered in. */
export const METER = Object.freeze({
  WORKSTATIONS: "workstations",
  PAGEVIEWS: "pageviews",
  TITLES: "titles",
  SERVERS: "servers",
  NONE: "none",
});

/** Every use category a font EULA normally distinguishes. */
export const USE_CASES = Object.freeze([
  { id: "desktop-design", label: "Install on designers' machines", meter: METER.WORKSTATIONS },
  { id: "print-output", label: "Print collateral, packaging, signage", meter: METER.NONE },
  { id: "static-image-export", label: "Rasterised text in images and social posts", meter: METER.NONE },
  { id: "webfont-selfhost", label: "Self-hosted @font-face on your website", meter: METER.PAGEVIEWS },
  { id: "webfont-cdn", label: "Served through a hosted font CDN", meter: METER.PAGEVIEWS },
  { id: "app-embed", label: "Embedded in a mobile or desktop app binary", meter: METER.TITLES },
  { id: "epub", label: "Embedded in an ebook or ePub", meter: METER.TITLES },
  { id: "pdf-embed", label: "Subset embedded in a PDF you distribute", meter: METER.NONE },
  { id: "server-render", label: "Rendered on a server or through an API", meter: METER.SERVERS },
  { id: "broadcast-video", label: "Titles and graphics in film, TV or streaming video", meter: METER.NONE },
  { id: "logo-trademark", label: "Letterforms inside a logo you will trademark", meter: METER.NONE },
  { id: "share-with-client", label: "Hand the font files to a client or contractor", meter: METER.WORKSTATIONS },
  { id: "modify", label: "Modify or extend the outlines", meter: METER.NONE },
  { id: "redistribute-sell", label: "Redistribute or sell the font files themselves", meter: METER.NONE },
]);

const P = VERDICT.PERMITTED;
const C = VERDICT.CONDITIONAL;
const S = VERDICT.SEPARATE;
const X = VERDICT.PROHIBITED;
const U = VERDICT.UNCLEAR;

/** Licence families and their per-use-category outcome. */
export const LICENCE_FAMILIES = Object.freeze({
  "ofl-1-1": {
    id: "ofl-1-1",
    name: "SIL Open Font License 1.1",
    summary:
      "Free for any use including commercial, in any medium. The font files may not be sold on their own, derivatives must stay under the OFL, and a Reserved Font Name may not be reused.",
    rules: {
      "desktop-design": [P, "No seat limit — install on as many machines as you need."],
      "print-output": [P, "No print run or impression limits."],
      "static-image-export": [P, "Rasterised output is unrestricted."],
      "webfont-selfhost": [P, "No pageview metering; ship the licence text with the files."],
      "webfont-cdn": [P, "Hosting through a third-party CDN is allowed."],
      "app-embed": [P, "You may bundle the font in an app you sell; the app is the product, not the font."],
      "epub": [P, "Embedding in ebooks is allowed with no per-title fee."],
      "pdf-embed": [P, "Full or subset embedding is allowed."],
      "server-render": [P, "Server-side rendering needs no extra licence."],
      "broadcast-video": [P, "Broadcast and streaming use is allowed with no audience cap."],
      "logo-trademark": [
        C,
        "The OFL permits it, but trademark registrability is a separate legal question — take advice before filing.",
      ],
      "share-with-client": [C, "Allowed, provided the copyright notice and full licence text travel with the files."],
      "modify": [
        C,
        "Allowed, but the derivative must be released under the OFL and must not carry any Reserved Font Name.",
      ],
      "redistribute-sell": [
        C,
        "You may redistribute freely, and bundle it inside something you sell, but you may not sell the font files by themselves.",
      ],
    },
  },
  "apache-2-0": {
    id: "apache-2-0",
    name: "Apache License 2.0",
    summary:
      "A permissive software licence used by much of the Google Fonts catalogue. Every use is granted, including sale, if you keep the copyright and NOTICE material and state your changes. No trademark rights are granted.",
    rules: {
      "desktop-design": [P, "No seat limit."],
      "print-output": [P, "No restriction on printed output."],
      "static-image-export": [P, "Rasterised output is unrestricted."],
      "webfont-selfhost": [P, "No pageview metering."],
      "webfont-cdn": [P, "Third-party hosting is allowed."],
      "app-embed": [C, "Allowed; include the licence and any NOTICE file in your app's legal screen."],
      "epub": [P, "Embedding in ebooks is allowed."],
      "pdf-embed": [P, "Full or subset embedding is allowed."],
      "server-render": [P, "No server licence needed."],
      "broadcast-video": [P, "No broadcast restriction."],
      "logo-trademark": [
        C,
        "Apache 2.0 grants no trademark rights, and the font's own name and marks stay with the owner — take advice before filing.",
      ],
      "share-with-client": [C, "Allowed with the licence and NOTICE attached."],
      "modify": [C, "Allowed, but modified files must carry prominent notices stating that you changed them."],
      "redistribute-sell": [C, "Allowed, including for a fee, with the licence, NOTICE and attribution intact."],
    },
  },
  "commercial-retail": {
    id: "commercial-retail",
    name: "Commercial retail EULA (desktop licence held)",
    summary:
      "The typical foundry or marketplace licence. Your base purchase is a per-workstation Desktop licence; web, app, ePub and server use are sold separately and modification and redistribution are normally forbidden.",
    rules: {
      "desktop-design": [
        P,
        "This is what the desktop licence buys. It is counted per installed workstation, not per person — base retail licences commonly cover between one and five.",
      ],
      "print-output": [P, "Printed output from a licensed workstation is normally unlimited."],
      "static-image-export": [P, "Flattened, non-editable raster output is normally covered by the desktop licence."],
      "webfont-selfhost": [S, "Buy a Webfont licence — almost always metered by monthly pageviews."],
      "webfont-cdn": [S, "A Webfont licence is still required, and some EULAs name which hosts are allowed."],
      "app-embed": [S, "Buy an App licence — usually priced per application title, sometimes per install band."],
      "epub": [S, "Buy an ePublication licence, normally priced per title."],
      "pdf-embed": [
        C,
        "Most desktop EULAs allow a subset to be embedded for viewing and printing, but not editable embedding — check the wording.",
      ],
      "server-render": [S, "On-demand or personalised rendering needs a Server licence, usually priced per server."],
      "broadcast-video": [
        U,
        "Practice varies: some foundries treat video titling as desktop use, others require a broadcast licence above an audience threshold.",
      ],
      "logo-trademark": [
        U,
        "Some foundries allow logo use outright, others sell a specific logo or trademark licence. Ask in writing before filing.",
      ],
      "share-with-client": [
        X,
        "Passing font files on is normally forbidden. The client or contractor must hold their own seats — send outlined artwork or a PDF instead.",
      ],
      "modify": [X, "Retail EULAs almost always forbid altering the outlines without written permission from the foundry."],
      "redistribute-sell": [X, "Redistributing or reselling the font files is prohibited under every retail EULA."],
    },
  },
  "custom-foundry": {
    id: "custom-foundry",
    name: "Custom or unknown foundry agreement",
    summary:
      "A bespoke, negotiated or unread agreement. Nothing can be assumed — every category has to be read out of your own contract.",
    rules: {},
  },
});

export const LICENCE_IDS = Object.freeze(Object.keys(LICENCE_FAMILIES));

const isCount = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

/**
 * Evaluate a project's intended uses against a licence family.
 *
 * @param {object} input
 * @param {string} input.licenceId       key of LICENCE_FAMILIES
 * @param {string[]} input.uses          selected USE_CASES ids
 * @param {number} [input.workstations]  machines that will have the font installed
 * @param {number} [input.monthlyPageviews] pageviews the webfont will serve per month
 * @param {number} [input.titles]        app or ebook titles the font ships inside
 * @param {number} [input.servers]       servers that will render the font on demand
 * @returns {object} verdicts, counts and metering requirements, or { error }
 */
export function evaluateFontLicence({
  licenceId,
  uses = [],
  workstations = 0,
  monthlyPageviews = 0,
  titles = 0,
  servers = 0,
} = {}) {
  const licence = LICENCE_FAMILIES[licenceId];
  if (!licence) return { error: "Choose a licence type to check against." };
  if (!Array.isArray(uses) || uses.length === 0) {
    return { error: "Select at least one way you plan to use the font." };
  }

  const known = new Set(USE_CASES.map((useCase) => useCase.id));
  const unknown = uses.filter((id) => !known.has(id));
  if (unknown.length > 0) return { error: `Unrecognised use: ${unknown[0]}.` };

  if (![workstations, monthlyPageviews, titles, servers].every(isCount)) {
    return { error: "Workstation, pageview, title and server counts cannot be negative or blank." };
  }

  const selected = new Set(uses);
  const results = USE_CASES.filter((useCase) => selected.has(useCase.id)).map((useCase) => {
    const rule = licence.rules[useCase.id];
    const [verdict, note] = rule || [
      VERDICT.UNCLEAR,
      "Not covered by a standard template — read this clause in your own agreement.",
    ];
    return {
      id: useCase.id,
      label: useCase.label,
      meter: useCase.meter,
      verdict,
      verdictLabel: VERDICT_LABEL[verdict],
      note,
    };
  });

  const counts = results.reduce(
    (acc, row) => ({ ...acc, [row.verdict]: (acc[row.verdict] || 0) + 1 }),
    { permitted: 0, conditional: 0, separate: 0, prohibited: 0, unclear: 0 },
  );

  const requirements = [];
  const usesMeter = (meter) => results.some((row) => row.meter === meter);
  if (usesMeter(METER.WORKSTATIONS)) {
    requirements.push({
      label: "Desktop seats to licence",
      value: `${workstations} workstation${workstations === 1 ? "" : "s"}`,
      note: "Count every machine the files are installed on, including freelancers and printers.",
    });
  }
  if (usesMeter(METER.PAGEVIEWS)) {
    requirements.push({
      label: "Webfont tier to cover",
      value: `${monthlyPageviews.toLocaleString("en-US")} pageviews / month`,
      note: "Webfont licences are metered on monthly pageviews across every domain you serve.",
    });
  }
  if (usesMeter(METER.TITLES)) {
    requirements.push({
      label: "App or ebook titles",
      value: `${titles} title${titles === 1 ? "" : "s"}`,
      note: "App and ePub licences are normally priced per title, not per company.",
    });
  }
  if (usesMeter(METER.SERVERS)) {
    requirements.push({
      label: "Servers rendering the font",
      value: `${servers} server${servers === 1 ? "" : "s"}`,
      note: "Count every instance that generates text on demand, including autoscaled workers.",
    });
  }

  const blockers = results.filter((row) => row.verdict === VERDICT.PROHIBITED);
  const addOns = results.filter((row) => row.verdict === VERDICT.SEPARATE);
  const openQuestions = results.filter((row) => row.verdict === VERDICT.UNCLEAR);

  return {
    licence: { id: licence.id, name: licence.name, summary: licence.summary },
    results,
    counts,
    requirements,
    blockers,
    addOns,
    openQuestions,
    status: riskStatus(counts),
  };
}

/** Overall traffic-light status derived from the verdict counts. */
export function riskStatus(counts) {
  if (!counts) return { level: "unknown", headline: "Nothing checked yet" };
  if (counts.prohibited > 0) {
    return {
      level: "blocked",
      headline: `${counts.prohibited} use${counts.prohibited === 1 ? "" : "s"} not permitted`,
    };
  }
  if (counts.separate > 0) {
    return {
      level: "add-on",
      headline: `${counts.separate} add-on licence${counts.separate === 1 ? "" : "s"} needed`,
    };
  }
  if (counts.unclear > 0) {
    return {
      level: "review",
      headline: `${counts.unclear} clause${counts.unclear === 1 ? "" : "s"} to read yourself`,
    };
  }
  if (counts.conditional > 0) {
    return {
      level: "conditional",
      headline: `Covered, with ${counts.conditional} condition${counts.conditional === 1 ? "" : "s"}`,
    };
  }
  return { level: "clear", headline: "Every selected use is covered" };
}

/** Plain-text summary of an evaluation, suitable for pasting into a brief. */
export function summariseEvaluation(evaluation) {
  if (!evaluation || evaluation.error) return "";
  const lines = [
    "Font licence check",
    `Licence: ${evaluation.licence.name}`,
    `Status: ${evaluation.status.headline}`,
    "",
  ];
  evaluation.results.forEach((row) => {
    lines.push(`- ${row.label}: ${row.verdictLabel} — ${row.note}`);
  });
  if (evaluation.requirements.length > 0) {
    lines.push("", "Metering to declare when buying:");
    evaluation.requirements.forEach((req) => lines.push(`- ${req.label}: ${req.value}`));
  }
  lines.push("", "Informational only — the licence file that shipped with your font is the authority.");
  return lines.join("\n");
}

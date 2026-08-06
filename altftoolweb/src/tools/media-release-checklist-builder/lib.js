/**
 * Media release and clearance checklist.
 *
 * The rules below restate widely applied publishing practice and the legal doctrines
 * behind it. They are not legal advice and the detail varies by jurisdiction.
 *
 * Doctrines referenced:
 *  - Right of publicity / personality rights: commercial use of a recognisable person's
 *    likeness normally needs a signed model release; genuine editorial and news use
 *    normally does not. (US state publicity statutes; UK/EU privacy under Art. 8 ECHR
 *    plus UK/EU GDPR when the person is identifiable.)
 *  - Capacity to consent: a minor cannot give valid consent, so a parent or guardian signs.
 *  - Property release: recognisable private property, interiors and trade dress in
 *    advertising, on the theory of implied endorsement and trespass/contract terms of entry.
 *  - Music: two separate rights must be cleared for recorded music in audiovisual work —
 *    a synchronisation licence for the composition (publisher) and a master use licence
 *    for the recording (label). Production-library and royalty-free catalogues bundle both.
 *  - Stock licences: "editorial use only" assets exclude advertising and promotional use.
 *  - Drone operation: national aviation regulators require operator registration and
 *    authorisation for commercial flight (FAA Part 107 in the US, CAA in the UK,
 *    DGCA Digital Sky in India, EASA Open/Specific categories in the EU).
 *  - Copyright in works that appear in shot: artworks, murals, posters and in some
 *    countries buildings; freedom-of-panorama rules differ sharply by country.
 */

/** Weight given to an outstanding item when scoring residual risk. */
export const SEVERITY_WEIGHT = { required: 10, recommended: 4 };

/**
 * Risk bands, expressed as the percentage of weighted items still
 * outstanding. `tone` drives the UI colour independently of `safeToPublish`
 * so the note's colour always matches what the note actually says.
 */
export const RISK_BANDS = [
  { max: 0, label: "Cleared", tone: "success", note: "Nothing outstanding on this checklist." },
  { max: 20, label: "Low", tone: "success", note: "Only minor items left; finish them before wide release." },
  { max: 50, label: "Medium", tone: "warning", note: "Several clearances outstanding — do not publish yet." },
  { max: 100, label: "High", tone: "danger", note: "Core releases are missing. Publishing now carries real exposure." },
];

/** Distribution channels offered. */
export const CHANNEL_OPTIONS = [
  { id: "web", label: "Own website or blog" },
  { id: "social", label: "Social platforms" },
  { id: "broadcast", label: "Broadcast or OTT" },
  { id: "print", label: "Print" },
  { id: "ads", label: "Paid advertising" },
  { id: "client", label: "Client deliverable" },
];

/** How the finished piece will be used. */
export const USAGE_OPTIONS = [
  { id: "internal", label: "Internal only (never published)" },
  { id: "editorial", label: "Editorial, news or documentary" },
  { id: "commercial", label: "Commercial, marketing or advertising" },
];

/** Where the music in the piece comes from. */
export const MUSIC_OPTIONS = [
  { id: "none", label: "No music" },
  { id: "commercial", label: "Commercially released track" },
  { id: "library", label: "Production library or royalty-free" },
  { id: "original", label: "Composed for this project" },
];

const isPublished = (a) => a.usage !== "internal";
// Gated on isPublished: internal-only material needs no release regardless
// of what is left ticked in Channels (the checkboxes are not cleared when
// Type of use switches to "Internal only", so a stray leftover "Paid
// advertising" channel must not keep commercial-only rules active).
const isCommercial = (a) => isPublished(a) && (a.usage === "commercial" || a.channels.includes("ads"));

/**
 * The full rule set. `applies` is a pure predicate over the normalised answers.
 */
export const RELEASE_RULES = [
  {
    id: "model-release",
    title: "Model release from every recognisable person",
    why: "Commercial use of an identifiable likeness engages the right of publicity, so each adult on camera signs a release covering the media, territory and term.",
    severity: "required",
    applies: (a) => a.peopleRecognisable && isCommercial(a),
  },
  {
    id: "appearance-release",
    title: "Appearance or contributor release",
    why: "Editorial use rarely needs a publicity release, but a short appearance release records that the contributor knew they were being recorded and for what.",
    severity: "recommended",
    applies: (a) => a.peopleRecognisable && a.usage === "editorial",
  },
  {
    id: "minor-consent",
    title: "Parent or guardian consent for anyone under 18",
    why: "A minor cannot give valid consent, so the release must be signed by a parent or legal guardian, and many broadcasters also require a chaperone record.",
    severity: "required",
    applies: (a) => a.minorsPresent && isPublished(a),
  },
  {
    id: "crowd-notice",
    title: "Crowd notice at every entrance",
    why: "Where a crowd is filmed you cannot collect individual releases, so a visible notice at each entry point evidences that attendance implied consent.",
    severity: "required",
    applies: (a) => a.crowdPublic && isPublished(a),
  },
  {
    id: "talent-agreement",
    title: "Paid talent agreement with a buyout or usage term",
    why: "Paid performers need a contract that states the media, territory and term of the licence; without it the buyout is ambiguous and re-use can trigger further fees.",
    severity: "required",
    applies: (a) => a.paidTalent,
  },
  {
    id: "crew-work-for-hire",
    title: "Written assignment of copyright from freelance crew",
    why: "In most jurisdictions a freelance photographer, editor or composer owns copyright in what they create unless a written agreement assigns it.",
    severity: "required",
    applies: (a) => a.freelanceCrew,
  },
  {
    id: "property-release",
    title: "Property release for recognisable private property",
    why: "Advertising that features an identifiable private building, interior or distinctive object can imply endorsement, so the owner signs a property release.",
    severity: "required",
    applies: (a) => a.locationPrivate && isCommercial(a),
  },
  {
    id: "location-agreement",
    title: "Location agreement and terms of entry",
    why: "Museums, schools, hospitals, transport hubs and shopping centres set filming terms as a condition of entry, and those terms bind you regardless of publicity law.",
    severity: "required",
    applies: (a) => a.locationInstitution,
  },
  {
    id: "filming-permit",
    title: "Filming permit for the public location",
    why: "Many cities require a permit for filming with a crew, tripod or lighting on the street, and insurance is usually a condition of the permit.",
    severity: "required",
    applies: (a) => a.publicPermitNeeded,
  },
  {
    id: "sync-master",
    title: "Synchronisation licence and master use licence",
    why: "A commercially released track carries two rights: the composition, cleared with the publisher, and the recording, cleared with the label. You need both.",
    severity: "required",
    applies: (a) => a.musicSource === "commercial",
  },
  {
    id: "library-licence",
    title: "Library licence receipt matched to the actual usage",
    why: "Production-library licences are tiered by media, territory and term, so keep the receipt and confirm it covers paid advertising or broadcast if you use those.",
    severity: "recommended",
    applies: (a) => a.musicSource === "library",
  },
  {
    id: "composer-assignment",
    title: "Composer agreement assigning or licensing the score",
    why: "Original music is still the composer's copyright until a written agreement assigns or licenses it for the media you are publishing in.",
    severity: "required",
    applies: (a) => a.musicSource === "original",
  },
  {
    id: "stock-licence",
    title: "Stock licence covering this distribution",
    why: "Standard stock licences cap print runs, exclude broadcast, or exclude use in a product for resale, so match the licence tier to the actual channels.",
    severity: "required",
    applies: (a) => a.stockAssets,
  },
  {
    id: "editorial-only",
    title: "Remove or replace editorial-use-only assets",
    why: "Assets marked editorial use only carry no model or property release and cannot lawfully be used in advertising or promotion.",
    severity: "required",
    applies: (a) => a.stockEditorialOnly && isCommercial(a),
  },
  {
    id: "archive-clearance",
    title: "Archive footage or photo clearance",
    why: "Archive holders licence by media, territory and term and often exclude advertising; the rights in the underlying material may sit with a third party.",
    severity: "required",
    applies: (a) => a.archiveFootage,
  },
  {
    id: "ugc-licence",
    title: "Written licence from the creator of user-generated content",
    why: "A social post is not licensed by being public. You need the creator's written permission and, if a person is recognisable in it, their release too.",
    severity: "required",
    applies: (a) => a.ugc && isPublished(a),
  },
  {
    id: "artwork-copyright",
    title: "Permission for artwork, murals or posters in shot",
    why: "Two-dimensional works in frame are separately copyrighted; freedom of panorama covers some outdoor works in some countries and not at all in others.",
    severity: "required",
    applies: (a) => a.artworkVisible && isPublished(a),
  },
  {
    id: "brand-check",
    title: "Trademark and logo review",
    why: "Incidental brands in editorial work are usually fine, but prominent logos in advertising can suggest an endorsement that the brand has not given.",
    severity: (a) => (isCommercial(a) ? "required" : "recommended"),
    applies: (a) => a.brandsVisible && isPublished(a),
  },
  {
    id: "drone-authorisation",
    title: "Drone operator registration and flight authorisation",
    why: "Commercial drone flight needs regulator authorisation — FAA Part 107 in the US, CAA in the UK, DGCA Digital Sky in India — plus rules on flying over people.",
    severity: "required",
    applies: (a) => a.droneUsed,
  },
  {
    id: "ai-disclosure",
    title: "Provenance record and disclosure for AI-generated material",
    why: "Synthetic likeness or voice needs the person's specific permission, and several platforms and advertising codes now require the material to be labelled.",
    severity: "required",
    applies: (a) => a.aiGenerated && isPublished(a),
  },
  {
    id: "territory-check",
    title: "Confirm every licence covers worldwide use",
    why: "Music, stock and archive licences are commonly sold per territory, and a worldwide website makes a single-country licence insufficient.",
    severity: "recommended",
    applies: (a) =>
      a.territoryWorldwide && (a.stockAssets || a.archiveFootage || a.musicSource !== "none"),
  },
  {
    id: "records",
    title: "Keep signed releases with the master file",
    why: "Broadcasters, stock agencies and errors-and-omissions insurers ask for the paperwork years later; store it alongside the master, not in an inbox.",
    severity: "recommended",
    applies: (a) => isPublished(a),
  },
];

function normalise(input) {
  const a = input && typeof input === "object" ? input : {};
  return {
    usage: USAGE_OPTIONS.some((o) => o.id === a.usage) ? a.usage : "editorial",
    channels: Array.isArray(a.channels) ? a.channels.filter((c) => CHANNEL_OPTIONS.some((o) => o.id === c)) : [],
    musicSource: MUSIC_OPTIONS.some((o) => o.id === a.musicSource) ? a.musicSource : "none",
    peopleRecognisable: Boolean(a.peopleRecognisable),
    minorsPresent: Boolean(a.minorsPresent),
    crowdPublic: Boolean(a.crowdPublic),
    paidTalent: Boolean(a.paidTalent),
    freelanceCrew: Boolean(a.freelanceCrew),
    locationPrivate: Boolean(a.locationPrivate),
    locationInstitution: Boolean(a.locationInstitution),
    publicPermitNeeded: Boolean(a.publicPermitNeeded),
    stockAssets: Boolean(a.stockAssets),
    stockEditorialOnly: Boolean(a.stockEditorialOnly),
    archiveFootage: Boolean(a.archiveFootage),
    ugc: Boolean(a.ugc),
    artworkVisible: Boolean(a.artworkVisible),
    brandsVisible: Boolean(a.brandsVisible),
    droneUsed: Boolean(a.droneUsed),
    aiGenerated: Boolean(a.aiGenerated),
    territoryWorldwide: a.territoryWorldwide !== false,
  };
}

/**
 * Build the checklist that applies to a given production.
 * @param {object} answers
 * @returns {object} { items, requiredCount, recommendedCount, answers } or { error }
 */
export function buildChecklist(answers) {
  const a = normalise(answers);

  if (a.usage !== "internal" && a.channels.length === 0) {
    return { error: "Pick at least one channel you will publish through." };
  }
  if (a.stockEditorialOnly && !a.stockAssets) {
    return { error: "Tick 'uses stock or licensed assets' before flagging editorial-use-only assets." };
  }

  const items = RELEASE_RULES.filter((rule) => rule.applies(a)).map((rule) => ({
    id: rule.id,
    title: rule.title,
    why: rule.why,
    severity: typeof rule.severity === "function" ? rule.severity(a) : rule.severity,
  }));

  if (items.length === 0) {
    return {
      items: [],
      requiredCount: 0,
      recommendedCount: 0,
      answers: a,
      note: "Nothing on this checklist applies. Internal-only material with no third-party content needs no release, but keep a record of that decision.",
    };
  }

  return {
    items,
    requiredCount: items.filter((item) => item.severity === "required").length,
    recommendedCount: items.filter((item) => item.severity === "recommended").length,
    answers: a,
  };
}

/**
 * Score how much of the checklist is cleared.
 * @param {{items:object[],done:object}} input done is { [itemId]: true }
 * @returns {object} { total, completed, readiness, riskScore, band, ... } or { error }
 */
export function assessReadiness({ items, done } = {}) {
  if (!Array.isArray(items)) return { error: "There is no checklist to score." };
  const ticked = done && typeof done === "object" ? done : {};

  if (items.length === 0) {
    return {
      total: 0,
      completed: 0,
      requiredTotal: 0,
      requiredDone: 0,
      readiness: 100,
      riskScore: 0,
      band: RISK_BANDS[0],
      outstanding: [],
      safeToPublish: true,
    };
  }

  let totalWeight = 0;
  let openWeight = 0;
  let completed = 0;
  let requiredTotal = 0;
  let requiredDone = 0;
  const outstanding = [];

  for (const item of items) {
    const weight = SEVERITY_WEIGHT[item.severity] || SEVERITY_WEIGHT.recommended;
    totalWeight += weight;
    const isDone = ticked[item.id] === true;
    if (isDone) completed += 1;
    else {
      openWeight += weight;
      outstanding.push(item);
    }
    if (item.severity === "required") {
      requiredTotal += 1;
      if (isDone) requiredDone += 1;
    }
  }

  const riskScore = totalWeight > 0 ? (openWeight / totalWeight) * 100 : 0;
  const safeToPublish = requiredTotal > 0 ? requiredDone === requiredTotal : true;

  // The blended required+recommended score can contradict safeToPublish,
  // which is the real legal-exposure signal: one open required item can be
  // diluted by many completed recommended ones into reading as "Low" risk,
  // or a fully-cleared required set can be outweighed by open recommended
  // items into reading as "High" ("core releases missing") when none are.
  // Reconcile the two: any open required item floors the band at "High";
  // a fully-cleared required set caps it at "Medium" (one below "High") so
  // the headline never claims a core release is missing when it is not.
  const rawIndex = RISK_BANDS.findIndex((entry) => riskScore <= entry.max);
  let bandIndex = rawIndex === -1 ? RISK_BANDS.length - 1 : rawIndex;
  const highIndex = RISK_BANDS.length - 1;
  const mediumIndex = Math.max(0, RISK_BANDS.length - 2);
  bandIndex = safeToPublish ? Math.min(bandIndex, mediumIndex) : Math.max(bandIndex, highIndex);
  const band = RISK_BANDS[bandIndex];

  return {
    total: items.length,
    completed,
    requiredTotal,
    requiredDone,
    readiness: (completed / items.length) * 100,
    riskScore: Math.round(riskScore * 10) / 10,
    band,
    outstanding,
    safeToPublish,
  };
}

/** Plain-text export of the checklist. */
export function checklistToText({ items, done, title = "Media release checklist" } = {}) {
  if (!Array.isArray(items) || items.length === 0) return `${title}\n\nNothing outstanding.`;
  const ticked = done && typeof done === "object" ? done : {};
  const lines = [title, ""];
  for (const group of ["required", "recommended"]) {
    const rows = items.filter((item) => item.severity === group);
    if (rows.length === 0) continue;
    lines.push(group === "required" ? "REQUIRED" : "RECOMMENDED");
    for (const row of rows) {
      lines.push(`[${ticked[row.id] ? "x" : " "}] ${row.title}`);
      lines.push(`    ${row.why}`);
    }
    lines.push("");
  }
  lines.push("Informational only, not legal advice.");
  return lines.join("\n");
}

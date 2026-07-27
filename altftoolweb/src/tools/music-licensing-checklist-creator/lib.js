/**
 * Music licensing checklist builder for creators.
 *
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Informational only, not legal advice. The checklist applies the standard
 * structure of music rights and names the bodies that grant each permission in
 * India and internationally.
 *
 * Facts encoded here:
 *  - A commercially released track carries two separate copyrights: the
 *    composition (music and lyrics, controlled by the songwriter and their
 *    publisher) and the sound recording, or master (controlled by the label or
 *    whoever paid for the session). Clearing one does not clear the other.
 *  - A synchronisation licence is what lets music be paired with visuals; a
 *    master use licence is what lets you use one specific recording.
 *  - Creative Commons 4.0 legal code states that where the licensed material
 *    is a musical work, performance or sound recording, Adapted Material is
 *    always produced when it is synched in timed relation with a moving image.
 *    So an ND-licensed track cannot lawfully be put under video at all.
 *  - India, public performance: IPRS licenses the literary and musical works;
 *    PPL India and Novex Communications license sound recordings. A venue or
 *    event usually needs licences from more than one of them.
 *  - Indian Copyright Act 1957, s.31C: a statutory licence for cover versions,
 *    available only after five calendar years from the end of the year of the
 *    first recording, on prior notice, with royalties paid in advance and no
 *    alteration to the literary or musical work.
 *  - Indian Copyright Act 1957, s.31D: a statutory licence for broadcasting
 *    organisations, at rates fixed by the adjudicating authority. It applies to
 *    broadcasting, not to putting a track under a YouTube video.
 *  - YouTube's Content ID is a claim and revenue-sharing system, not a licence.
 *    A track that does not trigger a claim is not thereby cleared.
 */

/** What you are making. */
export const PROJECTS = {
  youtubeVideo: {
    id: "youtubeVideo",
    label: "YouTube or streaming video",
    visual: true,
    broadcast: false,
    publicVenue: false,
    interactive: false,
    note: "Music under picture, distributed on a platform you do not control.",
  },
  socialShortForm: {
    id: "socialShortForm",
    label: "Short-form social video (Reels, Shorts)",
    visual: true,
    broadcast: false,
    publicVenue: false,
    interactive: false,
    note: "Platform music libraries usually cover personal posts only, not brand accounts.",
  },
  podcast: {
    id: "podcast",
    label: "Podcast or audio-only show",
    visual: false,
    broadcast: false,
    publicVenue: false,
    interactive: false,
    note: "No picture, so no sync in the classic sense — but you still reproduce and distribute the track.",
  },
  adCommercial: {
    id: "adCommercial",
    label: "Advertisement or branded campaign",
    visual: true,
    broadcast: true,
    publicVenue: false,
    interactive: false,
    note: "The most expensive and most tightly negotiated use of music there is.",
  },
  filmOrSeries: {
    id: "filmOrSeries",
    label: "Film, series or documentary",
    visual: true,
    broadcast: true,
    publicVenue: true,
    interactive: false,
    note: "Needs cue-sheet discipline and rights that survive festival, theatrical and streaming release.",
  },
  liveStream: {
    id: "liveStream",
    label: "Live stream",
    visual: true,
    broadcast: false,
    publicVenue: false,
    interactive: false,
    note: "Treated as a public transmission; platform music deals rarely extend to it.",
  },
  publicEvent: {
    id: "publicEvent",
    label: "Public event, venue or retail space",
    visual: false,
    broadcast: false,
    publicVenue: true,
    interactive: false,
    note: "Playing recorded music to the public is a restricted act in its own right.",
  },
  gameOrApp: {
    id: "gameOrApp",
    label: "Game or app",
    visual: true,
    broadcast: false,
    publicVenue: false,
    interactive: true,
    note: "Interactive use is licensed separately and is priced per platform and per territory.",
  },
};

/** Where the music comes from. */
export const MUSIC_SOURCES = {
  commercialRelease: {
    id: "commercialRelease",
    label: "A commercially released track",
    needsSync: true,
    needsMaster: true,
    note: "Two owners, two negotiations, two invoices. Budget weeks, not days.",
  },
  productionLibrary: {
    id: "productionLibrary",
    label: "Production or library music",
    needsSync: true,
    needsMaster: true,
    note: "The library controls both rights and licenses them together, which is why it is fast.",
  },
  royaltyFreeSubscription: {
    id: "royaltyFreeSubscription",
    label: "Royalty-free subscription library",
    needsSync: false,
    needsMaster: false,
    note: "One subscription licence covers both rights, but usually only for the channels you registered.",
  },
  ccLicensed: {
    id: "ccLicensed",
    label: "Creative Commons licensed music",
    needsSync: false,
    needsMaster: false,
    note: "Free of charge, not free of conditions. Attribution is always required.",
  },
  customComposed: {
    id: "customComposed",
    label: "Commissioned or custom composed",
    needsSync: false,
    needsMaster: false,
    note: "Cleanest option, provided the paperwork actually transfers the rights to you.",
  },
  coverVersion: {
    id: "coverVersion",
    label: "A cover version you recorded",
    needsSync: true,
    needsMaster: false,
    note: "You own your recording. You do not own the song.",
  },
  aiGenerated: {
    id: "aiGenerated",
    label: "AI-generated music",
    needsSync: false,
    needsMaster: false,
    note: "Your position rests entirely on the generator's terms of service.",
  },
  platformLibrary: {
    id: "platformLibrary",
    label: "The platform's own audio library",
    needsSync: false,
    needsMaster: false,
    note: "Convenient, but the grant is limited to that platform and often excludes brand accounts.",
  },
};

/** Creative Commons variants that change the answer. */
export const CC_VARIANTS = {
  none: { id: "none", label: "Not Creative Commons" },
  permissive: { id: "permissive", label: "CC BY or CC BY-SA" },
  nonCommercial: { id: "nonCommercial", label: "Creative Commons with NC" },
  noDerivatives: { id: "noDerivatives", label: "Creative Commons with ND" },
};

/** Territories the checklist knows about. */
export const TERRITORIES = {
  india: { id: "india", label: "India" },
  worldwide: { id: "worldwide", label: "Worldwide" },
};

/** Statuses, ordered by severity. */
export const STATUS_ORDER = ["blocker", "required", "likely", "recommended", "notNeeded"];

const STATUS_LABELS = {
  blocker: "Stop",
  required: "Required",
  likely: "Likely required",
  recommended: "Worth doing",
  notNeeded: "Not needed here",
};

/**
 * Build the licensing checklist.
 */
export function buildMusicChecklist({
  projectId = "youtubeVideo",
  sourceId = "commercialRelease",
  ccVariant = "none",
  territory = "india",
  monetised = true,
  coverIsOlderThanFiveYears = false,
} = {}) {
  const project = PROJECTS[projectId];
  const source = MUSIC_SOURCES[sourceId];
  const cc = CC_VARIANTS[ccVariant];
  const place = TERRITORIES[territory];

  if (!project) return { error: "Choose what you are making." };
  if (!source) return { error: "Choose where the music comes from." };
  if (!cc) return { error: "Choose the Creative Commons variant, or 'Not Creative Commons'." };
  if (!place) return { error: "Choose a territory." };
  if (typeof monetised !== "boolean") return { error: "Say whether the project is monetised." };
  if (typeof coverIsOlderThanFiveYears !== "boolean") {
    return { error: "Say whether the original recording is more than five years old." };
  }
  if (sourceId === "ccLicensed" && ccVariant === "none") {
    return { error: "Pick which Creative Commons licence the track carries." };
  }

  const items = [];
  const add = (id, title, status, grantedBy, detail) =>
    items.push({ id, title, status, grantedBy, detail });

  const isCc = sourceId === "ccLicensed";
  const inIndia = territory === "india";

  // 1. Synchronisation — the right to put music with picture.
  if (!project.visual) {
    add(
      "sync",
      "Synchronisation licence",
      "notNeeded",
      "Music publisher",
      "There is no moving image, so there is nothing to synchronise. You still need the reproduction and distribution rights covered below.",
    );
  } else if (isCc && ccVariant === "noDerivatives") {
    add(
      "sync",
      "Synchronisation licence",
      "blocker",
      "The composer directly",
      "Creative Commons 4.0 treats music synched in timed relation with a moving image as Adapted Material. An ND licence forbids sharing adaptations, so this track cannot go under video at all. Ask the creator for a separate licence or choose another track.",
    );
  } else if (isCc && ccVariant === "nonCommercial" && monetised) {
    add(
      "sync",
      "Synchronisation licence",
      "blocker",
      "The composer directly",
      "An NC licence excludes uses primarily aimed at commercial advantage. A monetised video, a brand channel or an ad-supported stream falls outside it. You need a direct licence from the creator.",
    );
  } else if (source.needsSync) {
    add(
      "sync",
      "Synchronisation licence",
      "required",
      sourceId === "coverVersion"
        ? "The publisher of the original song"
        : "The music publisher or composer",
      sourceId === "coverVersion"
        ? "Recording your own version does not give you the right to put the song under picture. The sync right stays with the publisher of the underlying composition."
        : "This is the permission to pair the composition with moving images. It is negotiated per project, per territory and per term — there is no statutory rate for it.",
    );
  } else {
    add(
      "sync",
      "Synchronisation licence",
      "notNeeded",
      "Covered by your existing licence",
      isCc
        ? "The Creative Commons licence permits adaptation, which covers synching to picture. Attribution remains mandatory."
        : "Your subscription, platform or commissioning agreement should already bundle the sync right. Confirm it in writing and keep the licence certificate.",
    );
  }

  // 2. Master use — the right to use one specific recording.
  if (source.needsMaster) {
    add(
      "master",
      "Master use licence",
      "required",
      "The record label or recording owner",
      "The second of the two copyrights in a released track. Even with the publisher's sync licence in hand, using that particular recording needs the master owner's permission. Re-recording the song avoids this but not the sync licence.",
    );
  } else if (sourceId === "coverVersion") {
    add(
      "master",
      "Master use licence",
      "notNeeded",
      "You",
      "You paid for and own the recording of your cover, so the master is yours. Get written releases from the session players and vocalists, whose performers' rights are separate again.",
    );
  } else {
    add(
      "master",
      "Master use licence",
      "notNeeded",
      "Covered by your existing licence",
      "Your library, platform or commissioning agreement covers the recording as well as the composition. Keep the certificate with the project files.",
    );
  }

  // 3. Mechanical / reproduction.
  if (sourceId === "coverVersion") {
    add(
      "mechanical",
      "Cover version or mechanical licence",
      inIndia && coverIsOlderThanFiveYears ? "required" : "required",
      inIndia ? "The publisher, or the s.31C statutory route" : "The publisher or a mechanical rights society",
      inIndia
        ? coverIsOlderThanFiveYears
          ? "Section 31C of the Copyright Act 1957 allows a cover version only after five calendar years from the end of the year of the first recording, on prior notice to the owner, with royalties paid in advance for a minimum number of copies, and with no alteration to the literary or musical work. Confirm the timing and follow the notice procedure exactly."
          : "Section 31C is not available yet: the statutory cover-version route opens only after five calendar years from the end of the year in which the song was first recorded. Until then you need a negotiated licence from the publisher."
        : "Reproducing and distributing someone else's composition needs a mechanical licence. Rates and procedures differ by country — some have compulsory licensing, others do not.",
    );
  } else if (!project.visual && source.needsMaster) {
    add(
      "mechanical",
      "Reproduction and distribution rights",
      "required",
      "Publisher and label together",
      "A podcast copies the track into an episode file and distributes it. That is a reproduction of both the composition and the recording, and both owners have to agree, usually in a single podcast licence.",
    );
  } else {
    add(
      "mechanical",
      "Mechanical or reproduction licence",
      "notNeeded",
      "Covered by your existing licence",
      "Nothing in this project reproduces a third-party composition outside what your licence already grants.",
    );
  }

  // 4. Public performance.
  if (project.publicVenue) {
    add(
      "performance",
      "Public performance licence",
      "required",
      inIndia ? "IPRS, plus PPL India or Novex" : "The local performing rights and neighbouring rights societies",
      inIndia
        ? "Playing recorded music to the public engages two sets of rights. IPRS licenses the literary and musical works; PPL India and Novex Communications license sound recordings, and different repertoires sit with each. A venue commonly needs more than one licence."
        : "Most countries split this between a performing rights organisation for the composition and a neighbouring rights body for the recording. Licence in every country where the work is performed.",
    );
  } else if (project.broadcast) {
    add(
      "performance",
      "Broadcast and performance licence",
      "likely",
      inIndia ? "IPRS and PPL India, or the s.31D statutory route" : "The broadcaster's blanket licences",
      inIndia
        ? "Section 31D of the Copyright Act 1957 gives broadcasting organisations a statutory licence at rates fixed by the adjudicating authority. It covers broadcasting, not on-demand internet delivery, so do not assume it reaches a streaming release."
        : "Broadcasters usually hold blanket licences, but confirm the specific track is inside the repertoire and that the clearance covers your territory and term.",
    );
  } else {
    add(
      "performance",
      "Public performance licence",
      "notNeeded",
      "Not applicable",
      "Nothing here is a public performance in a venue. If you later screen the work at an event or in a retail space, this becomes required.",
    );
  }

  // 5. Interactive use.
  if (project.interactive) {
    add(
      "interactive",
      "Interactive or in-game licence",
      "required",
      "Publisher and label, per platform",
      "Games and apps let the user trigger the music, which sits outside an ordinary sync grant. Expect the licence to be scoped per platform, per territory and per number of units, and to exclude the soundtrack album unless you ask for it.",
    );
  }

  // 6. Attribution.
  if (isCc) {
    add(
      "attribution",
      "Attribution in the required form",
      "required",
      "The licence itself",
      "Every current Creative Commons licence includes BY. Name the track, the artist, the source link and the licence with a link, in the description and ideally on screen. Leaving it out ends the licence.",
    );
  } else if (sourceId === "royaltyFreeSubscription" || sourceId === "platformLibrary") {
    add(
      "attribution",
      "Credit line if the licence asks for one",
      "recommended",
      "Your library or platform",
      "Several libraries require a credit in the description for the free tier and drop it for paid plans. Check the terms rather than assuming.",
    );
  }

  // 7. Source-specific traps.
  if (sourceId === "customComposed") {
    add(
      "assignment",
      "Written assignment or licence from the composer",
      "required",
      "The composer, and every performer",
      "Paying an invoice does not transfer copyright. Get a signed agreement covering the composition, the recording and the performers' rights, and say plainly which media, territories and term you have bought.",
    );
  }
  if (sourceId === "aiGenerated") {
    add(
      "ai-terms",
      "Check the generator's terms and indemnity",
      "required",
      "The AI provider",
      "Your rights come from the provider's terms, not from copyright: purely machine-made output generally has no human author to own it, so you may not be able to stop others using the same track. Check whether commercial use is permitted at your plan level and whether any indemnity is offered.",
    );
  }
  if (sourceId === "royaltyFreeSubscription" || sourceId === "platformLibrary") {
    add(
      "scope",
      "Confirm the licence covers this channel and this client",
      "required",
      "Your library or platform",
      "Subscription grants are usually tied to the specific channels you registered and often exclude client work, paid advertising and broadcast. Download and keep the licence certificate for each track — it is what you produce if a claim lands.",
    );
  }
  if (projectId === "socialShortForm" && sourceId === "platformLibrary" && monetised) {
    add(
      "brand-account",
      "Commercial music catalogue for brand accounts",
      "required",
      "The platform",
      "Consumer music libraries on social platforms are licensed for personal, non-commercial posts. Business and brand accounts are normally restricted to a smaller commercial catalogue.",
    );
  }
  if (projectId === "youtubeVideo" || projectId === "socialShortForm" || projectId === "liveStream") {
    add(
      "content-id",
      "Do not rely on Content ID silence",
      "recommended",
      "Nobody — it is not a licence",
      "Content ID is a claim and revenue-sharing system. A track passing without a claim is not evidence that you are licensed, and a claim being released is not a licence either. Keep the paperwork.",
    );
  }
  if (territory === "worldwide" && source.needsSync) {
    add(
      "territory",
      "Confirm worldwide rights actually exist",
      "required",
      "Publisher and label",
      "Publishing and master rights are frequently split by territory, and the party licensing you may only control some of them. Ask specifically for a worldwide grant and for confirmation that no co-publisher has to sign separately.",
    );
  }

  const counts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = items.filter((item) => item.status === status).length;
    return acc;
  }, {});

  const blockers = items.filter((item) => item.status === "blocker");
  const actionable = items.filter(
    (item) => item.status === "required" || item.status === "likely" || item.status === "blocker",
  );

  let verdict;
  let verdictDetail;
  if (blockers.length > 0) {
    verdict = "Cannot be cleared as described";
    verdictDetail = `${blockers.length} ${blockers.length === 1 ? "item makes" : "items make"} this combination impossible under the licence you hold. Change the track or get a direct licence.`;
  } else if (actionable.length > 0) {
    verdict = `${actionable.length} ${actionable.length === 1 ? "clearance" : "clearances"} to obtain`;
    verdictDetail = "Get each one in writing before release, and keep the paperwork with the project.";
  } else {
    verdict = "No clearances outstanding";
    verdictDetail = "Nothing in your answers needs a further licence. Keep your existing certificate on file anyway.";
  }

  const sortedItems = [...items].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return {
    projectId: project.id,
    projectLabel: project.label,
    projectNote: project.note,
    sourceId: source.id,
    sourceLabel: source.label,
    sourceNote: source.note,
    ccVariant: cc.id,
    ccLabel: cc.label,
    territory: place.id,
    territoryLabel: place.label,
    monetised,
    items: sortedItems,
    counts,
    statusLabels: STATUS_LABELS,
    blockerCount: blockers.length,
    actionableCount: actionable.length,
    totalItems: items.length,
    verdict,
    verdictDetail,
  };
}

/** Plain-text checklist for a production folder or a clearance email. */
export function formatChecklist(result) {
  if (!result || result.error) return "";
  return [
    "Music clearance checklist",
    `Project: ${result.projectLabel}`,
    `Music source: ${result.sourceLabel}${result.ccVariant !== "none" ? ` (${result.ccLabel})` : ""}`,
    `Territory: ${result.territoryLabel}`,
    `Monetised: ${result.monetised ? "yes" : "no"}`,
    "",
    `Verdict: ${result.verdict}`,
    result.verdictDetail,
    "",
    ...result.items.map(
      (item) =>
        `[${result.statusLabels[item.status]}] ${item.title}\n    Granted by: ${item.grantedBy}\n    ${item.detail}`,
    ),
    "",
    "Informational only. This is not legal advice — music clearance is contract-heavy and jurisdiction-specific, so take advice before release.",
  ].join("\n");
}

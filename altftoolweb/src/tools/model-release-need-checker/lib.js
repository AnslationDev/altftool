/**
 * Model / property release need checker.
 *
 * The decision rules below encode widely published photography-law practice, not statute text:
 *  - A model release addresses the subject's right of publicity and privacy. In most common-law
 *    jurisdictions the trigger is COMMERCIAL use — advertising, promotion, packaging, merchandise
 *    — of a recognisable person, rather than the act of taking the photograph.
 *  - Editorial, news and documentary use of a newsworthy subject is generally treated as
 *    protected expression and is normally published without a release; stock libraries still
 *    require such images to be filed and sold as editorial-only.
 *  - A minor cannot give valid consent: a parent or legal guardian signs on their behalf.
 *  - A property release covers recognisable private property, pets, distinctive private homes,
 *    interiors and artwork appearing as the subject of the image.
 *  - In the EU and UK, a photograph of an identifiable living person is personal data under the
 *    GDPR / UK GDPR, so a lawful basis for processing is needed regardless of the release.
 *
 * Informational only. This is not legal advice and it does not cover every jurisdiction.
 */

/** Verdict levels. The highest level triggered by any rule wins. */
export const LEVEL_NOT_NEEDED = 0;
export const LEVEL_RECOMMENDED = 1;
export const LEVEL_REQUIRED = 2;

export const VERDICTS = {
  [LEVEL_NOT_NEEDED]: {
    key: "not-typically-needed",
    headline: "A release is not typically needed",
    tone: "success",
  },
  [LEVEL_RECOMMENDED]: {
    key: "recommended",
    headline: "A release is strongly recommended",
    tone: "warning",
  },
  [LEVEL_REQUIRED]: {
    key: "required",
    headline: "A release is normally required",
    tone: "danger",
  },
};

export const USAGES = {
  advertising: {
    label: "Advertising, marketing or packaging",
    commercial: true,
    level: LEVEL_REQUIRED,
    reason:
      "Advertising and promotional use is the classic right-of-publicity trigger: using a recognisable person to sell something normally needs their signed permission.",
  },
  ownBusiness: {
    label: "Promoting my own business (website, social, brochure)",
    commercial: true,
    level: LEVEL_REQUIRED,
    reason:
      "Your own website and social feed are promotional surfaces, so the same commercial-use rule applies as for a paid ad.",
  },
  stockCommercial: {
    label: "Selling through a stock library (commercial / royalty-free)",
    commercial: true,
    level: LEVEL_REQUIRED,
    reason:
      "Every major stock library refuses royalty-free files with recognisable people unless a signed model release is attached to the submission.",
  },
  merchandise: {
    label: "Merchandise, prints for sale or product packaging",
    commercial: true,
    level: LEVEL_REQUIRED,
    reason:
      "Putting a recognisable person on something you sell is commercial exploitation of their likeness.",
  },
  stockEditorial: {
    label: "Selling through a stock library (editorial only)",
    commercial: false,
    level: LEVEL_NOT_NEEDED,
    reason:
      "Editorial-only stock is accepted without a release, but it must be captioned truthfully with who, what, where and when, and buyers may not use it commercially.",
  },
  editorial: {
    label: "News, journalism or documentary",
    commercial: false,
    level: LEVEL_NOT_NEEDED,
    reason:
      "Newsworthy editorial use of a person in a public setting is generally published without a release; the protection falls away if the image is later reused to promote something.",
  },
  fineArt: {
    label: "Fine art exhibition or artist portfolio",
    commercial: false,
    level: LEVEL_RECOMMENDED,
    reason:
      "Artistic use sits in a grey zone that varies sharply by country, and selling limited prints starts to look commercial — get a release where you can.",
  },
  portfolio: {
    label: "Personal portfolio / social post about the shoot",
    commercial: false,
    level: LEVEL_RECOMMENDED,
    reason:
      "Showing client work to win more work is promotional in substance, so a short usage permission avoids an awkward takedown request later.",
  },
  internal: {
    label: "Internal or private use only (never published)",
    commercial: false,
    level: LEVEL_NOT_NEEDED,
    reason: "Unpublished images do not engage publicity rights, but data-protection duties can still apply.",
  },
};

export const RECOGNISABILITY = {
  clear: {
    label: "Yes — face or a distinctive feature is clearly visible",
    identifiable: true,
    reason: "The subject is identifiable, so their likeness rights are in play.",
  },
  partial: {
    label: "Partly — no face, but a tattoo, uniform, vehicle or context could identify them",
    identifiable: true,
    reason:
      "Identifiability is not limited to faces: a distinctive tattoo, a name badge, a uniform or the caption context can identify someone just as well.",
  },
  none: {
    label: "No — silhouette, back of head, or too small to identify",
    identifiable: false,
    reason: "Nobody is identifiable in the frame, so there is no likeness to license.",
  },
  crowd: {
    label: "Large crowd, no individual singled out",
    identifiable: false,
    reason:
      "General crowd scenes where nobody is the subject are normally treated as unidentifiable — but a tight crop of one face changes that.",
  },
};

export const LOCATIONS = {
  public: {
    label: "Public street or public space",
    propertyRisk: false,
    reason: "Shooting in a public place is generally permitted, but that says nothing about how you may later use the image.",
  },
  privateWithPermission: {
    label: "Private property, with the owner's permission",
    propertyRisk: true,
    reason: "You had access, but access permission is not the same document as a property release for publication.",
  },
  privateNoPermission: {
    label: "Private property, without explicit permission",
    propertyRisk: true,
    level: LEVEL_REQUIRED,
    reason:
      "Shooting inside private property without permission risks a trespass or breach-of-conditions claim on top of any release question.",
  },
  workplace: {
    label: "A workplace or client site",
    propertyRisk: true,
    reason:
      "Employment does not by itself authorise a company to use a worker's likeness in advertising — a separate consent is usual.",
  },
  home: {
    label: "A private home or studio",
    propertyRisk: true,
    reason: "Recognisable private interiors and homes are the standard case for a property release.",
  },
};

export const REGIONS = {
  us: {
    label: "United States",
    gdpr: false,
    note: "Right of publicity is state law and varies widely — some states protect it by statute, others through common-law privacy.",
  },
  ukeu: {
    label: "United Kingdom / European Union",
    gdpr: true,
    note: "Under the UK GDPR and GDPR a photo of an identifiable living person is personal data, so you need a lawful basis to store and publish it as well as any release.",
  },
  in: {
    label: "India",
    gdpr: false,
    note: "Personality rights are recognised through privacy case law, and the Digital Personal Data Protection framework adds consent duties for identifiable personal data.",
  },
  other: {
    label: "Other / multiple countries",
    gdpr: false,
    note: "Where you publish into several countries, plan for the strictest of them — a signed release travels better than an argument about local practice.",
  },
};

/**
 * Decide whether a release is typically needed.
 * Pure: no dates, no randomness.
 *
 * @returns {{error: string} | {level: number, verdict: object, reasons: string[],
 *   documents: string[], checklist: string[], notes: string[]}}
 */
export function checkReleaseNeed(input = {}) {
  const usageKey = String(input.usage ?? "").trim();
  const usage = USAGES[usageKey];
  if (!usage) return { error: "Pick how the images will be used." };

  const recognisability = RECOGNISABILITY[String(input.recognisable ?? "").trim()];
  if (!recognisability) return { error: "Say whether anyone in the frame can be identified." };

  const location = LOCATIONS[String(input.location ?? "").trim()];
  if (!location) return { error: "Pick where the shoot happened." };

  const region = REGIONS[String(input.region ?? "").trim()];
  if (!region) return { error: "Pick the market where the images will be published." };

  const isMinor = Boolean(input.minor);
  const sensitive = Boolean(input.sensitiveContext);
  const propertyFeatured = Boolean(input.propertyFeatured);
  const artworkFeatured = Boolean(input.artworkFeatured);
  const petFeatured = Boolean(input.petFeatured);

  const reasons = [];
  const documents = [];
  const notes = [region.note];
  let level = LEVEL_NOT_NEEDED;
  const raise = (next, reason) => {
    if (next > level) level = next;
    if (reason) reasons.push(reason);
  };

  if (recognisability.identifiable) {
    reasons.push(recognisability.reason);
    raise(usage.level, usage.reason);
    if (usage.level >= LEVEL_RECOMMENDED) documents.push("Model release signed by the subject");
  } else {
    reasons.push(recognisability.reason);
    reasons.push(
      "With nobody identifiable, the model-release question falls away — but re-check if you later crop in on a face.",
    );
  }

  if (isMinor && recognisability.identifiable) {
    raise(
      LEVEL_REQUIRED,
      "The subject is under 18 and cannot give valid consent themselves — a parent or legal guardian has to sign, and the release should name the child.",
    );
    documents.push("Parent or guardian signature on the minor's release");
  }

  if (sensitive && recognisability.identifiable) {
    raise(
      LEVEL_REQUIRED,
      "A sensitive framing — health, religion, sexuality, politics, addiction or anything implying wrongdoing — raises defamation and false-light exposure well beyond the ordinary case.",
    );
    notes.push("Never let a sensitive image be used in a context that implies something untrue about the subject.");
  }

  if (location.level) {
    raise(location.level, location.reason);
    documents.push("Written location permission from the property owner or manager");
  } else {
    notes.push(location.reason);
  }

  if (propertyFeatured && location.propertyRisk) {
    raise(
      usage.commercial ? LEVEL_REQUIRED : LEVEL_RECOMMENDED,
      "Recognisable private property is the subject of the frame, which is what a property release covers.",
    );
    documents.push("Property release signed by the owner");
  }
  if (artworkFeatured) {
    raise(
      usage.commercial ? LEVEL_REQUIRED : LEVEL_RECOMMENDED,
      "Artwork, murals, sculpture and designed objects carry their own copyright — the artist's permission is separate from the model release.",
    );
    documents.push("Permission from the artwork's copyright owner");
  }
  if (petFeatured && usage.commercial) {
    raise(
      LEVEL_RECOMMENDED,
      "Animals have no publicity rights, but stock libraries and most clients still want the owner's property release for a recognisable pet.",
    );
    documents.push("Property release from the animal's owner");
  }

  if (region.gdpr && recognisability.identifiable && usageKey !== "internal") {
    raise(
      LEVEL_RECOMMENDED,
      "Publishing an identifiable person in the UK or EU is processing personal data, so record a lawful basis and tell the subject how the images will be used and how long you keep them.",
    );
    documents.push("Privacy notice covering how the images are stored and used");
  }

  const checklist = [
    "Capture the release before the subject leaves the shoot — chasing a signature afterwards rarely works.",
    "Name the actual usage in the release: media, territory, duration and whether it may be sub-licensed.",
    "Keep the signed release with the raw files, and store the file reference or contact sheet number in the release itself.",
    "Record the shoot date and location in the metadata so an editorial caption can be verified later.",
  ];
  if (usage.commercial) {
    checklist.push("Confirm the release wording covers commercial and advertising use — a plain 'permission to photograph' does not.");
  }
  if (usageKey === "stockEditorial" || usageKey === "editorial") {
    checklist.push("Caption editorial images truthfully with who, what, where and when, and never let them be resold for advertising.");
  }

  return {
    level,
    verdict: VERDICTS[level],
    reasons,
    documents: Array.from(new Set(documents)),
    checklist,
    notes,
    commercial: usage.commercial,
    identifiable: recognisability.identifiable,
  };
}

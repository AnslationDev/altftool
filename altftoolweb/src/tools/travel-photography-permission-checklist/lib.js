/**
 * Travel photography permission checklist.
 *
 * Two separate engines:
 *
 * 1. SUBJECT RULES — a graded assessment of what you plan to point a camera at. Each
 *    situation carries a severity, because "you need a permit" and "you can be arrested"
 *    are not the same problem. The severities drive both the headline risk and the
 *    ordered action list.
 *
 * 2. DRONE LIMITS — an arithmetic check against the published numeric limits of the two
 *    regimes most travellers meet: the EASA Open category (Regulation (EU) 2019/947) and
 *    FAA Part 107 in the United States. These are real numbers with real thresholds, so
 *    they can be checked rather than described.
 *
 * This is travel guidance, not legal advice. Rules change, and a posted sign or an
 * instruction from staff always outranks anything here.
 */

/* ------------------------------------------------------- subject severities */

/**
 * Severity weights. A prohibition is worth five restrictions because the outcomes are
 * categorically different: a deleted card and an apology versus a detention.
 */
export const SEVERITY = {
  prohibited: 10,
  permit: 6,
  consent: 4,
  restricted: 2,
  allowed: 0,
};

export const SEVERITY_LABEL = {
  prohibited: "Usually prohibited",
  permit: "Permit or fee required",
  consent: "Consent required first",
  restricted: "Restricted — conditions apply",
  allowed: "Generally allowed",
};

/**
 * Situations a traveller can select. `severity` is the worst case commonly encountered,
 * `rule` states what the restriction actually is and `action` is what to do about it.
 */
export const SUBJECTS = [
  {
    id: "military",
    label: "Military sites, police, borders and airports",
    severity: "prohibited",
    rule:
      "Photographing defence installations, checkpoints, border posts and airport security areas is prohibited in a great many countries, and in some it is treated as espionage rather than as a tourist mistake. India, Egypt, Morocco, Turkey and the Gulf states all restrict it, and enforcement usually starts with your device being taken.",
    action: "Put the camera away entirely, including phones. Do not argue, and do not delete files under instruction — hand the device over if asked.",
  },
  {
    id: "government",
    label: "Government buildings, embassies, courts and prisons",
    severity: "prohibited",
    rule:
      "Commonly prohibited even where the street outside is public, and courts in most countries ban recording of proceedings outright.",
    action: "Photograph from the public street only where permitted, and never inside.",
  },
  {
    id: "infrastructure",
    label: "Nuclear plants, ports, dams and critical infrastructure",
    severity: "prohibited",
    rule: "Restricted for security reasons in most jurisdictions, and often signposted in more than one language.",
    action: "Assume prohibited unless a sign says otherwise.",
  },
  {
    id: "people-uae",
    label: "Identifiable people in the UAE and parts of the Gulf",
    severity: "prohibited",
    rule:
      "The UAE's Federal Decree-Law No. 34 of 2021 on countering rumours and cybercrimes makes photographing or publishing images of people without their consent a criminal offence, with penalties including imprisonment and substantial fines. It is enforced against tourists.",
    action: "Ask first, every time — and do not post a stranger's face even if the photo was taken elsewhere.",
  },
  {
    id: "commercial",
    label: "Commercial shoots, paid work or stock photography",
    severity: "permit",
    rule:
      "Almost every city, park authority and heritage body separates personal photography from commercial photography, and the second needs a permit, a fee and often proof of insurance. What triggers it is the purpose, not the size of the camera.",
    action: "Apply to the relevant authority in advance; retrospective permits do not exist.",
  },
  {
    id: "tripod",
    label: "Tripods, gimbals, lighting or selfie sticks",
    severity: "permit",
    rule:
      "Tripods are banned in most museums and galleries, restricted in crowded public squares, and treated as a marker of commercial intent by many heritage sites. Selfie sticks are separately banned at a long list of museums including the Louvre.",
    action: "Check the site's own rules; where a tripod needs permission, a small beanbag or a monopod is often accepted instead.",
  },
  {
    id: "drone",
    label: "Drone flying",
    severity: "permit",
    rule:
      "Registration, a remote pilot competency test and airspace authorisation are required in most of the world, and drones are banned outright in several countries and in essentially all national parks in the United States. Some countries confiscate them at the airport.",
    action: "Check the national aviation authority before the flight is even planned, and use the drone check below for the numeric limits.",
  },
  {
    id: "religious-interior",
    label: "Inside temples, mosques, churches and shrines",
    severity: "restricted",
    rule:
      "Practice varies by building rather than by faith. The Sistine Chapel prohibits photography entirely while the rest of the Vatican Museums permit it; the Taj Mahal prohibits it inside the main mausoleum chamber; many mosques permit it outside prayer times only.",
    action: "Read the sign at the door, and never photograph people praying without asking.",
  },
  {
    id: "museum",
    label: "Museums and galleries",
    severity: "restricted",
    rule:
      "Most permit hand-held photography without flash in permanent collections and prohibit it in temporary exhibitions, where the loan agreements rather than the museum set the terms. Flash is restricted because repeated light exposure damages pigments and textiles.",
    action: "Flash off before you go in, and check each temporary exhibition separately.",
  },
  {
    id: "metro",
    label: "Metro systems, railway stations and transport hubs",
    severity: "restricted",
    rule:
      "Rules differ sharply. The New York MTA permits photography but not tripods without a permit; the Delhi Metro requires prior permission; and several networks prohibit it outright on security grounds.",
    action: "Look for posted rules on the concourse, and expect staff discretion either way.",
  },
  {
    id: "casino",
    label: "Casinos, gaming floors and some nightlife venues",
    severity: "prohibited",
    rule: "Gaming floors prohibit photography almost universally, to protect both patron privacy and security operations.",
    action: "Phone away on the floor; the lobby is usually fine.",
  },
  {
    id: "people-street",
    label: "Identifiable strangers in public, elsewhere",
    severity: "consent",
    rule:
      "Taking the photograph is generally lawful in public in most of Europe and the Americas, but publishing it may not be. France's droit à l'image, grounded in Article 9 of the Civil Code, protects a person's control over their own image, and several other civil-law countries take a similar line.",
    action: "Ask before a close portrait, and get explicit permission before publishing an identifiable face.",
  },
  {
    id: "children",
    label: "Children",
    severity: "consent",
    rule:
      "Consent must come from a parent or guardian, and many countries, schools and orphanages prohibit photography of children by visitors regardless of consent.",
    action: "Ask the adult with them, accept a refusal immediately, and never photograph children at a school or care institution.",
  },
  {
    id: "indigenous",
    label: "Indigenous communities and ceremonies",
    severity: "prohibited",
    rule:
      "Many communities prohibit photography of ceremonies entirely rather than conditionally. Several Pueblos in New Mexico ban cameras from their villages outright and others require a paid permit; comparable rules exist in Australia, Canada and across the Pacific.",
    action: "Find and follow the community's own published rules; there is no general right that overrides them.",
  },
  {
    id: "funeral",
    label: "Funerals, cremations and mourning rites",
    severity: "prohibited",
    rule:
      "Photography at cremation grounds such as Pashupatinath and Manikarnika is a persistent source of offence, and is prohibited or actively policed at many of them.",
    action: "Do not photograph a funeral you were not invited to.",
  },
  {
    id: "hospital",
    label: "Hospitals and medical settings",
    severity: "prohibited",
    rule: "Patient privacy law prohibits photography in clinical areas in essentially every country.",
    action: "Camera away past reception.",
  },
  {
    id: "landscape",
    label: "Landscapes, streets and architecture, no people",
    severity: "allowed",
    rule:
      "Generally unrestricted for personal use. The narrow exception is freedom-of-panorama law: a few countries, France and Italy among them, limit publishing images of certain copyrighted modern buildings and artworks, which is why photographs of the illuminated Eiffel Tower at night are treated differently from daytime ones.",
    action: "Shoot freely; check freedom-of-panorama rules only if you intend to publish commercially.",
  },
];

/* ------------------------------------------------------------ drone limits */

/** EASA Open category, Regulation (EU) 2019/947. */
export const EASA = {
  /** Maximum height above the closest point of the surface of the earth, in metres. */
  maxHeightM: 120,
  /** Subcategory A2: minimum horizontal distance from uninvolved people, in metres. */
  a2MinDistanceToPeopleM: 30,
  /** A2 with low-speed mode active, in metres. */
  a2LowSpeedDistanceM: 5,
  /** Subcategory A3: minimum horizontal distance from built-up areas, in metres. */
  a3MinDistanceToBuiltUpM: 150,
  /** Mass at or below which a drone may be flown over uninvolved people (class C0). */
  c0MaxMassG: 250,
};

/** FAA Part 107, 14 CFR Part 107, United States. */
export const FAA = {
  /** Maximum altitude above ground level, in feet. */
  maxHeightFt: 400,
  /** Maximum groundspeed, in miles per hour. */
  maxGroundspeedMph: 100,
  /** Minimum flight visibility, in statute miles. */
  minVisibilitySm: 3,
};

/** Exact conversion, used so the FAA ceiling can be compared with metric input. */
export const FEET_PER_METRE = 3.280839895013123;

const toNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return NaN;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

/* ---------------------------------------------------------------- assessor */

/**
 * Assess the photography situations on a traveller's list.
 *
 * @param {object} input
 * @param {string[]} input.subjectIds ids from SUBJECTS
 * @returns {object} graded assessment, or { error }
 */
export function assessSubjects({ subjectIds = [] } = {}) {
  if (!Array.isArray(subjectIds)) return { error: "Selected situations must be a list." };

  const valid = new Set(SUBJECTS.map((s) => s.id));
  const chosen = SUBJECTS.filter((s) => new Set(subjectIds.filter((id) => valid.has(id))).has(s.id));

  if (chosen.length === 0) {
    return { error: "Pick at least one thing you plan to photograph." };
  }

  const riskScore = chosen.reduce((sum, item) => sum + SEVERITY[item.severity], 0);
  const worstScore = chosen.reduce((max, item) => Math.max(max, SEVERITY[item.severity]), 0);

  const counts = { prohibited: 0, permit: 0, consent: 0, restricted: 0, allowed: 0 };
  for (const item of chosen) counts[item.severity] += 1;

  let band;
  let verdict;
  if (counts.prohibited > 0) {
    band = "prohibited";
    verdict =
      counts.prohibited === 1
        ? "One item on your list is usually prohibited outright."
        : `${counts.prohibited} items on your list are usually prohibited outright.`;
  } else if (counts.permit > 0) {
    band = "permit";
    verdict = "Nothing is banned, but you need a permit or a fee arranged in advance.";
  } else if (counts.consent > 0) {
    band = "consent";
    verdict = "You need people's permission before shooting, and again before publishing.";
  } else if (counts.restricted > 0) {
    band = "restricted";
    verdict = "Conditions apply at the venues you picked — read the sign at each door.";
  } else {
    band = "clear";
    verdict = "Nothing on your list normally carries a restriction.";
  }

  /* Highest severity first, so the action list is in the order that matters. */
  const actions = [...chosen]
    .sort((a, b) => SEVERITY[b.severity] - SEVERITY[a.severity])
    .map((item) => ({
      id: item.id,
      label: item.label,
      severity: item.severity,
      severityLabel: SEVERITY_LABEL[item.severity],
      rule: item.rule,
      action: item.action,
    }));

  return {
    chosenCount: chosen.length,
    riskScore,
    worstScore,
    counts,
    band,
    verdict,
    actions,
  };
}

/* ------------------------------------------------------------ drone check */

/**
 * Check a planned drone flight against the numeric limits of one regime.
 *
 * @param {object} input
 * @param {"easa"|"faa"} input.regime         which rulebook applies
 * @param {number} input.heightM              planned height above ground, in metres
 * @param {number} input.distanceToPeopleM    horizontal distance to uninvolved people, in metres
 * @param {number} input.distanceToBuiltUpM   horizontal distance to built-up areas, in metres
 * @param {number} input.massG                take-off mass, in grams
 * @param {boolean} input.lowSpeedMode        EASA A2 low-speed mode active
 * @param {boolean} input.overPeople          planning to overfly uninvolved people
 * @param {boolean} input.night               flying at night
 * @param {boolean} input.controlledAirspace  inside controlled airspace
 * @returns {object} findings, or { error }
 */
export function checkDroneFlight({
  regime = "easa",
  heightM,
  distanceToPeopleM,
  distanceToBuiltUpM,
  massG,
  lowSpeedMode = false,
  overPeople = false,
  night = false,
  controlledAirspace = false,
} = {}) {
  if (regime !== "easa" && regime !== "faa") {
    return { error: "Pick either the EASA Open category or FAA Part 107." };
  }

  const height = toNumber(heightM);
  const toPeople = toNumber(distanceToPeopleM);
  const toBuiltUp = toNumber(distanceToBuiltUpM);
  const mass = toNumber(massG);

  if (!Number.isFinite(height) || height < 0) return { error: "Enter a planned height in metres, zero or above." };
  if (height > 10000) return { error: "That height is outside any drone regime — enter metres, not feet." };
  if (!Number.isFinite(toPeople) || toPeople < 0) return { error: "Enter the distance to uninvolved people in metres." };
  if (!Number.isFinite(toBuiltUp) || toBuiltUp < 0) return { error: "Enter the distance to built-up areas in metres." };
  if (!Number.isFinite(mass) || mass <= 0) return { error: "Enter the drone's take-off mass in grams." };
  if (mass > 25000) return { error: "Above 25 kg neither the EASA Open category nor Part 107 applies." };

  const breaches = [];
  const notes = [];
  let ceilingM;

  if (regime === "easa") {
    ceilingM = EASA.maxHeightM;
    if (height > EASA.maxHeightM) {
      breaches.push(
        `Height ${height} m exceeds the ${EASA.maxHeightM} m Open-category ceiling above the closest point of the surface.`,
      );
    }
    const requiredToPeople = lowSpeedMode ? EASA.a2LowSpeedDistanceM : EASA.a2MinDistanceToPeopleM;
    if (toPeople < requiredToPeople) {
      breaches.push(
        `Only ${toPeople} m from uninvolved people; subcategory A2 requires ${EASA.a2MinDistanceToPeopleM} m, or ${EASA.a2LowSpeedDistanceM} m with low-speed mode active.`,
      );
    }
    if (toBuiltUp < EASA.a3MinDistanceToBuiltUpM) {
      notes.push(
        `Only ${toBuiltUp} m from a built-up area, so subcategory A3 — which requires ${EASA.a3MinDistanceToBuiltUpM} m from residential, commercial, industrial and recreational areas — is not available. You need A1 or A2 and the matching drone class and pilot competency.`,
      );
    }
    if (overPeople && mass > EASA.c0MaxMassG) {
      breaches.push(
        `Overflying uninvolved people at ${mass} g; in the Open category only a class C0 drone under ${EASA.c0MaxMassG} g may be flown over uninvolved people, and never over assemblies.`,
      );
    }
    notes.push(
      "Operator registration is required in the EU for any drone with a camera other than a toy, and the registration number must be displayed on the aircraft.",
    );
  } else {
    ceilingM = FAA.maxHeightFt / FEET_PER_METRE;
    const heightFt = height * FEET_PER_METRE;
    if (heightFt > FAA.maxHeightFt) {
      breaches.push(
        `Height ${height} m is ${heightFt.toFixed(1)} ft, above the ${FAA.maxHeightFt} ft AGL Part 107 ceiling. The exception is that within 400 ft of a structure you may fly up to 400 ft above that structure's uppermost limit.`,
      );
    }
    if (overPeople) {
      breaches.push(
        "Flying over people requires the aircraft to meet one of the Part 107 Category 1 to 4 operations-over-people requirements; it is not permitted by default.",
      );
    }
    if (night) {
      notes.push(
        "Night operations are permitted under Part 107 only with anti-collision lighting visible for at least three statute miles and the updated recurrent training completed.",
      );
    }
    notes.push(
      `Remote ID is required, minimum flight visibility is ${FAA.minVisibilitySm} statute miles, and maximum groundspeed is ${FAA.maxGroundspeedMph} mph.`,
    );
    notes.push(
      "Drone flying is prohibited across essentially all United States National Park Service land, regardless of Part 107 compliance.",
    );
  }

  if (controlledAirspace) {
    notes.push(
      regime === "easa"
        ? "Inside controlled airspace or a geographical zone you need authorisation from the national aviation authority before flight; check the national geo-awareness map."
        : "Inside Class B, C, D or surface-area Class E airspace you need an authorisation, normally obtained instantly through LAANC.",
    );
  }

  const headroomM = ceilingM - height;

  return {
    regime,
    ceilingM,
    headroomM,
    compliant: breaches.length === 0,
    breaches,
    notes,
  };
}

export default assessSubjects;

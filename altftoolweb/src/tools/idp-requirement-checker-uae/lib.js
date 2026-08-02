/**
 * IDP requirement checker for the United Arab Emirates.
 *
 * The UAE is unusual: the question is not really which permit you hold, it is
 * which visa you hold.
 *
 *  - Traffic law is federal - Federal Decree-Law No. 14 of 2024 on Traffic
 *    Regulation, which replaced Federal Law No. 21 of 1995 - but licensing is
 *    administered by each emirate, through the RTA in Dubai, Abu Dhabi Police
 *    and the equivalent authorities elsewhere.
 *  - A visitor on a tourist or visit visa may drive a rental car on a valid
 *    foreign licence where that licence comes from a country the UAE
 *    recognises. Where it does not, or where the licence is not in English or
 *    Arabic, an International Driving Permit is required alongside it.
 *  - The moment a UAE residence visa is issued, that arrangement ends. A
 *    resident may not drive on a foreign licence or an International Driving
 *    Permit at all: a UAE driving licence becomes compulsory, whatever the
 *    remaining validity of the foreign one.
 *  - Residents from a published list of roughly forty countries convert
 *    without sitting a test. The list includes the UK, the United States,
 *    Canada, Australia, New Zealand, Japan, South Korea, Singapore, Hong Kong,
 *    South Africa, Turkey, the other GCC states and most of the EU and EEA. It
 *    has been expanded several times, so check the current version with your
 *    emirate's licensing authority.
 *  - The UAE is a party to the 1968 Vienna Convention on Road Traffic. In
 *    practice hire desks treat either convention's booklet as the translation.
 *  - The licence age is 18. There is zero tolerance for alcohol: any reading
 *    while driving is an offence.
 *  - The traffic law runs a black-point system, and reaching 24 points inside
 *    twelve months costs you the licence and normally the vehicle as well.
 *
 * Informational only, not legal advice. The recognised-country list and the
 * penalties change - confirm with the RTA, Abu Dhabi Police or your emirate's
 * licensing authority.
 */

export const COUNTRY_NAME = "UAE";
export const COUNTRY_LONG_NAME = "the United Arab Emirates";
export const DRIVES_ON = "right";

/** The UAE is a 1968 Vienna party; hire desks accept either booklet as a translation. */
export const ACCEPTED_IDP_FORMATS = ["geneva-1949", "vienna-1968"];

/** Languages a UAE officer or hire clerk reads without a translation. */
export const OFFICIAL_LANGUAGES = ["english", "arabic"];

/** Minimum age to hold a UAE driving licence, lowered from 21 in 2021. */
export const MINIMUM_CAR_AGE = 18;
/** Commercial hire-desk practice, not law. */
export const RENTAL_MIN_AGE = 21;
export const RENTAL_PREMIUM_MIN_AGE = 25;

/** Black points that cost a driver the licence, counted over twelve months. */
export const BLACK_POINT_LIMIT = 24;
export const BLACK_POINT_WINDOW_MONTHS = 12;

export const MS_PER_DAY = 86400000;
const MAX_STAY_DAYS = 3650;

/**
 * Issuing countries, by the three things that matter here:
 *   language:            "english" | "arabic" | "latin" | "non-latin"
 *   touristRecognised:   can a visitor drive or rent on this licence alone
 *   residentConvertible: can a resident swap it without sitting a test
 */
export const LICENCE_ORIGINS = [
  {
    id: "uae",
    label: "United Arab Emirates",
    language: "arabic",
    touristRecognised: true,
    residentConvertible: true,
    note: "A UAE licence is what every other route here is trying to reach. Nothing else is needed.",
  },
  {
    id: "gcc",
    label: "Another GCC state (Saudi Arabia, Kuwait, Bahrain, Qatar, Oman)",
    language: "arabic",
    touristRecognised: true,
    residentConvertible: true,
    note: "GCC licences are recognised for visitors and convertible for residents without a test.",
  },
  {
    id: "uk-ireland",
    label: "United Kingdom or Ireland",
    language: "english",
    touristRecognised: true,
    residentConvertible: true,
    note: "English-language licences from countries on the recognised list. A visitor rents on the licence alone; a resident converts without a test.",
  },
  {
    id: "usa-canada",
    label: "United States or Canada",
    language: "english",
    touristRecognised: true,
    residentConvertible: true,
    note: "Recognised for visitors and convertible for residents. Canadian holders sometimes have to show the province, since the list is administered by jurisdiction.",
  },
  {
    id: "australia-nz",
    label: "Australia or New Zealand",
    language: "english",
    touristRecognised: true,
    residentConvertible: true,
    note: "Both appear on the recognised list. The road-side change is real, though - the UAE drives on the right.",
  },
  {
    id: "eu-latin",
    label: "An EU or EEA state, licence in Latin script but not English",
    language: "latin",
    touristRecognised: true,
    residentConvertible: true,
    note: "Most EU and EEA states are on the recognised list, but a licence printed only in German, French, Italian or Polish is not readable here, so hire desks ask for the permit as the translation.",
  },
  {
    id: "east-asia",
    label: "Japan, South Korea, Singapore or Hong Kong",
    language: "non-latin",
    touristRecognised: true,
    residentConvertible: true,
    note: "All are on the recognised list for conversion. The licences themselves are not in English or Arabic, so carry the permit as the translation while you are still a visitor.",
  },
  {
    id: "south-africa-turkey",
    label: "South Africa or Turkey",
    language: "latin",
    touristRecognised: true,
    residentConvertible: true,
    note: "Both appear on the recognised list for conversion without a test.",
  },
  {
    id: "india-subcontinent",
    label: "India, Pakistan, Bangladesh, Sri Lanka or Nepal",
    language: "english",
    touristRecognised: false,
    residentConvertible: false,
    note: "These licences are not on the UAE's conversion list, so a resident takes the full course of lessons and tests at a licensed driving institute - the single biggest surprise for new arrivals from the subcontinent.",
  },
  {
    id: "other-recognised",
    label: "Another country on the recognised conversion list",
    language: "latin",
    touristRecognised: true,
    residentConvertible: true,
    note: "The recognised list runs to roughly forty countries and is revised. Confirm yours is still on it before planning around a straight conversion.",
  },
  {
    id: "not-recognised",
    label: "A country not on the recognised list",
    language: "non-latin",
    touristRecognised: false,
    residentConvertible: false,
    note: "A visitor needs the permit alongside the licence, and a resident starts from scratch at a licensed driving institute, including the theory and road tests.",
  },
];

export const IDP_HELD_OPTIONS = [
  { id: "none", label: "No IDP" },
  { id: "geneva-1949", label: "1949 Geneva Convention IDP" },
  { id: "vienna-1968", label: "1968 Vienna Convention IDP" },
  { id: "both", label: "Both formats" },
  { id: "uae-licence", label: "A UAE driving licence" },
];

export const VISA_STATUSES = [
  { id: "tourist", label: "Tourist or visit visa" },
  { id: "resident", label: "UAE residence visa (issued or being issued)" },
];

export const VERDICTS = {
  "not-permitted": { label: "You may not drive", tone: "danger" },
  "uae-licence-required": { label: "UAE licence required", tone: "danger" },
  required: { label: "IDP required", tone: "danger" },
  satisfied: { label: "IDP required - and you have it", tone: "success" },
  recommended: { label: "IDP not required, but worth carrying", tone: "warning" },
  "not-required": { label: "No IDP needed", tone: "success" },
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD string to a UTC timestamp, or null if it is not a real date. */
export function parseISODate(value) {
  const match = DATE_PATTERN.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

function holdsIdp(idpHeld) {
  return idpHeld === "both" || ACCEPTED_IDP_FORMATS.includes(idpHeld);
}

/**
 * Decide whether an International Driving Permit is expected in the UAE.
 *
 * @param {object} input
 * @param {string} input.licenceOrigin   id from LICENCE_ORIGINS
 * @param {string} input.idpHeld         id from IDP_HELD_OPTIONS
 * @param {string} input.visaStatus      id from VISA_STATUSES
 * @param {string} input.arrivalDate     YYYY-MM-DD, date of entry
 * @param {string} [input.departureDate] YYYY-MM-DD, optional planned exit
 * @param {number} input.ageYears        driver's age in whole years
 * @returns {object} verdict object, or { error }
 */
export function checkIdpRequirement({
  licenceOrigin,
  idpHeld,
  visaStatus,
  arrivalDate,
  departureDate,
  ageYears,
} = {}) {
  const origin = LICENCE_ORIGINS.find((entry) => entry.id === licenceOrigin);
  if (!origin) return { error: "Choose the country that issued your driving licence." };

  const idp = IDP_HELD_OPTIONS.find((entry) => entry.id === idpHeld);
  if (!idp) return { error: "Choose which permit you already hold." };

  const visa = VISA_STATUSES.find((entry) => entry.id === visaStatus);
  if (!visa) return { error: "Choose whether you are on a visit visa or a residence visa." };

  const arrival = parseISODate(arrivalDate);
  if (arrival === null) return { error: "Enter a valid arrival date as year, month and day." };

  let stayDays = null;
  if (departureDate) {
    const departure = parseISODate(departureDate);
    if (departure === null) return { error: "Enter a valid departure date, or leave it empty." };
    stayDays = Math.round((departure - arrival) / MS_PER_DAY);
    if (stayDays < 0) return { error: "The departure date cannot fall before the arrival date." };
    if (stayDays > MAX_STAY_DAYS) {
      return { error: "Enter a stay of ten years or less - beyond that you are simply resident." };
    }
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter your age in whole years." };
  if (age < 14 || age > 110) return { error: "Enter an age between 14 and 110 years." };

  const readable = OFFICIAL_LANGUAGES.includes(origin.language);
  const hasIdp = holdsIdp(idpHeld);
  const hasUaeLicence = idpHeld === "uae-licence" || origin.id === "uae";
  const isResident = visa.id === "resident";

  let verdict;
  let reason;

  if (age < MINIMUM_CAR_AGE) {
    verdict = "not-permitted";
    reason = `A UAE driving licence is issued from age ${MINIMUM_CAR_AGE}, and a foreign licence issued earlier does not lower that. At ${age} you cannot drive in ${COUNTRY_LONG_NAME}.`;
  } else if (hasUaeLicence) {
    verdict = "not-required";
    reason =
      "You hold a UAE licence, which is what the law asks of anyone driving here. No permit is involved.";
  } else if (isResident) {
    verdict = "uae-licence-required";
    reason =
      "Once a UAE residence visa is issued, a foreign licence and an International Driving Permit both stop being accepted - however much validity is left on them. A UAE driving licence becomes compulsory, and the permit cannot bridge the gap while you apply.";
  } else if (!origin.touristRecognised) {
    verdict = hasIdp ? "satisfied" : "required";
    reason = hasIdp
      ? "Your licence is not on the list the UAE recognises on its own, so the International Driving Permit you hold is what makes it usable at a rental desk. Carry it with the original licence - the permit alone is not a licence."
      : "Your licence is not on the list the UAE recognises on its own, so you need an International Driving Permit alongside it to hire or drive a car as a visitor. It must be issued at home before you travel.";
  } else if (readable) {
    verdict = "not-required";
    reason =
      "Your licence is on the recognised list and is printed in a language read here, so as a visitor you can hire and drive on the licence alone. Some rental companies still ask for a permit as a matter of policy - it is worth checking the booking terms rather than the law.";
  } else if (hasIdp) {
    verdict = "satisfied";
    reason =
      "Your country is recognised, but the licence itself is not in English or Arabic, so the International Driving Permit does the translating. Carry it with the original licence.";
  } else {
    verdict = "recommended";
    reason =
      "Your country is on the recognised list, but the licence is not printed in English or Arabic, so nobody at a hire desk or a checkpoint can read it. An International Driving Permit removes the argument, and rental companies routinely insist on one in this situation.";
  }

  const warnings = [];
  let windowLabel;

  if (hasUaeLicence) {
    windowLabel = "No limit while the UAE licence is valid";
  } else if (isResident) {
    windowLabel = "Ends when the residence visa is issued";
    if (origin.residentConvertible) {
      warnings.push(
        "Your country is on the UAE's conversion list, so swapping for a UAE licence needs an application, an eye test, the fee and your Emirates ID - no driving lessons and no road test.",
      );
    } else {
      warnings.push(
        "Your country is not on the UAE's conversion list, so the UAE licence means enrolling at a licensed driving institute for the required lessons, the theory test and the road test, however many years you have been driving.",
      );
    }
    warnings.push(
      "There is no grace period built into the rule. Arrange the conversion or the course before the residence visa lands, rather than after, or you have a gap where you cannot legally drive at all.",
    );
  } else {
    windowLabel = "Valid for the visit while you remain on a visit visa";
    if (stayDays !== null && stayDays > 90) {
      warnings.push(
        `A ${stayDays}-day stay usually means a visa change at some point. The day a residence visa is issued, the foreign licence stops working - plan the UAE licence around that date, not around the length of the trip.`,
      );
    }
  }

  if (idpHeld === "geneva-1949" || idpHeld === "vienna-1968" || idpHeld === "both") {
    warnings.push(
      "An International Driving Permit is a translation, not a licence, and it is refused on its own. Carry the original licence with it, and check the expiry - a 1949 Geneva permit runs one year from issue, a 1968 Vienna permit up to three.",
    );
  }
  if (age < RENTAL_MIN_AGE) {
    warnings.push(
      `Rental companies here generally start at ${RENTAL_MIN_AGE}, and at ${RENTAL_PREMIUM_MIN_AGE} for premium and sports categories. That is company policy rather than law.`,
    );
  } else if (age < RENTAL_PREMIUM_MIN_AGE) {
    warnings.push(
      `Expect to be limited to standard categories below ${RENTAL_PREMIUM_MIN_AGE}, and to pay a young-driver surcharge.`,
    );
  }
  warnings.push(
    "There is zero tolerance for alcohol behind the wheel. Any reading is an offence, and the consequences include imprisonment as well as a fine - do not treat a licensed hotel bar as a licence to drive afterwards.",
  );
  warnings.push(
    `The traffic law runs a black-point system: ${BLACK_POINT_LIMIT} points inside ${BLACK_POINT_WINDOW_MONTHS} months costs you the licence and normally the vehicle. Speed cameras are dense and fines follow the rental agreement back to your card.`,
  );
  warnings.push(
    "Salik in Dubai and Darb in Abu Dhabi are automatic toll gantries with no booths. The charges are billed through the rental company, usually with an admin fee on top.",
  );

  const checklist = [
    "Your original national driving licence - a permit is never valid on its own",
    "Passport with the entry stamp, or your Emirates ID once you have one",
    "The rental agreement and the insurance certificate",
    "The vehicle registration card (mulkiya), which stays in the car",
  ];
  if (verdict === "required" || verdict === "satisfied" || verdict === "recommended") {
    checklist.unshift("Your International Driving Permit, issued at home before you travelled");
  }
  if (verdict === "uae-licence-required") {
    checklist.unshift("A UAE driving licence from your emirate's licensing authority");
  }

  return {
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    tone: VERDICTS[verdict].tone,
    reason,
    country: COUNTRY_NAME,
    drivesOn: DRIVES_ON,
    originLabel: origin.label,
    originNote: origin.note,
    visaLabel: visa.label,
    idpLabel: idp.label,
    acceptedFormats: "Either format, as the translation",
    minimumAge: MINIMUM_CAR_AGE,
    ageOk: age >= MINIMUM_CAR_AGE,
    touristRecognised: origin.touristRecognised,
    residentConvertible: origin.residentConvertible,
    blackPointLimit: BLACK_POINT_LIMIT,
    stayDays,
    windowLabel,
    warnings,
    checklist,
    legalBasis:
      "Federal Decree-Law No. 14 of 2024 on Traffic Regulation; emirate licensing rules (RTA Dubai, Abu Dhabi Police and others); 1968 Vienna Convention on Road Traffic",
  };
}

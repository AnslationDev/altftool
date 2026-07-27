/**
 * Bhutan entry requirement checklist and Sustainable Development Fee calculator.
 *
 * Bhutan is unusual: the binding cost of a visit is not the visa fee but a per-night
 * levy, and it is set in law rather than by a tour operator's price list.
 *
 * The rules modelled here:
 *
 *  - Sustainable Development Fee (SDF). Levied under the Tourism Levy Act of Bhutan,
 *    2022, on every night halted in the country. The Act set the rate at USD 200 per
 *    person per night for international visitors; from 1 September 2023 the government
 *    notified a reduced rate of USD 100 per person per night, announced as running to
 *    31 August 2027. Indian nationals, treated as regional visitors, pay Nu. 1,200 per
 *    person per night, the ngultrum being at par with the Indian rupee.
 *
 *  - Concessions by age. Children aged 6 up to but not including 12 pay half the SDF.
 *    Children under 6 are exempt from the SDF entirely.
 *
 *  - Visa. Everyone except nationals of India, Bangladesh and the Maldives needs a
 *    visa, applied for online through the official Department of Immigration system
 *    before travel. The visa application fee is USD 40 per person, one-time and
 *    non-refundable, and the visa is only processed once the SDF and the fee are paid.
 *    Nationals of India, Bangladesh and the Maldives are visa-exempt but still need an
 *    entry permit, and Bangladeshi and Maldivian nationals still pay the USD 100 SDF.
 *
 *  - Documents for Indian nationals. A passport valid for at least six months, or a
 *    Voter Identity Card issued by the Election Commission of India, is accepted.
 *    Children under 18 travel on a passport or birth certificate with a guardian.
 *
 *  - Guide. Since the 2023 reform, visitors must be accompanied by a licensed
 *    Bhutanese guide when travelling outside Thimphu and Paro. Independent travel
 *    inside those two districts is permitted.
 *
 *  - Insurance. Travel insurance covering the whole period of the stay is a listed
 *    requirement of the visa application.
 *
 *  - Entry points. Paro International Airport, and the land borders at Phuentsholing,
 *    Gelephu and Samdrup Jongkhar.
 *
 * The government has periodically notified incentive schemes that waive the SDF for a
 * number of nights on longer stays. Those notifications are time-limited, so this
 * module takes the number of waived nights as an input rather than assuming one.
 *
 * Informational only. Rates and concessions are set by notification and change —
 * confirm on the official Department of Tourism and Department of Immigration sites.
 */

/** Standard SDF for international visitors, USD per person per night (from 1 Sep 2023). */
export const SDF_INTERNATIONAL_USD_PER_NIGHT = 100;

/** SDF for Indian nationals as regional visitors, Nu./INR per person per night. */
export const SDF_INDIA_INR_PER_NIGHT = 1200;

/** One-time, non-refundable visa application fee, USD per person. */
export const VISA_FEE_USD = 40;

/** Age from which the half-rate SDF applies. */
export const SDF_HALF_RATE_FROM_AGE = 6;

/** Age from which the full SDF applies. */
export const SDF_FULL_RATE_FROM_AGE = 12;

/** Share of the SDF payable by a child aged 6 to under 12. */
export const SDF_CHILD_SHARE = 0.5;

/** Months of passport validity expected on entry. */
export const PASSPORT_VALIDITY_MONTHS = 6;

/** Districts where a licensed guide is not compulsory. */
export const GUIDE_FREE_DISTRICTS = ["Thimphu", "Paro"];

export const ROUTES = [
  {
    id: "international",
    label: "International visitor (visa required)",
    currency: "USD",
    sdfPerNight: SDF_INTERNATIONAL_USD_PER_NIGHT,
    visaFeePerPerson: VISA_FEE_USD,
    needsVisa: true,
    note: "Apply online through the official Department of Immigration system. The visa is issued only after the SDF and the USD 40 fee are paid.",
  },
  {
    id: "bangladesh-maldives",
    label: "Bangladeshi or Maldivian national (permit, no visa)",
    currency: "USD",
    sdfPerNight: SDF_INTERNATIONAL_USD_PER_NIGHT,
    visaFeePerPerson: 0,
    needsVisa: false,
    note: "Visa-exempt but not fee-exempt: an entry permit is required and the USD 100 per night SDF still applies.",
  },
  {
    id: "india",
    label: "Indian national (regional visitor permit)",
    currency: "INR",
    sdfPerNight: SDF_INDIA_INR_PER_NIGHT,
    visaFeePerPerson: 0,
    needsVisa: false,
    note: "No visa. An entry permit is issued on a passport or an Election Commission voter ID, and the SDF is Nu. 1,200 per night.",
  },
];

const MS_PER_DAY = 86400000;

function parseDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function addMonths(date, months) {
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

const round2 = (value) => Math.round(value * 100) / 100;

function buildDocuments(context) {
  const documents = [];

  if (context.route.needsVisa) {
    documents.push({
      id: "visa",
      label: "Visa clearance letter from the online application",
      detail:
        "Applied for before travel through the official Department of Immigration system, or by a licensed Bhutanese operator on your behalf. The clearance is checked at Paro and at the land borders.",
      required: true,
    });
    documents.push({
      id: "photo",
      label: "Digital passport photograph and passport bio-page scan",
      detail: "Uploaded with the online application; a plain background and a clear scan avoid a rejection.",
      required: true,
    });
  } else {
    documents.push({
      id: "permit",
      label: "Entry permit issued by the Department of Immigration",
      detail:
        "Arranged online in advance or at the point of entry. The permit names the districts you may travel in.",
      required: true,
    });
  }

  if (context.route.id === "india") {
    documents.push({
      id: "identity",
      label: "Indian passport valid six months, or an Election Commission voter ID",
      detail:
        "Either is accepted for Indian nationals. An Aadhaar card alone is not, and a driving licence is not.",
      required: true,
    });
  } else {
    documents.push({
      id: "passport",
      label: `Passport valid at least ${PASSPORT_VALIDITY_MONTHS} months beyond entry`,
      detail: "Counted from the day you enter Bhutan. Carry blank pages for the entry and exit stamps.",
      required: true,
    });
  }

  documents.push({
    id: "sdf",
    label: "Sustainable Development Fee receipt for every night",
    detail:
      "The levy is charged per night halted under the Tourism Levy Act, 2022. Keep the payment confirmation — the permit is tied to it.",
    required: true,
  });
  documents.push({
    id: "insurance",
    label: "Travel insurance covering the whole stay",
    detail:
      "A listed requirement of the visa application. Cover for altitude trekking and medical evacuation is worth checking, since roads are slow and hospitals are few.",
    required: true,
  });
  documents.push({
    id: "itinerary",
    label: "Itinerary with confirmed accommodation",
    detail:
      "Hotels must be certified by the Department of Tourism. The itinerary is what the permit is written against.",
    required: true,
  });
  documents.push({
    id: "tickets",
    label: "Confirmed flights or land-border arrival plan",
    detail:
      "Paro is served by a small number of carriers with weather-dependent schedules; the land borders are Phuentsholing, Gelephu and Samdrup Jongkhar.",
    required: true,
  });

  if (context.needsGuide) {
    documents.push({
      id: "guide",
      label: "Licensed Bhutanese guide booked for the days outside Thimphu and Paro",
      detail:
        "A guide is compulsory once you leave those two districts. Inside them you may travel independently.",
      required: true,
    });
  }

  if (context.hasMinors) {
    documents.push({
      id: "minor",
      label: "Each child's own travel document",
      detail:
        "A passport, or for Indian nationals under 18, a birth certificate together with a guardian's documents. Children under 6 are exempt from the SDF but not from the permit.",
      required: true,
    });
  }

  if (context.trekking) {
    documents.push({
      id: "trek",
      label: "Trekking route permit and a guide arranged through a licensed operator",
      detail:
        "Restricted and high-altitude routes need their own clearance, and some peaks and areas are closed to visitors entirely.",
      required: true,
    });
  }

  documents.push({
    id: "cash",
    label: "Cash or a card that works locally",
    detail:
      "Card acceptance is thin outside Thimphu and Paro. Indian rupee notes are widely accepted; ngultrum cannot be spent outside Bhutan.",
    required: false,
  });
  documents.push({
    id: "meds",
    label: "Prescriptions and altitude medication",
    detail:
      "Tobacco imports are tightly restricted and taxed, and pharmacies outside the main towns carry little. Carry what you need in labelled packaging.",
    required: false,
  });

  return documents;
}

/**
 * Build the Bhutan checklist and price the Sustainable Development Fee.
 *
 * @param {object} input
 * @param {string} input.routeId        One of ROUTES ids.
 * @param {string} input.entryDate      YYYY-MM-DD, day of entry.
 * @param {string} input.passportExpiry YYYY-MM-DD.
 * @param {number} input.nights         Nights halted in Bhutan.
 * @param {number} input.adults         Travellers aged 12 and over.
 * @param {number} input.children6to11  Travellers aged 6 to 11 inclusive.
 * @param {number} input.childrenUnder6 Travellers under 6.
 * @param {number} [input.waivedNights] Nights waived under a current incentive notification.
 * @param {boolean} [input.travellingOutsideThimphuParo]
 * @param {boolean} [input.trekking]
 * @returns {object} result, or { error }.
 */
export function buildBhutanChecklist({
  routeId = "international",
  entryDate = "",
  passportExpiry = "",
  nights = 5,
  adults = 2,
  children6to11 = 0,
  childrenUnder6 = 0,
  waivedNights = 0,
  travellingOutsideThimphuParo = true,
  trekking = false,
} = {}) {
  const route = ROUTES.find((entry) => entry.id === routeId);
  if (!route) return { error: "Choose which entry route applies to you." };

  const entry = parseDate(entryDate);
  if (!entry) return { error: "Enter your date of entry as a real calendar date." };

  const expiry = parseDate(passportExpiry);
  if (!expiry) {
    return {
      error:
        route.id === "india"
          ? "Enter the expiry date of the passport or voter ID you will travel on."
          : "Enter your passport expiry date as a real calendar date.",
    };
  }

  const nightCount = Number(nights);
  if (!Number.isFinite(nightCount) || nightCount < 1) {
    return { error: "Enter the number of nights you will spend in Bhutan, at least 1." };
  }
  if (nightCount > 365) {
    return { error: "Enter 365 nights or fewer; a longer stay needs a different permit." };
  }

  const adultCount = Number(adults);
  const midCount = Number(children6to11);
  const infantCount = Number(childrenUnder6);
  if (![adultCount, midCount, infantCount].every((value) => Number.isFinite(value))) {
    return { error: "Enter the number of travellers in each age band as whole numbers." };
  }
  if ([adultCount, midCount, infantCount].some((value) => value < 0)) {
    return { error: "The number of travellers cannot be negative." };
  }
  const partySize = adultCount + midCount + infantCount;
  if (partySize < 1) return { error: "Add at least one traveller." };
  if (partySize > 60) {
    return { error: "This checklist covers one party — book above 60 people through an operator." };
  }

  const waived = Number(waivedNights);
  if (!Number.isFinite(waived) || waived < 0) {
    return { error: "Waived nights must be zero or a positive number." };
  }
  if (waived > nightCount) {
    return { error: "You cannot waive more nights than you are staying." };
  }

  // Passport validity: six months counted from the day of entry.
  const passportMustReach = addMonths(entry, PASSPORT_VALIDITY_MONTHS);
  const passportOk = expiry.getTime() >= passportMustReach.getTime();
  const passportShortfallDays = passportOk ? 0 : daysBetween(expiry, passportMustReach);

  // SDF: chargeable nights x rate, at full rate for 12 and over, half for 6 to 11,
  // nothing for under 6.
  const chargeableNights = Math.round(nightCount - waived);
  const rate = route.sdfPerNight;
  const sdfAdults = round2(adultCount * rate * chargeableNights);
  const sdfChildren = round2(midCount * rate * SDF_CHILD_SHARE * chargeableNights);
  const sdfTotal = round2(sdfAdults + sdfChildren);

  // Visa fee: per person, all ages, only where a visa is required.
  const visaFeeTotal = round2(route.visaFeePerPerson * partySize);
  const grandTotal = round2(sdfTotal + visaFeeTotal);
  const perNight = chargeableNights === 0 ? 0 : round2(sdfTotal / chargeableNights);

  const needsGuide = Boolean(travellingOutsideThimphuParo) || Boolean(trekking);

  const documents = buildDocuments({
    route,
    needsGuide,
    hasMinors: midCount + infantCount > 0,
    trekking: Boolean(trekking),
  });
  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  const warnings = [];
  if (!passportOk) {
    warnings.push(
      `Your travel document expires ${passportShortfallDays} day(s) too early — it should stay valid to ${toIso(passportMustReach)}, six months past entry.`,
    );
  }
  if (needsGuide) {
    warnings.push(
      "A licensed Bhutanese guide is compulsory outside Thimphu and Paro. Book it before you pay the SDF so the itinerary matches the permit.",
    );
  }
  if (waived > 0) {
    warnings.push(
      "Waived nights only apply while a government incentive notification is in force. Check the current notification before you count on it.",
    );
  }
  if (infantCount > 0) {
    warnings.push(
      "Children under 6 pay no SDF, but they still need their own travel document and permit.",
    );
  }

  const verdict = passportOk
    ? `Route is clear — budget ${route.currency} ${grandTotal.toLocaleString("en-US")} in government charges before flights and hotels.`
    : "Travel document validity fails the six-month rule — fix that before paying the SDF.";

  return {
    route,
    currency: route.currency,
    entryDate: toIso(entry),
    passportExpiry: toIso(expiry),
    passportMustBeValidUntil: toIso(passportMustReach),
    passportOk,
    passportShortfallDays,
    nights: Math.round(nightCount),
    waivedNights: Math.round(waived),
    chargeableNights,
    adults: Math.round(adultCount),
    children6to11: Math.round(midCount),
    childrenUnder6: Math.round(infantCount),
    partySize: Math.round(partySize),
    sdfRatePerNight: rate,
    sdfAdults,
    sdfChildren,
    sdfTotal,
    sdfPerChargeableNight: perNight,
    visaFeeTotal,
    grandTotal,
    needsGuide,
    guideFreeDistricts: GUIDE_FREE_DISTRICTS,
    documents,
    requiredDocuments,
    optionalDocuments,
    warnings,
    verdict,
  };
}

/**
 * Progress against the required documents only.
 *
 * @param {Array<{id:string,required:boolean}>} documents
 * @param {Array<string>} haveIds
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const requiredDocs = list.filter((doc) => doc.required);
  const missing = requiredDocs.filter((doc) => !have.includes(doc.id));
  const total = requiredDocs.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildBhutanChecklist;

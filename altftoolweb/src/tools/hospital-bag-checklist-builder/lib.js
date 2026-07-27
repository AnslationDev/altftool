/**
 * Hospital bag checklist builder.
 *
 * The catalogue is plain data: every item declares the groups it belongs to,
 * the conditions under which it applies, and how its quantity scales with the
 * expected length of stay (quantity = base + perNight x nights).
 *
 * No dates are read from the system clock — the current week of pregnancy is
 * supplied by the caller.
 */

/** Sections the finished list is grouped into, in packing order. */
export const GROUPS = [
  { id: "documents", label: "Documents & admin" },
  { id: "labour", label: "Labour bag (needed first)" },
  { id: "mother", label: "For the mother — ward stay" },
  { id: "baby", label: "For the baby" },
  { id: "partner", label: "For the birth partner" },
  { id: "goinghome", label: "Going home" },
];

export const DELIVERY_MODES = [
  { id: "vaginal", label: "Vaginal birth expected", typicalNights: 2 },
  { id: "csection", label: "Planned caesarean", typicalNights: 4 },
  { id: "unsure", label: "Not decided / unsure", typicalNights: 3 },
];

export const FEEDING_PLANS = [
  { id: "breast", label: "Breastfeeding" },
  { id: "formula", label: "Formula feeding" },
  { id: "both", label: "Both / undecided" },
];

export const CLIMATES = [
  { id: "hot", label: "Hot weather" },
  { id: "mild", label: "Mild weather" },
  { id: "cold", label: "Cold weather" },
];

/**
 * Newborns are commonly changed 8-12 times a day in the first week, so nappies
 * are budgeted at 10 per day plus a spare handful.
 */
export const NAPPIES_PER_DAY = 10;

/**
 * Maternity pads: lochia is heaviest in the first days and pads are changed
 * roughly every 2-4 hours, so 6 per day plus an opening pack is budgeted.
 */
export const MATERNITY_PADS_PER_DAY = 6;

/**
 * Antenatal guidance (NHS, and the ACOG third-trimester checklist) is to have
 * the bag packed by around 36 weeks, since roughly 1 in 10 births in many
 * countries happens preterm.
 */
export const PACK_BY_WEEK = 36;
export const FULL_TERM_WEEK = 40;
export const MIN_WEEK = 20;
export const MAX_WEEK = 44;

export const MIN_NIGHTS = 1;
export const MAX_NIGHTS = 14;

/**
 * The item catalogue.
 *
 * base      — fixed quantity
 * perNight  — additional quantity for each night of the expected stay
 * delivery  — only include for these delivery modes (omit = all)
 * feeding   — only include for these feeding plans (omit = all)
 * climate   — only include in these climates (omit = all)
 * partnerOnly — only include when a birth partner is coming
 */
export const CATALOGUE = [
  // Documents & admin
  { id: "id-proof", group: "documents", label: "Photo ID for mother and partner", base: 1 },
  { id: "hospital-file", group: "documents", label: "Antenatal notes / hospital file", base: 1 },
  { id: "scan-reports", group: "documents", label: "Scan and blood test reports", base: 1 },
  { id: "insurance", group: "documents", label: "Insurance card, policy number and pre-authorisation", base: 1 },
  { id: "birth-plan", group: "documents", label: "Birth plan or preferences, printed", base: 2 },
  { id: "cash", group: "documents", label: "Cash and a card for hospital charges", base: 1 },
  { id: "contacts", group: "documents", label: "Written list of emergency contacts", base: 1, note: "Useful if a phone runs flat." },
  { id: "blood-group", group: "documents", label: "Blood group card and any allergy list", base: 1 },

  // Labour bag
  { id: "labour-gown", group: "labour", label: "Loose nightdress or gown for labour", base: 1 },
  { id: "slippers", group: "labour", label: "Non-slip slippers or flip-flops", base: 1 },
  { id: "hair-ties", group: "labour", label: "Hair ties and a hairbrush", base: 1 },
  { id: "lip-balm", group: "labour", label: "Lip balm", base: 1, note: "Ward air and mouth-breathing dry the lips fast." },
  { id: "water-bottle", group: "labour", label: "Water bottle with a straw or sports cap", base: 1 },
  { id: "energy-snacks", group: "labour", label: "Glucose sweets, dates or energy snacks", base: 1 },
  { id: "massage", group: "labour", label: "Massage oil or a hot water bottle for back labour", base: 1, delivery: ["vaginal", "unsure"] },
  { id: "tens", group: "labour", label: "TENS unit with fresh batteries, if you plan to use one", base: 1, delivery: ["vaginal", "unsure"] },
  { id: "glasses", group: "labour", label: "Glasses instead of contact lenses", base: 1 },

  // Mother — ward stay
  { id: "nightwear", group: "mother", label: "Nightdresses with front opening", base: 1, perNight: 1 },
  { id: "maternity-pads", group: "mother", label: "Maternity pads", base: 10, perNight: MATERNITY_PADS_PER_DAY },
  { id: "underwear", group: "mother", label: "Disposable or old high-waist underwear", base: 2, perNight: 2 },
  { id: "csection-underwear", group: "mother", label: "High-waist underwear that sits above the scar", base: 4, delivery: ["csection"] },
  { id: "abdominal-binder", group: "mother", label: "Abdominal binder, if your doctor recommends one", base: 1, delivery: ["csection"] },
  { id: "nursing-bra", group: "mother", label: "Nursing bras", base: 2, feeding: ["breast", "both"] },
  { id: "breast-pads", group: "mother", label: "Breast pads", base: 10, perNight: 4, feeding: ["breast", "both"] },
  { id: "nipple-cream", group: "mother", label: "Nipple cream", base: 1, feeding: ["breast", "both"] },
  { id: "nursing-pillow", group: "mother", label: "Feeding pillow", base: 1, feeding: ["breast", "both"] },
  { id: "toiletries", group: "mother", label: "Toiletries: toothbrush, paste, soap, shampoo, comb", base: 1 },
  { id: "towels", group: "mother", label: "Bath towels", base: 2 },
  { id: "socks", group: "mother", label: "Warm socks", base: 2, climate: ["cold", "mild"] },
  { id: "shawl", group: "mother", label: "Shawl or light cardigan for air-conditioned wards", base: 1 },
  { id: "medication", group: "mother", label: "Your regular prescription medicines in original packs", base: 1 },
  { id: "charger", group: "mother", label: "Phone charger with a long cable", base: 1 },
  { id: "earplugs", group: "mother", label: "Eye mask and earplugs", base: 1, note: "Wards rarely go fully dark or quiet." },

  // Baby
  { id: "nappies", group: "baby", label: "Newborn nappies", base: 6, perNight: NAPPIES_PER_DAY },
  { id: "wipes-cotton", group: "baby", label: "Cotton wool or water wipes", base: 1, perNight: 1 },
  { id: "bodysuits", group: "baby", label: "Bodysuits or vests", base: 2, perNight: 2 },
  { id: "sleepsuits", group: "baby", label: "Sleepsuits", base: 2, perNight: 2 },
  { id: "muslins", group: "baby", label: "Muslin squares", base: 4 },
  { id: "receiving-blanket", group: "baby", label: "Receiving blankets", base: 2 },
  { id: "warm-blanket", group: "baby", label: "Warm blanket or quilt", base: 1, climate: ["cold"] },
  { id: "cap-mittens", group: "baby", label: "Caps, mittens and booties", base: 2, climate: ["cold", "mild"] },
  { id: "light-cap", group: "baby", label: "Light cotton cap", base: 2, climate: ["hot"] },
  { id: "baby-toiletries", group: "baby", label: "Baby soap, oil and a soft towel", base: 1 },
  { id: "nappy-cream", group: "baby", label: "Barrier / nappy rash cream", base: 1 },
  { id: "bottles", group: "baby", label: "Sterilised bottles and teats", base: 2, feeding: ["formula", "both"] },
  { id: "formula", group: "baby", label: "Formula tin and measuring scoop", base: 1, feeding: ["formula", "both"], note: "Check first — many hospitals supply or restrict this." },
  { id: "baby-nail", group: "baby", label: "Baby nail file and a soft brush", base: 1 },

  // Partner
  { id: "partner-clothes", group: "partner", label: "Change of clothes for the partner", base: 1, perNight: 1, partnerOnly: true },
  { id: "partner-toiletries", group: "partner", label: "Partner's toiletries", base: 1, partnerOnly: true },
  { id: "partner-snacks", group: "partner", label: "Snacks and a water bottle", base: 1, partnerOnly: true },
  { id: "partner-charger", group: "partner", label: "Spare charger or power bank", base: 1, partnerOnly: true },
  { id: "partner-pillow", group: "partner", label: "Pillow or light blanket for the chair", base: 1, partnerOnly: true },
  { id: "partner-cash", group: "partner", label: "Small change for parking and the canteen", base: 1, partnerOnly: true },

  // Going home
  { id: "going-home-mother", group: "goinghome", label: "Loose going-home outfit for the mother", base: 1, note: "Choose maternity-size clothing, not pre-pregnancy size." },
  { id: "going-home-baby", group: "goinghome", label: "Going-home outfit for the baby", base: 1 },
  { id: "car-seat", group: "goinghome", label: "Rear-facing infant car seat, already fitted", base: 1, note: "Fit and test it before labour starts." },
  { id: "discharge-folder", group: "goinghome", label: "Folder for discharge summary and birth records", base: 1 },
  { id: "baby-carry-blanket", group: "goinghome", label: "Wrap or blanket for the journey", base: 1 },
];

const matches = (allowed, value) => !allowed || allowed.includes(value);

/** Quantity for one catalogue item at a given number of nights. */
export function itemQuantity(item, nights) {
  const base = Number(item.base) || 0;
  const perNight = Number(item.perNight) || 0;
  const n = Number.isFinite(nights) && nights > 0 ? Math.round(nights) : 0;
  return base + perNight * n;
}

/**
 * Build the packing list.
 *
 * @param {object} input
 * @param {string} input.deliveryMode One of DELIVERY_MODES ids.
 * @param {number} input.stayNights Expected nights in hospital.
 * @param {string} input.feedingPlan One of FEEDING_PLANS ids.
 * @param {string} input.climate One of CLIMATES ids.
 * @param {boolean} [input.includePartner] Whether a birth partner is staying.
 * @param {number} [input.weeksPregnant] Current week of pregnancy, for the pack-by reminder.
 * @returns {object} sections and totals, or { error }
 */
export function buildHospitalBag({
  deliveryMode = "vaginal",
  stayNights = 2,
  feedingPlan = "breast",
  climate = "mild",
  includePartner = true,
  weeksPregnant = 34,
} = {}) {
  if (!DELIVERY_MODES.some((mode) => mode.id === deliveryMode)) {
    return { error: "Choose a delivery type from the list." };
  }
  if (!FEEDING_PLANS.some((plan) => plan.id === feedingPlan)) {
    return { error: "Choose a feeding plan from the list." };
  }
  if (!CLIMATES.some((entry) => entry.id === climate)) {
    return { error: "Choose the expected weather from the list." };
  }

  const nights = Number(stayNights);
  if (!Number.isFinite(nights)) return { error: "Enter the expected hospital stay in nights." };
  if (nights < MIN_NIGHTS || nights > MAX_NIGHTS) {
    return { error: `Expected stay should be between ${MIN_NIGHTS} and ${MAX_NIGHTS} nights.` };
  }

  const week = Number(weeksPregnant);
  if (!Number.isFinite(week)) return { error: "Enter how many weeks pregnant you are." };
  if (week < MIN_WEEK || week > MAX_WEEK) {
    return { error: `Weeks of pregnancy should be between ${MIN_WEEK} and ${MAX_WEEK}.` };
  }

  const nightsRounded = Math.round(nights);
  const selected = CATALOGUE.filter(
    (item) =>
      matches(item.delivery, deliveryMode) &&
      matches(item.feeding, feedingPlan) &&
      matches(item.climate, climate) &&
      (!item.partnerOnly || includePartner === true),
  );

  const sections = GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: selected
      .filter((item) => item.group === group.id)
      .map((item) => ({
        id: item.id,
        label: item.label,
        note: item.note || "",
        quantity: itemQuantity(item, nightsRounded),
      })),
  })).filter((section) => section.items.length > 0);

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const totalPieces = sections.reduce(
    (sum, section) => sum + section.items.reduce((inner, item) => inner + item.quantity, 0),
    0,
  );

  const weeksUntilPackBy = Math.max(0, PACK_BY_WEEK - week);
  const weeksUntilTerm = Math.max(0, FULL_TERM_WEEK - week);

  return {
    deliveryMode,
    feedingPlan,
    climate,
    includePartner: includePartner === true,
    nights: nightsRounded,
    week,
    sections,
    totalItems,
    totalPieces,
    weeksUntilPackBy,
    weeksUntilTerm,
    packNow: week >= PACK_BY_WEEK,
    packByWeek: PACK_BY_WEEK,
  };
}

/** Render a built list as plain text, e.g. for copying to a notes app. */
export function checklistToText(result) {
  if (!result || result.error) return "";
  const lines = ["Hospital Bag Checklist", ""];
  lines.push(
    `Expected stay: ${result.nights} night${result.nights === 1 ? "" : "s"} · ${result.totalItems} items`,
  );
  lines.push("");
  for (const section of result.sections) {
    lines.push(section.label.toUpperCase());
    for (const item of section.items) {
      lines.push(`- ${item.label}${item.quantity > 1 ? ` x${item.quantity}` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

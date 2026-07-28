/**
 * First aid kit builder logic.
 *
 * Pure module — no React, no DOM, no clock reads. Dates arrive as ISO strings.
 *
 * Two rules drive the quantities:
 *  1. A transparent scaling model (this tool's own, documented below) that grows
 *     consumables with group size, days of coverage and distance from help.
 *  2. ANSI/ISEA Z308.1-2021 Class A minimum fill, a real workplace standard for a
 *     kit serving up to 25 people. For the workplace profile the standard's
 *     quantities are applied as a hard floor, multiplied by the number of kits
 *     required (one Class A kit per 25 people).
 */

/* --- scaling model (this tool's assumptions, not a standard) --- */

/* Reference kit: 1 person, 7 days of coverage, urban (help within ~30 minutes). */
export const REFERENCE_PEOPLE = 1;
export const REFERENCE_DAYS = 7;

/* Each extra person adds 25% to consumable quantities rather than a full share,
   because dressings and medicines are shared from one kit. Capped so a 200-person
   office does not produce an absurd list — buy multiple kits instead. */
export const PERSON_SCALING = 0.25;
export const MAX_PERSON_FACTOR = 6;

/* Each extra week of coverage adds 20% to consumables, capped at 3x. Kits are
   restocked, so supply does not need to grow in a straight line with time. */
export const WEEK_SCALING = 0.2;
export const MAX_DURATION_FACTOR = 3;

/* How far you are from professional care. The further you are, the longer you
   must manage a casualty yourself, so consumables go up. */
export const REMOTENESS_LEVELS = [
  { id: "urban", label: "Urban — help within ~30 minutes", factor: 1 },
  { id: "rural", label: "Rural — help in 30 to 120 minutes", factor: 1.3 },
  { id: "remote", label: "Remote — help more than 2 hours away", factor: 1.6 },
];

/* One ANSI Class A kit is specified as serving up to 25 people. */
export const PEOPLE_PER_CLASS_A_KIT = 25;

/* Widely recommended interval for physically checking and restocking a kit. */
export const KIT_CHECK_INTERVAL_MONTHS = 6;

export const KIT_PROFILES = [
  { id: "home", label: "Home", people: 4, days: 30, remoteness: "urban" },
  { id: "car", label: "Car / two-wheeler", people: 4, days: 30, remoteness: "rural" },
  { id: "office", label: "Workplace", people: 25, days: 30, remoteness: "urban" },
  { id: "trek", label: "Trek / outdoors", people: 4, days: 5, remoteness: "remote" },
  { id: "travel", label: "Travel / hotel", people: 2, days: 14, remoteness: "urban" },
];

export const ITEM_CATEGORIES = [
  "Wound care",
  "Bleeding and trauma",
  "Protection and hygiene",
  "Tools",
  "Over-the-counter medicines",
];

/**
 * Catalogue.
 *  base        - quantity for the reference kit (1 person, 7 days, urban)
 *  kind        - "consumable" scales with people/days/remoteness; "hardware" does not
 *  unitWeightG - typical packed mass of one unit, in grams
 *  shelfLifeMonths - typical manufacturer shelf life from purchase (null = no expiry)
 *  profiles    - which kit profiles include the item
 */
export const KIT_ITEMS = [
  // Wound care
  { id: "adhesive-bandages", name: "Adhesive bandages, assorted sizes", category: "Wound care", unit: "pieces", base: 8, kind: "consumable", unitWeightG: 2, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "sterile-gauze", name: "Sterile gauze pads 7.5 × 7.5 cm", category: "Wound care", unit: "pieces", base: 4, kind: "consumable", unitWeightG: 3, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "non-adherent-dressing", name: "Non-adherent dressings 5 × 5 cm", category: "Wound care", unit: "pieces", base: 2, kind: "consumable", unitWeightG: 3, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "trauma-pad", name: "Trauma pad 13 × 23 cm", category: "Wound care", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 12, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek"] },
  { id: "roller-bandage", name: "Conforming roller bandage 5 cm × 4 m", category: "Wound care", unit: "rolls", base: 1, kind: "consumable", unitWeightG: 25, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "crepe-bandage", name: "Crepe bandage 7.5 cm", category: "Wound care", unit: "rolls", base: 1, kind: "consumable", unitWeightG: 45, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek"] },
  { id: "triangular-bandage", name: "Triangular bandage (sling)", category: "Wound care", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 30, shelfLifeMonths: 120, profiles: ["home", "car", "office", "trek"] },
  { id: "adhesive-tape", name: "Microporous tape 2.5 cm × 5 m", category: "Wound care", unit: "rolls", base: 1, kind: "consumable", unitWeightG: 15, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "antiseptic-wipes", name: "Antiseptic cleansing wipes", category: "Wound care", unit: "pieces", base: 10, kind: "consumable", unitWeightG: 2, shelfLifeMonths: 36, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "antibiotic-ointment", name: "Antibiotic ointment sachets", category: "Wound care", unit: "sachets", base: 4, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 24, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "burn-cream", name: "Burn gel sachets", category: "Wound care", unit: "sachets", base: 4, kind: "consumable", unitWeightG: 4, shelfLifeMonths: 36, profiles: ["home", "car", "office", "trek"] },
  { id: "burn-dressing", name: "Burn gel dressing 10 × 10 cm", category: "Wound care", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 20, shelfLifeMonths: 36, profiles: ["home", "car", "office", "trek"] },
  { id: "wound-closure-strips", name: "Wound closure (steri) strips", category: "Wound care", unit: "strips", base: 4, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 36, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "eye-pad", name: "Sterile eye pads", category: "Wound care", unit: "pieces", base: 2, kind: "consumable", unitWeightG: 3, shelfLifeMonths: 60, profiles: ["home", "car", "office"] },
  { id: "eye-wash", name: "Sterile eye and skin wash 30 ml", category: "Wound care", unit: "bottles", base: 1, kind: "consumable", unitWeightG: 35, shelfLifeMonths: 24, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "blister-plasters", name: "Hydrocolloid blister plasters", category: "Wound care", unit: "pieces", base: 4, kind: "consumable", unitWeightG: 2, shelfLifeMonths: 36, profiles: ["trek", "travel"] },

  // Bleeding and trauma
  { id: "pressure-dressing", name: "Pressure (emergency) bandage", category: "Bleeding and trauma", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 75, shelfLifeMonths: 60, profiles: ["car", "trek"] },
  { id: "tourniquet", name: "Windlass tourniquet", category: "Bleeding and trauma", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 90, shelfLifeMonths: 60, profiles: ["car", "office", "trek"] },
  { id: "splint", name: "Mouldable splint 10 × 60 cm", category: "Bleeding and trauma", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 130, shelfLifeMonths: null, profiles: ["car", "trek"] },
  { id: "cold-pack", name: "Instant cold pack", category: "Bleeding and trauma", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 130, shelfLifeMonths: 36, profiles: ["home", "car", "office"] },
  { id: "emergency-blanket", name: "Foil emergency blanket", category: "Bleeding and trauma", unit: "pieces", base: 1, kind: "consumable", unitWeightG: 60, shelfLifeMonths: null, profiles: ["home", "car", "trek", "travel"] },

  // Protection and hygiene
  { id: "nitrile-gloves", name: "Nitrile gloves", category: "Protection and hygiene", unit: "pairs", base: 2, kind: "consumable", unitWeightG: 8, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "cpr-face-shield", name: "CPR face shield / pocket mask", category: "Protection and hygiene", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 12, shelfLifeMonths: 60, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "hand-sanitiser", name: "Alcohol hand rub 50 ml", category: "Protection and hygiene", unit: "bottles", base: 1, kind: "consumable", unitWeightG: 55, shelfLifeMonths: 36, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "biohazard-bag", name: "Biohazard waste bags", category: "Protection and hygiene", unit: "pieces", base: 2, kind: "consumable", unitWeightG: 5, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },

  // Tools
  { id: "shears", name: "Tuff-cut shears", category: "Tools", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 60, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "tweezers", name: "Splinter tweezers", category: "Tools", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 12, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "safety-pins", name: "Safety pins", category: "Tools", unit: "pieces", base: 6, kind: "hardware", unitWeightG: 1, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "thermometer", name: "Digital thermometer", category: "Tools", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 30, shelfLifeMonths: null, profiles: ["home", "office", "travel"] },
  { id: "torch", name: "LED torch with spare cells", category: "Tools", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 55, shelfLifeMonths: null, profiles: ["home", "car", "trek"] },
  { id: "notepad", name: "Notepad and pencil for casualty notes", category: "Tools", unit: "sets", base: 1, kind: "hardware", unitWeightG: 25, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "first-aid-guide", name: "Printed first aid guide", category: "Tools", unit: "copies", base: 1, kind: "hardware", unitWeightG: 60, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "contact-card", name: "Emergency contact and allergy card", category: "Tools", unit: "cards", base: 1, kind: "hardware", unitWeightG: 3, shelfLifeMonths: null, profiles: ["home", "car", "office", "trek", "travel"] },

  // Over-the-counter medicines
  { id: "paracetamol", name: "Paracetamol 500 mg tablets", category: "Over-the-counter medicines", unit: "tablets", base: 10, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 24, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "ors", name: "Oral rehydration salt sachets", category: "Over-the-counter medicines", unit: "sachets", base: 2, kind: "consumable", unitWeightG: 22, shelfLifeMonths: 24, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "antihistamine", name: "Oral antihistamine tablets", category: "Over-the-counter medicines", unit: "tablets", base: 6, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 24, profiles: ["home", "car", "office", "trek", "travel"] },
  { id: "antacid", name: "Antacid tablets", category: "Over-the-counter medicines", unit: "tablets", base: 6, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 24, profiles: ["home", "office", "travel"] },
  { id: "loperamide", name: "Anti-diarrhoeal tablets", category: "Over-the-counter medicines", unit: "tablets", base: 6, kind: "consumable", unitWeightG: 1, shelfLifeMonths: 24, profiles: ["trek", "travel"] },
  { id: "rehydration-bottle", name: "Drinking water pouch for irrigation", category: "Over-the-counter medicines", unit: "pouches", base: 1, kind: "consumable", unitWeightG: 210, shelfLifeMonths: 12, profiles: ["trek"] },
];

/** Extra items added when children are covered by the kit. */
export const CHILD_ITEMS = [
  { id: "child-plasters", name: "Child-size plasters", category: "Wound care", unit: "pieces", base: 8, kind: "consumable", unitWeightG: 2, shelfLifeMonths: 60 },
  { id: "dosing-syringe", name: "Oral dosing syringe with mL markings", category: "Tools", unit: "pieces", base: 1, kind: "hardware", unitWeightG: 8, shelfLifeMonths: null },
  { id: "paediatric-paracetamol", name: "Paediatric paracetamol suspension 60 ml", category: "Over-the-counter medicines", unit: "bottles", base: 1, kind: "consumable", unitWeightG: 95, shelfLifeMonths: 24 },
];

/**
 * ANSI/ISEA Z308.1-2021 Class A minimum fill, for a workplace kit serving up to
 * 25 people. Only the items whose units map cleanly onto this catalogue are listed.
 */
export const ANSI_CLASS_A_MINIMUMS = {
  "adhesive-bandages": 16,
  "adhesive-tape": 1,
  "antibiotic-ointment": 10,
  "antiseptic-wipes": 10,
  "cpr-face-shield": 1,
  "burn-cream": 10,
  "burn-dressing": 1,
  "cold-pack": 1,
  "eye-pad": 2,
  "eye-wash": 1,
  "first-aid-guide": 1,
  "nitrile-gloves": 2,
  "roller-bandage": 1,
  "shears": 1,
  "sterile-gauze": 2,
  "trauma-pad": 2,
  "triangular-bandage": 1,
};

/* Weight above which a kit stops being realistic to carry in a daypack. */
export const TREK_WEIGHT_WARNING_G = 1500;

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function addMonthsIso(isoDate, months) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isFinite(months)) return null;
  const whole = Math.trunc(months);
  const zeroBased = date.month - 1 + whole;
  const year = date.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(date.day, daysInMonth);
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function personFactor(people) {
  const raw = 1 + PERSON_SCALING * (people - REFERENCE_PEOPLE);
  return Math.min(MAX_PERSON_FACTOR, Math.max(1, raw));
}

export function durationFactor(days) {
  const extraWeeks = (days - REFERENCE_DAYS) / 7;
  const raw = 1 + WEEK_SCALING * extraWeeks;
  return Math.min(MAX_DURATION_FACTOR, Math.max(1, raw));
}

export function remotenessFactor(id) {
  const level = REMOTENESS_LEVELS.find((entry) => entry.id === id);
  return level ? level.factor : null;
}

/**
 * Build the kit list.
 * @returns {{error: string}|object}
 */
export function buildFirstAidKit(input = {}) {
  const profileId = clean(input.profile) || "home";
  const profile = KIT_PROFILES.find((entry) => entry.id === profileId);
  if (!profile) {
    return { error: `Unknown kit type. Choose one of ${KIT_PROFILES.map((p) => p.label).join(", ")}.` };
  }

  const people = Number(input.people);
  const days = Number(input.days);
  const remotenessId = clean(input.remoteness) || "urban";
  const riskFactor = remotenessFactor(remotenessId);

  if (!Number.isFinite(people) || !Number.isFinite(days)) {
    return { error: "Enter a number of people and a number of days." };
  }
  if (people < 1) return { error: "A kit has to cover at least one person." };
  if (people > 500) return { error: "For more than 500 people, plan several kits per floor or vehicle instead." };
  if (days < 1) return { error: "Days of coverage must be at least 1." };
  if (days > 365) return { error: "Plan a maximum of 365 days of coverage — restock the kit at least once a year." };
  if (riskFactor === null) {
    return { error: `Distance from help must be one of ${REMOTENESS_LEVELS.map((l) => l.id).join(", ")}.` };
  }

  const purchaseDate = clean(input.purchaseDate);
  if (purchaseDate && !parseIsoDate(purchaseDate)) {
    return { error: "Purchase date must be a real date in YYYY-MM-DD form." };
  }

  const includeChildren = Boolean(input.includeChildren);
  const pFactor = personFactor(people);
  const dFactor = durationFactor(days);
  const consumableFactor = pFactor * dFactor * riskFactor;
  const kitsRequired = Math.max(1, Math.ceil(people / PEOPLE_PER_CLASS_A_KIT));
  const applyAnsiFloor = profileId === "office";

  const source = KIT_ITEMS.filter((item) => item.profiles.includes(profileId));
  const extras = includeChildren ? CHILD_ITEMS : [];
  const catalogue = [...source, ...extras];

  const items = catalogue.map((item) => {
    const scaled =
      item.kind === "consumable"
        ? Math.ceil(item.base * consumableFactor)
        : item.base;
    const floor = applyAnsiFloor && ANSI_CLASS_A_MINIMUMS[item.id]
      ? ANSI_CLASS_A_MINIMUMS[item.id] * kitsRequired
      : 0;
    const quantity = Math.max(1, scaled, floor);
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      kind: item.kind,
      quantity,
      meetsAnsiFloor: floor > 0,
      ansiFloor: floor || null,
      weightG: quantity * item.unitWeightG,
      shelfLifeMonths: item.shelfLifeMonths,
      replaceBy: item.shelfLifeMonths && purchaseDate ? addMonthsIso(purchaseDate, item.shelfLifeMonths) : null,
    };
  });

  const groups = ITEM_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightG = items.reduce((sum, item) => sum + item.weightG, 0);
  const lineCount = items.length;

  const expiringItems = items
    .filter((item) => item.shelfLifeMonths !== null)
    .sort((a, b) => a.shelfLifeMonths - b.shelfLifeMonths);
  const shortestShelfLifeMonths = expiringItems.length ? expiringItems[0].shelfLifeMonths : null;
  const firstReplaceBy = expiringItems.length ? expiringItems[0].replaceBy : null;
  const nextCheckDate = purchaseDate ? addMonthsIso(purchaseDate, KIT_CHECK_INTERVAL_MONTHS) : null;

  const warnings = [];
  if (applyAnsiFloor && kitsRequired > 1) {
    warnings.push(
      `${people} people needs ${kitsRequired} workplace kits under the one-kit-per-25-people rule. Split this list across ${kitsRequired} boxes at different locations.`,
    );
  }
  if (profileId === "trek" && totalWeightG > TREK_WEIGHT_WARNING_G) {
    warnings.push(
      `The list weighs about ${(totalWeightG / 1000).toFixed(2)} kg — heavy for a daypack. Share the bulky items (splint, cold pack, blanket) across the group.`,
    );
  }
  if (remotenessId === "remote" && !items.some((item) => item.id === "tourniquet")) {
    warnings.push(
      "You are more than two hours from help but this kit type has no tourniquet or pressure bandage. Consider adding one and getting trained to use it.",
    );
  }
  if (!purchaseDate) {
    warnings.push("Add a purchase or pack date to get expiry and restock dates for the perishable items.");
  }

  return {
    profile: profile.label,
    profileId,
    people,
    days,
    remoteness: REMOTENESS_LEVELS.find((l) => l.id === remotenessId).label,
    personFactor: pFactor,
    durationFactor: dFactor,
    riskFactor,
    consumableFactor,
    kitsRequired,
    appliedAnsiFloor: applyAnsiFloor,
    includeChildren,
    groups,
    items,
    lineCount,
    totalUnits,
    totalWeightG,
    shortestShelfLifeMonths,
    firstReplaceBy,
    nextCheckDate,
    warnings,
  };
}

/** Plain-text checklist suitable for pasting into notes or a shopping list. */
export function kitToText(kit) {
  if (!kit || kit.error) return "";
  const lines = [
    `First aid kit — ${kit.profile}`,
    `${kit.people} people · ${kit.days} days · ${kit.remoteness}`,
    `${kit.lineCount} line items · ${kit.totalUnits} units · ${(kit.totalWeightG / 1000).toFixed(2)} kg`,
    "",
  ];
  kit.groups.forEach((group) => {
    lines.push(group.category.toUpperCase());
    group.items.forEach((item) => {
      lines.push(`  [ ] ${item.name} — ${item.quantity} ${item.unit}`);
    });
    lines.push("");
  });
  if (kit.nextCheckDate) lines.push(`Next kit check: ${kit.nextCheckDate}`);
  return lines.join("\n").trim();
}

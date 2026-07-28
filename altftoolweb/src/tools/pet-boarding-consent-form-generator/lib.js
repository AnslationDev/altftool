/**
 * Pet boarding consent form builder.
 *
 * Pure module - no React, no DOM, no clocks. Two real calculations sit behind
 * the form so the kennel is not guessing:
 *
 *   1. FOOD. Resting Energy Requirement is the standard small-animal energy
 *      equation, RER (kcal/day) = 70 x bodyweight(kg)^0.75. Daily intake is
 *      RER multiplied by a life-stage factor (Maintenance Energy Requirement),
 *      then converted to grams using the energy density printed on the food bag.
 *      Multipliers below are the values published in veterinary nutrition
 *      references and the WSAVA feeding-guide calculators.
 *
 *   2. STAY. Nights between drop-off and collection, feeding days (both partial
 *      days count), the food to pack including a delay buffer, and the total
 *      board cost including per-day extras.
 *
 * These are planning figures for a healthy animal. A pet on a prescription
 * diet, or with a medical condition, is fed on its own vet's instructions.
 */

// RER (kcal/day) = 70 x bodyweight(kg)^0.75. The standard interspecific
// allometric equation for resting energy in dogs and cats.
export const RER_COEFFICIENT = 70;
export const RER_EXPONENT = 0.75;

// Maintenance Energy Requirement = factor x RER. Published veterinary values.
export const LIFE_STAGES = [
  { id: "dogNeutered", species: "dog", label: "Adult dog, neutered", factor: 1.6 },
  { id: "dogIntact", species: "dog", label: "Adult dog, entire", factor: 1.8 },
  { id: "dogInactive", species: "dog", label: "Adult dog, inactive or prone to weight gain", factor: 1.3 },
  { id: "dogWeightLoss", species: "dog", label: "Dog on a weight-loss plan", factor: 1.0 },
  { id: "dogActive", species: "dog", label: "Working or highly active dog", factor: 2.5 },
  { id: "puppyYoung", species: "dog", label: "Puppy under 4 months", factor: 3.0 },
  { id: "puppyOlder", species: "dog", label: "Puppy 4 months to adult", factor: 2.0 },
  { id: "catNeutered", species: "cat", label: "Adult cat, neutered", factor: 1.2 },
  { id: "catIntact", species: "cat", label: "Adult cat, entire", factor: 1.4 },
  { id: "catInactive", species: "cat", label: "Adult cat, inactive or prone to weight gain", factor: 1.0 },
  { id: "catWeightLoss", species: "cat", label: "Cat on a weight-loss plan", factor: 0.8 },
  { id: "kitten", species: "cat", label: "Kitten", factor: 2.5 },
];

// Extra food sent with the pet so a delayed flight or a late collection does
// not force an abrupt diet change, which is a common cause of boarding-related
// stomach upset.
export const FOOD_BUFFER_PERCENT = 20;

// Core vaccinations boarding facilities normally insist on seeing in date.
export const VACCINATION_REQUIREMENTS = {
  dog: [
    "Rabies",
    "DHPP / DHLPP (distemper, hepatitis-adenovirus, parvovirus, parainfluenza)",
    "Bordetella (kennel cough) - usually required within the last 6-12 months",
  ],
  cat: [
    "Rabies",
    "FVRCP (feline viral rhinotracheitis, calicivirus, panleukopenia)",
  ],
};

export const BOARDING_WEIGHT_MIN_KG = 0.5;
export const BOARDING_WEIGHT_MAX_KG = 100;
export const KCAL_PER_100G_MIN = 20;
export const KCAL_PER_100G_MAX = 600;
export const MAX_MEALS_PER_DAY = 6;
export const MAX_NIGHTS = 365;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

export function nightsBetween(fromIso, toIso) {
  if (!isValidIsoDate(fromIso) || !isValidIsoDate(toIso)) return null;
  const stamp = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((stamp(toIso) - stamp(fromIso)) / 86400000);
}

/** RER in kcal/day for a bodyweight in kg. Null outside the sane range. */
export function restingEnergyRequirement(weightKg) {
  if (!Number.isFinite(weightKg)) return null;
  if (weightKg < BOARDING_WEIGHT_MIN_KG || weightKg > BOARDING_WEIGHT_MAX_KG) return null;
  return RER_COEFFICIENT * Math.pow(weightKg, RER_EXPONENT);
}

/**
 * Daily ration for a healthy pet.
 * @returns {null|{rerKcal, merKcal, gramsPerDay, gramsPerMeal, factor, stageLabel}}
 */
export function dailyRation({ weightKg, stageId, kcalPer100g, mealsPerDay }) {
  const rer = restingEnergyRequirement(weightKg);
  if (rer === null) return null;
  const stage = LIFE_STAGES.find((item) => item.id === stageId);
  if (!stage) return null;
  if (!Number.isFinite(kcalPer100g) || kcalPer100g < KCAL_PER_100G_MIN || kcalPer100g > KCAL_PER_100G_MAX) {
    return null;
  }
  if (!Number.isFinite(mealsPerDay) || mealsPerDay < 1 || mealsPerDay > MAX_MEALS_PER_DAY) return null;

  const merKcal = rer * stage.factor;
  const gramsPerDay = (merKcal / kcalPer100g) * 100;
  const meals = Math.round(mealsPerDay);
  return {
    rerKcal: rer,
    merKcal,
    gramsPerDay,
    gramsPerMeal: gramsPerDay / meals,
    mealsPerDay: meals,
    factor: stage.factor,
    stageLabel: stage.label,
    species: stage.species,
  };
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build the boarding consent form.
 * @returns {{error: string}} on bad input, otherwise the document and figures.
 */
export function buildPetBoardingConsent(input = {}) {
  const ownerName = clean(input.ownerName);
  const ownerPhone = clean(input.ownerPhone);
  const altContactName = clean(input.altContactName);
  const altContactPhone = clean(input.altContactPhone);
  const facilityName = clean(input.facilityName);
  const petName = clean(input.petName);
  const breed = clean(input.breed);
  const microchip = clean(input.microchip);
  const vetName = clean(input.vetName);
  const vetPhone = clean(input.vetPhone);
  const foodBrand = clean(input.foodBrand);
  const medications = clean(input.medications);
  const behaviourNotes = clean(input.behaviourNotes);
  const currencySymbol = clean(input.currencySymbol) || "INR";
  const checkInDate = clean(input.checkInDate);
  const checkOutDate = clean(input.checkOutDate);
  const stageId = clean(input.stageId) || "dogNeutered";
  const vaccinationsCurrent = Boolean(input.vaccinationsCurrent);
  const allowGrooming = Boolean(input.allowGrooming);
  const allowGroupPlay = Boolean(input.allowGroupPlay);
  const allowPhotos = Boolean(input.allowPhotos);

  const weightKg = Number(input.weightKg);
  const kcalPer100g = Number(input.kcalPer100g);
  const mealsPerDay = Number(input.mealsPerDay);
  const nightlyRate = Number(input.nightlyRate);
  const dailyExtras = Number(input.dailyExtras ?? 0);
  const vetSpendCap = Number(input.vetSpendCap);

  if (!ownerName || !ownerPhone) return { error: "Enter the owner's name and a phone number." };
  if (!facilityName) return { error: "Enter the boarding facility's name." };
  if (!petName) return { error: "Enter the pet's name." };
  if (!vetName || !vetPhone) {
    return { error: "Enter the vet's name and phone number - the treatment authority is meaningless without one." };
  }
  if (!isValidIsoDate(checkInDate) || !isValidIsoDate(checkOutDate)) {
    return { error: "Enter valid drop-off and collection dates in YYYY-MM-DD form." };
  }

  const nights = nightsBetween(checkInDate, checkOutDate);
  if (nights === null || nights < 1) {
    return { error: "The collection date must be at least one night after the drop-off date." };
  }
  if (nights > MAX_NIGHTS) {
    return { error: `A stay longer than ${MAX_NIGHTS} nights is a fostering arrangement, not boarding - use a different agreement.` };
  }

  const ration = dailyRation({ weightKg, stageId, kcalPer100g, mealsPerDay });
  if (!ration) {
    return {
      error: `Check the feeding figures: weight ${BOARDING_WEIGHT_MIN_KG}-${BOARDING_WEIGHT_MAX_KG} kg, food energy ${KCAL_PER_100G_MIN}-${KCAL_PER_100G_MAX} kcal per 100 g, and 1-${MAX_MEALS_PER_DAY} meals a day.`,
    };
  }

  if (!Number.isFinite(nightlyRate) || nightlyRate < 0) return { error: "Enter the nightly rate (use 0 if the stay is free)." };
  if (!Number.isFinite(dailyExtras) || dailyExtras < 0) return { error: "Daily extras cannot be negative." };
  if (!Number.isFinite(vetSpendCap) || vetSpendCap < 0) {
    return { error: "Enter the vet spending limit you authorise without being reached first (0 means call me for everything)." };
  }

  // Both the drop-off day and the collection day involve at least one meal.
  const feedingDays = nights + 1;
  const foodNeededG = ration.gramsPerDay * feedingDays;
  const foodToPackG = foodNeededG * (1 + FOOD_BUFFER_PERCENT / 100);
  const boardCost = nights * nightlyRate;
  const extrasCost = feedingDays * dailyExtras;
  const totalCost = boardCost + extrasCost;

  const species = ration.species;
  const vaccineList = VACCINATION_REQUIREMENTS[species] || [];

  const money = (value) => `${currencySymbol} ${Math.round(value).toLocaleString("en-IN")}`;
  const grams = (value) => `${Math.round(value)} g`;

  const warnings = [];
  if (!vaccinationsCurrent) {
    warnings.push(`Vaccinations are not confirmed as in date. Most facilities will refuse admission without proof of ${vaccineList.join(", ")}.`);
  }
  if (vetSpendCap === 0) {
    warnings.push("With a zero spending limit, staff must reach you before any treatment. Make sure at least one of your two numbers is answered day and night, or raise the cap.");
  }
  if (!altContactName || !altContactPhone) {
    warnings.push("No second contact. If you are unreachable and the pet needs a decision, there is nobody the kennel can lawfully ask.");
  }
  if (medications) {
    warnings.push("Medication is being handed over: send it in the original labelled packaging, count it in and count it out, and have both parties sign the count.");
  }
  if (nights > 14) {
    warnings.push(`A ${nights}-night stay is long enough to need a mid-stay welfare update and a weight check on collection.`);
  }
  if (allowGroupPlay) {
    warnings.push("Group play raises the chance of scuffles and of kennel cough spreading. Ask how groups are matched and how they are supervised.");
  }
  if (ration.factor >= 2.5) {
    warnings.push("This life stage eats a lot for its size - check the kennel can store and serve the full daily amount before you commit.");
  }

  const sections = [
    {
      heading: "1. Owner and pet",
      body: [
        `Owner: ${ownerName}    Phone: ${ownerPhone}`,
        altContactName ? `Second contact: ${altContactName}    Phone: ${altContactPhone}` : "Second contact: ______________________    Phone: ______________",
        `Pet: ${petName}${breed ? ` (${breed})` : ""}    Species: ${species}`,
        `Weight at drop-off: ${weightKg} kg`,
        microchip ? `Microchip / tag number: ${microchip}` : "Microchip / tag number: ______________________",
        `Boarding at: ${facilityName}`,
        `Drop-off: ${formatLongDate(checkInDate)}    Collection: ${formatLongDate(checkOutDate)}    Nights: ${nights}`,
      ].join("\n"),
    },
    {
      heading: "2. Vaccination",
      body: [
        vaccinationsCurrent
          ? "The owner confirms the following vaccinations are current and has supplied the certificate:"
          : "The owner has NOT yet confirmed current vaccinations. The following are required before admission:",
        vaccineList.map((item) => `  - ${item}`).join("\n"),
        "The owner also confirms the pet is free of fleas, ticks and worms, and has not shown sickness, diarrhoea or a cough in the 48 hours before drop-off.",
      ].join("\n"),
    },
    {
      heading: "3. Feeding",
      body: [
        `${petName} is fed ${foodBrand || "the food supplied by the owner"} at ${ration.mealsPerDay} meal${ration.mealsPerDay === 1 ? "" : "s"} a day.`,
        `Daily amount: ${grams(ration.gramsPerDay)} (about ${Math.round(ration.merKcal)} kcal), which is ${grams(ration.gramsPerMeal)} per meal.`,
        `Food supplied for the stay: ${grams(foodToPackG)} - that is ${feedingDays} feeding day${feedingDays === 1 ? "" : "s"} plus a ${FOOD_BUFFER_PERCENT}% buffer for a late collection.`,
        "Do not change the diet, add table scraps or introduce new treats without the owner's agreement. Fresh water must be available at all times.",
      ].join("\n"),
    },
    {
      heading: "4. Medication",
      body: medications
        ? `${petName} receives: ${medications}\nMedication is handed over in its original labelled packaging, counted in on arrival and counted out on collection, and both parties sign the count. Staff will record each dose given, with the time and the initials of the person giving it.`
        : `${petName} is not on any medication. If medication becomes necessary during the stay, the owner is told before the first dose unless a vet directs otherwise in an emergency.`,
    },
    {
      heading: "5. Veterinary treatment authority",
      body: [
        `Regular vet: ${vetName}, ${vetPhone}.`,
        `If ${petName} becomes ill or is injured and the owner cannot be reached, ${facilityName} is authorised to seek veterinary attention from the regular vet, or from the nearest available veterinary surgeon if the regular vet is unavailable, and to consent to the treatment that vet advises.`,
        vetSpendCap > 0
          ? `The owner authorises treatment costs up to ${money(vetSpendCap)} without prior approval, and agrees to reimburse ${facilityName} for any amount properly incurred under this clause. Above that figure, staff will keep trying both contact numbers before agreeing to further treatment, except where a vet advises that delay would cause suffering.`
          : "The owner has set no pre-approved spending limit, so staff must reach the owner or the second contact before agreeing to any treatment, except where a vet advises that delay would cause suffering.",
        "Nothing in this clause obliges the facility to withhold emergency pain relief or life-saving treatment.",
      ].join(" "),
    },
    {
      heading: "6. Activities the owner permits",
      body: [
        allowGroupPlay
          ? "Supervised group play with other compatible animals: PERMITTED."
          : "Supervised group play with other animals: NOT permitted - this pet is exercised alone.",
        allowGrooming
          ? "Bathing, brushing and nail trimming as needed: PERMITTED."
          : "Grooming beyond basic brushing: NOT permitted without a further call.",
        allowPhotos
          ? `Photographs of ${petName} may be sent to the owner and posted on the facility's social media.`
          : `Photographs of ${petName} may be sent to the owner only, and must not be posted publicly.`,
        behaviourNotes ? `Behaviour and handling notes: ${behaviourNotes}` : null,
      ].filter(Boolean).join("\n"),
    },
    {
      heading: "7. Charges",
      body: [
        `Nightly rate: ${money(nightlyRate)} x ${nights} night${nights === 1 ? "" : "s"} = ${money(boardCost)}.`,
        dailyExtras > 0 ? `Daily extras: ${money(dailyExtras)} x ${feedingDays} day${feedingDays === 1 ? "" : "s"} = ${money(extrasCost)}.` : "No daily extras agreed.",
        `Total quoted for the stay: ${money(totalCost)}, excluding any veterinary costs and any night beyond the collection date.`,
        "Late collection is charged at the nightly rate. Veterinary costs incurred under clause 5 are added to the final bill.",
      ].join(" "),
    },
    {
      heading: "8. Risk and liability",
      body: [
        `${facilityName} will take reasonable care of ${petName} and follow the instructions in this form.`,
        "Boarding carries risks that reasonable care cannot remove: kennel cough and other airborne infections, stress-related stomach upset, self-injury from fence or crate contact, and escape during handover.",
        "The facility is not liable for illness, injury or loss that occurs despite reasonable care, but nothing here limits its liability for its own negligence or for death or personal injury caused by negligence, and nothing here overrides the owner's statutory rights.",
        "The owner confirms the pet has no history of biting or aggression that has not been disclosed above.",
      ].join(" "),
    },
    {
      heading: "9. Uncollected animals",
      body: `If ${petName} is not collected within 7 days of ${formatLongDate(checkOutDate)} and the owner and second contact cannot be reached, ${facilityName} will notify the owner in writing at the address held, continue to care for the pet at the owner's cost, and may then place the pet with a rehoming organisation in line with local law. Charges continue to accrue throughout.`,
    },
    {
      heading: "10. Signatures",
      body: [
        "I have read this form, the information in it is accurate and complete, and I authorise the arrangements above.",
        "",
        `Owner: ${ownerName}`,
        "Signature: ______________________    Date: ______________",
        "",
        `For ${facilityName}`,
        "Name and role: ______________________",
        "Signature: ______________________    Date: ______________",
      ].join("\n"),
    },
  ];

  const documentText = [
    "PET BOARDING CONSENT AND CARE AGREEMENT",
    "",
    ...sections.flatMap((section) => [section.heading, section.body, ""]),
    "Informational template only, not legal or veterinary advice. Feeding figures are for a healthy animal - follow your vet's instructions for a prescription diet or a medical condition.",
  ].join("\n");

  return {
    sections,
    documentText,
    nights,
    feedingDays,
    ration,
    foodNeededG,
    foodToPackG,
    boardCost,
    extrasCost,
    totalCost,
    vetSpendCap,
    species,
    vaccineList,
    currencySymbol,
    warnings,
  };
}

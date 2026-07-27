/**
 * Weekly pill organiser (dosette box) layout builder.
 *
 * A standard 7-day organiser has four compartments per day, labelled the way
 * prescriptions are written in English and in Latin abbreviation:
 *   Morning (mane), Noon (meridie), Evening (vespere), Night (nocte).
 *
 * The layout is pure counting, not pharmacology:
 *   tablets in a compartment = sum over medicines scheduled for that
 *                              day + slot of (tablets per dose)
 *   tablets per week for a medicine = tablets per dose x slots per day x days per week
 *   doses per week for a medicine    = slots per day x days per week
 *
 * Compartment capacity is a physical property of the box, not a medical rule,
 * so it is an input. Eight standard-size tablets is a common practical limit
 * for a typical 7-day organiser compartment; large capsules fit fewer, and
 * boxes vary widely by brand, so the figure is adjustable.
 */

/** The four compartments on a standard 7-day organiser, in order. */
export const SLOTS = [
  { id: "morning", label: "Morning", latin: "mane", suggestedTime: "08:00" },
  { id: "noon", label: "Noon", latin: "meridie", suggestedTime: "13:00" },
  { id: "evening", label: "Evening", latin: "vespere", suggestedTime: "18:00" },
  { id: "night", label: "Night", latin: "nocte", suggestedTime: "22:00" },
];

/** Days of the week, Monday first, matching how organisers are printed. */
export const DAYS = [
  { id: "mon", label: "Monday", short: "Mon" },
  { id: "tue", label: "Tuesday", short: "Tue" },
  { id: "wed", label: "Wednesday", short: "Wed" },
  { id: "thu", label: "Thursday", short: "Thu" },
  { id: "fri", label: "Friday", short: "Fri" },
  { id: "sat", label: "Saturday", short: "Sat" },
  { id: "sun", label: "Sunday", short: "Sun" },
];

/**
 * Practical tablet limit for one compartment of a typical 7-day organiser.
 * A box property, not a dosing rule — override it for your own box.
 */
export const DEFAULT_COMPARTMENT_CAPACITY = 8;

/** Refuses to lay out more than this many medicines, to keep the grid readable. */
export const MAX_MEDICINES = 20;

const SLOT_IDS = SLOTS.map((slot) => slot.id);
const DAY_IDS = DAYS.map((day) => day.id);

/** Common prescription frequencies mapped to organiser compartments. */
export const FREQUENCY_PRESETS = [
  { id: "od-morning", label: "Once daily, morning", slots: ["morning"] },
  { id: "od-night", label: "Once daily, at night", slots: ["night"] },
  { id: "bd", label: "Twice daily (BD)", slots: ["morning", "night"] },
  { id: "tds", label: "Three times daily (TDS)", slots: ["morning", "noon", "night"] },
  { id: "qds", label: "Four times daily (QDS)", slots: ["morning", "noon", "evening", "night"] },
];

/**
 * @param {object} input
 * @param {Array} input.medicines  [{ name, tabletsPerDose, slots: string[], days: string[] }]
 * @param {number} [input.compartmentCapacity]
 * @returns {object} layout or { error }
 */
export function buildOrganiser({ medicines, compartmentCapacity = DEFAULT_COMPARTMENT_CAPACITY }) {
  if (!Array.isArray(medicines) || medicines.length === 0) {
    return { error: "Add at least one medicine to lay out the organiser." };
  }
  if (medicines.length > MAX_MEDICINES) {
    return { error: `This builder handles up to ${MAX_MEDICINES} medicines at a time.` };
  }
  if (
    typeof compartmentCapacity !== "number" ||
    !Number.isFinite(compartmentCapacity) ||
    compartmentCapacity < 1
  ) {
    return { error: "Compartment capacity must be at least 1 tablet." };
  }

  const clean = [];
  for (let index = 0; index < medicines.length; index += 1) {
    const medicine = medicines[index] ?? {};
    const name = String(medicine.name ?? "").trim();
    const position = index + 1;
    if (!name) return { error: `Medicine ${position} needs a name.` };
    const tabletsPerDose = Number(medicine.tabletsPerDose);
    if (!Number.isFinite(tabletsPerDose) || tabletsPerDose <= 0) {
      return { error: `${name}: tablets per dose must be greater than zero.` };
    }
    if (tabletsPerDose > 20) {
      return { error: `${name}: ${tabletsPerDose} tablets in one dose looks like a typo.` };
    }
    const slots = (Array.isArray(medicine.slots) ? medicine.slots : []).filter((slot) =>
      SLOT_IDS.includes(slot),
    );
    if (slots.length === 0) {
      return { error: `${name}: pick at least one compartment (morning, noon, evening or night).` };
    }
    const days = (Array.isArray(medicine.days) ? medicine.days : []).filter((day) =>
      DAY_IDS.includes(day),
    );
    if (days.length === 0) {
      return { error: `${name}: pick at least one day of the week.` };
    }
    clean.push({ name, tabletsPerDose, slots, days });
  }

  const grid = DAYS.map((day) => ({
    dayId: day.id,
    dayLabel: day.label,
    dayShort: day.short,
    cells: SLOTS.map((slot) => {
      const items = clean
        .filter((med) => med.days.includes(day.id) && med.slots.includes(slot.id))
        .map((med) => ({ name: med.name, tablets: med.tabletsPerDose }));
      return {
        slotId: slot.id,
        slotLabel: slot.label,
        items,
        tablets: items.reduce((sum, item) => sum + item.tablets, 0),
        over: items.reduce((sum, item) => sum + item.tablets, 0) > compartmentCapacity,
      };
    }),
  }));

  const perMedicine = clean.map((med) => {
    const dosesPerWeek = med.slots.length * med.days.length;
    return {
      name: med.name,
      tabletsPerDose: med.tabletsPerDose,
      slotLabels: med.slots
        .map((id) => SLOTS.find((slot) => slot.id === id)?.label)
        .filter(Boolean),
      dayCount: med.days.length,
      dosesPerWeek,
      tabletsPerWeek: dosesPerWeek * med.tabletsPerDose,
    };
  });

  const perSlot = SLOTS.map((slot) => ({
    slotId: slot.id,
    slotLabel: slot.label,
    tablets: grid.reduce(
      (sum, day) => sum + (day.cells.find((cell) => cell.slotId === slot.id)?.tablets ?? 0),
      0,
    ),
  }));

  const allCells = grid.flatMap((day) =>
    day.cells.map((cell) => ({ ...cell, dayLabel: day.dayLabel })),
  );
  const busiest = allCells.reduce(
    (best, cell) => (cell.tablets > best.tablets ? cell : best),
    allCells[0],
  );
  const overCapacity = allCells.filter((cell) => cell.over);

  const weeklyTablets = perMedicine.reduce((sum, med) => sum + med.tabletsPerWeek, 0);
  const weeklyDoses = perMedicine.reduce((sum, med) => sum + med.dosesPerWeek, 0);

  return {
    grid,
    perMedicine,
    perSlot,
    weeklyTablets,
    weeklyDoses,
    medicineCount: clean.length,
    compartmentCapacity,
    busiestCompartment: busiest,
    overCapacity,
    filledCompartments: allCells.filter((cell) => cell.tablets > 0).length,
    emptyCompartments: allCells.filter((cell) => cell.tablets === 0).length,
  };
}

/** Slot ids for a named prescription frequency, or an empty list if unknown. */
export function slotsForFrequency(presetId) {
  return FREQUENCY_PRESETS.find((preset) => preset.id === presetId)?.slots ?? [];
}

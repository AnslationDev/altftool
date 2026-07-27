/**
 * Local cuisine bucket list builder.
 *
 * A must-eat list is really a capacity problem, and it is the one people never
 * do the arithmetic on. A trip offers a fixed number of eating slots:
 *
 *     main slots  = days x main meals per day
 *     light slots = days x snack / dessert / drink stops per day
 *
 * A full dish needs a main slot. A snack, sweet or drink needs a light slot,
 * and will fall back to a main slot when the light slots run out. If "doubling
 * up" is allowed, a full dish may also take a light slot — which is what people
 * actually do on a short trip, and what makes them feel sick by day three.
 *
 * Dishes are placed by priority (must-eat first), then in list order, into the
 * earliest day with a free slot of the right type. What does not fit is
 * returned explicitly rather than silently dropped, because the useful output
 * of this exercise is "these four will not happen — pick two".
 *
 * Everything is pure: the schedule depends only on the list and the trip shape,
 * never on the clock.
 */

/** Priority bands. Lower number is placed first. */
export const PRIORITIES = [
  { value: 1, id: "must", label: "Must eat", note: "You would be annoyed to come home without it." },
  { value: 2, id: "want", label: "Want to try", note: "On the list, not worth rearranging a day for." },
  { value: 3, id: "maybe", label: "If there is time", note: "Nice to have, first to be cut." },
];

/** A dish either fills a meal or fills a gap between meals. */
export const DISH_KINDS = [
  { id: "main", label: "Full dish (a meal)", slot: "main" },
  { id: "light", label: "Snack, sweet or drink", slot: "light" },
];

/**
 * Tags used for filtering. These describe what is in the dish, so one list can
 * serve travellers with different restrictions without rewriting it.
 */
export const DIET_TAGS = [
  { id: "meat", label: "Contains meat" },
  { id: "fish", label: "Contains fish or shellfish" },
  { id: "egg", label: "Contains egg" },
  { id: "dairy", label: "Contains dairy" },
  { id: "nuts", label: "Contains nuts" },
  { id: "gluten", label: "Contains gluten" },
  { id: "raw", label: "Served raw or undercooked" },
  { id: "verySpicy", label: "Very spicy" },
];

export const MAX_DAYS = 90;
export const MAX_MAIN_MEALS_PER_DAY = 5;
export const MAX_LIGHT_SLOTS_PER_DAY = 8;
export const MAX_DISHES = 120;

const KIND_BY_ID = Object.fromEntries(DISH_KINDS.map((kind) => [kind.id, kind]));

/** A stable id for a new dish row, derived from a counter the caller holds. */
export function makeDishId(counter) {
  return `dish-${counter}`;
}

/** Blank dish row. */
export function emptyDish(counter) {
  return { id: makeDishId(counter), name: "", kind: "main", priority: 2, tags: [], ticked: false, note: "" };
}

/**
 * @param {object} input
 * @param {number} input.days
 * @param {number} input.mainMealsPerDay
 * @param {number} input.lightSlotsPerDay
 * @param {boolean} input.allowDoubleUp   full dishes may also take a light slot
 * @param {string[]} input.avoidTags      DIET_TAGS ids to exclude
 * @param {Array} input.dishes
 */
export function buildBucketList(input) {
  const {
    days,
    mainMealsPerDay,
    lightSlotsPerDay,
    allowDoubleUp = false,
    avoidTags = [],
    dishes = [],
  } = input || {};

  const dayCount = Number(days);
  const mainPerDay = Number(mainMealsPerDay);
  const lightPerDay = Number(lightSlotsPerDay);

  if (![dayCount, mainPerDay, lightPerDay].every(Number.isFinite)) {
    return { error: "Enter a number of days, meals and snack stops." };
  }
  if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > MAX_DAYS) {
    return { error: `Days must be a whole number between 1 and ${MAX_DAYS}.` };
  }
  if (!Number.isInteger(mainPerDay) || mainPerDay < 0 || mainPerDay > MAX_MAIN_MEALS_PER_DAY) {
    return { error: `Main meals per day must be a whole number between 0 and ${MAX_MAIN_MEALS_PER_DAY}.` };
  }
  if (!Number.isInteger(lightPerDay) || lightPerDay < 0 || lightPerDay > MAX_LIGHT_SLOTS_PER_DAY) {
    return { error: `Snack stops per day must be a whole number between 0 and ${MAX_LIGHT_SLOTS_PER_DAY}.` };
  }
  if (mainPerDay + lightPerDay < 1) {
    return { error: "A day needs at least one eating slot — raise meals or snack stops above zero." };
  }
  if (!Array.isArray(dishes)) {
    return { error: "The dish list is missing." };
  }
  if (dishes.length > MAX_DISHES) {
    return { error: `Keep the list to ${MAX_DISHES} dishes or fewer.` };
  }

  const named = dishes.filter((dish) => typeof dish?.name === "string" && dish.name.trim().length > 0);
  if (named.length === 0) {
    return { error: "Add at least one dish with a name." };
  }

  const avoid = new Set(Array.isArray(avoidTags) ? avoidTags : []);

  const classified = named.map((dish, index) => {
    const tags = Array.isArray(dish.tags) ? dish.tags : [];
    const blockedBy = tags.filter((tag) => avoid.has(tag));
    const kind = KIND_BY_ID[dish.kind] ? dish.kind : "main";
    const priority = PRIORITIES.some((p) => p.value === Number(dish.priority)) ? Number(dish.priority) : 2;
    return {
      id: dish.id || makeDishId(index),
      name: dish.name.trim(),
      note: typeof dish.note === "string" ? dish.note.trim() : "",
      kind,
      slot: KIND_BY_ID[kind].slot,
      priority,
      tags,
      ticked: Boolean(dish.ticked),
      excluded: blockedBy.length > 0,
      blockedBy,
      order: index,
    };
  });

  const ticked = classified.filter((dish) => dish.ticked && !dish.excluded);
  const excluded = classified.filter((dish) => dish.excluded);
  const pending = classified.filter((dish) => !dish.ticked && !dish.excluded);

  // Build the empty days, then fill them.
  const schedule = Array.from({ length: dayCount }, (_, index) => ({
    day: index + 1,
    mainFree: mainPerDay,
    lightFree: lightPerDay,
    main: [],
    light: [],
  }));

  const queue = [...pending].sort((a, b) => a.priority - b.priority || a.order - b.order);
  const unscheduled = [];

  for (const dish of queue) {
    let placed = false;
    // Preferred slot type first, then the documented fallback.
    const attempts =
      dish.slot === "light"
        ? ["light", "main"]
        : allowDoubleUp
          ? ["main", "light"]
          : ["main"];

    for (const slotType of attempts) {
      const day = schedule.find((entry) => (slotType === "main" ? entry.mainFree : entry.lightFree) > 0);
      if (!day) continue;
      if (slotType === "main") {
        day.mainFree -= 1;
        day.main.push({ ...dish, placedAs: "main" });
      } else {
        day.lightFree -= 1;
        day.light.push({ ...dish, placedAs: "light" });
      }
      placed = true;
      break;
    }
    if (!placed) unscheduled.push(dish);
  }

  const mainSlots = dayCount * mainPerDay;
  const lightSlots = dayCount * lightPerDay;
  const totalSlots = mainSlots + lightSlots;
  const scheduledCount = pending.length - unscheduled.length;
  const usedSlots = schedule.reduce((sum, day) => sum + day.main.length + day.light.length, 0);
  const eligible = classified.length - excluded.length;
  const progressPct = eligible > 0 ? (ticked.length / eligible) * 100 : 0;
  const pacePerDay = dayCount > 0 ? pending.length / dayCount : 0;

  const verdict = unscheduled.length === 0
    ? { id: "fits", label: "The whole list fits", note: `${usedSlots} of ${totalSlots} eating slots used.` }
    : {
        id: "over",
        label: `${unscheduled.length} dish${unscheduled.length === 1 ? "" : "es"} will not fit`,
        note: `You have ${totalSlots} eating slots and ${pending.length} dishes still to eat.`,
      };

  const cuts = [...unscheduled].sort((a, b) => b.priority - a.priority || b.order - a.order);

  const notes = [];
  if (pacePerDay > 4) {
    notes.push("More than four new dishes a day is a lot to actually enjoy — most people slow down after the first two days.");
  }
  if (unscheduled.some((dish) => dish.priority === 1)) {
    notes.push("A must-eat dish did not fit. Drop something lower down the list or add a day.");
  }
  if (lightPerDay === 0 && classified.some((dish) => dish.kind === "light")) {
    notes.push("You have snacks and sweets on the list but no snack stops in the day, so they are competing for meal slots.");
  }
  if (excluded.length > 0) {
    notes.push(`${excluded.length} dish${excluded.length === 1 ? "" : "es"} filtered out by your dietary settings and left unscheduled.`);
  }

  return {
    days: dayCount,
    mainSlots,
    lightSlots,
    totalSlots,
    usedSlots,
    freeSlots: totalSlots - usedSlots,
    schedule,
    unscheduled,
    cuts,
    ticked,
    excluded,
    pending,
    scheduledCount,
    total: classified.length,
    eligible,
    progressPct,
    pacePerDay,
    verdict,
    notes,
  };
}

/** Clipboard summary of the plan. */
export function formatBucketListText(plan, destination) {
  if (!plan || plan.error) return "";
  const lines = [
    `Must-eat list${destination ? ` — ${destination}` : ""}`,
    `${plan.days} days, ${plan.totalSlots} eating slots, ${plan.total} dishes on the list`,
    `Ticked off: ${plan.ticked.length} of ${plan.eligible} (${Math.round(plan.progressPct)}%)`,
    "",
  ];
  plan.schedule.forEach((day) => {
    if (day.main.length === 0 && day.light.length === 0) return;
    lines.push(`Day ${day.day}`);
    day.main.forEach((dish) => lines.push(`   [meal]  ${dish.name}`));
    day.light.forEach((dish) => lines.push(`   [snack] ${dish.name}`));
  });
  if (plan.unscheduled.length > 0) {
    lines.push("", "Will not fit:");
    plan.unscheduled.forEach((dish) => lines.push(`   ${dish.name}`));
  }
  if (plan.excluded.length > 0) {
    lines.push("", "Filtered out on dietary grounds:");
    plan.excluded.forEach((dish) => lines.push(`   ${dish.name}`));
  }
  return lines.join("\n");
}

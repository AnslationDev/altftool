/**
 * Museum visit time estimator.
 *
 * The estimate is built from measured visitor behaviour rather than a guess at
 * "about two hours".
 *
 * The key number is how long people actually look at a single object, and it is
 * far shorter than anyone expects. Smith and Smith's timing study at the
 * Metropolitan Museum of Art (2001) recorded a median of 17 seconds per work.
 * Smith, Smith and Tinio repeated the method at the Art Institute of Chicago
 * (2017) and recorded a median of 21 seconds and a mean of 28.6 seconds. Those
 * two studies anchor the per-object times used here.
 *
 * The second number is how much of a collection anyone stops for at all. Most
 * visitors walk past the large majority of what is on display, pausing at a
 * minority of objects — which is why gallery count and walking time matter as
 * much as object count.
 *
 * The third is museum fatigue, the effect Benjamin Ives Gilman named in 1916:
 * attention, stopping frequency and time per object all fall away as a visit
 * goes on. This model handles it by scheduling a sit-down break for each hour
 * of gallery time rather than by pretending the pace holds.
 *
 * Two directions are calculated:
 *   forward  — how long will this museum take at this pace?
 *   reverse  — I have N minutes; how much of it will I actually see?
 *
 * All functions are pure: times are arithmetic on the inputs, never the clock.
 */

/** Smith, Smith & Tinio (2017), Art Institute of Chicago: median seconds per work. */
export const ART_INSTITUTE_MEDIAN_SECONDS = 21;

/** Gilman (1916) named museum fatigue; a sit-down is scheduled per hour of gallery time. */
export const FATIGUE_BREAK_INTERVAL_MIN = 60;
export const DEFAULT_REST_BREAK_MIN = 10;

/** Beyond this much continuous gallery time, most people have stopped absorbing anything. */
export const ATTENTION_CEILING_MIN = 180;

/** Walking and orientation time per gallery room, in seconds. */
export const DEFAULT_SECONDS_PER_GALLERY = 45;

/** Audio-guide and label-heavy stops run far longer than a silent look. */
export const DEFAULT_HIGHLIGHT_SECONDS = 180;

export const MAX_OBJECTS = 500000;
export const MAX_GALLERIES = 600;

/**
 * Viewing styles. `stopRate` is the share of objects on display the visitor
 * pauses at; `secondsPerObject` is how long each of those pauses lasts.
 */
export const VIEWING_STYLES = [
  {
    id: "skim",
    label: "Greatest hits only",
    stopRate: 0.08,
    secondsPerObject: 12,
    note: "Walk the route, stop at the famous ones, read almost no labels.",
  },
  {
    id: "normal",
    label: "Ordinary visitor",
    stopRate: 0.25,
    secondsPerObject: ART_INSTITUTE_MEDIAN_SECONDS,
    note: `The measured median pace — ${ART_INSTITUTE_MEDIAN_SECONDS} seconds a work, stopping at a quarter of what is on show.`,
  },
  {
    id: "thorough",
    label: "Thorough",
    stopRate: 0.45,
    secondsPerObject: 45,
    note: "Read the wall texts, take the rooms in order, skip only the repetitive cases.",
  },
  {
    id: "scholar",
    label: "Studying it",
    stopRate: 0.7,
    secondsPerObject: 90,
    note: "Notes, comparisons, second looks. Plan on more than one visit.",
  },
];

const STYLE_BY_ID = Object.fromEntries(VIEWING_STYLES.map((style) => [style.id, style]));

/** Format a number of minutes as "3 h 25 min". */
export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * @param {object} input
 * @param {number} input.objectsOnDisplay
 * @param {number} input.galleries
 * @param {string} input.style              a VIEWING_STYLES id
 * @param {number} input.highlights         works you will give real time to
 * @param {number} input.highlightSeconds
 * @param {number} input.secondsPerGallery
 * @param {number} input.entryMinutes       queue, ticket desk, security
 * @param {number} input.cloakroomMinutes
 * @param {number} input.cafeMinutes
 * @param {number} input.shopMinutes
 * @param {number} input.restBreakMinutes
 * @param {number} input.availableMinutes   0 to skip the reverse calculation
 */
export function estimateMuseumVisit(input) {
  const {
    objectsOnDisplay,
    galleries,
    style = "normal",
    highlights = 0,
    highlightSeconds = DEFAULT_HIGHLIGHT_SECONDS,
    secondsPerGallery = DEFAULT_SECONDS_PER_GALLERY,
    entryMinutes = 0,
    cloakroomMinutes = 0,
    cafeMinutes = 0,
    shopMinutes = 0,
    restBreakMinutes = DEFAULT_REST_BREAK_MIN,
    availableMinutes = 0,
  } = input || {};

  const objects = Number(objectsOnDisplay);
  const rooms = Number(galleries);
  const highlightCount = Number(highlights);
  const highlightSecs = Number(highlightSeconds);
  const gallerySecs = Number(secondsPerGallery);
  const entry = Number(entryMinutes);
  const cloak = Number(cloakroomMinutes);
  const cafe = Number(cafeMinutes);
  const shop = Number(shopMinutes);
  const restMinutes = Number(restBreakMinutes);
  const available = Number(availableMinutes);

  const numbers = [objects, rooms, highlightCount, highlightSecs, gallerySecs, entry, cloak, cafe, shop, restMinutes, available];
  if (!numbers.every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }

  const chosen = STYLE_BY_ID[style];
  if (!chosen) return { error: "Pick a viewing style." };

  if (objects < 1 || objects > MAX_OBJECTS) {
    return { error: `Objects on display must be between 1 and ${MAX_OBJECTS.toLocaleString("en-US")}.` };
  }
  if (rooms < 1 || rooms > MAX_GALLERIES) {
    return { error: `Gallery rooms must be between 1 and ${MAX_GALLERIES}.` };
  }
  if (highlightCount < 0 || highlightCount > objects) {
    return { error: "Highlights must be between zero and the number of objects on display." };
  }
  if (highlightSecs < 0 || highlightSecs > 3600) {
    return { error: "Time per highlight must be between 0 and 3600 seconds." };
  }
  if (gallerySecs < 0 || gallerySecs > 1800) {
    return { error: "Walking time per gallery must be between 0 and 1800 seconds." };
  }
  if ([entry, cloak, cafe, shop].some((value) => value < 0 || value > 600)) {
    return { error: "Queue, cloakroom, café and shop times must each be between 0 and 600 minutes." };
  }
  if (restMinutes < 0 || restMinutes > 120) {
    return { error: "A rest break should be between 0 and 120 minutes." };
  }
  if (available < 0 || available > 1440) {
    return { error: "Time available should be between 0 and 1440 minutes." };
  }

  const stoppedObjects = Math.round(objects * chosen.stopRate);
  const ordinaryStops = Math.max(0, stoppedObjects - Math.min(highlightCount, stoppedObjects));
  const countedHighlights = Math.min(highlightCount, stoppedObjects);

  const viewingSeconds = ordinaryStops * chosen.secondsPerObject + countedHighlights * highlightSecs;
  const transitSeconds = rooms * gallerySecs;
  const galleryMinutes = (viewingSeconds + transitSeconds) / 60;

  const restBreaks = restMinutes > 0 ? Math.floor(galleryMinutes / FATIGUE_BREAK_INTERVAL_MIN) : 0;
  const restTotalMinutes = restBreaks * restMinutes;

  const fixedMinutes = entry + cloak + cafe + shop;
  const totalMinutes = galleryMinutes + restTotalMinutes + fixedMinutes;

  // Reverse: what fits in the time you have?
  let reverse = null;
  if (available > 0) {
    const afterFixed = available - fixedMinutes;

    // Rest breaks are scheduled per hour of *gallery* time (viewing + transit),
    // matching the forward model's own rule — but here gallery time is itself
    // what's left after rest is carved out of the fixed budget: spending an
    // hour of gallery time earns a break, and that break itself eats into the
    // same budget. Re-substituting (budget -> breaks -> smaller budget ->
    // fewer breaks -> bigger budget -> ...) is a fixed-point iteration that
    // can oscillate between two values forever, so solve it directly instead:
    // find the largest number of complete "hour of gallery + its break"
    // cycles that fit, then spend whatever is left of the current cycle.
    const restBreaksFor = (budgetMinutes) =>
      restMinutes > 0 ? Math.floor(Math.max(0, budgetMinutes) / FATIGUE_BREAK_INTERVAL_MIN) : 0;
    let galleryBudgetMinutes;
    if (restMinutes <= 0 || afterFixed <= 0) {
      galleryBudgetMinutes = Math.max(0, afterFixed);
    } else {
      const cycleMinutes = FATIGUE_BREAK_INTERVAL_MIN + restMinutes;
      const fullCycles = Math.floor(afterFixed / cycleMinutes);
      const bandFloor = fullCycles * FATIGUE_BREAK_INTERVAL_MIN;
      const bandCeiling = (fullCycles + 1) * FATIGUE_BREAK_INTERVAL_MIN;
      const budgetCeiling = afterFixed - fullCycles * restMinutes;
      // budgetCeiling can reach into (or past) the next hour boundary, but
      // spending into that hour would earn one more break than the budget
      // allows, so cap one minute short of it rather than overshooting.
      galleryBudgetMinutes = Math.max(bandFloor, Math.min(budgetCeiling, bandCeiling - 1));
    }
    const restAllowance = restBreaksFor(galleryBudgetMinutes) * restMinutes;
    const viewingBudgetSeconds = galleryBudgetMinutes * 60 - transitSeconds;

    if (galleryBudgetMinutes <= 0) {
      reverse = {
        feasible: false,
        objectsPossible: 0,
        coveragePct: 0,
        message: `${formatDuration(available)} is not enough — the queue, cloakroom, café and shop alone come to ${formatDuration(fixedMinutes)}.`,
      };
    } else if (viewingBudgetSeconds <= 0) {
      reverse = {
        feasible: false,
        objectsPossible: 0,
        coveragePct: 0,
        message: `Walking the ${rooms} rooms takes ${formatDuration(transitSeconds / 60)} on its own, which uses the whole gallery budget. You would be moving, not looking.`,
      };
    } else {
      // Mirror the forward calculation's split between highlights (slow,
      // fixed count) and ordinary stops (fast, the rest), instead of pricing
      // every object at the flat per-object rate.
      const perObject = chosen.secondsPerObject;
      const highlightTimeNeeded = highlightCount * highlightSecs;
      let objectsPossible;
      let highlightsPossible;
      if (highlightCount > 0 && viewingBudgetSeconds < highlightTimeNeeded) {
        highlightsPossible = highlightSecs > 0 ? Math.floor(viewingBudgetSeconds / highlightSecs) : highlightCount;
        // Time left over after the partial highlights still buys ordinary-pace
        // objects rather than being discarded.
        const leftoverSeconds = viewingBudgetSeconds - highlightsPossible * highlightSecs;
        objectsPossible = highlightsPossible + Math.floor(leftoverSeconds / perObject);
      } else {
        highlightsPossible = highlightCount;
        const remainingSeconds = viewingBudgetSeconds - highlightTimeNeeded;
        objectsPossible = highlightCount + Math.floor(remainingSeconds / perObject);
      }
      const coveragePct = (Math.min(objectsPossible, objects) / objects) * 100;
      reverse = {
        feasible: true,
        objectsPossible: Math.min(objectsPossible, objects),
        coveragePct,
        galleryBudgetMinutes,
        restAllowance,
        message:
          objectsPossible >= stoppedObjects
            ? "Comfortable — you have time for the full pace you chose."
            : highlightCount > 0
              ? `Enough for ${objectsPossible.toLocaleString("en-US")} objects — including ${Math.min(highlightsPossible, objectsPossible).toLocaleString("en-US")} highlights at ${highlightSecs} seconds each — against the ${stoppedObjects.toLocaleString("en-US")} this pace normally stops at.`
              : `Enough for ${objectsPossible.toLocaleString("en-US")} objects at ${perObject} seconds each, against the ${stoppedObjects.toLocaleString("en-US")} this pace normally stops at.`,
      };
    }
  }

  const notes = [];
  if (galleryMinutes > ATTENTION_CEILING_MIN) {
    notes.push(
      `${formatDuration(galleryMinutes)} of continuous gallery time is past the point where most people take anything else in. Split it across two visits, or pick two wings and leave the rest.`,
    );
  }
  if (chosen.id === "scholar" && objects > 5000) {
    notes.push("At this pace a large collection is a multi-day project. Choose a department rather than a museum.");
  }
  if (restBreaks === 0 && galleryMinutes > FATIGUE_BREAK_INTERVAL_MIN) {
    notes.push("No rest break is budgeted. Museum fatigue is measurable within the first hour — a ten-minute sit resets the pace more than pushing on does.");
  }
  if (entry === 0) {
    notes.push("No queue time budgeted. Major museums routinely run 20 to 45 minutes at the door without a timed ticket.");
  }
  if (highlightCount > stoppedObjects) {
    notes.push(
      `Only ${stoppedObjects.toLocaleString("en-US")} of the ${highlightCount.toLocaleString("en-US")} highlights you entered are counted — at this pace you only stop at ${stoppedObjects.toLocaleString("en-US")} objects in total, so the rest are treated as skipped.`,
    );
  }

  const breakdown = [
    { id: "entry", label: "Queue, tickets and security", minutes: entry },
    { id: "cloak", label: "Cloakroom and bags", minutes: cloak },
    { id: "viewing", label: `Looking at ${stoppedObjects.toLocaleString("en-US")} objects`, minutes: viewingSeconds / 60 },
    { id: "transit", label: `Walking ${rooms} rooms`, minutes: transitSeconds / 60 },
    { id: "rest", label: `Rest breaks (${restBreaks})`, minutes: restTotalMinutes },
    { id: "cafe", label: "Café", minutes: cafe },
    { id: "shop", label: "Shop", minutes: shop },
  ].map((row) => ({ ...row, share: totalMinutes > 0 ? (row.minutes / totalMinutes) * 100 : 0 }));

  return {
    style: chosen,
    stoppedObjects,
    skippedObjects: objects - stoppedObjects,
    coverageOfCollectionPct: (stoppedObjects / objects) * 100,
    viewingMinutes: viewingSeconds / 60,
    transitMinutes: transitSeconds / 60,
    galleryMinutes,
    restBreaks,
    restTotalMinutes,
    fixedMinutes,
    totalMinutes,
    breakdown,
    reverse,
    notes,
    objects,
    rooms,
  };
}

/** Clipboard summary. */
export function formatVisitText(result, museum) {
  if (!result || result.error) return "";
  const lines = [
    `Museum visit estimate${museum ? ` — ${museum}` : ""}`,
    `Total: ${formatDuration(result.totalMinutes)} (${result.style.label})`,
    `Gallery time: ${formatDuration(result.galleryMinutes)}`,
    `Objects you will stop at: ${result.stoppedObjects.toLocaleString("en-US")} of ${result.objects.toLocaleString("en-US")} (${Math.round(result.coverageOfCollectionPct)}%)`,
    "",
    "Breakdown:",
  ];
  result.breakdown.forEach((row) => {
    if (row.minutes <= 0) return;
    lines.push(`  ${row.label}: ${formatDuration(row.minutes)}`);
  });
  if (result.reverse) {
    lines.push("", `In the time you have: ${result.reverse.message}`);
  }
  return lines.join("\n");
}

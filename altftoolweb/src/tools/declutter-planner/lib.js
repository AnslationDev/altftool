/**
 * Planning a decluttering sprint: how long it takes, what ends up in each
 * pile, and which session each category falls in.
 *
 * ORDER OF WORK. Categories are always worked in the KonMari order — clothes,
 * books, papers, komono (miscellaneous), then sentimental items — because
 * decisions get slower as you move down that list, and starting with the
 * easiest category builds the decision-making speed the hard ones need. The
 * planner enforces that order regardless of the order the categories were
 * entered in.
 *
 * TIME MODEL. Every item gets handled exactly once (the "only handle it once"
 * principle), so the sorting time for a category is:
 *
 *   sorting minutes = items x seconds per decision x difficulty / 60
 *
 * Difficulty is a multiplier on the decision time: a shirt is a one-second
 * decision, a box of letters is not. On top of that each category needs a
 * fixed block to set up the staging space and label the boxes, and anything
 * being sold needs listing time per item, which is by far the largest hidden
 * cost in a declutter — photographing, writing and answering messages for one
 * item takes several minutes whatever the item is.
 *
 * PILES. The share you keep is the number you choose. What is left is split
 * between sell, donate and bin using per-category shares, because the mix is
 * genuinely different by category: almost all discarded paper is shredded or
 * recycled, while a garage produces a much higher proportion of sellable
 * items than a wardrobe does.
 *
 * SCHEDULING. Sessions are filled sequentially to the length you have
 * available, so a large category simply spans several sessions. Session dates
 * are spaced by floor(k x 7 / sessions per week) days from the start date,
 * which distributes n sessions evenly across each week.
 */

/** One decision, one item, handled once. The default pace of a real sort. */
export const DEFAULT_SECONDS_PER_DECISION = 20;

/** Fixed block per category: clearing a staging area, boxes, labels, bags. */
export const SETUP_MINUTES_PER_CATEGORY = 10;

/** Photograph, write the listing, answer messages, arrange handover. */
export const SELL_LISTING_MINUTES_PER_ITEM = 8;

/** A car boot of donations and the round trip to drop them off. */
export const ITEMS_PER_DONATION_TRIP = 40;
export const DONATION_TRIP_MINUTES = 30;

/** A tip or recycling-centre run, which takes longer than a charity drop. */
export const ITEMS_PER_DISPOSAL_TRIP = 30;
export const DISPOSAL_TRIP_MINUTES = 45;

/** Shortest session the planner will accept as useful. */
export const MIN_SESSION_MINUTES = 15;

/** Sanity ceiling on a single category, to catch a typo like 50000 books. */
export const MAX_ITEMS_PER_CATEGORY = 20000;

/**
 * Categories in KonMari working order. `difficulty` multiplies the decision
 * time; `sell`, `donate` and `bin` are the split of everything not kept and
 * always sum to 1.
 */
export const CATEGORIES = [
  { id: "clothes", label: "Clothes and shoes", order: 1, difficulty: 1, defaultItems: 200, sell: 0.15, donate: 0.65, bin: 0.2, tip: "Empty every wardrobe onto the bed first. Seeing the whole volume at once is the point of the method." },
  { id: "books", label: "Books and magazines", order: 2, difficulty: 1.2, defaultItems: 120, sell: 0.25, donate: 0.65, bin: 0.1, tip: "Decide by whether you will actually re-read it, not by whether you enjoyed it." },
  { id: "papers", label: "Papers and documents", order: 3, difficulty: 2, defaultItems: 300, sell: 0, donate: 0.05, bin: 0.95, tip: "Keep only what is legally or financially required. Shred anything with account numbers rather than binning it whole." },
  { id: "kitchen", label: "Kitchen and dining", order: 4, difficulty: 1.3, defaultItems: 250, sell: 0.15, donate: 0.55, bin: 0.3, tip: "Duplicates and single-purpose gadgets are the easy wins. Check expiry dates while you are in the cupboards." },
  { id: "bathroom", label: "Bathroom and toiletries", order: 4, difficulty: 1, defaultItems: 80, sell: 0, donate: 0.2, bin: 0.8, tip: "Mostly a disposal job. Take unused medicines to a pharmacy rather than binning them." },
  { id: "toys", label: "Toys and children's things", order: 4, difficulty: 1.4, defaultItems: 150, sell: 0.2, donate: 0.65, bin: 0.15, tip: "Do this without the children present for the sort, then let them veto a small number of items." },
  { id: "electronics", label: "Electronics and cables", order: 4, difficulty: 1.5, defaultItems: 60, sell: 0.4, donate: 0.25, bin: 0.35, tip: "Wipe every device before it leaves the house, and take e-waste to a proper recycling point." },
  { id: "garage", label: "Garage, tools and outdoors", order: 4, difficulty: 1.4, defaultItems: 180, sell: 0.35, donate: 0.35, bin: 0.3, tip: "The highest resale value per item in the house, and the slowest to list. Batch the listings." },
  { id: "decor", label: "Decor, linen and soft furnishings", order: 4, difficulty: 1.2, defaultItems: 100, sell: 0.1, donate: 0.6, bin: 0.3, tip: "Textile banks take worn linen that charity shops will not; check locally before binning." },
  { id: "sentimental", label: "Sentimental items", order: 5, difficulty: 3, defaultItems: 120, sell: 0.02, donate: 0.28, bin: 0.7, tip: "Always last. Photograph what you want to remember rather than keep, and set a single box as the hard limit." },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Add whole days to an ISO yyyy-mm-dd date in UTC, returning yyyy-mm-dd. */
export function addDays(isoDate, days) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const ms = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(ms)) return null;
  const next = new Date(ms + days * 86400000);
  return next.toISOString().slice(0, 10);
}

/**
 * Day offset of the k-th session (0-based) when doing n sessions a week.
 * floor(k * 7 / n) spreads them evenly: 3 a week lands on days 0, 2, 4, 7, 9…
 */
export function sessionDayOffset(index, sessionsPerWeek) {
  return Math.floor((index * 7) / sessionsPerWeek);
}

/** Minutes formatted as "3 h 20 min", or "45 min" under an hour. */
export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Build a decluttering plan.
 *
 * @param {object} input
 * @param {Array}  input.areas              [{ id, items }] — categories to include
 * @param {number} [input.minutesPerSession] length of one working session
 * @param {number} [input.sessionsPerWeek]   how many sessions a week
 * @param {number} [input.keepPercent]       share of items you expect to keep
 * @param {number} [input.secondsPerDecision] pace per item
 * @param {boolean}[input.listSellItems]     whether the sell pile is actually listed
 * @param {number} [input.averageSalePrice]  per sold item, for the revenue estimate
 * @param {string} [input.startDate]         yyyy-mm-dd, the first session
 * @returns {object} { error } or the plan
 */
export function planDeclutter({
  areas = [],
  minutesPerSession = 90,
  sessionsPerWeek = 3,
  keepPercent = 60,
  secondsPerDecision = DEFAULT_SECONDS_PER_DECISION,
  listSellItems = true,
  averageSalePrice = 400,
  startDate = "2026-01-01",
} = {}) {
  const session = Number(minutesPerSession);
  if (!Number.isFinite(session) || session < MIN_SESSION_MINUTES) {
    return { error: `A session needs to be at least ${MIN_SESSION_MINUTES} minutes to be worth setting up for.` };
  }
  const perWeek = Number(sessionsPerWeek);
  if (!Number.isInteger(perWeek) || perWeek < 1 || perWeek > 7) {
    return { error: "Choose between 1 and 7 sessions a week." };
  }
  const keep = Number(keepPercent);
  if (!Number.isFinite(keep) || keep < 0 || keep > 100) {
    return { error: "The share you keep has to be between 0 and 100 percent." };
  }
  const pace = Number(secondsPerDecision);
  if (!Number.isFinite(pace) || pace <= 0 || pace > 600) {
    return { error: "Seconds per decision has to be between 1 and 600." };
  }
  const price = Number(averageSalePrice);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Average sale price cannot be negative." };
  }
  if (!addDays(startDate, 0)) {
    return { error: "Enter the start date as a calendar date." };
  }

  const chosen = [];
  for (const area of areas) {
    const meta = CATEGORIES.find((c) => c.id === area?.id);
    if (!meta) continue;
    const items = Number(area.items);
    if (!Number.isFinite(items) || items < 0) {
      return { error: `Item count for ${meta.label.toLowerCase()} has to be zero or more.` };
    }
    if (items > MAX_ITEMS_PER_CATEGORY) {
      return { error: `${MAX_ITEMS_PER_CATEGORY.toLocaleString("en-IN")} items in one category is almost certainly a typo — check the figure for ${meta.label.toLowerCase()}.` };
    }
    if (items > 0) chosen.push({ meta, items: Math.round(items) });
  }

  if (chosen.length === 0) {
    return { error: "Pick at least one category and give it an item count above zero." };
  }

  // KonMari order first, then the entered order within a tier.
  chosen.sort((a, b) => a.meta.order - b.meta.order);

  const keepFraction = keep / 100;
  const byArea = chosen.map(({ meta, items }) => {
    const keepCount = Math.round(items * keepFraction);
    const release = items - keepCount;
    const sellCount = Math.round(release * meta.sell);
    const donateCount = Math.round(release * meta.donate);
    // Bin takes the remainder so the four piles always add back to the total.
    const binCount = release - sellCount - donateCount;

    const sortingMinutes = (items * pace * meta.difficulty) / 60;
    const listingMinutes = listSellItems ? sellCount * SELL_LISTING_MINUTES_PER_ITEM : 0;
    const setupMinutes = SETUP_MINUTES_PER_CATEGORY;

    return {
      id: meta.id,
      label: meta.label,
      tip: meta.tip,
      difficulty: meta.difficulty,
      items,
      keepCount,
      sellCount,
      donateCount,
      binCount: Math.max(0, binCount),
      sortingMinutes: round(sortingMinutes, 1),
      listingMinutes: round(listingMinutes, 1),
      setupMinutes,
      totalMinutes: round(setupMinutes + sortingMinutes + listingMinutes, 1),
    };
  });

  // Fill sessions sequentially from the ordered queue of categories.
  const queue = byArea.map((a) => ({ id: a.id, label: a.label, remaining: a.totalMinutes }));
  const sessions = [];
  let cursor = 0;
  let guard = 0;
  const GUARD_LIMIT = 10000;
  while (cursor < queue.length && guard < GUARD_LIMIT) {
    guard += 1;
    let left = session;
    const blocks = [];
    while (left > 0.01 && cursor < queue.length) {
      const head = queue[cursor];
      const take = Math.min(left, head.remaining);
      blocks.push({ id: head.id, label: head.label, minutes: round(take, 1) });
      head.remaining = round(head.remaining - take, 4);
      left = round(left - take, 4);
      if (head.remaining <= 0.01) cursor += 1;
    }
    const index = sessions.length;
    sessions.push({
      number: index + 1,
      date: addDays(startDate, sessionDayOffset(index, perWeek)),
      minutes: round(session - left, 1),
      blocks,
    });
  }

  // The guard stops the loop for pathologically large inputs. When that
  // happens the queue still has categories the schedule never reached at
  // all — drop those from the summary entirely instead of letting the
  // totals claim work that was never actually placed into a session.
  const truncated = cursor < queue.length;
  const remainingById = new Map(queue.map((q) => [q.id, q.remaining]));
  const droppedAreas = truncated
    ? byArea.filter((a) => (remainingById.get(a.id) ?? 0) >= a.totalMinutes - 0.01)
    : [];
  const scheduledByArea = truncated
    ? byArea.filter((a) => !droppedAreas.includes(a))
    : byArea;

  const totals = scheduledByArea.reduce(
    (acc, a) => ({
      items: acc.items + a.items,
      keep: acc.keep + a.keepCount,
      sell: acc.sell + a.sellCount,
      donate: acc.donate + a.donateCount,
      bin: acc.bin + a.binCount,
      sorting: acc.sorting + a.sortingMinutes,
      listing: acc.listing + a.listingMinutes,
      setup: acc.setup + a.setupMinutes,
    }),
    { items: 0, keep: 0, sell: 0, donate: 0, bin: 0, sorting: 0, listing: 0, setup: 0 },
  );

  const donationTrips = Math.ceil(totals.donate / ITEMS_PER_DONATION_TRIP);
  const disposalTrips = Math.ceil(totals.bin / ITEMS_PER_DISPOSAL_TRIP);
  const logisticsMinutes =
    donationTrips * DONATION_TRIP_MINUTES + disposalTrips * DISPOSAL_TRIP_MINUTES;

  const workMinutes = totals.setup + totals.sorting + totals.listing;
  const totalMinutes = workMinutes + logisticsMinutes;

  const lastSession = sessions[sessions.length - 1];
  const estimatedRevenue = listSellItems ? totals.sell * price : 0;

  const warnings = [];
  if (truncated) {
    const droppedLabels = droppedAreas.map((a) => a.label).join(", ");
    warnings.push(
      `This plan is too large to schedule in full — it would need more than ${GUARD_LIMIT.toLocaleString("en-IN")} sessions, so the totals below only cover the ${sessions.length.toLocaleString("en-IN")} sessions actually generated. ${droppedAreas.length} categor${droppedAreas.length === 1 ? "y" : "ies"} could not be scheduled at all (${droppedLabels}). Reduce the item counts or increase minutes per session to fit the whole plan.`,
    );
  }
  if (listSellItems && totals.listing > totals.sorting) {
    warnings.push(
      `Listing ${totals.sell} items for sale takes ${formatMinutes(totals.listing)}, which is longer than sorting the whole house (${formatMinutes(totals.sorting)}). At ${SELL_LISTING_MINUTES_PER_ITEM} minutes an item that only pays if the items are worth listing — donating the low-value half will finish the job far sooner.`,
    );
  }
  if (sessions.length > 30) {
    warnings.push(
      `At ${formatMinutes(session)} a session this runs to ${sessions.length} sessions. Sprints this long usually stall — either lengthen the sessions or cut the category list and come back for the rest.`,
    );
  }
  if (keep >= 90) {
    warnings.push(
      `Keeping ${round(keep)}% means only ${totals.items - totals.keep} of ${totals.items} items actually leave. The sorting time is nearly the same either way, so the effort will not show in the room.`,
    );
  }

  return {
    byArea: scheduledByArea,
    sessions,
    truncated,
    totalItems: totals.items,
    keepCount: totals.keep,
    sellCount: totals.sell,
    donateCount: totals.donate,
    binCount: totals.bin,
    releaseCount: totals.items - totals.keep,
    keepPercent: totals.items > 0 ? round((totals.keep / totals.items) * 100, 1) : round(keep, 1),
    sortingMinutes: round(totals.sorting),
    listingMinutes: round(totals.listing),
    setupMinutes: round(totals.setup),
    workMinutes: round(workMinutes),
    logisticsMinutes: round(logisticsMinutes),
    totalMinutes: round(totalMinutes),
    totalHours: round(totalMinutes / 60, 1),
    donationTrips,
    disposalTrips,
    sessionCount: sessions.length,
    sessionMinutes: round(session),
    sessionsPerWeek: perWeek,
    startDate,
    finishDate: lastSession ? lastSession.date : startDate,
    calendarDays: lastSession ? sessionDayOffset(sessions.length - 1, perWeek) + 1 : 0,
    estimatedRevenue: round(estimatedRevenue),
    averageSalePrice: round(price),
    listSellItems,
    warnings,
  };
}

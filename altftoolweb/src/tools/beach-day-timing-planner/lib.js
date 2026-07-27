/**
 * Beach day tide and timing planner.
 *
 * Four real effects decide when a beach is actually good, and they do not peak
 * at the same time — which is why "go in the morning" is sometimes right and
 * sometimes exactly wrong.
 *
 * TIDES. On a semidiurnal coast the tide follows the moon, not the sun. The
 * lunar day is 24 hours 50 minutes, so successive high waters are 12 hours 25
 * minutes apart and low water falls about 6 hours 12 minutes after high water.
 * Between them the water moves by the rule of twelfths, the standard
 * navigational approximation: over the six hours of a tide the range is covered
 * 1/12, 2/12, 3/12, 3/12, 2/12, 1/12 in successive hours — slow at the turn,
 * fastest in the middle two hours.
 *
 * ULTRAVIOLET. UV peaks at solar noon, which is exactly the midpoint between
 * sunrise and sunset, not at 12:00 on the clock. WHO and WMO guidance under the
 * Global Solar UV Index is that protection is required from UV Index 3 upwards
 * and that outdoor exposure should be limited around the middle of the day.
 * The shadow rule follows from the same geometry: when your shadow is shorter
 * than you are, the sun is above 45 degrees and UV is high.
 *
 * HEAT. Air temperature lags the sun by roughly two to three hours because the
 * ground keeps releasing heat after the peak of the radiation, so the hottest
 * part of the day is mid-afternoon rather than solar noon.
 *
 * CROWDS. Beach occupancy peaks around and just after the middle of the day and
 * falls away sharply in the last two hours of light.
 *
 * The tool scores each half-hour of daylight against all four and returns the
 * best windows. Everything is pure arithmetic on the times you supply; nothing
 * reads the clock, and no forecast is fetched.
 */

/** A lunar day, minutes. */
export const LUNAR_DAY_MIN = 1490;

/** Time between successive high waters on a semidiurnal coast, minutes. */
export const SEMIDIURNAL_INTERVAL_MIN = 745;

/** High water to the following low water, minutes. */
export const HIGH_TO_LOW_MIN = SEMIDIURNAL_INTERVAL_MIN / 2;

/** Cumulative share of the tidal range at each sixth of the cycle — the rule of twelfths. */
export const TWELFTHS_CUMULATIVE = [0, 1 / 12, 3 / 12, 6 / 12, 9 / 12, 11 / 12, 1];

/** WHO/WMO Global Solar UV Index: protection required at this value and above. */
export const UV_PROTECTION_INDEX = 3;

/** Air temperature peaks this long after solar noon. */
export const THERMAL_LAG_MIN = 150;

/** Beyond this far from solar noon the UV penalty has gone. */
export const UV_SPREAD_MIN = 240;

/** Spread of the heat and crowd curves either side of their own peaks. */
export const HEAT_SPREAD_MIN = 210;
export const CROWD_SPREAD_MIN = 240;

/** Crowd peaks a little after solar noon. */
export const CROWD_PEAK_OFFSET_MIN = 60;

/** Maximum points each factor can take off, or in the tide's case add. */
export const UV_MAX_PENALTY = 45;
export const HEAT_MAX_PENALTY = 25;
export const CROWD_MAX_PENALTY = 20;
export const TIDE_MAX_BONUS = 20;

/** Half-hour resolution. */
export const SLOT_MINUTES = 30;

export const TIDE_PREFERENCES = [
  { id: "low", label: "Low tide — wide flat sand, rock pools, walking", note: "Rock pools and firm sand appear as the water drops." },
  { id: "high", label: "High tide — deep water close in, less walking", note: "Better for swimming without a long wade, but far less dry sand." },
  { id: "either", label: "No preference", note: "Tide is ignored in the scoring." },
];

export const SCORE_BANDS = [
  { min: 80, label: "Prime window", tone: "ok" },
  { min: 65, label: "Good", tone: "ok" },
  { min: 50, label: "Usable", tone: "warn" },
  { min: 0, label: "Avoid if you can", tone: "danger" },
];

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** "06:12" -> 372 minutes from midnight, or null. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes from midnight -> "HH:MM", marking a roll past midnight. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const rounded = Math.round(totalMinutes);
  const dayOffset = Math.floor(rounded / 1440);
  const inDay = ((rounded % 1440) + 1440) % 1440;
  const hh = String(Math.floor(inDay / 60)).padStart(2, "0");
  const mm = String(inDay % 60).padStart(2, "0");
  const suffix = dayOffset > 0 ? " (+1d)" : dayOffset < 0 ? " (−1d)" : "";
  return `${hh}:${mm}${suffix}`;
}

export function formatMinutes(value) {
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.round(value);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * Every high and low water within a window either side of the day, generated
 * from one known high water on the semidiurnal interval.
 */
export function tideEvents(knownHighMinutes, fromMinutes, toMinutes) {
  const events = [];
  const firstIndex = Math.floor((fromMinutes - knownHighMinutes) / HIGH_TO_LOW_MIN) - 2;
  const lastIndex = Math.ceil((toMinutes - knownHighMinutes) / HIGH_TO_LOW_MIN) + 2;
  for (let i = firstIndex; i <= lastIndex; i += 1) {
    const at = knownHighMinutes + i * HIGH_TO_LOW_MIN;
    // Even steps land on high water, odd steps on low water.
    events.push({ at, type: ((i % 2) + 2) % 2 === 0 ? "high" : "low" });
  }
  return events.sort((a, b) => a.at - b.at);
}

/** Cumulative share of the range covered at a fraction f through a tide. */
export function twelfthsCurve(fraction) {
  const f = Math.min(1, Math.max(0, fraction));
  const scaled = f * 6;
  const index = Math.min(5, Math.floor(scaled));
  const within = scaled - index;
  const from = TWELFTHS_CUMULATIVE[index];
  const to = TWELFTHS_CUMULATIVE[index + 1];
  return from + (to - from) * within;
}

/** Water level 0 (low water) to 1 (high water) at a time, by the rule of twelfths. */
export function tideLevelAt(events, minutes) {
  let previous = null;
  let next = null;
  for (const event of events) {
    if (event.at <= minutes) previous = event;
    if (event.at > minutes) {
      next = event;
      break;
    }
  }
  if (!previous || !next) return 0.5;
  const fraction = (minutes - previous.at) / (next.at - previous.at);
  const rise = twelfthsCurve(fraction);
  return previous.type === "low" ? rise : 1 - rise;
}

export function bandForScore(score) {
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/** Cosine taper: full weight at the peak, zero at `spread` minutes away. */
function taper(distanceMin, spread) {
  if (distanceMin >= spread) return 0;
  return Math.cos((Math.PI * distanceMin) / (2 * spread));
}

/**
 * @param {object} input
 * @param {string} input.sunrise        "HH:MM"
 * @param {string} input.sunset         "HH:MM"
 * @param {string} input.highTide       "HH:MM" of a known high water on the day
 * @param {string} input.tidePreference a TIDE_PREFERENCES id
 * @param {number} input.busynessPct    how busy this beach gets, 0-100
 * @param {number} input.arriveNoEarlier minutes from midnight you can first get there
 * @param {number} input.leaveByMinutes  minutes from midnight you must leave
 * @param {number} input.hoursWanted     length of the visit you are planning
 */
export function planBeachDay(input) {
  const {
    sunrise,
    sunset,
    highTide,
    tidePreference = "low",
    busynessPct = 70,
    arriveNoEarlier = "07:00",
    leaveBy = "20:00",
    hoursWanted = 3,
  } = input || {};

  const sunriseMin = parseClock(sunrise);
  const sunsetMin = parseClock(sunset);
  const highTideMin = parseClock(highTide);
  const earliest = parseClock(arriveNoEarlier);
  const latest = parseClock(leaveBy);

  if (sunriseMin === null) return { error: "Enter sunrise as HH:MM." };
  if (sunsetMin === null) return { error: "Enter sunset as HH:MM." };
  if (highTideMin === null) return { error: "Enter a known high water time as HH:MM." };
  if (earliest === null) return { error: "Enter the earliest you could arrive as HH:MM." };
  if (latest === null) return { error: "Enter the time you must leave as HH:MM." };
  if (sunsetMin <= sunriseMin) return { error: "Sunset must be later than sunrise on the same day." };
  if (latest <= earliest) return { error: "The time you must leave has to be after the earliest you could arrive." };

  const busy = Number(busynessPct);
  const hours = Number(hoursWanted);
  if (!Number.isFinite(busy) || busy < 0 || busy > 100) {
    return { error: "Busyness must be between 0% and 100%." };
  }
  if (!Number.isFinite(hours) || hours < 0.5 || hours > 14) {
    return { error: "The visit length must be between 0.5 and 14 hours." };
  }
  if (!TIDE_PREFERENCES.some((item) => item.id === tidePreference)) {
    return { error: "Pick a tide preference." };
  }

  const visitMinutes = hours * 60;
  const windowStart = Math.max(sunriseMin, earliest);
  const windowEnd = Math.min(sunsetMin, latest);
  if (windowEnd - windowStart < visitMinutes) {
    return {
      error: `A ${formatMinutes(visitMinutes)} visit does not fit between ${formatClock(windowStart)} and ${formatClock(windowEnd)}. Shorten the visit or widen the window.`,
    };
  }

  const solarNoon = (sunriseMin + sunsetMin) / 2;
  const heatPeak = solarNoon + THERMAL_LAG_MIN;
  const crowdPeak = solarNoon + CROWD_PEAK_OFFSET_MIN;
  const events = tideEvents(highTideMin, windowStart - 800, windowEnd + 800);
  const dayEvents = events.filter((event) => event.at >= 0 && event.at <= 1440);

  const slots = [];
  for (let t = windowStart; t <= windowEnd - SLOT_MINUTES; t += SLOT_MINUTES) {
    const mid = t + SLOT_MINUTES / 2;
    const level = tideLevelAt(events, mid);

    const uvPenalty = UV_MAX_PENALTY * taper(Math.abs(mid - solarNoon), UV_SPREAD_MIN);
    const heatPenalty = HEAT_MAX_PENALTY * taper(Math.abs(mid - heatPeak), HEAT_SPREAD_MIN);
    const crowdPenalty = CROWD_MAX_PENALTY * (busy / 100) * taper(Math.abs(mid - crowdPeak), CROWD_SPREAD_MIN);
    const tideBonus =
      tidePreference === "low"
        ? TIDE_MAX_BONUS * (1 - level)
        : tidePreference === "high"
          ? TIDE_MAX_BONUS * level
          : 0;

    // The tide term is centred on zero (half the bonus is subtracted back) so
    // that expressing a tide preference cannot inflate every score by 20 — it
    // only moves slots relative to each other.
    const tideTerm = tidePreference === "either" ? 0 : tideBonus - TIDE_MAX_BONUS / 2;
    const score = Math.max(0, Math.min(100, 100 - uvPenalty - heatPenalty - crowdPenalty + tideTerm));
    slots.push({ start: t, end: t + SLOT_MINUTES, mid, level, uvPenalty, heatPenalty, crowdPenalty, tideBonus, score });
  }

  if (slots.length === 0) return { error: "No daylight slots fall inside that window." };

  // Best contiguous run of the length you asked for.
  const slotsNeeded = Math.max(1, Math.round(visitMinutes / SLOT_MINUTES));
  let best = null;
  for (let i = 0; i + slotsNeeded <= slots.length; i += 1) {
    const run = slots.slice(i, i + slotsNeeded);
    const total = run.reduce((sum, slot) => sum + slot.score, 0);
    if (!best || total > best.total) {
      best = { total, average: total / slotsNeeded, start: run[0].start, end: run[run.length - 1].end, run };
    }
  }

  const uvWindow = { from: solarNoon - 180, to: solarNoon + 180 };
  const hottest = { from: heatPeak - 60, to: heatPeak + 60 };

  const bestSlot = slots.reduce((top, slot) => (slot.score > top.score ? slot : top), slots[0]);
  const worstSlot = slots.reduce((low, slot) => (slot.score < low.score ? slot : low), slots[0]);

  const notes = [];
  notes.push(
    `Solar noon is ${formatClock(solarNoon)} — the exact midpoint of sunrise and sunset, and where UV peaks. Clock noon is not the same thing.`,
  );
  notes.push(
    `The strongest UV runs roughly ${formatClock(uvWindow.from)} to ${formatClock(uvWindow.to)}. If your shadow is shorter than you are, the sun is above 45° and you are in it.`,
  );
  notes.push(
    `The hottest air is around ${formatClock(heatPeak)}, about ${formatMinutes(THERMAL_LAG_MIN)} after the sun's peak, because the ground keeps releasing heat.`,
  );
  if (tidePreference === "low") {
    const nextLow = dayEvents.find((event) => event.type === "low" && event.at >= windowStart);
    if (nextLow) {
      notes.push(
        `Low water is at ${formatClock(nextLow.at)}. The flattest sand and the rock pools are in the hour or so either side of it, and the water moves fastest in the two hours around mid-tide.`,
      );
    }
  }
  if (tidePreference === "high") {
    const nextHigh = dayEvents.find((event) => event.type === "high" && event.at >= windowStart);
    if (nextHigh) {
      notes.push(`High water is at ${formatClock(nextHigh.at)}. Expect much less dry sand within two hours either side of it.`);
    }
  }
  if (best && best.start < solarNoon && best.end <= solarNoon) {
    notes.push("The best run is entirely before solar noon. Morning beaches are cooler, emptier and lower in UV — the trade is that the sea is usually at its coldest.");
  }

  return {
    solarNoon,
    heatPeak,
    crowdPeak,
    daylightMinutes: sunsetMin - sunriseMin,
    windowStart,
    windowEnd,
    slots,
    best,
    bestBand: best ? bandForScore(best.average) : null,
    bestSlot,
    worstSlot,
    tideEventsToday: dayEvents,
    uvWindow,
    hottest,
    notes,
  };
}

/** Clipboard summary. */
export function formatBeachPlanText(plan, beach) {
  if (!plan || plan.error) return "";
  const lines = [
    `Beach day plan${beach ? ` — ${beach}` : ""}`,
    `Best window: ${formatClock(plan.best.start)}–${formatClock(plan.best.end)} (${plan.bestBand.label}, ${Math.round(plan.best.average)}/100)`,
    `Solar noon ${formatClock(plan.solarNoon)}, hottest around ${formatClock(plan.heatPeak)}`,
    `Strongest UV ${formatClock(plan.uvWindow.from)}–${formatClock(plan.uvWindow.to)}`,
    "",
    "Tides today:",
  ];
  plan.tideEventsToday.forEach((event) => {
    lines.push(`  ${formatClock(event.at)}  ${event.type === "high" ? "High water" : "Low water"}`);
  });
  lines.push("", "Worth knowing:");
  plan.notes.forEach((note) => lines.push(`  ${note}`));
  return lines.join("\n");
}

/**
 * Deployment window planning across timezones.
 *
 * Model: each served region has a fixed UTC offset and an "avoid" range of
 * local hours (business + peak traffic). An hour of UTC time is CLEAR when
 * no region's local clock falls inside its avoid range. The planner scans
 * all 24 UTC start hours, finds contiguous clear runs (wrapping midnight),
 * and recommends the start whose window overlaps the fewest region-hours
 * of avoid time — the standard "follow-the-quiet" release scheduling
 * heuristic used by distributed teams.
 *
 * Offsets are standard-time approximations; regions observing DST shift by
 * one hour part of the year, which the UI flags.
 */

/** Common regions with their standard UTC offsets in minutes. */
export const REGION_PRESETS = [
  { id: "us-west", label: "US West (Los Angeles, UTC−8)", offsetMinutes: -480 },
  { id: "us-east", label: "US East (New York, UTC−5)", offsetMinutes: -300 },
  { id: "brazil", label: "Brazil (São Paulo, UTC−3)", offsetMinutes: -180 },
  { id: "uk", label: "UK (London, UTC+0)", offsetMinutes: 0 },
  { id: "eu-central", label: "Central Europe (Berlin, UTC+1)", offsetMinutes: 60 },
  { id: "india", label: "India (Mumbai, UTC+5:30)", offsetMinutes: 330 },
  { id: "sg-cn", label: "Singapore / China (UTC+8)", offsetMinutes: 480 },
  { id: "japan", label: "Japan / Korea (UTC+9)", offsetMinutes: 540 },
  { id: "sydney", label: "Australia East (Sydney, UTC+10)", offsetMinutes: 600 },
];

export const MINUTES_PER_DAY = 24 * 60;

/** Format minutes-past-midnight as hh:mm. */
export function formatMinutes(totalMinutes) {
  const wrapped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Is local minute-of-day inside [start, end), where the range may wrap midnight? */
function inAvoidRange(localMinute, startMinute, endMinute) {
  if (startMinute < endMinute) return localMinute >= startMinute && localMinute < endMinute;
  // wraps midnight, e.g. 22:00-06:00
  return localMinute >= startMinute || localMinute < endMinute;
}

/**
 * Plan a deployment window.
 *
 * @param {object} input
 * @param {string[]} input.regionIds        Ids from REGION_PRESETS (at least one).
 * @param {number} input.avoidStartHour     Local hour the avoid range starts (0-23).
 * @param {number} input.avoidEndHour       Local hour it ends, exclusive (0-24, may wrap).
 * @param {number} input.windowLengthHours  Desired window length (1-12).
 * @returns {object} plan, or { error }.
 */
export function planDeploymentWindow({ regionIds, avoidStartHour, avoidEndHour, windowLengthHours }) {
  if (!Array.isArray(regionIds) || regionIds.length === 0) {
    return { error: "Pick at least one region you serve." };
  }
  const regions = regionIds.map((id) => REGION_PRESETS.find((r) => r.id === id)).filter(Boolean);
  if (regions.length !== regionIds.length) return { error: "Unknown region selected." };

  const start = Number(avoidStartHour);
  const end = Number(avoidEndHour);
  const len = Number(windowLengthHours);
  if (!Number.isInteger(start) || start < 0 || start > 23) {
    return { error: "Avoid-start hour must be a whole number from 0 to 23." };
  }
  if (!Number.isInteger(end) || end < 0 || end > 24) {
    return { error: "Avoid-end hour must be a whole number from 0 to 24." };
  }
  if (start === (end % 24)) {
    return { error: "The avoid range cannot be zero-length — start and end hours are equal." };
  }
  if (!Number.isInteger(len) || len < 1 || len > 12) {
    return { error: "Window length must be a whole number of hours from 1 to 12." };
  }

  const startMinute = start * 60;
  const endMinute = (end % 24) * 60;

  // Hour-by-hour matrix over one UTC day.
  const matrix = [];
  for (let utcHour = 0; utcHour < 24; utcHour += 1) {
    const utcMinute = utcHour * 60;
    const entries = regions.map((region) => {
      const localMinute = utcMinute + region.offsetMinutes;
      return {
        id: region.id,
        label: region.label,
        localTime: formatMinutes(localMinute),
        blocked: inAvoidRange(
          ((localMinute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY,
          startMinute,
          endMinute,
        ),
      };
    });
    matrix.push({
      utcHour,
      entries,
      blockedCount: entries.filter((e) => e.blocked).length,
    });
  }

  const blockedByHour = matrix.map((row) => row.blockedCount);
  const clear = blockedByHour.map((count) => count === 0);

  // Best start: minimise total blocked region-hours inside the window;
  // tie-break on the earlier count of blocked regions then earlier UTC hour.
  let best = null;
  for (let startHour = 0; startHour < 24; startHour += 1) {
    let cost = 0;
    for (let k = 0; k < len; k += 1) cost += blockedByHour[(startHour + k) % 24];
    if (!best || cost < best.cost) best = { startHour, cost };
  }

  const recommendation = {
    startUtcHour: best.startHour,
    endUtcHour: (best.startHour + len) % 24,
    lengthHours: len,
    blockedRegionHours: best.cost,
    fullyClear: best.cost === 0,
    localTimes: regions.map((region) => ({
      label: region.label,
      start: formatMinutes(best.startHour * 60 + region.offsetMinutes),
      end: formatMinutes((best.startHour + len) * 60 + region.offsetMinutes),
    })),
  };

  return {
    matrix,
    totalClearHours: clear.filter(Boolean).length,
    recommendation,
    regions: regions.map((r) => r.label),
  };
}

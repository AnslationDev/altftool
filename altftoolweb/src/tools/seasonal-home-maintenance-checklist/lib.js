/**
 * Seasonal Home Maintenance Checklist — task engine.
 *
 * Seasons follow the India Meteorological Department's four-season calendar:
 * winter (Jan-Feb), pre-monsoon/summer (Mar-May), southwest monsoon (Jun-Sep)
 * and post-monsoon (Oct-Dec).
 *
 * Climate zones follow the five-zone classification used by the National Building
 * Code of India / ECBC: hot-dry, warm-humid, composite, temperate and cold.
 *
 * Pure module: no React, no DOM, no clock reads. The month is always passed in.
 */

export const SEASONS = [
  { id: "winter", label: "Winter", months: "January – February" },
  { id: "summer", label: "Summer / pre-monsoon", months: "March – May" },
  { id: "monsoon", label: "Southwest monsoon", months: "June – September" },
  { id: "post", label: "Post-monsoon", months: "October – December" },
];

export const ZONES = [
  { id: "hot-dry", label: "Hot & dry", example: "Jaipur, Ahmedabad, Nagpur" },
  { id: "warm-humid", label: "Warm & humid", example: "Mumbai, Chennai, Kolkata" },
  { id: "composite", label: "Composite", example: "Delhi, Lucknow, Bhopal" },
  { id: "temperate", label: "Temperate / moderate", example: "Bengaluru, Pune" },
  { id: "cold", label: "Cold", example: "Shimla, Srinagar, Gangtok" },
];

export const HOME_TYPES = [
  { id: "apartment", label: "Apartment / flat" },
  { id: "house", label: "Independent house / villa" },
];

export const FEATURES = [
  { id: "ac", label: "Air conditioner(s)" },
  { id: "geyser", label: "Water heater / geyser" },
  { id: "tank", label: "Overhead or underground water tank" },
  { id: "chimney", label: "Kitchen chimney / exhaust" },
  { id: "purifier", label: "RO / water purifier" },
  { id: "inverter", label: "Inverter or battery backup" },
  { id: "solar", label: "Solar panels or solar water heater" },
  { id: "garden", label: "Garden, trees or terrace planters" },
];

export const PRIORITIES = ["critical", "important", "routine"];

/** A realistic productive stretch of DIY work in one sitting, in minutes. */
export const MINUTES_PER_SESSION = 240;

/** The same session length expressed in hours, for display. */
export const HOURS_PER_SESSION = MINUTES_PER_SESSION / 60;

/** Season ids keyed by calendar month index (0 = January), per the IMD calendar. */
const SEASON_BY_MONTH = [
  "winter", // Jan
  "winter", // Feb
  "summer", // Mar
  "summer", // Apr
  "summer", // May
  "monsoon", // Jun
  "monsoon", // Jul
  "monsoon", // Aug
  "monsoon", // Sep
  "post", // Oct
  "post", // Nov
  "post", // Dec
];

/**
 * @param {number} monthIndex 0-11, as returned by Date#getMonth
 * @returns {string|null} season id, or null for an out-of-range month
 */
export function seasonForMonth(monthIndex) {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
  return SEASON_BY_MONTH[monthIndex];
}

/**
 * Task catalogue.
 * season   — which IMD season the job belongs to
 * zones    — "all" or the climate zones where the job matters
 * homes    — "all" or the home types it applies to
 * needs    — optional feature id the household must own
 * minutes  — realistic DIY / supervision time for one dwelling
 */
export const TASKS = [
  // ---------- Winter ----------
  { id: "w-alarm", season: "winter", zones: "all", homes: "all", minutes: 15, priority: "critical", title: "Test smoke and gas alarms, replace batteries", why: "Closed windows in winter make a slow leak far more dangerous." },
  { id: "w-lpg", season: "winter", zones: "all", homes: "all", minutes: 15, priority: "critical", title: "Check LPG hose and regulator for cracks and expiry", why: "ISI-marked suction hoses carry a printed expiry, usually five years from manufacture." },
  { id: "w-geyser", season: "winter", zones: "all", homes: "all", needs: "geyser", minutes: 45, priority: "important", title: "Service the geyser: flush sediment, check the anode rod", why: "Scale on the element wastes power and shortens tank life." },
  { id: "w-seals", season: "winter", zones: "all", homes: "all", minutes: 30, priority: "routine", title: "Check door and window seals for draughts", why: "Gaps cost heating energy and let dust in during dry months." },
  { id: "w-fans", season: "winter", zones: "all", homes: "all", minutes: 40, priority: "routine", title: "Deep clean ceiling fan blades before storing or covering", why: "Dust baked onto blades is far harder to remove next summer." },
  { id: "w-pipes", season: "winter", zones: ["cold"], homes: "all", minutes: 90, priority: "critical", title: "Lag exposed water pipes and tank outlets against freezing", why: "Water expands as it freezes and splits unlagged pipe runs." },
  { id: "w-heater", season: "winter", zones: ["cold", "composite"], homes: "all", minutes: 45, priority: "critical", title: "Service room heaters and check any flue or vent", why: "Blocked flues on combustion heaters cause carbon monoxide build-up." },
  { id: "w-roofload", season: "winter", zones: ["cold"], homes: ["house"], minutes: 60, priority: "important", title: "Clear snow load and check roof flashing", why: "Melt-and-refreeze cycles push water back under roofing sheets." },
  { id: "w-cracks", season: "winter", zones: ["hot-dry"], homes: "all", minutes: 45, priority: "routine", title: "Inspect plaster for shrinkage cracks from dry air", why: "Dry winters open hairline cracks that later admit monsoon water." },

  // ---------- Summer / pre-monsoon ----------
  { id: "s-ac-service", season: "summer", zones: "all", homes: "all", needs: "ac", minutes: 90, priority: "critical", title: "Full AC service: coil clean, drain flush, gas pressure check", why: "A dirty coil can add 15-25% to the unit's running cost." },
  { id: "s-ac-filter", season: "summer", zones: "all", homes: "all", needs: "ac", minutes: 20, priority: "important", title: "Wash AC filters and set a fortnightly filter reminder", why: "Filters clog fastest in the first weeks of heavy use." },
  { id: "s-tank", season: "summer", zones: "all", homes: "all", needs: "tank", minutes: 120, priority: "important", title: "Clean and disinfect the water tank before peak demand", why: "Warm, half-empty tanks grow biofilm quickly." },
  { id: "s-fanmount", season: "summer", zones: "all", homes: "all", minutes: 30, priority: "important", title: "Check ceiling fan mountings, down-rod pins and blade balance", why: "A wobbling fan loosens its own canopy screws over a season." },
  { id: "s-terrace", season: "summer", zones: "all", homes: ["house"], minutes: 180, priority: "important", title: "Inspect terrace waterproofing and apply reflective roof coating", why: "Repairs must be done and cured before the first rain, and a white coat cuts top-floor heat gain." },
  { id: "s-fridge", season: "summer", zones: "all", homes: "all", minutes: 30, priority: "routine", title: "Clean the fridge condenser coil and check the door gasket", why: "A gasket that fails the paper-slip test makes the compressor run constantly." },
  { id: "s-inverter", season: "summer", zones: "all", homes: "all", needs: "inverter", minutes: 30, priority: "important", title: "Top up battery water to the marker and clean terminals", why: "Electrolyte evaporates fastest in summer, and low levels permanently lose capacity." },
  { id: "s-shading", season: "summer", zones: ["hot-dry", "composite"], homes: "all", minutes: 60, priority: "important", title: "Fit external shading, blinds or khus screens on west windows", why: "External shading blocks solar gain before it reaches the glass." },
  { id: "s-cooler", season: "summer", zones: ["hot-dry", "composite"], homes: "all", minutes: 45, priority: "important", title: "Replace evaporative cooler pads and clean the pump", why: "Salted-up pads cut airflow and breed odour." },
  { id: "s-vent", season: "summer", zones: ["warm-humid"], homes: "all", minutes: 30, priority: "important", title: "Test bathroom and kitchen exhaust fans, clear the ducts", why: "Humid air with nowhere to go seeds mould on the nearest cold wall." },

  // ---------- Monsoon ----------
  { id: "m-drains", season: "monsoon", zones: "all", homes: "all", minutes: 60, priority: "critical", title: "Clear roof drains, gutters, balcony outlets and weep holes", why: "One blocked outlet turns a flat roof into a pond within an hour." },
  { id: "m-damp", season: "monsoon", zones: "all", homes: "all", minutes: 120, priority: "critical", title: "Seal external wall cracks and check for damp patches", why: "Water travels along a crack and appears metres away inside." },
  { id: "m-elcb", season: "monsoon", zones: "all", homes: "all", minutes: 30, priority: "critical", title: "Press the ELCB/RCCB test button and inspect outdoor wiring", why: "An earth-leakage device that does not trip on test is not protecting anyone." },
  { id: "m-pest", season: "monsoon", zones: "all", homes: "all", minutes: 60, priority: "important", title: "Book pre-monsoon pest and anti-termite treatment", why: "Damp masonry is when subterranean termites move upward." },
  { id: "m-trees", season: "monsoon", zones: "all", homes: "all", needs: "garden", minutes: 90, priority: "important", title: "Trim branches overhanging the roof, wires or parking", why: "Wet, leafed-out branches are heavy and snap in the first squall." },
  { id: "m-sump", season: "monsoon", zones: "all", homes: ["house"], minutes: 45, priority: "important", title: "Test the sump pump and clear basement drainage", why: "A pump that has sat idle since last year usually needs priming." },
  { id: "m-wardrobe", season: "monsoon", zones: "all", homes: "all", minutes: 20, priority: "routine", title: "Dehumidify wardrobes with silica gel or camphor", why: "Leather and cotton mildew above roughly 70% relative humidity." },
  { id: "m-mould", season: "monsoon", zones: ["warm-humid", "composite"], homes: "all", minutes: 90, priority: "important", title: "Treat mould on north and shaded walls with an anti-fungal wash", why: "Painting over live mould only hides it for a few weeks." },
  { id: "m-solar", season: "monsoon", zones: "all", homes: "all", needs: "solar", minutes: 30, priority: "routine", title: "Check panel mounts and cable glands before high winds", why: "Loose clamps and cracked glands are the usual monsoon failure points." },

  // ---------- Post-monsoon ----------
  { id: "p-paint", season: "post", zones: "all", homes: ["house"], minutes: 240, priority: "important", title: "Touch up exterior paint and re-point rain-damaged plaster", why: "October to December is the driest painting window in most of India." },
  { id: "p-tank", season: "post", zones: "all", homes: "all", needs: "tank", minutes: 120, priority: "important", title: "Clean the water tank again to remove monsoon silt", why: "Roof run-off and airborne dust settle as sludge over the rains." },
  { id: "p-chimney", season: "post", zones: "all", homes: "all", needs: "chimney", minutes: 60, priority: "important", title: "Degrease chimney filters and service the motor before festive cooking", why: "Baffle filters lose most of their suction once the channels fill with grease." },
  { id: "p-solar", season: "post", zones: "all", homes: "all", needs: "solar", minutes: 45, priority: "important", title: "Wash monsoon deposits off solar panels", why: "Soiling can cost a several-percent slice of annual yield." },
  { id: "p-purifier", season: "post", zones: "all", homes: "all", needs: "purifier", minutes: 30, priority: "important", title: "Replace purifier sediment and carbon filters, sanitise the tank", why: "Post-monsoon supply carries the year's heaviest sediment load." },
  { id: "p-hardware", season: "post", zones: "all", homes: "all", minutes: 45, priority: "routine", title: "Lubricate window rollers, hinges and grilles against rust", why: "Rust that started in the rains sets hard once the air dries." },
  { id: "p-ac-off", season: "post", zones: "all", homes: "all", needs: "ac", minutes: 20, priority: "routine", title: "Clean and cover the outdoor unit for the off-season", why: "Leaf litter packed into the condenser fins is next summer's service call." },
  { id: "p-geyser", season: "post", zones: ["cold", "composite", "temperate"], homes: "all", needs: "geyser", minutes: 30, priority: "important", title: "Test the geyser and its thermostat before the cold sets in", why: "Failures show up on the first cold morning, when technicians are booked out." },
];

const isKnown = (list, id) => list.some((entry) => entry.id === id);

const matchesZone = (task, zone) => task.zones === "all" || task.zones.includes(zone);
const matchesHome = (task, homeType) => task.homes === "all" || task.homes.includes(homeType);

/**
 * @param {object} input
 * @param {string} input.zone      climate zone id
 * @param {string} input.season    season id, or "year" for the whole year
 * @param {string} input.homeType  home type id
 * @param {string[]} input.features feature ids the household owns
 * @returns {object} plan, or { error }
 */
export function buildMaintenancePlan({ zone, season, homeType, features = [] } = {}) {
  if (!isKnown(ZONES, zone)) return { error: "Choose a climate zone to build the checklist." };
  if (!isKnown(HOME_TYPES, homeType)) return { error: "Choose whether this is a flat or an independent house." };
  if (season !== "year" && !isKnown(SEASONS, season)) {
    return { error: "Choose a season, or select the whole year." };
  }
  if (!Array.isArray(features)) return { error: "Selected features must be a list." };

  const owned = new Set(features.filter((id) => isKnown(FEATURES, id)));

  const selected = TASKS.filter((task) => {
    if (season !== "year" && task.season !== season) return false;
    if (!matchesZone(task, zone)) return false;
    if (!matchesHome(task, homeType)) return false;
    if (task.needs && !owned.has(task.needs)) return false;
    return true;
  });

  const priorityRank = { critical: 0, important: 1, routine: 2 };
  const tasks = [...selected].sort((a, b) => {
    const bySeason = SEASONS.findIndex((s) => s.id === a.season) - SEASONS.findIndex((s) => s.id === b.season);
    if (bySeason !== 0) return bySeason;
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.minutes - b.minutes;
  });

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

  const counts = { critical: 0, important: 0, routine: 0 };
  const minutesByPriority = { critical: 0, important: 0, routine: 0 };
  for (const task of tasks) {
    counts[task.priority] += 1;
    minutesByPriority[task.priority] += task.minutes;
  }

  const bySeason = SEASONS.map((entry) => {
    const seasonTasks = tasks.filter((task) => task.season === entry.id);
    const seasonMinutes = seasonTasks.reduce((sum, task) => sum + task.minutes, 0);
    return {
      id: entry.id,
      label: entry.label,
      months: entry.months,
      count: seasonTasks.length,
      minutes: seasonMinutes,
      hours: seasonMinutes / 60,
      tasks: seasonTasks,
    };
  }).filter((entry) => entry.count > 0);

  return {
    zone,
    season,
    homeType,
    tasks,
    bySeason,
    taskCount: tasks.length,
    totalMinutes,
    totalHours: totalMinutes / 60,
    sessions: totalMinutes === 0 ? 0 : Math.ceil(totalMinutes / MINUTES_PER_SESSION),
    counts,
    minutesByPriority,
  };
}

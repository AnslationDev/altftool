/**
 * Gardening Prompt Builder — pure logic.
 *
 * Real horticultural arithmetic, then deterministic prompt assembly:
 *  - plants per bed from square spacing
 *  - weekly watering from the classic 25 mm (1 inch) per week guideline
 *  - harvest date from sowing date plus days to maturity
 *  - frost check against the last spring frost date
 *  - USDA hardiness zone converted to its defined minimum-temperature band
 *
 * All dates are arguments. No React, no DOM, no Date.now().
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

const MS_PER_DAY = 86400000;

/**
 * The standard vegetable-garden watering guideline: about 25 mm (1 inch) of
 * water per week, from rain plus irrigation combined. Because 1 mm of depth
 * over 1 m² is exactly 1 litre, this is also 25 litres per square metre.
 */
export const WEEKLY_WATER_MM = 25;
export const LITRES_PER_MM_PER_SQM = 1;

/**
 * USDA Plant Hardiness Zones: zone 1 starts at -60 °F and each whole zone
 * covers a 10 °F band of average annual minimum winter temperature. The "a"
 * and "b" halves each cover 5 °F. Zone 13b therefore tops out at 70 °F.
 */
export const ZONE_BASE_F = -60;
export const ZONE_WIDTH_F = 10;
export const MIN_ZONE = 1;
export const MAX_ZONE = 13;

/** Sensible input bounds. */
export const MAX_BED_CM = 3000; // 30 m — beyond this it is a field, not a bed
export const MAX_DAYS_TO_MATURITY = 400;

/** Crops that are killed by frost and must not be sown out before the last frost. */
export const HARDINESS_TYPES = {
  tender: {
    label: "Tender (frost kills it)",
    note: "Do not plant out until after the last spring frost date — tomatoes, beans, courgettes, basil.",
  },
  "half-hardy": {
    label: "Half-hardy (survives a light frost)",
    note: "Can go out around the last frost date with fleece on cold nights.",
  },
  hardy: {
    label: "Hardy (overwinters)",
    note: "Can be sown or planted well before the last frost — garlic, broad beans, kale.",
  },
};

export const SUN_LEVELS = {
  full: "Full sun — 6 or more hours of direct sun a day",
  partial: "Partial sun — 3 to 6 hours of direct sun a day",
  shade: "Shade — under 3 hours of direct sun a day",
};

export const CONTAINERS = {
  bed: "Open ground or raised bed",
  container: "Pots and containers",
  balcony: "Balcony or windowsill",
  greenhouse: "Greenhouse or polytunnel",
};

function clean(text) {
  return String(text ?? "").trim();
}

function parseISO(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return stamp;
}

function toISO(stamp) {
  const date = new Date(stamp);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days from one ISO date to another. Null if either is unparseable. */
export function daysBetween(fromISO, toISODate) {
  const a = parseISO(fromISO);
  const b = parseISO(toISODate);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** ISO date `days` after `fromISO`. Null if the date is unparseable. */
export function addDays(fromISO, days) {
  const a = parseISO(fromISO);
  if (a === null || !Number.isFinite(days)) return null;
  return toISO(a + Math.round(days) * MS_PER_DAY);
}

/**
 * Plants that fit in a rectangular bed at square spacing.
 * Partial spaces are dropped — you cannot plant 0.6 of a lettuce.
 */
export function plantsInBed({ lengthCm, widthCm, spacingCm }) {
  if (!(lengthCm > 0) || !(widthCm > 0) || !(spacingCm > 0)) return null;
  const along = Math.floor(lengthCm / spacingCm);
  const across = Math.floor(widthCm / spacingCm);
  return { along, across, total: along * across };
}

/** Weekly water in litres for an area at WEEKLY_WATER_MM depth. */
export function weeklyWaterLitres(areaSqm, mmPerWeek = WEEKLY_WATER_MM) {
  if (!(areaSqm > 0) || !(mmPerWeek > 0)) return 0;
  return areaSqm * mmPerWeek * LITRES_PER_MM_PER_SQM;
}

/**
 * Minimum-temperature band for a USDA zone label such as "7b".
 * @returns {{lowF: number, highF: number, lowC: number, highC: number} | null}
 */
export function zoneTemperatureBand(zoneLabel) {
  const match = /^(\d{1,2})\s*([ab])?$/i.exec(clean(zoneLabel));
  if (!match) return null;
  const zone = Number(match[1]);
  if (zone < MIN_ZONE || zone > MAX_ZONE) return null;
  const half = match[2] ? match[2].toLowerCase() : null;
  const zoneStart = ZONE_BASE_F + (zone - 1) * ZONE_WIDTH_F;
  const lowF = half === "b" ? zoneStart + ZONE_WIDTH_F / 2 : zoneStart;
  const highF = half ? lowF + ZONE_WIDTH_F / 2 : zoneStart + ZONE_WIDTH_F;
  const toC = (f) => Math.round(((f - 32) * 5) / 9);
  return { lowF, highF, lowC: toC(lowF), highC: toC(highF) };
}

/**
 * @returns {{error: string} | object}
 */
export function buildGardeningPrompt({
  crop = "",
  zone = "",
  container = "bed",
  sun = "full",
  hardiness = "tender",
  bedLengthCm = 0,
  bedWidthCm = 0,
  spacingCm = 0,
  daysToMaturity = 0,
  sowISO = "",
  lastFrostISO = "",
  soil = "",
  goals = "",
} = {}) {
  const cropText = clean(crop);
  const length = Number(bedLengthCm);
  const width = Number(bedWidthCm);
  const spacing = Number(spacingCm);
  const maturity = Math.round(Number(daysToMaturity));

  if (!cropText) return { error: "Name the crop or plant you want to grow." };
  if (![length, width, spacing, maturity].every(Number.isFinite)) {
    return { error: "Bed size, spacing and days to maturity must all be numbers." };
  }
  if (!(length > 0) || !(width > 0)) return { error: "Bed length and width must be greater than zero." };
  if (length > MAX_BED_CM || width > MAX_BED_CM) {
    return { error: `Bed dimensions should be under ${MAX_BED_CM} cm — check whether you entered metres.` };
  }
  if (!(spacing > 0)) return { error: "Plant spacing must be greater than zero." };
  if (spacing > length || spacing > width) {
    return { error: "Spacing is wider than the bed — no plants would fit. Reduce the spacing or enlarge the bed." };
  }
  if (maturity < 1 || maturity > MAX_DAYS_TO_MATURITY) {
    return { error: `Days to maturity should be between 1 and ${MAX_DAYS_TO_MATURITY}.` };
  }

  const layout = plantsInBed({ lengthCm: length, widthCm: width, spacingCm: spacing });
  if (!layout || layout.total < 1) {
    return { error: "Spacing is wider than the bed — no plants would fit." };
  }

  const areaSqm = (length / 100) * (width / 100);
  const waterLitres = weeklyWaterLitres(areaSqm);

  const zoneText = clean(zone);
  const band = zoneText ? zoneTemperatureBand(zoneText) : null;
  if (zoneText && !band) {
    return { error: `USDA zone should look like "7b" — a number from ${MIN_ZONE} to ${MAX_ZONE}, optionally with a or b.` };
  }

  let harvestISO = null;
  if (clean(sowISO)) {
    harvestISO = addDays(sowISO, maturity);
    if (harvestISO === null) return { error: "Sowing date must be a real calendar date in YYYY-MM-DD form." };
  }

  let frostGap = null;
  let frostWarning = null;
  if (clean(sowISO) && clean(lastFrostISO)) {
    frostGap = daysBetween(lastFrostISO, sowISO);
    if (frostGap === null) return { error: "The last frost date must be a real calendar date in YYYY-MM-DD form." };
    if (hardiness === "tender" && frostGap < 0) {
      frostWarning = `Sowing ${Math.abs(frostGap)} days before the last frost. A tender crop planted out this early will usually be killed — start it indoors instead.`;
    } else if (hardiness === "half-hardy" && frostGap < -7) {
      frostWarning = `Sowing ${Math.abs(frostGap)} days before the last frost. Half-hardy plants need fleece or a cloche this far ahead.`;
    }
  }

  const hardy = HARDINESS_TYPES[hardiness] ?? HARDINESS_TYPES.tender;
  const sunText = SUN_LEVELS[sun] ?? SUN_LEVELS.full;
  const siteText = CONTAINERS[container] ?? CONTAINERS.bed;

  const lines = [];
  lines.push(`Act as an experienced kitchen gardener. Give me a growing plan for ${cropText}.`);
  lines.push("");
  lines.push("MY SITE");
  lines.push(`- Growing in: ${siteText}`);
  lines.push(`- Bed size: ${length} cm x ${width} cm (${Math.round(areaSqm * 100) / 100} m²)`);
  lines.push(`- Light: ${sunText}`);
  if (band) {
    lines.push(
      `- USDA hardiness zone ${zoneText.toUpperCase()} — average annual minimum ${band.lowF} to ${band.highF} °F (${band.lowC} to ${band.highC} °C)`,
    );
  }
  lines.push(`- Crop hardiness: ${hardy.label}. ${hardy.note}`);
  if (clean(soil)) lines.push(`- Soil: ${clean(soil)}`);
  lines.push("");
  lines.push("THE NUMBERS I ALREADY HAVE");
  lines.push(`- Spacing: ${spacing} cm each way, so ${layout.along} x ${layout.across} = ${layout.total} plants fit`);
  lines.push(
    `- Watering at ${WEEKLY_WATER_MM} mm a week over ${Math.round(areaSqm * 100) / 100} m² is about ${Math.round(waterLitres)} litres a week, rain included`,
  );
  lines.push(`- Days to maturity: ${maturity}`);
  if (clean(sowISO)) lines.push(`- Sowing on ${clean(sowISO)}, so first harvest around ${harvestISO}`);
  if (clean(lastFrostISO)) {
    lines.push(
      `- Last spring frost: ${clean(lastFrostISO)}${frostGap === null ? "" : ` (${frostGap >= 0 ? `${frostGap} days after it` : `${Math.abs(frostGap)} days before it`})`}`,
    );
  }
  if (frostWarning) lines.push(`- WARNING: ${frostWarning}`);
  if (clean(goals)) lines.push(`- What I want out of it: ${clean(goals)}`);
  lines.push("");
  lines.push("WHAT TO GIVE ME");
  lines.push("1. A sowing-to-harvest timeline with dates, using my sowing date, and say clearly if I should start indoors and transplant.");
  lines.push("2. Soil preparation and feeding: what to add, how much per square metre, and when.");
  lines.push("3. A watering schedule that adapts my weekly litres for hot spells and for seedlings versus mature plants.");
  lines.push("4. Support, pruning or thinning, with the exact stage at which each is done.");
  lines.push("5. The three pests or diseases most likely to hit this crop in my zone, with the earliest visible symptom for each and a non-chemical response first.");
  lines.push("6. Two good companion plants and one thing I should not plant next to it, with the reason.");
  lines.push("7. How I will know it is ready to pick, and how to store or preserve a glut.");
  lines.push("");
  lines.push("Use my numbers above rather than generic ones. If my spacing or timing is wrong for this crop, say so and give the correct figure.");

  const prompt = lines.join("\n");

  return {
    prompt,
    plantsAlong: layout.along,
    plantsAcross: layout.across,
    plantCount: layout.total,
    areaSqm: Math.round(areaSqm * 100) / 100,
    weeklyWaterLitres: Math.round(waterLitres),
    harvestISO,
    frostGap,
    frostWarning,
    zoneBand: band,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}

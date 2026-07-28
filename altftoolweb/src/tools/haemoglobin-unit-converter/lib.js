/**
 * Haemoglobin Unit Converter — pure conversion and WHO anaemia banding.
 *
 * g/dL is used in the US, UK and India, g/L across much of Europe and Canada,
 * and mmol/L in the Netherlands, Scandinavia and parts of Germany.
 */

/** 1 g/dL is 1 gram per 100 mL, so exactly 10 g/L. */
export const GL_PER_GDL = 10;

/**
 * The SI value for haemoglobin is expressed per iron-containing monomer, molar
 * mass 16,114.5 g/mol. 10 g/L / 16,114.5 g/mol = 0.62056 mmol/L per g/dL.
 * The factor printed on conversion tables is 0.6206.
 * Check: 14 g/dL x 0.6206 = 8.7 mmol/L, the value Dutch laboratories report.
 */
export const MMOLL_PER_GDL = 0.6206;

/** Outside this the value is not a haemoglobin result. */
export const MIN_GDL = 1;
export const MAX_GDL = 30;

export const UNITS = [
  { id: "gdl", label: "g/dL", step: "0.1" },
  { id: "gl", label: "g/L", step: "1" },
  { id: "mmoll", label: "mmol/L", step: "0.1" },
];

/**
 * WHO haemoglobin thresholds for anaemia and its severity, at sea level
 * (WHO/NMH/NHD/MNM/11.1, Haemoglobin concentrations for the diagnosis of
 * anaemia and assessment of severity). All figures in g/dL.
 */
export const POPULATIONS = [
  {
    id: "adult-male",
    label: "Man, 15 years or older",
    anaemiaBelow: 13.0,
    severe: 8.0,
    moderate: 11.0,
    typicalHigh: 17.5,
  },
  {
    id: "adult-female",
    label: "Woman, 15 years or older, not pregnant",
    anaemiaBelow: 12.0,
    severe: 8.0,
    moderate: 11.0,
    typicalHigh: 15.5,
  },
  {
    id: "pregnant",
    label: "Pregnant woman",
    anaemiaBelow: 11.0,
    severe: 7.0,
    moderate: 10.0,
    typicalHigh: 15.0,
  },
  {
    id: "child-6-59m",
    label: "Child, 6 to 59 months",
    anaemiaBelow: 11.0,
    severe: 7.0,
    moderate: 10.0,
    typicalHigh: 14.0,
  },
  {
    id: "child-5-11y",
    label: "Child, 5 to 11 years",
    anaemiaBelow: 11.5,
    severe: 8.0,
    moderate: 11.0,
    typicalHigh: 14.5,
  },
  {
    id: "child-12-14y",
    label: "Child, 12 to 14 years",
    anaemiaBelow: 12.0,
    severe: 8.0,
    moderate: 11.0,
    typicalHigh: 15.5,
  },
];

/**
 * Haemoglobin rises with altitude, so WHO publishes an adjustment that is
 * SUBTRACTED from the measured value before the thresholds above are applied.
 * Table from WHO/NMH/NHD/MNM/11.1, in g/L; no adjustment below 1,000 metres.
 * Values between the listed elevations are interpolated linearly.
 */
export const ALTITUDE_ADJUST_FROM_M = 1000;

export const ALTITUDE_ADJUSTMENT_TABLE = [
  { metres: 1000, gl: 2 },
  { metres: 1500, gl: 5 },
  { metres: 2000, gl: 8 },
  { metres: 2500, gl: 13 },
  { metres: 3000, gl: 19 },
  { metres: 3500, gl: 27 },
  { metres: 4000, gl: 35 },
  { metres: 4500, gl: 45 },
];

/** Amount (g/dL) to subtract from a measured haemoglobin at this elevation. */
export function altitudeAdjustmentGdl(metres) {
  if (!Number.isFinite(metres) || metres < ALTITUDE_ADJUST_FROM_M) return 0;
  const table = ALTITUDE_ADJUSTMENT_TABLE;
  const last = table[table.length - 1];
  if (metres >= last.metres) return last.gl / GL_PER_GDL;
  for (let index = 0; index < table.length - 1; index += 1) {
    const low = table[index];
    const high = table[index + 1];
    if (metres >= low.metres && metres <= high.metres) {
      const span = high.metres - low.metres;
      const share = span === 0 ? 0 : (metres - low.metres) / span;
      return (low.gl + (high.gl - low.gl) * share) / GL_PER_GDL;
    }
  }
  return 0;
}

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isBlank = (value) => String(value ?? "").trim() === "";

export function gdlToGl(gdl) {
  return Number.isFinite(gdl) ? gdl * GL_PER_GDL : NaN;
}
export function glToGdl(gl) {
  return Number.isFinite(gl) ? gl / GL_PER_GDL : NaN;
}
export function gdlToMmoll(gdl) {
  return Number.isFinite(gdl) ? gdl * MMOLL_PER_GDL : NaN;
}
export function mmollToGdl(mmoll) {
  return Number.isFinite(mmoll) ? mmoll / MMOLL_PER_GDL : NaN;
}

/** Classify an already altitude-adjusted g/dL value for one population group. */
export function classifyHaemoglobin(adjustedGdl, population) {
  if (!Number.isFinite(adjustedGdl) || !population) return null;
  if (adjustedGdl >= population.anaemiaBelow) {
    if (adjustedGdl > population.typicalHigh) {
      return {
        id: "high",
        label: "Above the usual range",
        note: `Above about ${population.typicalHigh} g/dL for this group. A high haemoglobin can follow dehydration, smoking, living at altitude or a blood disorder, and should be reviewed by a clinician.`,
      };
    }
    return {
      id: "normal",
      label: "Not anaemic by the WHO threshold",
      note: `At or above ${population.anaemiaBelow} g/dL (${gdlToGl(population.anaemiaBelow)} g/L), the WHO anaemia threshold for this group.`,
    };
  }
  if (adjustedGdl < population.severe) {
    return {
      id: "severe",
      label: "Severe anaemia range",
      note: `Below ${population.severe} g/dL (${gdlToGl(population.severe)} g/L) is classed as severe anaemia by the WHO. Seek medical assessment promptly.`,
    };
  }
  if (adjustedGdl < population.moderate) {
    return {
      id: "moderate",
      label: "Moderate anaemia range",
      note: `${population.severe} to ${(population.moderate - 0.1).toFixed(1)} g/dL is the WHO moderate anaemia band for this group.`,
    };
  }
  return {
    id: "mild",
    label: "Mild anaemia range",
    note: `${population.moderate} to ${(population.anaemiaBelow - 0.1).toFixed(1)} g/dL is the WHO mild anaemia band for this group.`,
  };
}

/**
 * Convert a haemoglobin result to all three units and band it.
 *
 * @param {object} input
 * @param {number|string} input.value      Result as entered.
 * @param {string} input.unit             "gdl" | "gl" | "mmoll".
 * @param {string} input.populationId     One of POPULATIONS ids.
 * @param {number|string} [input.altitudeM] Altitude of residence in metres; blank means sea level.
 */
export function convertHaemoglobin({
  value,
  unit = "gdl",
  populationId = "adult-male",
  altitudeM,
} = {}) {
  if (!UNITS.some((item) => item.id === unit)) return { error: "Choose g/dL, g/L or mmol/L." };
  const population = POPULATIONS.find((item) => item.id === populationId);
  if (!population) return { error: "Choose one of the population groups." };

  const raw = toFinite(value);
  if (Number.isNaN(raw)) return { error: "Enter the haemoglobin result as a number." };
  if (raw <= 0) return { error: "Haemoglobin must be greater than zero." };

  let gdl;
  if (unit === "gdl") gdl = raw;
  else if (unit === "gl") gdl = glToGdl(raw);
  else gdl = mmollToGdl(raw);

  if (!Number.isFinite(gdl) || gdl < MIN_GDL || gdl > MAX_GDL) {
    return {
      error: `That works out to ${Number.isFinite(gdl) ? gdl.toFixed(1) : "an impossible"} g/dL, outside the ${MIN_GDL} to ${MAX_GDL} g/dL range results fall in — check which unit you selected.`,
    };
  }

  let altitude = 0;
  if (!isBlank(altitudeM)) {
    altitude = toFinite(altitudeM);
    if (Number.isNaN(altitude)) return { error: "Altitude must be a number in metres, or left blank." };
    if (altitude < 0 || altitude > 6000) {
      return { error: "Enter an altitude between 0 and 6000 metres, or leave it blank." };
    }
  }

  const adjustment = altitudeAdjustmentGdl(altitude);
  const adjustedGdl = gdl - adjustment;
  const band = classifyHaemoglobin(adjustedGdl, population);

  return {
    gdl,
    gl: gdlToGl(gdl),
    mmoll: gdlToMmoll(gdl),
    unit,
    population,
    altitudeM: altitude,
    adjustment,
    adjustedGdl,
    band,
  };
}

/**
 * Decode a tyre sidewall code such as 205/55 R16 91V.
 *
 * The load index and speed symbol are defined by the standards bodies (ETRTO in
 * Europe, TRA in the US, JATMA in Japan) and reproduced in ECE Regulation 30.
 * A load index maps to a maximum mass in kilograms per tyre; a speed symbol
 * maps to a maximum speed in km/h. Both apply only at the tyre's specified
 * inflation pressure and within its rated load.
 */

/** ETRTO load index -> maximum load carried by ONE tyre, in kilograms. */
export const LOAD_INDEX_KG = {
  20: 80, 21: 82.5, 22: 85, 23: 87.5, 24: 90, 25: 92.5, 26: 95, 27: 97.5, 28: 100, 29: 103,
  30: 106, 31: 109, 32: 112, 33: 115, 34: 118, 35: 121, 36: 125, 37: 128, 38: 132, 39: 136,
  40: 140, 41: 145, 42: 150, 43: 155, 44: 160, 45: 165, 46: 170, 47: 175, 48: 180, 49: 185,
  50: 190, 51: 195, 52: 200, 53: 206, 54: 212, 55: 218, 56: 224, 57: 230, 58: 236, 59: 243,
  60: 250, 61: 257, 62: 265, 63: 272, 64: 280, 65: 290, 66: 300, 67: 307, 68: 315, 69: 325,
  70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400, 77: 412, 78: 425, 79: 437,
  80: 450, 81: 462, 82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580,
  90: 600, 91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775,
  100: 800, 101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975, 108: 1000,
  109: 1030, 110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180, 115: 1215, 116: 1250,
  117: 1285, 118: 1320, 119: 1360, 120: 1400, 121: 1450, 122: 1500, 123: 1550, 124: 1600,
  125: 1650, 126: 1700, 127: 1750, 128: 1800, 129: 1850, 130: 1900, 131: 1950, 132: 2000,
  133: 2060, 134: 2120, 135: 2180, 136: 2240, 137: 2300, 138: 2360, 139: 2430, 140: 2500,
  141: 2575, 142: 2650, 143: 2725, 144: 2800, 145: 2900, 146: 3000, 147: 3075, 148: 3150,
  149: 3250, 150: 3350,
};

/** Speed symbol -> maximum speed in km/h (ECE R30 / ETRTO). */
export const SPEED_SYMBOL_KMH = {
  B: 50, C: 60, D: 65, E: 70, F: 80, G: 90, J: 100, K: 110, L: 120, M: 130,
  N: 140, P: 150, Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240,
  W: 270, Y: 300,
};

/** Symbols whose rating is open-ended rather than a fixed ceiling. */
export const OPEN_ENDED_SPEED = {
  ZR: { minKmh: 240, note: "ZR marks a tyre rated above 240 km/h; the actual ceiling comes from the service description." },
  "(Y)": { minKmh: 300, note: "A speed symbol in brackets means the tyre is rated above 300 km/h." },
};

/** One inch is exactly 25.4 mm. */
export const MM_PER_INCH = 25.4;

/** One mile is exactly 1.609344 km. */
export const KM_PER_MILE = 1.609344;

/**
 * A loaded tyre deflects, so its rolling circumference is roughly 2-3% under
 * the free geometric circumference. Revolutions per km are reported both ways.
 */
export const DEFLECTION_FACTOR = 0.97;

const TYRE_CODE_RE =
  /^(P|LT|ST|T|C)?\s*(\d{2,3})\s*\/\s*(\d{2,3})\s*(ZR|R|D|B|-)\s*(\d{1,2}(?:\.5)?)\s*C?\s*(\d{2,3})(?:\s*\/\s*(\d{2,3}))?\s*(\(Y\)|[A-Z]{1,2})?\s*$/;

const CONSTRUCTION_LABEL = {
  R: "Radial",
  ZR: "Radial, ZR speed marking",
  D: "Diagonal / bias-ply",
  B: "Bias-belted",
  "-": "Diagonal / bias-ply (dash notation)",
};

const PREFIX_LABEL = {
  P: "P-metric — passenger car (US sizing)",
  LT: "LT — light truck",
  ST: "ST — special trailer",
  T: "T — temporary / space-saver spare",
  C: "C — commercial",
};

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Decode a full sidewall code.
 *
 * @param {string} code e.g. "205/55 R16 91V", "LT265/75R16 123/120Q", "90/90-18 51P"
 * @param {object} [options]
 * @param {number} [options.tyresOnVehicle] used for the total capacity figure
 * @param {number} [options.grossVehicleWeightKg] checked against total capacity
 */
export function decodeTyreCode(code, { tyresOnVehicle = 4, grossVehicleWeightKg } = {}) {
  if (typeof code !== "string" || code.trim() === "") {
    return { error: "Enter a tyre size such as 205/55 R16 91V." };
  }
  const normalised = code.toUpperCase().replace(/\s+/g, " ").trim();
  const match = TYRE_CODE_RE.exec(normalised);
  if (!match) {
    return {
      error:
        "That does not look like a standard tyre code. Use the format width/aspect construction rim load-index speed, for example 205/55 R16 91V.",
    };
  }

  const [, prefix, widthRaw, aspectRaw, constructionRaw, rimRaw, loadRaw, loadDualRaw, speedRaw] = match;

  const widthMm = Number(widthRaw);
  const aspect = Number(aspectRaw);
  const rimInch = Number(rimRaw);
  const loadIndex = Number(loadRaw);
  const loadIndexDual = loadDualRaw ? Number(loadDualRaw) : null;

  if (!(widthMm >= 50 && widthMm <= 405)) {
    return { error: "Section width should be between 50 mm and 405 mm." };
  }
  if (!(aspect >= 20 && aspect <= 100)) {
    return { error: "Aspect ratio should be between 20 and 100." };
  }
  if (!(rimInch >= 8 && rimInch <= 30)) {
    return { error: "Rim diameter should be between 8 and 30 inches." };
  }

  const loadKg = LOAD_INDEX_KG[loadIndex];
  if (loadKg === undefined) {
    return { error: `Load index ${loadIndex} is not in the standard table (20 to 150).` };
  }
  const loadDualKg = loadIndexDual === null ? null : LOAD_INDEX_KG[loadIndexDual];
  if (loadIndexDual !== null && loadDualKg === undefined) {
    return { error: `Second load index ${loadIndexDual} is not in the standard table (20 to 150).` };
  }

  const warnings = [];
  let speedSymbol = speedRaw || null;
  let speedKmh = null;
  let speedIsMinimum = false;
  let speedNote = "";

  if (speedSymbol && OPEN_ENDED_SPEED[speedSymbol]) {
    speedKmh = OPEN_ENDED_SPEED[speedSymbol].minKmh;
    speedIsMinimum = true;
    speedNote = OPEN_ENDED_SPEED[speedSymbol].note;
  } else if (speedSymbol) {
    const value = SPEED_SYMBOL_KMH[speedSymbol];
    if (value === undefined) {
      return { error: `Speed symbol "${speedSymbol}" is not in the standard table.` };
    }
    speedKmh = value;
  } else {
    warnings.push("No speed symbol was found in the code — read it again from the sidewall; a tyre without one has no rated speed you can rely on.");
  }

  if (constructionRaw === "ZR" && speedSymbol && !OPEN_ENDED_SPEED[speedSymbol]) {
    speedIsMinimum = true;
    speedNote = "ZR in the size plus a speed symbol means the service description governs: the tyre is rated above 240 km/h.";
  }

  const sidewallMm = (widthMm * aspect) / 100;
  const rimMm = rimInch * MM_PER_INCH;
  const overallDiameterMm = rimMm + 2 * sidewallMm;
  const circumferenceMm = Math.PI * overallDiameterMm;
  const revsPerKmGeometric = 1000000 / circumferenceMm;
  const revsPerKmLoaded = 1000000 / (circumferenceMm * DEFLECTION_FACTOR);

  const count = Number.isFinite(tyresOnVehicle) && tyresOnVehicle >= 1 ? Math.floor(tyresOnVehicle) : 4;
  const totalCapacityKg = loadKg * count;

  let gvwCheck = null;
  if (Number.isFinite(grossVehicleWeightKg) && grossVehicleWeightKg > 0) {
    gvwCheck = {
      gvwKg: grossVehicleWeightKg,
      capacityKg: totalCapacityKg,
      marginKg: round(totalCapacityKg - grossVehicleWeightKg, 0),
      sufficient: totalCapacityKg >= grossVehicleWeightKg,
    };
    if (!gvwCheck.sufficient) {
      warnings.push(`${count} tyres at load index ${loadIndex} carry ${totalCapacityKg} kg, which is below the ${grossVehicleWeightKg} kg gross weight you entered. Fit a higher load index.`);
    }
  }

  if (constructionRaw === "D" || constructionRaw === "-" || constructionRaw === "B") {
    warnings.push("This is a bias-ply or bias-belted tyre. Never mix bias and radial tyres on the same axle.");
  }

  return {
    input: normalised,
    prefix: prefix || null,
    prefixLabel: prefix ? PREFIX_LABEL[prefix] : "Metric passenger sizing (no prefix)",
    widthMm,
    aspect,
    construction: constructionRaw,
    constructionLabel: CONSTRUCTION_LABEL[constructionRaw],
    rimInch,
    rimMm: round(rimMm, 1),
    sidewallMm: round(sidewallMm, 1),
    overallDiameterMm: round(overallDiameterMm, 1),
    overallDiameterInch: round(overallDiameterMm / MM_PER_INCH, 2),
    circumferenceMm: round(circumferenceMm, 1),
    revsPerKmGeometric: round(revsPerKmGeometric, 1),
    revsPerKmLoaded: round(revsPerKmLoaded, 1),
    loadIndex,
    loadKg,
    loadIndexDual,
    loadDualKg,
    axleCapacityKg: loadKg * 2,
    tyresOnVehicle: count,
    totalCapacityKg,
    speedSymbol,
    speedKmh,
    speedMph: speedKmh === null ? null : round(speedKmh / KM_PER_MILE, 1),
    speedIsMinimum,
    speedNote,
    gvwCheck,
    warnings,
  };
}

/** Reverse lookup: the smallest load index that carries at least `kg` per tyre. */
export function loadIndexForKg(kg) {
  if (!Number.isFinite(kg) || kg <= 0) return null;
  const entries = Object.entries(LOAD_INDEX_KG)
    .map(([index, value]) => [Number(index), value])
    .sort((a, b) => a[0] - b[0]);
  const hit = entries.find(([, value]) => value >= kg);
  return hit ? { index: hit[0], kg: hit[1] } : null;
}

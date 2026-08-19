/**
 * Rough-sheet zone planner.
 *
 * The organising method is the "numbered zone" technique from exam-technique
 * coaching: fold or rule each rough side into a fixed grid of zones, label
 * every zone with the question number it serves, and reserve one area for
 * formulas/values you will reuse. Because each calculation has a labelled
 * home, you can re-find intermediate results instead of recomputing them.
 * This module does the capacity arithmetic for that layout.
 */

/** A single fold-in-half twice gives 4 zones per side — the common default. */
export const DEFAULT_ZONES_PER_SIDE = 4;

/** Rough sheets are almost always usable on both sides. */
export const DEFAULT_SIDES_PER_SHEET = 2;

/**
 * Plan the zone layout.
 *
 * @param {object} input
 * @param {number} input.sheets              Rough sheets provided/allowed.
 * @param {number} input.sidesPerSheet       Usable sides per sheet (1 or 2).
 * @param {number} input.zonesPerSide        Zones you will rule each side into.
 * @param {number} input.calcQuestions       Questions expected to need written working.
 * @param {number} input.reserveSides        Sides kept aside for a formula/reuse bank.
 * @returns {object} plan or { error }
 */
export function planRoughWork({
  sheets,
  sidesPerSheet,
  zonesPerSide,
  calcQuestions,
  reserveSides,
}) {
  const sheetCount = Number(sheets);
  const sides = Number(sidesPerSheet);
  const zones = Number(zonesPerSide);
  const questions = Number(calcQuestions);
  const reserved = Number(reserveSides);

  if (!Number.isFinite(sheetCount) || !Number.isInteger(sheetCount) || sheetCount < 1) {
    return { error: "Enter a whole number of rough sheets (at least 1)." };
  }
  if (!Number.isFinite(sides) || !Number.isInteger(sides) || sides < 1 || sides > 2) {
    return { error: "Sides per sheet must be 1 or 2." };
  }
  if (!Number.isFinite(zones) || !Number.isInteger(zones) || zones < 1 || zones > 12) {
    return { error: "Zones per side must be a whole number from 1 to 12 — beyond that they get too small to use." };
  }
  if (!Number.isFinite(questions) || !Number.isInteger(questions) || questions < 1) {
    return { error: "Enter a whole number of questions needing rough work (at least 1)." };
  }
  if (!Number.isFinite(reserved) || !Number.isInteger(reserved) || reserved < 0) {
    return { error: "Reserved sides must be a whole number, 0 or more." };
  }

  const totalSides = sheetCount * sides;
  if (reserved >= totalSides) {
    return {
      error: `You only have ${totalSides} side${totalSides === 1 ? "" : "s"} in total — reserve fewer for the formula bank.`,
    };
  }

  const workingSides = totalSides - reserved;
  const totalZones = workingSides * zones;
  const enough = totalZones >= questions;

  // How many zones each question can claim (floor), and how many questions
  // get one extra zone when zones don't divide evenly.
  const zonesPerQuestion = Math.floor(totalZones / questions);
  const questionsWithExtraZone = totalZones % questions;

  // If short, the zones-per-side that would make capacity meet demand.
  const requiredZonesPerSide = Math.ceil(questions / workingSides);
  const shortfall = enough ? 0 : questions - totalZones;

  return {
    totalSides,
    workingSides,
    reservedSides: reserved,
    totalZones,
    calcQuestions: questions,
    enough,
    zonesPerQuestion,
    questionsWithExtraZone,
    shortfall,
    requiredZonesPerSide,
    // Labelling scheme: sheet number, side letter, zone number.
    labelExample: `Label zones "S1a-1" … "S1a-${zones}", then "S1b-1" onward — write the question number beside the label before any working.`,
  };
}

import { SIZE_DATA, FIT_TYPES } from "./sizeData";

/**
 * Converts shoe size from one system to another.
 * @param {string} value - The size value.
 * @param {string} fromSystem - The system of the input value (us, uk, eu, in, cm).
 * @param {string} gender - men, women, kids.
 * @returns {object|null} - All systems for the matched size.
 */
export const convertShoeSize = (value, fromSystem, gender) => {
  const data = SIZE_DATA.shoes[gender];
  if (!data) return null;

  const match = data.find(item => item[fromSystem.toLowerCase()] === value);
  return match || null;
};

/**
 * Converts clothing size.
 * @param {string} value - The size value (e.g. "S", "M", "40").
 * @param {string} category - shirts, jeans, tops, dresses.
 * @param {string} gender - men, women.
 * @returns {object|null}
 */
export const convertClothingSize = (value, category, gender, fromSystem) => {
  const data = SIZE_DATA.clothing[gender]?.[category];
  if (!data) return null;

  const match = data.find(item => item[fromSystem.toLowerCase()] === value || item.size === value);
  return match || null;
};

/**
 * Recommends size based on measurements.
 * @param {object} measurements - { chest, waist, hip, footLength }.
 * @param {string} category - clothing/shoes.
 * @param {string} subCategory - shirts, jeans, etc.
 * @param {string} gender - men, women, kids.
 * @param {string} fitType - SLIM, REGULAR, LOOSE, OVERSIZED.
 */
export const getRecommendation = (measurements, category, subCategory, gender, fitType = "REGULAR") => {
  if (category === "shoes") {
    const data = SIZE_DATA.shoes[gender];
    if (!data) return null;

    const footLength = parseFloat(measurements.footLength);
    if (isNaN(footLength)) return null;

    // Find the closest CM match that is equal or greater than footLength
    const match = data.find(item => parseFloat(item.cm) >= footLength);
    return match || data[data.length - 1];
  }

  if (category === "clothing") {
    const data = SIZE_DATA.clothing[gender]?.[subCategory];
    if (!data) return null;

    const { chest, waist, hip } = measurements;
    const fitOffset = FIT_TYPES[fitType].offset;

    // Recommendation logic: find the first size where measurements fit within range
    // Range is typically "34-36", so we check against the upper bound
    const match = data.find(item => {
      if (item.chest) {
        const [min, max] = item.chest.split("-").map(v => parseFloat(v));
        if (parseFloat(chest) + fitOffset <= (max || min)) return true;
      }
      if (item.waist) {
        const [min, max] = item.waist.split("-").map(v => parseFloat(v));
        if (parseFloat(waist) + fitOffset <= (max || min)) return true;
      }
      return false;
    });

    return match || data[data.length - 1];
  }

  return null;
};

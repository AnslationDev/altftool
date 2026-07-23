/**
 * Format a number as an Indian-Rupee string with Indian digit grouping
 * (lakhs/crores, e.g. 139999 → "₹1,39,999"), matching the site's existing
 * currency style.
 *
 * @param {number|null|undefined} amount
 * @returns {string} formatted amount, or "" if not a finite number
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return "";

  const num = Math.round(Number(amount));
  const sign = num < 0 ? "-" : "";
  const str = String(Math.abs(num));
  const lastThree = str.slice(-3);
  const other = str.slice(0, -3);
  const formattedOther = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `₹${sign}${formattedOther ? `${formattedOther},` : ""}${lastThree}`;
}

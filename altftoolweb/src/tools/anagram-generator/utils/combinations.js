// Multinomial coefficient: n! / (count1! * count2! * ...), which is the true
// number of *distinct* letter arrangements once repeated letters are taken
// into account (a raw n! overstates it for any word with duplicate letters).
// Uses BigInt so the magnitude stays exact and readable well past 12 letters
// instead of collapsing to a flat placeholder.
function factorialBig(n) {
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

export function combinationsEstimate(input) {
  const clean = (input || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
  const n = clean.length;
  if (!n) return "0";

  const freq = {};
  for (const ch of clean) freq[ch] = (freq[ch] || 0) + 1;

  const numerator = factorialBig(n);
  let denominator = 1n;
  for (const count of Object.values(freq)) denominator *= factorialBig(count);
  const distinct = numerator / denominator;

  const digits = distinct.toString().length;
  // Beyond ~15 digits a grouped integer is unreadable in a small stat card;
  // fall back to scientific notation so the order of magnitude stays honest.
  if (digits > 15) {
    const str = distinct.toString();
    const exponent = digits - 1;
    const mantissa = `${str[0]}.${str.slice(1, 3)}`;
    return `~${mantissa} × 10^${exponent}`;
  }

  return distinct.toLocaleString("en-US");
}

export default combinationsEstimate;

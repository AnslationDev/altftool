// Converts an ISO 3166-1 alpha-2 country code to its flag emoji using the
// regional indicator symbol Unicode block, so flags never need hardcoding.

const REGIONAL_INDICATOR_BASE = 0x1f1e6; // 🇦
const ASCII_A = 65; // "A"

export function countryCodeToFlagEmoji(code) {
  if (!code || typeof code !== "string" || code.length !== 2) return "🌍";

  const upper = code.toUpperCase();
  const codePoints = [...upper].map((char) => {
    const offset = char.charCodeAt(0) - ASCII_A;
    return REGIONAL_INDICATOR_BASE + offset;
  });

  if (codePoints.some((point) => point < REGIONAL_INDICATOR_BASE || point > REGIONAL_INDICATOR_BASE + 25)) {
    return "🌍";
  }

  return String.fromCodePoint(...codePoints);
}

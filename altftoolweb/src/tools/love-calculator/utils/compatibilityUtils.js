/**
 * Calculates a deterministic percentage (0-100) based on name pairings.
 * Preserves order independence (e.g. A & B is identical to B & A).
 */
export function getDeterministicMatch(name1 = "", name2 = "") {
  const n1 = name1.trim().toLowerCase();
  const n2 = name2.trim().toLowerCase();
  if (!n1 || !n2) return 0;

  // Sort names to make order independent
  const sortedNames = [n1, n2].sort().join("&");

  // Polynomial rolling hash (similar to DJB2)
  let hash = 0;
  for (let i = 0; i < sortedNames.length; i++) {
    hash = (hash << 5) - hash + sortedNames.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Return value between 15 and 99 (making it a fun calculation)
  const baseScore = Math.abs(hash % 85) + 15;
  return baseScore;
}

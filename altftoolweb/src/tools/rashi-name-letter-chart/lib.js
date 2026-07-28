/**
 * Rashi naming syllables (namakshar).
 *
 * In the traditional Indian naming custom, the first syllable of a child's name is
 * taken from the nakshatra pada the Moon occupied at birth. Each of the 27
 * nakshatras is divided into four padas, giving 108 syllables; each rashi spans
 * exactly nine of those padas (2.25 nakshatras), so every rashi has nine
 * syllables. The nine listed for each sign below are the standard set, given in
 * pada order with the nakshatra each comes from.
 *
 * This is cultural reference material about a naming custom. It is not a
 * prediction of anything, and it does not determine a name's suitability.
 */

/** Padas per nakshatra, fixed at four in the classical scheme. */
export const PADAS_PER_NAKSHATRA = 4;
/** Nakshatras in the zodiac. */
export const NAKSHATRA_COUNT = 27;
/** Padas per rashi: 108 padas across 12 signs. */
export const PADAS_PER_RASHI = (NAKSHATRA_COUNT * PADAS_PER_NAKSHATRA) / 12;

/** Longest name string the matcher will accept. */
export const MAX_NAME_LENGTH = 30;

/** Medial glides and liquids that a cluster can be reduced by when matching. */
export const CLUSTER_GLIDES = ["r", "l", "y", "v", "w"];

export const RASHIS = [
  {
    id: "mesha",
    sanskrit: "Mesha",
    english: "Aries",
    symbol: "Ram",
    lord: "Mangal (Mars)",
    element: "Fire",
    syllables: [
      { syllable: "Chu", nakshatra: "Ashwini", pada: 1 },
      { syllable: "Che", nakshatra: "Ashwini", pada: 2 },
      { syllable: "Cho", nakshatra: "Ashwini", pada: 3 },
      { syllable: "La", nakshatra: "Ashwini", pada: 4 },
      { syllable: "Li", nakshatra: "Bharani", pada: 1 },
      { syllable: "Lu", nakshatra: "Bharani", pada: 2 },
      { syllable: "Le", nakshatra: "Bharani", pada: 3 },
      { syllable: "Lo", nakshatra: "Bharani", pada: 4 },
      { syllable: "A", nakshatra: "Krittika", pada: 1 },
    ],
  },
  {
    id: "vrishabha",
    sanskrit: "Vrishabha",
    english: "Taurus",
    symbol: "Bull",
    lord: "Shukra (Venus)",
    element: "Earth",
    syllables: [
      { syllable: "I", nakshatra: "Krittika", pada: 2 },
      { syllable: "U", nakshatra: "Krittika", pada: 3 },
      { syllable: "E", nakshatra: "Krittika", pada: 4 },
      { syllable: "O", nakshatra: "Rohini", pada: 1 },
      { syllable: "Va", nakshatra: "Rohini", pada: 2 },
      { syllable: "Vi", nakshatra: "Rohini", pada: 3 },
      { syllable: "Vu", nakshatra: "Rohini", pada: 4 },
      { syllable: "Ve", nakshatra: "Mrigashira", pada: 1 },
      { syllable: "Vo", nakshatra: "Mrigashira", pada: 2 },
    ],
  },
  {
    id: "mithuna",
    sanskrit: "Mithuna",
    english: "Gemini",
    symbol: "Twins",
    lord: "Budha (Mercury)",
    element: "Air",
    syllables: [
      { syllable: "Ka", nakshatra: "Mrigashira", pada: 3 },
      { syllable: "Ki", nakshatra: "Mrigashira", pada: 4 },
      { syllable: "Ku", nakshatra: "Ardra", pada: 1 },
      { syllable: "Gha", nakshatra: "Ardra", pada: 2 },
      { syllable: "Nga", nakshatra: "Ardra", pada: 3 },
      { syllable: "Chha", nakshatra: "Ardra", pada: 4 },
      { syllable: "Ke", nakshatra: "Punarvasu", pada: 1 },
      { syllable: "Ko", nakshatra: "Punarvasu", pada: 2 },
      { syllable: "Ha", nakshatra: "Punarvasu", pada: 3 },
    ],
  },
  {
    id: "karka",
    sanskrit: "Karka",
    english: "Cancer",
    symbol: "Crab",
    lord: "Chandra (Moon)",
    element: "Water",
    syllables: [
      { syllable: "Hi", nakshatra: "Punarvasu", pada: 4 },
      { syllable: "Hu", nakshatra: "Pushya", pada: 1 },
      { syllable: "He", nakshatra: "Pushya", pada: 2 },
      { syllable: "Ho", nakshatra: "Pushya", pada: 3 },
      { syllable: "Da", nakshatra: "Pushya", pada: 4 },
      { syllable: "Di", nakshatra: "Ashlesha", pada: 1 },
      { syllable: "Du", nakshatra: "Ashlesha", pada: 2 },
      { syllable: "De", nakshatra: "Ashlesha", pada: 3 },
      { syllable: "Do", nakshatra: "Ashlesha", pada: 4 },
    ],
  },
  {
    id: "simha",
    sanskrit: "Simha",
    english: "Leo",
    symbol: "Lion",
    lord: "Surya (Sun)",
    element: "Fire",
    syllables: [
      { syllable: "Ma", nakshatra: "Magha", pada: 1 },
      { syllable: "Mi", nakshatra: "Magha", pada: 2 },
      { syllable: "Mu", nakshatra: "Magha", pada: 3 },
      { syllable: "Me", nakshatra: "Magha", pada: 4 },
      { syllable: "Mo", nakshatra: "Purva Phalguni", pada: 1 },
      { syllable: "Ta", nakshatra: "Purva Phalguni", pada: 2 },
      { syllable: "Ti", nakshatra: "Purva Phalguni", pada: 3 },
      { syllable: "Tu", nakshatra: "Purva Phalguni", pada: 4 },
      { syllable: "Te", nakshatra: "Uttara Phalguni", pada: 1 },
    ],
  },
  {
    id: "kanya",
    sanskrit: "Kanya",
    english: "Virgo",
    symbol: "Maiden",
    lord: "Budha (Mercury)",
    element: "Earth",
    syllables: [
      { syllable: "To", nakshatra: "Uttara Phalguni", pada: 2 },
      { syllable: "Pa", nakshatra: "Uttara Phalguni", pada: 3 },
      { syllable: "Pi", nakshatra: "Uttara Phalguni", pada: 4 },
      { syllable: "Pu", nakshatra: "Hasta", pada: 1 },
      { syllable: "Sha", nakshatra: "Hasta", pada: 2 },
      { syllable: "Na", nakshatra: "Hasta", pada: 3 },
      { syllable: "Tha", nakshatra: "Hasta", pada: 4 },
      { syllable: "Pe", nakshatra: "Chitra", pada: 1 },
      { syllable: "Po", nakshatra: "Chitra", pada: 2 },
    ],
  },
  {
    id: "tula",
    sanskrit: "Tula",
    english: "Libra",
    symbol: "Scales",
    lord: "Shukra (Venus)",
    element: "Air",
    syllables: [
      { syllable: "Ra", nakshatra: "Chitra", pada: 3 },
      { syllable: "Ri", nakshatra: "Chitra", pada: 4 },
      { syllable: "Ru", nakshatra: "Swati", pada: 1 },
      { syllable: "Re", nakshatra: "Swati", pada: 2 },
      { syllable: "Ro", nakshatra: "Swati", pada: 3 },
      { syllable: "Taa", nakshatra: "Swati", pada: 4 },
      { syllable: "Tee", nakshatra: "Vishakha", pada: 1 },
      { syllable: "Too", nakshatra: "Vishakha", pada: 2 },
      { syllable: "Tay", nakshatra: "Vishakha", pada: 3 },
    ],
  },
  {
    id: "vrischika",
    sanskrit: "Vrischika",
    english: "Scorpio",
    symbol: "Scorpion",
    lord: "Mangal (Mars)",
    element: "Water",
    syllables: [
      { syllable: "Tho", nakshatra: "Vishakha", pada: 4 },
      { syllable: "Na", nakshatra: "Anuradha", pada: 1 },
      { syllable: "Ni", nakshatra: "Anuradha", pada: 2 },
      { syllable: "Nu", nakshatra: "Anuradha", pada: 3 },
      { syllable: "Ne", nakshatra: "Anuradha", pada: 4 },
      { syllable: "No", nakshatra: "Jyeshtha", pada: 1 },
      { syllable: "Ya", nakshatra: "Jyeshtha", pada: 2 },
      { syllable: "Yi", nakshatra: "Jyeshtha", pada: 3 },
      { syllable: "Yu", nakshatra: "Jyeshtha", pada: 4 },
    ],
  },
  {
    id: "dhanu",
    sanskrit: "Dhanu",
    english: "Sagittarius",
    symbol: "Archer",
    lord: "Guru (Jupiter)",
    element: "Fire",
    syllables: [
      { syllable: "Ye", nakshatra: "Mula", pada: 1 },
      { syllable: "Yo", nakshatra: "Mula", pada: 2 },
      { syllable: "Bha", nakshatra: "Mula", pada: 3 },
      { syllable: "Bhi", nakshatra: "Mula", pada: 4 },
      { syllable: "Bhu", nakshatra: "Purva Ashadha", pada: 1 },
      { syllable: "Dha", nakshatra: "Purva Ashadha", pada: 2 },
      { syllable: "Pha", nakshatra: "Purva Ashadha", pada: 3 },
      { syllable: "Dhaa", nakshatra: "Purva Ashadha", pada: 4 },
      { syllable: "Bhe", nakshatra: "Uttara Ashadha", pada: 1 },
    ],
  },
  {
    id: "makara",
    sanskrit: "Makara",
    english: "Capricorn",
    symbol: "Crocodile or sea-goat",
    lord: "Shani (Saturn)",
    element: "Earth",
    syllables: [
      { syllable: "Bho", nakshatra: "Uttara Ashadha", pada: 2 },
      { syllable: "Ja", nakshatra: "Uttara Ashadha", pada: 3 },
      { syllable: "Ji", nakshatra: "Uttara Ashadha", pada: 4 },
      { syllable: "Khi", nakshatra: "Shravana", pada: 1 },
      { syllable: "Khu", nakshatra: "Shravana", pada: 2 },
      { syllable: "Khe", nakshatra: "Shravana", pada: 3 },
      { syllable: "Kho", nakshatra: "Shravana", pada: 4 },
      { syllable: "Ga", nakshatra: "Dhanishtha", pada: 1 },
      { syllable: "Gi", nakshatra: "Dhanishtha", pada: 2 },
    ],
  },
  {
    id: "kumbha",
    sanskrit: "Kumbha",
    english: "Aquarius",
    symbol: "Water pot",
    lord: "Shani (Saturn)",
    element: "Air",
    syllables: [
      { syllable: "Gu", nakshatra: "Dhanishtha", pada: 3 },
      { syllable: "Ge", nakshatra: "Dhanishtha", pada: 4 },
      { syllable: "Go", nakshatra: "Shatabhisha", pada: 1 },
      { syllable: "Sa", nakshatra: "Shatabhisha", pada: 2 },
      { syllable: "Si", nakshatra: "Shatabhisha", pada: 3 },
      { syllable: "Su", nakshatra: "Shatabhisha", pada: 4 },
      { syllable: "Se", nakshatra: "Purva Bhadrapada", pada: 1 },
      { syllable: "So", nakshatra: "Purva Bhadrapada", pada: 2 },
      { syllable: "Da", nakshatra: "Purva Bhadrapada", pada: 3 },
    ],
  },
  {
    id: "meena",
    sanskrit: "Meena",
    english: "Pisces",
    symbol: "Fish",
    lord: "Guru (Jupiter)",
    element: "Water",
    syllables: [
      { syllable: "Di", nakshatra: "Purva Bhadrapada", pada: 4 },
      { syllable: "Du", nakshatra: "Uttara Bhadrapada", pada: 1 },
      { syllable: "Tha", nakshatra: "Uttara Bhadrapada", pada: 2 },
      { syllable: "Jha", nakshatra: "Uttara Bhadrapada", pada: 3 },
      { syllable: "Nya", nakshatra: "Uttara Bhadrapada", pada: 4 },
      { syllable: "De", nakshatra: "Revati", pada: 1 },
      { syllable: "Do", nakshatra: "Revati", pada: 2 },
      { syllable: "Cha", nakshatra: "Revati", pada: 3 },
      { syllable: "Chi", nakshatra: "Revati", pada: 4 },
    ],
  },
];

/** Strip to lowercase letters only. */
export function normalise(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Look up one rashi by its id. */
export function getRashi(id) {
  return RASHIS.find((rashi) => rashi.id === id) || null;
}

/** Every syllable in the chart, flattened, longest first so matching is greedy. */
export function allSyllables() {
  const flat = [];
  RASHIS.forEach((rashi) => {
    rashi.syllables.forEach((entry) => {
      flat.push({ ...entry, rashiId: rashi.id, rashi: rashi.sanskrit, english: rashi.english });
    });
  });
  return flat.sort((a, b) => b.syllable.length - a.syllable.length || a.syllable.localeCompare(b.syllable));
}

/**
 * Reduce a consonant cluster by dropping a medial glide, so Priya can be matched
 * against Pi and Shravan against Sha. Returns null when nothing was dropped.
 */
export function reduceCluster(name) {
  const clean = normalise(name);
  if (clean.length < 3) return null;
  for (let index = 1; index < Math.min(4, clean.length); index += 1) {
    if (CLUSTER_GLIDES.includes(clean[index]) && !"aeiou".includes(clean[index - 1])) {
      return clean.slice(0, index) + clean.slice(index + 1);
    }
  }
  return null;
}

/** The consonants a word opens with, before its first vowel. */
export function leadingConsonants(word) {
  const match = normalise(word).match(/^[^aeiou]*/);
  return match ? match[0] : "";
}

/** Drop medial glides from a consonant cluster: "shr" becomes "sh", "pr" becomes "p". */
export function reduceConsonants(cluster) {
  if (cluster.length < 2) return cluster;
  return cluster[0] + cluster.slice(1).replace(/[rlyvw]/g, "");
}

/**
 * Which rashi does a name's first syllable belong to?
 *
 * Three tiers are reported separately and never merged: an exact syllable match,
 * an approximate match after dropping a medial glide (Priya against Pi), and a
 * same-consonant match where only the vowel differs (Shreya against Sha).
 *
 * Returns { error } for an empty, over-long or non-alphabetic name.
 */
export function matchName(rawName) {
  const clean = normalise(rawName);
  if (!clean) return { error: "Enter a name using letters." };
  if (String(rawName).length > MAX_NAME_LENGTH) {
    return { error: `Keep the name to ${MAX_NAME_LENGTH} characters or fewer.` };
  }

  const syllables = allSyllables();
  const key = (entry) => `${entry.syllable}|${entry.rashiId}`;

  const exact = syllables.filter((entry) => clean.startsWith(normalise(entry.syllable)));
  const taken = new Set(exact.map(key));

  const reduced = reduceCluster(clean);
  const approximate = reduced
    ? syllables.filter((entry) => reduced.startsWith(normalise(entry.syllable)) && !taken.has(key(entry)))
    : [];
  approximate.forEach((entry) => taken.add(key(entry)));

  const nameCluster = reduceConsonants(leadingConsonants(clean));
  const family = nameCluster
    ? syllables.filter(
        (entry) => leadingConsonants(entry.syllable) === nameCluster && !taken.has(key(entry)),
      )
    : [];

  const best = exact[0] || approximate[0] || family[0] || null;

  return {
    name: String(rawName).trim(),
    exact,
    approximate,
    family,
    reduced,
    nameCluster,
    best,
    matched: exact.length + approximate.length + family.length,
    rashiIds: Array.from(new Set([...exact, ...approximate, ...family].map((entry) => entry.rashiId))),
  };
}

/** The nakshatras a rashi spans, in order, with how many padas of each fall in it. */
export function nakshatraSpan(rashiId) {
  const rashi = getRashi(rashiId);
  if (!rashi) return [];
  const counts = new Map();
  rashi.syllables.forEach((entry) => {
    counts.set(entry.nakshatra, (counts.get(entry.nakshatra) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([nakshatra, padas]) => ({ nakshatra, padas }));
}

/** Plain-text version of one rashi's chart entry. */
export function rashiToText(rashiId) {
  const rashi = getRashi(rashiId);
  if (!rashi) return "";
  const lines = [
    `${rashi.sanskrit} rashi (${rashi.english})`,
    `Symbol: ${rashi.symbol} · Lord: ${rashi.lord} · Element: ${rashi.element}`,
    "",
    "Naming syllables:",
    ...rashi.syllables.map(
      (entry) => `${entry.syllable} — ${entry.nakshatra} pada ${entry.pada}`,
    ),
    "",
    `Spans: ${nakshatraSpan(rashiId)
      .map((span) => `${span.nakshatra} (${span.padas} pada${span.padas === 1 ? "" : "s"})`)
      .join(", ")}`,
  ];
  return lines.join("\n");
}

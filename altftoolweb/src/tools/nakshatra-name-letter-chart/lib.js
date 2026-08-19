/**
 * Nakshatra name-letter (namakarana akshara) reference data and the sidereal
 * arithmetic that positions every pada on the zodiac.
 *
 * Conventions used here are the classical ones stated in Vedic jyotisha texts:
 *  - The 360 deg sidereal zodiac is divided into 27 equal nakshatras.
 *  - Each nakshatra is divided into 4 equal padas (quarters).
 *  - Each pada carries one traditional starting syllable used at namakarana
 *    (the naming ceremony); the four syllables of a nakshatra are fixed by
 *    long-standing convention and are reproduced in the table below.
 *  - Nakshatra lords follow the Vimshottari dasha order, repeating every 9
 *    nakshatras: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury.
 *  - The navamsa (D-9) chart maps each 3 deg 20 min pada to one sign; because
 *    108 padas cover 12 signs exactly 9 times, the navamsa sign of the k-th
 *    pada of the zodiac (k counted from 0 at 0 deg Aries) is simply k mod 12.
 */

/** A full circle in degrees. */
export const ZODIAC_DEGREES = 360;

/** Classical count of nakshatras in the sidereal zodiac. */
export const NAKSHATRA_COUNT = 27;

/** Quarters (padas) per nakshatra. */
export const PADAS_PER_NAKSHATRA = 4;

/** 360 / 27 = 13 deg 20 min — the span of one nakshatra. */
export const NAKSHATRA_SPAN_DEG = ZODIAC_DEGREES / NAKSHATRA_COUNT;

/** 13 deg 20 min / 4 = 3 deg 20 min — the span of one pada. */
export const PADA_SPAN_DEG = NAKSHATRA_SPAN_DEG / PADAS_PER_NAKSHATRA;

/** 27 x 4 = 108 padas cover the whole zodiac. */
export const TOTAL_PADAS = NAKSHATRA_COUNT * PADAS_PER_NAKSHATRA;

/** Degrees in one rashi (sign): 360 / 12. */
export const RASHI_SPAN_DEG = ZODIAC_DEGREES / 12;

/** The twelve rashis in zodiacal order, with their common English names. */
export const RASHIS = [
  { sanskrit: "Mesha", english: "Aries" },
  { sanskrit: "Vrishabha", english: "Taurus" },
  { sanskrit: "Mithuna", english: "Gemini" },
  { sanskrit: "Karka", english: "Cancer" },
  { sanskrit: "Simha", english: "Leo" },
  { sanskrit: "Kanya", english: "Virgo" },
  { sanskrit: "Tula", english: "Libra" },
  { sanskrit: "Vrishchika", english: "Scorpio" },
  { sanskrit: "Dhanu", english: "Sagittarius" },
  { sanskrit: "Makara", english: "Capricorn" },
  { sanskrit: "Kumbha", english: "Aquarius" },
  { sanskrit: "Meena", english: "Pisces" },
];

/**
 * Vimshottari lord order. Nakshatra number n (1-based) is ruled by
 * VIMSHOTTARI_LORDS[(n - 1) % 9].
 */
export const VIMSHOTTARI_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

/**
 * The 27 nakshatras in zodiacal order.
 * `syllables` are the four namakarana aksharas in pada order (1 to 4), in the
 * usual Roman transliteration; `devanagari` is the same syllable in script.
 * `alt` holds the widely used alternative syllable set where tradition records
 * one (Shravana is the notable case).
 */
export const NAKSHATRAS = [
  {
    number: 1,
    name: "Ashwini",
    deity: "Ashwini Kumaras",
    symbol: "Horse's head",
    syllables: ["Chu", "Che", "Cho", "La"],
    devanagari: ["चु", "चे", "चो", "ला"],
  },
  {
    number: 2,
    name: "Bharani",
    deity: "Yama",
    symbol: "Yoni (womb)",
    syllables: ["Li", "Lu", "Le", "Lo"],
    devanagari: ["ली", "लू", "ले", "लो"],
  },
  {
    number: 3,
    name: "Krittika",
    deity: "Agni",
    symbol: "Razor / flame",
    syllables: ["A", "I", "U", "E"],
    devanagari: ["अ", "ई", "उ", "ए"],
  },
  {
    number: 4,
    name: "Rohini",
    deity: "Brahma (Prajapati)",
    symbol: "Ox cart",
    syllables: ["O", "Va", "Vi", "Vu"],
    devanagari: ["ओ", "वा", "वी", "वू"],
  },
  {
    number: 5,
    name: "Mrigashira",
    deity: "Soma (Chandra)",
    symbol: "Deer's head",
    syllables: ["Ve", "Vo", "Ka", "Ki"],
    devanagari: ["वे", "वो", "का", "की"],
  },
  {
    number: 6,
    name: "Ardra",
    deity: "Rudra",
    symbol: "Teardrop / gem",
    syllables: ["Ku", "Gha", "Ing", "Chha"],
    devanagari: ["कु", "घ", "ङ", "छ"],
  },
  {
    number: 7,
    name: "Punarvasu",
    deity: "Aditi",
    symbol: "Quiver of arrows",
    syllables: ["Ke", "Ko", "Ha", "Hi"],
    devanagari: ["के", "को", "हा", "ही"],
  },
  {
    number: 8,
    name: "Pushya",
    deity: "Brihaspati",
    symbol: "Cow's udder / lotus",
    syllables: ["Hu", "He", "Ho", "Da"],
    devanagari: ["हु", "हे", "हो", "डा"],
  },
  {
    number: 9,
    name: "Ashlesha",
    deity: "Nagas",
    symbol: "Coiled serpent",
    syllables: ["Di", "Du", "De", "Do"],
    devanagari: ["डी", "डू", "डे", "डो"],
  },
  {
    number: 10,
    name: "Magha",
    deity: "Pitrs (ancestors)",
    symbol: "Royal throne",
    syllables: ["Ma", "Mi", "Mu", "Me"],
    devanagari: ["मा", "मी", "मू", "मे"],
  },
  {
    number: 11,
    name: "Purva Phalguni",
    deity: "Bhaga",
    symbol: "Front legs of a cot",
    syllables: ["Mo", "Ta", "Ti", "Tu"],
    devanagari: ["मो", "टा", "टी", "टू"],
  },
  {
    number: 12,
    name: "Uttara Phalguni",
    deity: "Aryaman",
    symbol: "Back legs of a cot",
    syllables: ["Te", "To", "Pa", "Pi"],
    devanagari: ["टे", "टो", "पा", "पी"],
  },
  {
    number: 13,
    name: "Hasta",
    deity: "Savitr (Sun)",
    symbol: "Open palm",
    syllables: ["Pu", "Sha", "Na", "Tha"],
    devanagari: ["पू", "ष", "ण", "ठ"],
  },
  {
    number: 14,
    name: "Chitra",
    deity: "Tvashtar",
    symbol: "Bright jewel / pearl",
    syllables: ["Pe", "Po", "Ra", "Ri"],
    devanagari: ["पे", "पो", "रा", "री"],
  },
  {
    number: 15,
    name: "Swati",
    deity: "Vayu",
    symbol: "Young sprout in the wind",
    syllables: ["Ru", "Re", "Ro", "Ta"],
    devanagari: ["रू", "रे", "रो", "ता"],
  },
  {
    number: 16,
    name: "Vishakha",
    deity: "Indra-Agni",
    symbol: "Triumphal archway",
    syllables: ["Ti", "Tu", "Te", "To"],
    devanagari: ["ती", "तू", "ते", "तो"],
  },
  {
    number: 17,
    name: "Anuradha",
    deity: "Mitra",
    symbol: "Lotus / staff",
    syllables: ["Na", "Ni", "Nu", "Ne"],
    devanagari: ["ना", "नी", "नू", "ने"],
  },
  {
    number: 18,
    name: "Jyeshtha",
    deity: "Indra",
    symbol: "Circular amulet / earring",
    syllables: ["No", "Ya", "Yi", "Yu"],
    devanagari: ["नो", "या", "यी", "यू"],
  },
  {
    number: 19,
    name: "Mula",
    deity: "Nirriti",
    symbol: "Bunch of tied roots",
    syllables: ["Ye", "Yo", "Bha", "Bhi"],
    devanagari: ["ये", "यो", "भा", "भी"],
  },
  {
    number: 20,
    name: "Purva Ashadha",
    deity: "Apas (waters)",
    symbol: "Winnowing fan / elephant tusk",
    syllables: ["Bhu", "Dha", "Pha", "Dha"],
    devanagari: ["भू", "धा", "फा", "ढा"],
  },
  {
    number: 21,
    name: "Uttara Ashadha",
    deity: "Vishvedevas",
    symbol: "Elephant tusk / planks of a cot",
    syllables: ["Bhe", "Bho", "Ja", "Ji"],
    devanagari: ["भे", "भो", "जा", "जी"],
  },
  {
    number: 22,
    name: "Shravana",
    deity: "Vishnu",
    symbol: "Three footprints / ear",
    // `devanagari` below (खी, खू, खे, खो) is the script for Khi/Khu/Khe/Kho, so that
    // set is kept as the primary `syllables` here (script must match the primary
    // Roman syllables, as it does for every other nakshatra in this table); the
    // Ju/Je/Jo/Gha variant some panchangs use is kept in `alt`.
    syllables: ["Khi", "Khu", "Khe", "Kho"],
    alt: ["Ju", "Je", "Jo", "Gha"],
    devanagari: ["खी", "खू", "खे", "खो"],
  },
  {
    number: 23,
    name: "Dhanishta",
    deity: "Vasus",
    symbol: "Drum (damaru)",
    syllables: ["Ga", "Gi", "Gu", "Ge"],
    devanagari: ["गा", "गी", "गू", "गे"],
  },
  {
    number: 24,
    name: "Shatabhisha",
    deity: "Varuna",
    symbol: "Empty circle / hundred healers",
    syllables: ["Go", "Sa", "Si", "Su"],
    devanagari: ["गो", "सा", "सी", "सू"],
  },
  {
    number: 25,
    name: "Purva Bhadrapada",
    deity: "Aja Ekapada",
    symbol: "Front of a funeral cot / two-faced man",
    syllables: ["Se", "So", "Da", "Di"],
    devanagari: ["से", "सो", "दा", "दी"],
  },
  {
    number: 26,
    name: "Uttara Bhadrapada",
    deity: "Ahir Budhnya",
    symbol: "Back of a funeral cot / serpent of the deep",
    syllables: ["Du", "Tha", "Jha", "Tra"],
    devanagari: ["दू", "थ", "झ", "त्र"],
  },
  {
    number: 27,
    name: "Revati",
    deity: "Pushan",
    symbol: "Fish / drum",
    syllables: ["De", "Do", "Cha", "Chi"],
    devanagari: ["दे", "दो", "चा", "ची"],
  },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Ruling planet of nakshatra number n (1-based), per the Vimshottari cycle. */
export function nakshatraLord(nakshatraNumber) {
  if (!Number.isInteger(nakshatraNumber) || nakshatraNumber < 1 || nakshatraNumber > NAKSHATRA_COUNT) {
    return null;
  }
  return VIMSHOTTARI_LORDS[(nakshatraNumber - 1) % VIMSHOTTARI_LORDS.length];
}

/**
 * Format an absolute sidereal longitude as "26 deg 40' Kanya (Virgo)" style parts.
 * Returns { degrees, minutes, rashiIndex } with degrees measured inside the sign.
 */
export function splitLongitude(longitude) {
  const wrapped = ((longitude % ZODIAC_DEGREES) + ZODIAC_DEGREES) % ZODIAC_DEGREES;
  let rashiIndex = Math.floor(wrapped / RASHI_SPAN_DEG);
  const within = wrapped - rashiIndex * RASHI_SPAN_DEG;
  let degrees = Math.floor(within);
  // Round to the nearest minute; 3 deg 20 min padas are exact in minutes.
  let minutes = Math.round((within - degrees) * 60);
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
    // A minute carry can push degrees to the 30 deg rashi boundary — roll over
    // into the next rashi instead of reporting an impossible "30deg" reading.
    if (degrees >= RASHI_SPAN_DEG) {
      degrees -= RASHI_SPAN_DEG;
      rashiIndex = (rashiIndex + 1) % RASHIS.length;
    }
  }
  return { degrees, minutes, rashiIndex };
}

/** Human-readable "12°40′ Kanya" for an absolute longitude. */
export function formatLongitude(longitude) {
  if (!isFiniteNumber(longitude)) return "—";
  const { degrees, minutes, rashiIndex } = splitLongitude(longitude);
  const rashi = RASHIS[rashiIndex];
  return `${degrees}°${String(minutes).padStart(2, "0")}′ ${rashi.sanskrit}`;
}

/**
 * Everything about one pada, derived from its position on the zodiac.
 * @param {{nakshatraNumber:number, pada:number}} input
 */
export function getPadaDetails({ nakshatraNumber, pada } = {}) {
  if (!Number.isInteger(nakshatraNumber) || nakshatraNumber < 1 || nakshatraNumber > NAKSHATRA_COUNT) {
    return { error: `Nakshatra number must be a whole number from 1 to ${NAKSHATRA_COUNT}.` };
  }
  if (!Number.isInteger(pada) || pada < 1 || pada > PADAS_PER_NAKSHATRA) {
    return { error: `Pada must be a whole number from 1 to ${PADAS_PER_NAKSHATRA}.` };
  }

  const nakshatra = NAKSHATRAS[nakshatraNumber - 1];
  // Global pada index counted from 0 at 0 deg Aries.
  const padaIndex = (nakshatraNumber - 1) * PADAS_PER_NAKSHATRA + (pada - 1);
  const startDeg = padaIndex * PADA_SPAN_DEG;
  const endDeg = startDeg + PADA_SPAN_DEG;

  const rashiIndex = Math.floor(startDeg / RASHI_SPAN_DEG);
  // 108 padas / 12 signs = 9 full cycles, so the navamsa sign is padaIndex mod 12.
  const navamsaIndex = padaIndex % 12;

  return {
    nakshatraNumber,
    pada,
    padaIndex,
    name: nakshatra.name,
    deity: nakshatra.deity,
    symbol: nakshatra.symbol,
    lord: nakshatraLord(nakshatraNumber),
    syllable: nakshatra.syllables[pada - 1],
    altSyllable: nakshatra.alt ? nakshatra.alt[pada - 1] : null,
    devanagari: nakshatra.devanagari[pada - 1],
    startDeg,
    endDeg,
    startLabel: formatLongitude(startDeg),
    endLabel: formatLongitude(endDeg - 1 / 60 / 60),
    rashi: RASHIS[rashiIndex],
    navamsa: RASHIS[navamsaIndex],
    spanDeg: PADA_SPAN_DEG,
  };
}

/**
 * Which nakshatra and pada does a sidereal longitude fall in?
 * @param {number} longitude sidereal longitude in degrees, 0 <= x < 360
 */
export function padaFromLongitude(longitude) {
  if (!isFiniteNumber(longitude)) {
    return { error: "Enter a sidereal longitude in degrees." };
  }
  if (longitude < 0 || longitude >= ZODIAC_DEGREES) {
    return { error: "Longitude must be at least 0° and less than 360°." };
  }
  const padaIndex = Math.floor(longitude / PADA_SPAN_DEG);
  const nakshatraNumber = Math.floor(padaIndex / PADAS_PER_NAKSHATRA) + 1;
  const pada = (padaIndex % PADAS_PER_NAKSHATRA) + 1;
  return getPadaDetails({ nakshatraNumber, pada });
}

/** The whole chart: 27 nakshatras, each with its four resolved padas. */
export function buildChart() {
  return NAKSHATRAS.map((nakshatra) => ({
    number: nakshatra.number,
    name: nakshatra.name,
    deity: nakshatra.deity,
    symbol: nakshatra.symbol,
    lord: nakshatraLord(nakshatra.number),
    startDeg: (nakshatra.number - 1) * NAKSHATRA_SPAN_DEG,
    endDeg: nakshatra.number * NAKSHATRA_SPAN_DEG,
    padas: Array.from({ length: PADAS_PER_NAKSHATRA }, (unused, i) =>
      getPadaDetails({ nakshatraNumber: nakshatra.number, pada: i + 1 }),
    ),
  }));
}

const normalise = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/**
 * Find every pada whose naming syllable matches the start of `query`
 * (or which starts with `query`, so "ch" surfaces Chu, Che, Cho, Chha, Cha, Chi).
 */
export function findPadasBySyllable(query) {
  const q = normalise(query);
  if (!q) return { error: "Type at least one letter to search naming syllables." };
  const matches = [];
  for (const nakshatra of NAKSHATRAS) {
    for (let p = 1; p <= PADAS_PER_NAKSHATRA; p += 1) {
      const detail = getPadaDetails({ nakshatraNumber: nakshatra.number, pada: p });
      const candidates = [detail.syllable, detail.altSyllable].filter(Boolean).map(normalise);
      const hit = candidates.some((c) => c.startsWith(q) || q.startsWith(c));
      if (hit) matches.push(detail);
    }
  }
  if (matches.length === 0) {
    return { error: `No nakshatra pada uses a naming syllable starting with “${String(query).trim()}”.` };
  }
  return { query: String(query).trim(), matches, count: matches.length };
}

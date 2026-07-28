/**
 * Parsi and Zoroastrian baby name finder - pure data and filtering.
 * No React, no DOM, no clocks.
 *
 * Every entry is tied to a checkable source rather than to a generic meaning
 * list:
 *  - The seven Amesha Spentas: Ahura Mazda together with Vohu Manah (good
 *    mind), Asha Vahishta (best truth), Khshathra Vairya (desirable dominion),
 *    Spenta Armaiti (holy devotion), Haurvatat (wholeness) and Ameretat
 *    (immortality). Their Middle Persian forms - Bahman, Ardibehesht,
 *    Shehrevar, Aspandard, Khordad and Amardad - are used as given names.
 *  - The yazatas, the beings worthy of worship: Meher, Sarosh, Rashne, Tir,
 *    Behram, Adar, Avan, Khorshed, Mohor and others.
 *  - The Zoroastrian calendar of 12 months of 30 days, in which each day and
 *    each month carries a divine name. Day and month numbers are recorded here
 *    where the name is part of that calendar.
 *  - The Shahnameh, Ferdowsi's epic, which supplies Rustom, Sohrab, Zal,
 *    Jamshed, Faridoon, Siavax, Tehmina, Rudabeh, Manijeh and others.
 *  - Named people: Zarathushtra, his wife Hvovi and his daughter Pouruchista,
 *    and historical rulers such as Cyrus, Darius and Ardeshir.
 *
 * Syllable counts are stored per entry rather than derived from the
 * romanisation, because Parsi spellings vary widely and are not a reliable
 * guide to pronunciation.
 */

/** Amesha Spentas, counting Ahura Mazda among them. */
export const AMESHA_SPENTA_COUNT = 7;

/** Days in each month of the Zoroastrian calendar, each with a divine name. */
export const ZOROASTRIAN_DAYS_PER_MONTH = 30;

/** Months in the Zoroastrian calendar, before the five Gatha days are added. */
export const ZOROASTRIAN_MONTHS = 12;

/** Gatha days added after the twelfth month to complete the year. */
export const GATHA_DAYS = 5;

/** Maximum number of names a single search may return. */
export const MAX_RESULTS = 60;

/** Minimum number of names a single search may return. */
export const MIN_RESULTS = 1;

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
];

export const CATEGORIES = [
  { id: "any", label: "Any source" },
  { id: "divine", label: "Amesha Spentas and yazatas" },
  { id: "shahnameh", label: "Shahnameh kings and heroes" },
  { id: "historical", label: "Historical and scriptural figures" },
  { id: "quality", label: "Qualities and nature" },
];

export const ORIGINS = [
  { id: "any", label: "Any" },
  { id: "Avestan", label: "Avestan" },
  { id: "Old Persian", label: "Old Persian" },
  { id: "Middle Persian", label: "Middle Persian" },
  { id: "Persian", label: "Persian" },
];

export const PARSI_NAMES = [
  // --- Amesha Spentas and yazatas ---
  { name: "Hormazd", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "The wise lord", note: "From Ahura Mazda. Day 1 of the Zoroastrian month." },
  { name: "Bahman", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "Good mind", note: "From Vohu Manah, the first Amesha Spenta. Day 2 and month 11." },
  { name: "Ardibehesht", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 4, meaning: "Best truth, best order", note: "From Asha Vahishta, the Amesha Spenta of truth and of fire. Day 3 and month 2." },
  { name: "Shehrevar", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 3, meaning: "Desirable dominion", note: "From Khshathra Vairya, the Amesha Spenta of metals. Day 4 and month 6." },
  { name: "Aspandard", gender: "girl", origin: "Middle Persian", category: "divine", syllables: 3, meaning: "Holy devotion", note: "From Spenta Armaiti, the Amesha Spenta of the earth. Day 5 and month 12." },
  { name: "Armaiti", gender: "girl", origin: "Avestan", category: "divine", syllables: 3, meaning: "Devotion, right-mindedness", note: "The Avestan form of Aspandard, guardian of the earth." },
  { name: "Khordad", gender: "girl", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "Wholeness, perfection", note: "From Haurvatat, the Amesha Spenta of the waters. Day 6 and month 3." },
  { name: "Amardad", gender: "girl", origin: "Middle Persian", category: "divine", syllables: 3, meaning: "Immortality", note: "From Ameretat, the Amesha Spenta of plants. Day 7 and month 5." },
  { name: "Adar", gender: "boy", origin: "Avestan", category: "divine", syllables: 2, meaning: "Fire", note: "The yazata of fire, from Avestan atar. Day 9 and month 9." },
  { name: "Avan", gender: "girl", origin: "Avestan", category: "divine", syllables: 2, meaning: "The waters", note: "The yazata of the waters, from Avestan apas. Day 10 and month 8." },
  { name: "Anahita", gender: "girl", origin: "Avestan", category: "divine", syllables: 4, meaning: "The immaculate one", note: "Aredvi Sura Anahita, the yazata of the waters, strength and healing." },
  { name: "Khorshed", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "The sun", note: "The yazata of the sun. Day 11 of the Zoroastrian month." },
  { name: "Mohor", gender: "girl", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "The moon", note: "The yazata of the moon, from Avestan Mah. Day 12 of the month." },
  { name: "Tir", gender: "boy", origin: "Avestan", category: "divine", syllables: 1, meaning: "The star Sirius, bringer of rain", note: "From Tishtrya, the rain-star. Day 13 and month 4; the Tirgan festival is named for it." },
  { name: "Meher", gender: "boy", origin: "Avestan", category: "divine", syllables: 2, meaning: "Covenant, contract, the light of day", note: "From Mithra, who watches over promises. Day 16 and month 7." },
  { name: "Mehernosh", gender: "boy", origin: "Persian", category: "divine", syllables: 3, meaning: "Everlasting Meher", note: "A Parsi compound of Meher with -nosh, undying." },
  { name: "Sarosh", gender: "boy", origin: "Avestan", category: "divine", syllables: 2, meaning: "Hearkening, obedience", note: "From Sraosha, the yazata who guards the soul for three nights after death. Day 17." },
  { name: "Rashne", gender: "boy", origin: "Avestan", category: "divine", syllables: 2, meaning: "Justice", note: "From Rashnu, who weighs the soul at the Chinvat bridge. Day 18." },
  { name: "Fravardin", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 3, meaning: "Of the guardian spirits", note: "From the fravashis, the ancestral spirits. Day 19 and month 1; Fravardigan honours the dead." },
  { name: "Behram", gender: "boy", origin: "Middle Persian", category: "divine", syllables: 2, meaning: "Smiter of resistance, victory", note: "From Verethragna, the yazata of victory. Day 20; the highest grade of fire temple is Atash Behram." },
  { name: "Ram", gender: "boy", origin: "Avestan", category: "divine", syllables: 1, meaning: "Peace, joy", note: "The yazata of good pasture and peace. Day 21 of the month." },
  { name: "Din", gender: "girl", origin: "Avestan", category: "divine", syllables: 1, meaning: "Conscience, inner vision, religion", note: "From Daena, the self that meets the soul after death. Day 24." },
  { name: "Ashi", gender: "girl", origin: "Avestan", category: "divine", syllables: 2, meaning: "Reward, blessing", note: "The yazata of fortune, invoked for prosperity." },
  { name: "Chista", gender: "girl", origin: "Avestan", category: "divine", syllables: 2, meaning: "Insight, understanding", note: "The yazata who shows the right path." },
  { name: "Zamyad", gender: "boy", origin: "Avestan", category: "divine", syllables: 2, meaning: "The earth", note: "The yazata of the earth. Day 28; the Zamyad Yasht is named for it." },
  { name: "Hom", gender: "boy", origin: "Avestan", category: "divine", syllables: 1, meaning: "The sacred plant Haoma", note: "Both the plant pressed in the Yasna ritual and the yazata of the same name." },
  { name: "Yazad", gender: "boy", origin: "Persian", category: "divine", syllables: 2, meaning: "Worthy of worship", note: "From Avestan yazata, the class of divine beings below Ahura Mazda." },

  // --- Shahnameh kings and heroes ---
  { name: "Jamshed", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Radiant Yima", note: "From Avestan Yima Khshaeta, king of the golden age; Jamshedi Navroz is named for him." },
  { name: "Hoshang", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Name of the second Pishdadian king", note: "Credited in the Shahnameh with the discovery of fire." },
  { name: "Tehmuras", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Strong Tahma", note: "Tahmuras Div-band, the binder of demons, third of the Pishdadian kings." },
  { name: "Faridoon", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Name of the king who overthrew Zahak", note: "From Avestan Thraetaona, a hero of the Aban Yasht." },
  { name: "Erach", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Name of Faridoon's youngest son", note: "Iraj, after whom Iran is named in the Shahnameh." },
  { name: "Manuchehr", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Of heavenly face", note: "The Pishdadian king who avenges Erach." },
  { name: "Nozer", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Name of Manuchehr's son", note: "Nozar, a king of the Pishdadian line." },
  { name: "Zal", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 1, meaning: "The white-haired one", note: "Born albino and raised by the Simurgh; the father of Rustom." },
  { name: "Rustom", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Name of the greatest Shahnameh hero", note: "Rostam, son of Zal and Rudabeh, whose seven trials fill the epic." },
  { name: "Sohrab", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 2, meaning: "Illustrious, shining", note: "The son of Rustom and Tehmina, killed by his father without either knowing." },
  { name: "Siavax", gender: "boy", origin: "Avestan", category: "shahnameh", syllables: 3, meaning: "He of the black horse", note: "From Syavarshan; the blameless prince who walks through fire to prove his innocence." },
  { name: "Gushtasp", gender: "boy", origin: "Avestan", category: "shahnameh", syllables: 2, meaning: "He who has trained horses", note: "Vishtaspa, the king who accepted Zarathushtra's teaching." },
  { name: "Aspandiar", gender: "boy", origin: "Avestan", category: "shahnameh", syllables: 4, meaning: "Given by the holy one", note: "From Spentodata; the invulnerable prince killed by Rustom." },
  { name: "Peshotan", gender: "boy", origin: "Avestan", category: "shahnameh", syllables: 3, meaning: "He of the well-formed body", note: "The son of Gushtasp, held in tradition to be deathless." },
  { name: "Kaikhushru", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Kai of good fame", note: "Kai Khosrow, the Kayanian king who withdraws from the world at the height of his power." },
  { name: "Kaikobad", gender: "boy", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Name of the first Kayanian king", note: "Kai Qobad, raised to the throne by Rustom." },
  { name: "Kersi", gender: "boy", origin: "Avestan", category: "shahnameh", syllables: 2, meaning: "Short form of Keresaspa", note: "Keresaspa, the club-bearing hero of the Avesta, Persian Garshasp." },
  { name: "Tehmina", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Brave, strong", note: "The princess of Samangan, wife of Rustom and mother of Sohrab." },
  { name: "Rudabeh", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Child of the river", note: "The princess of Kabul who marries Zal and gives birth to Rustom." },
  { name: "Manijeh", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Name of the Turanian princess", note: "The daughter of Afrasiab who saves Bijan from the pit." },
  { name: "Farangis", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Name of Siavax's wife", note: "The daughter of Afrasiab and mother of Kai Khosrow." },
  { name: "Katayun", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "Name of Gushtasp's queen", note: "The mother of Aspandiar." },
  { name: "Homai", gender: "girl", origin: "Persian", category: "shahnameh", syllables: 3, meaning: "The auspicious bird Homa", note: "The queen who ruled Persia in the Shahnameh; the Homa's shadow was said to confer kingship." },

  // --- Historical and scriptural figures ---
  { name: "Zarathushtra", gender: "boy", origin: "Avestan", category: "historical", syllables: 4, meaning: "He of the old camels", note: "The prophet, author of the Gathas; the usual philological reading of the name." },
  { name: "Zarir", gender: "boy", origin: "Avestan", category: "historical", syllables: 2, meaning: "He of golden armour", note: "From Zairivairi, the brother of Gushtasp who falls defending the new faith." },
  { name: "Havovi", gender: "girl", origin: "Avestan", category: "historical", syllables: 3, meaning: "Of good cattle", note: "Hvovi, the wife of Zarathushtra." },
  { name: "Pouruchista", gender: "girl", origin: "Avestan", category: "historical", syllables: 4, meaning: "Of much wisdom", note: "The youngest daughter of Zarathushtra, addressed directly in Yasna 53." },
  { name: "Freny", gender: "girl", origin: "Avestan", category: "historical", syllables: 2, meaning: "Beloved, dear", note: "Freni, named in tradition as a daughter of Zarathushtra." },
  { name: "Thrity", gender: "girl", origin: "Avestan", category: "historical", syllables: 2, meaning: "Name of a daughter of Zarathushtra", note: "Thriti, listed with Freni and Pouruchista." },
  { name: "Cyrus", gender: "boy", origin: "Old Persian", category: "historical", syllables: 2, meaning: "Name of the founder of the Achaemenid empire", note: "Kurush, whose cylinder is one of the oldest surviving statements on the treatment of subject peoples." },
  { name: "Darius", gender: "boy", origin: "Old Persian", category: "historical", syllables: 3, meaning: "He who holds firm the good", note: "Darayavaush, the Achaemenid king whose inscription stands at Behistun." },
  { name: "Xerxes", gender: "boy", origin: "Old Persian", category: "historical", syllables: 2, meaning: "Ruling over heroes", note: "Khshayarsha, the Achaemenid king." },
  { name: "Ardeshir", gender: "boy", origin: "Middle Persian", category: "historical", syllables: 3, meaning: "He whose rule is through truth", note: "From Artakhshathra; the founder of the Sasanian empire." },
  { name: "Ardavan", gender: "boy", origin: "Middle Persian", category: "historical", syllables: 3, meaning: "Guardian of truth", note: "The Parthian royal name recorded in Greek as Artabanus." },
  { name: "Shapur", gender: "boy", origin: "Middle Persian", category: "historical", syllables: 2, meaning: "Son of the king", note: "The name of three Sasanian emperors." },
  { name: "Viraf", gender: "boy", origin: "Middle Persian", category: "historical", syllables: 2, meaning: "Name of the priest of the Arda Viraf Namag", note: "Arda Viraf, whose visionary journey through the other world is one of the best-known Pahlavi texts." },
  { name: "Jehangir", gender: "boy", origin: "Persian", category: "historical", syllables: 3, meaning: "World-holder", note: "A Persian royal title long used as a Parsi given name." },
  { name: "Khushroo", gender: "boy", origin: "Persian", category: "historical", syllables: 2, meaning: "Of good fame", note: "Khosrow, the Sasanian royal name; the subject of the Khosrow and Shirin romance." },
  { name: "Shirin", gender: "girl", origin: "Persian", category: "historical", syllables: 2, meaning: "Sweet", note: "The queen of the Khosrow and Shirin romance told by Nizami." },

  // --- Qualities and nature ---
  { name: "Roshan", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Bright, luminous", note: "Used for both girls and boys in Parsi families." },
  { name: "Rohinton", gender: "boy", origin: "Persian", category: "quality", syllables: 3, meaning: "Of a bright way", note: "Built on roshan, bright; a distinctly Parsi given name." },
  { name: "Farrokh", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "Fortunate, auspicious", note: "A common element in Persian and Parsi compound names." },
  { name: "Firoz", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "Victorious; turquoise", note: "The stone and the quality share a word in Persian." },
  { name: "Behroz", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "Of good days, fortunate", note: "From beh, good, and roz, day." },
  { name: "Burjor", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "Of high strength", note: "From burz, high, with zor, strength." },
  { name: "Zubin", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "A short spear", note: "A Persian weapon name used as a given name." },
  { name: "Aspi", gender: "boy", origin: "Avestan", category: "quality", syllables: 2, meaning: "Horse", note: "From Avestan aspa, the element behind Gushtasp and Vishtaspa." },
  { name: "Homi", gender: "boy", origin: "Persian", category: "quality", syllables: 2, meaning: "Of the Homa bird", note: "The auspicious bird whose shadow was said to make a king." },
  { name: "Banoo", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Lady", note: "A term of respect used as a name and as a suffix." },
  { name: "Behnaz", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Finest grace", note: "From beh, good or best, and naz, grace." },
  { name: "Shehnaz", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Royal grace, the king's pride", note: "From shah, king, and naz, grace." },
  { name: "Delna", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Of the heart", note: "From Persian del, heart." },
  { name: "Dilnavaz", gender: "girl", origin: "Persian", category: "quality", syllables: 3, meaning: "One who soothes the heart", note: "From del, heart, and navaz, to caress or console." },
  { name: "Goolrukh", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Rose-faced", note: "From gul, rose, and rukh, face." },
  { name: "Gulnar", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Pomegranate blossom", note: "From gul, flower, and anar, pomegranate." },
  { name: "Mahrukh", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Moon-faced", note: "From mah, moon, and rukh, face." },
  { name: "Nargis", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Narcissus", note: "The flower whose form is a stock image in Persian poetry for the eye." },
  { name: "Perin", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Of the fairies", note: "From pari, fairy." },
  { name: "Perizad", gender: "girl", origin: "Persian", category: "quality", syllables: 3, meaning: "Fairy-born", note: "From pari, fairy, and zad, born." },
  { name: "Yasmin", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Jasmine", note: "The Persian source of the English word jasmine." },
  { name: "Zarine", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Golden", note: "From zar, gold." },
  { name: "Mehri", gender: "girl", origin: "Persian", category: "quality", syllables: 2, meaning: "Sun-like; kind", note: "The feminine form built on mehr, which carries both senses." },
];

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

const normalise = (value) =>
  clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const byId = (list, id) => list.find((item) => item.id === id) || null;

/** Deterministic 32-bit mixer used to rotate the result order. */
function mix(seed, salt) {
  let h = (Math.trunc(seed) ^ (salt * 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** The distinct first letters present in the list, in alphabetical order. */
export function availableInitials(names = PARSI_NAMES) {
  const set = new Set(names.map((entry) => entry.name.charAt(0).toUpperCase()));
  return Array.from(set).sort();
}

/** Highest syllable count in the list, used to bound the syllable filter. */
export function maxSyllables(names = PARSI_NAMES) {
  return names.reduce((max, entry) => (entry.syllables > max ? entry.syllables : max), 0);
}

/**
 * Filter the name list.
 *
 * @param {object} input
 * @param {string} [input.gender]           "any" | "boy" | "girl".
 * @param {string} [input.category]         One of CATEGORIES ids.
 * @param {string} [input.origin]           One of ORIGINS ids.
 * @param {string} [input.letter]           A single A-Z letter, or "" for all.
 * @param {number|string} [input.syllables] Exact syllable count, or "" for all.
 * @param {string} [input.query]            Free text matched on name, meaning and note.
 * @param {number} [input.limit]            How many names to return, 1 to 60.
 * @param {number} [input.seed]             Rotates the alphabetical order deterministically.
 * @returns {{error:string}|object}
 */
export function findParsiNames(input) {
  const data = input && typeof input === "object" ? input : {};

  const gender = byId(GENDERS, data.gender || "any");
  if (!gender) return { error: "Choose a gender filter, or Any." };

  const category = byId(CATEGORIES, data.category || "any");
  if (!category) return { error: "Choose a source of names, or Any." };

  const origin = byId(ORIGINS, data.origin || "any");
  if (!origin) return { error: "Choose a language of origin, or Any." };

  const letterRaw = clean(data.letter).toUpperCase();
  if (letterRaw && !/^[A-Z]$/.test(letterRaw)) {
    return { error: "The starting letter must be a single letter from A to Z." };
  }

  let syllables = 0;
  if (data.syllables !== "" && data.syllables != null) {
    const value = Number(data.syllables);
    if (!Number.isFinite(value)) return { error: "Syllable count must be a whole number." };
    syllables = Math.round(value);
    const ceiling = maxSyllables();
    if (syllables < 1 || syllables > ceiling) {
      return { error: `Syllable count must be between 1 and ${ceiling}.` };
    }
  }

  const query = normalise(data.query);
  if (query.length > 40) return { error: "Search text is too long - keep it under 40 characters." };

  const limitRaw = data.limit == null || data.limit === "" ? 12 : Number(data.limit);
  if (!Number.isFinite(limitRaw)) return { error: "Number of results must be a whole number." };
  const limit = Math.round(limitRaw);
  if (limit < MIN_RESULTS || limit > MAX_RESULTS) {
    return { error: `Show between ${MIN_RESULTS} and ${MAX_RESULTS} names at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 0 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const matched = PARSI_NAMES.filter((entry) => {
    if (gender.id !== "any" && entry.gender !== gender.id) return false;
    if (category.id !== "any" && entry.category !== category.id) return false;
    if (origin.id !== "any" && entry.origin !== origin.id) return false;
    if (letterRaw && entry.name.charAt(0).toUpperCase() !== letterRaw) return false;
    if (syllables && entry.syllables !== syllables) return false;
    if (query) {
      const haystack = normalise(`${entry.name} ${entry.meaning} ${entry.note}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = matched.slice().sort((a, b) => a.name.localeCompare(b.name, "en"));

  // Rotating a stable alphabetical list keeps the shuffle reproducible while
  // still exposing every match if the user keeps shuffling.
  const offset = sorted.length === 0 ? 0 : mix(seed, 1) % sorted.length;
  const rotated = sorted.slice(offset).concat(sorted.slice(0, offset));
  const names = rotated.slice(0, limit);

  const byGender = { boy: 0, girl: 0 };
  const byCategory = {};
  matched.forEach((entry) => {
    byGender[entry.gender] += 1;
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
  });

  return {
    names,
    matchedCount: matched.length,
    totalCount: PARSI_NAMES.length,
    shownCount: names.length,
    byGender,
    byCategory,
    gender,
    category,
    origin,
    letter: letterRaw,
    syllables,
    seed,
    limit,
  };
}

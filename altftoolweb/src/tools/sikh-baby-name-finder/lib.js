/**
 * Sikh baby name finder — pure logic, no React and no DOM.
 *
 * Naming practice encoded here:
 *  - A Sikh child's name is traditionally chosen after a Hukamnama: the Guru
 *    Granth Sahib is opened at random and the first letter of the first word of
 *    the shabad on the left-hand page becomes the first letter of the name.
 *  - The name is then followed by Singh (lion) for boys and Kaur (princess) for
 *    girls, the convention instituted by Guru Gobind Singh at Vaisakhi in 1699.
 *  - Most Sikh given names are the same for boys and girls; Singh or Kaur, not
 *    the given name, marks the gender.
 * Nothing here reads the clock or performs a Hukamnama — the letter is supplied
 * by the caller.
 */

/** Year Guru Gobind Singh instituted the Singh and Kaur names, at Anandpur Sahib. */
export const KHALSA_YEAR = 1699;
export const MALE_SUFFIX = "Singh";
export const FEMALE_SUFFIX = "Kaur";

/** The Painti Akhri — the 35 letters of the Gurmukhi alphabet, in order. */
export const PAINTI_AKHRI = [
  "ੳ", "ਅ", "ੲ", "ਸ", "ਹ",
  "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
  "ਚ", "ਛ", "ਜ", "ਝ", "ਞ",
  "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
  "ਤ", "ਥ", "ਦ", "ਧ", "ਨ",
  "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
  "ਯ", "ਰ", "ਲ", "ਵ", "ੜ",
];

export const USAGES = [
  { id: "any", label: "Any" },
  { id: "both", label: "Used for both" },
  { id: "boys", label: "More often boys" },
  { id: "girls", label: "More often girls" },
];

/** Row format: [roman, gurmukhi, meaning, usage] */
const ROWS = [
  ["Ajeet", "ਅਜੀਤ", "Unconquerable, invincible", "both"],
  ["Amandeep", "ਅਮਨਦੀਪ", "Lamp of peace", "both"],
  ["Amanpreet", "ਅਮਨਪ੍ਰੀਤ", "Love of peace", "both"],
  ["Amrit", "ਅੰਮ੍ਰਿਤ", "Nectar of immortality", "both"],
  ["Angad", "ਅੰਗਦ", "Part of the body; the name of the second Guru", "both"],
  ["Anhad", "ਅਨਹਦ", "Unstruck; the unstruck celestial sound", "both"],
  ["Anmol", "ਅਨਮੋਲ", "Priceless, beyond value", "both"],
  ["Arshdeep", "ਅਰਸ਼ਦੀਪ", "Lamp of the heavens", "both"],
  ["Avtar", "ਅਵਤਾਰ", "Descent, incarnation", "both"],
  ["Baljeet", "ਬਲਜੀਤ", "Victorious through strength", "both"],
  ["Balwinder", "ਬਲਵਿੰਦਰ", "Mighty as Indra; strong lord", "boys"],
  ["Bhupinder", "ਭੁਪਿੰਦਰ", "King of the earth", "boys"],
  ["Charanjit", "ਚਰਨਜੀਤ", "One who has won at the Guru's feet", "both"],
  ["Chetan", "ਚੇਤਨ", "Consciousness, awareness", "both"],
  ["Daljeet", "ਦਲਜੀਤ", "Conqueror of armies", "both"],
  ["Dharam", "ਧਰਮ", "Righteous duty, faith", "both"],
  ["Dilpreet", "ਦਿਲਪ੍ਰੀਤ", "Love of the heart", "both"],
  ["Ekam", "ਏਕਮ", "The one, the first", "both"],
  ["Fateh", "ਫਤਿਹ", "Victory", "boys"],
  ["Gagandeep", "ਗਗਨਦੀਪ", "Lamp of the sky", "both"],
  ["Gurbaksh", "ਗੁਰਬਖਸ਼", "Gift of the Guru", "both"],
  ["Gurbani", "ਗੁਰਬਾਣੀ", "The Guru's word", "girls"],
  ["Gurdas", "ਗੁਰਦਾਸ", "Servant of the Guru", "boys"],
  ["Gurdeep", "ਗੁਰਦੀਪ", "Lamp of the Guru", "both"],
  ["Gurjeet", "ਗੁਰਜੀਤ", "Victory through the Guru", "both"],
  ["Gurkirat", "ਗੁਰਕਿਰਤ", "The Guru's work", "both"],
  ["Gurmeet", "ਗੁਰਮੀਤ", "Friend of the Guru", "both"],
  ["Gurnam", "ਗੁਰਨਾਮ", "The Guru's name", "both"],
  ["Gurpreet", "ਗੁਰਪ੍ਰੀਤ", "Love of the Guru", "both"],
  ["Gursharan", "ਗੁਰਸ਼ਰਨ", "Shelter of the Guru", "both"],
  ["Hardeep", "ਹਰਦੀਪ", "Lamp of God", "both"],
  ["Harjeet", "ਹਰਜੀਤ", "Victory of God", "both"],
  ["Harjot", "ਹਰਜੋਤ", "Light of God", "both"],
  ["Harkirat", "ਹਰਕਿਰਤ", "God's work", "both"],
  ["Harleen", "ਹਰਲੀਨ", "Absorbed in God", "girls"],
  ["Harman", "ਹਰਮਨ", "Heart set on God", "both"],
  ["Harnoor", "ਹਰਨੂਰ", "The light of God", "both"],
  ["Harpreet", "ਹਰਪ੍ਰੀਤ", "Love of God", "both"],
  ["Harsimran", "ਹਰਸਿਮਰਨ", "Remembrance of God", "both"],
  ["Inderjeet", "ਇੰਦਰਜੀਤ", "Conqueror of Indra", "boys"],
  ["Ishmeet", "ਇਸ਼ਮੀਤ", "Friend of the beloved", "both"],
  ["Jagdeep", "ਜਗਦੀਪ", "Lamp of the world", "both"],
  ["Jagjeet", "ਜਗਜੀਤ", "Conqueror of the world", "both"],
  ["Jagmeet", "ਜਗਮੀਤ", "Friend of the world", "both"],
  ["Jasbir", "ਜਸਬੀਰ", "Heroic in glory", "boys"],
  ["Jasleen", "ਜਸਲੀਨ", "Absorbed in praise", "girls"],
  ["Jasmeet", "ਜਸਮੀਤ", "Friend of glory", "both"],
  ["Jaspreet", "ਜਸਪ੍ਰੀਤ", "Love of praise", "both"],
  ["Jaswant", "ਜਸਵੰਤ", "Full of praise, glorious", "boys"],
  ["Jeevan", "ਜੀਵਨ", "Life", "both"],
  ["Kanwal", "ਕੰਵਲ", "Lotus", "girls"],
  ["Karamjeet", "ਕਰਮਜੀਤ", "Victory through grace and good deeds", "both"],
  ["Kiran", "ਕਿਰਨ", "Ray of light", "both"],
  ["Kirandeep", "ਕਿਰਨਦੀਪ", "Lamp of light", "both"],
  ["Kirat", "ਕਿਰਤ", "Honest labour", "both"],
  ["Kulwant", "ਕੁਲਵੰਤ", "Of a noble family", "boys"],
  ["Livleen", "ਲਿਵਲੀਨ", "Absorbed in devotion", "girls"],
  ["Mandeep", "ਮਨਦੀਪ", "Lamp of the mind", "both"],
  ["Manjeet", "ਮਨਜੀਤ", "Conqueror of the mind", "both"],
  ["Manpreet", "ਮਨਪ੍ਰੀਤ", "Love of the mind", "both"],
  ["Manveer", "ਮਨਵੀਰ", "Brave of mind", "boys"],
  ["Mehtab", "ਮਹਿਤਾਬ", "Moonlight", "both"],
  ["Navdeep", "ਨਵਦੀਪ", "New lamp", "both"],
  ["Navjot", "ਨਵਜੋਤ", "New light", "both"],
  ["Nihal", "ਨਿਹਾਲ", "Delighted, blissful", "both"],
  ["Nirmal", "ਨਿਰਮਲ", "Pure, spotless", "both"],
  ["Onkar", "ਓਅੰਕਾਰ", "The one primal being", "both"],
  ["Paramjeet", "ਪਰਮਜੀਤ", "Supreme victory", "both"],
  ["Parminder", "ਪਰਮਿੰਦਰ", "Supreme lord", "both"],
  ["Pavan", "ਪਵਨ", "Wind, breath", "both"],
  ["Prabhjot", "ਪ੍ਰਭਜੋਤ", "Light of God", "both"],
  ["Preet", "ਪ੍ਰੀਤ", "Love", "both"],
  ["Pritpal", "ਪ੍ਰੀਤਪਾਲ", "One who nurtures with love", "both"],
  ["Rajdeep", "ਰਾਜਦੀਪ", "Lamp of the kingdom", "both"],
  ["Ramneek", "ਰਮਨੀਕ", "Beautiful, pleasing", "girls"],
  ["Ranjeet", "ਰਣਜੀਤ", "Victorious in battle", "boys"],
  ["Rupinder", "ਰੁਪਿੰਦਰ", "Of the greatest beauty", "both"],
  ["Sahib", "ਸਾਹਿਬ", "Lord, master", "both"],
  ["Sandeep", "ਸੰਦੀਪ", "A lighted lamp", "both"],
  ["Sarbjeet", "ਸਰਬਜੀਤ", "Conqueror of all", "both"],
  ["Satnam", "ਸਤਿਨਾਮ", "The true name", "both"],
  ["Satwant", "ਸਤਵੰਤ", "Full of truth", "boys"],
  ["Sehaj", "ਸਹਿਜ", "Intuitive calm, equipoise", "both"],
  ["Sharan", "ਸ਼ਰਨ", "Shelter, refuge", "both"],
  ["Simran", "ਸਿਮਰਨ", "Meditative remembrance", "girls"],
  ["Sukhdeep", "ਸੁਖਦੀਪ", "Lamp of peace", "both"],
  ["Sukhjeet", "ਸੁਖਜੀਤ", "One who wins peace", "both"],
  ["Sukhman", "ਸੁਖਮਨ", "Peaceful mind", "both"],
  ["Sukhpreet", "ਸੁਖਪ੍ਰੀਤ", "Love of peace", "both"],
  ["Sukhwinder", "ਸੁਖਵਿੰਦਰ", "Lord of peace", "both"],
  ["Surjeet", "ਸੁਰਜੀਤ", "Victorious over the gods", "both"],
  ["Taran", "ਤਰਨ", "To cross over, to be liberated", "both"],
  ["Tejinder", "ਤੇਜਿੰਦਰ", "Radiance of Indra; glorious", "both"],
  ["Updesh", "ਉਪਦੇਸ਼", "Teaching, instruction", "both"],
  ["Veer", "ਵੀਰ", "Brave; brother", "boys"],
];

export const NAMES = ROWS.map(([name, gurmukhi, meaning, usage]) => ({
  name,
  gurmukhi,
  meaning,
  usage,
  initial: name.charAt(0).toUpperCase(),
  gurmukhiInitial: gurmukhi.charAt(0),
  singh: `${name} ${MALE_SUFFIX}`,
  kaur: `${name} ${FEMALE_SUFFIX}`,
}));

/** Gurmukhi first letters that actually occur in this list, in Painti order. */
export const GURMUKHI_INITIALS = PAINTI_AKHRI.concat(
  Array.from(new Set(NAMES.map((n) => n.gurmukhiInitial))).filter(
    (ch) => !PAINTI_AKHRI.includes(ch),
  ),
).filter((ch) => NAMES.some((n) => n.gurmukhiInitial === ch));

/** How many names start with each Gurmukhi letter. */
export function gurmukhiCounts() {
  const counts = {};
  for (const entry of NAMES) {
    counts[entry.gurmukhiInitial] = (counts[entry.gurmukhiInitial] ?? 0) + 1;
  }
  return counts;
}

/**
 * Filter the name list.
 *
 * @param {object} options
 * @param {string} [options.mode]     "roman" | "gurmukhi"
 * @param {string} [options.letter]   a roman letter, or "any"
 * @param {string} [options.gurmukhi] a Gurmukhi letter, or "any"
 * @param {string} [options.usage]    "any" | "both" | "boys" | "girls"
 * @param {string} [options.meaning]  substring of the meaning
 * @returns {{names: object[], matched: number, total: number}|{error: string}}
 */
export function filterNames({
  mode = "roman",
  letter = "any",
  gurmukhi = "any",
  usage = "any",
  meaning = "",
} = {}) {
  if (mode !== "roman" && mode !== "gurmukhi") {
    return { error: "Choose whether to search by roman letter or by Gurmukhi letter." };
  }
  if (usage !== "any" && !USAGES.some((u) => u.id === usage)) {
    return { error: "Choose a valid usage option." };
  }

  let useRoman = false;
  let wantedLetter = "";
  if (mode === "roman") {
    wantedLetter = typeof letter === "string" ? letter.trim().toUpperCase() : "";
    useRoman = wantedLetter.length === 1 && /^[A-Z]$/.test(wantedLetter);
    if (wantedLetter && wantedLetter !== "ANY" && !useRoman) {
      return { error: "Pick a single letter from A to Z." };
    }
  }

  let useGurmukhi = false;
  const wantedGurmukhi = typeof gurmukhi === "string" ? gurmukhi.trim() : "";
  if (mode === "gurmukhi") {
    if (wantedGurmukhi && wantedGurmukhi !== "any") {
      if (!GURMUKHI_INITIALS.includes(wantedGurmukhi)) {
        return { error: "No names in this list begin with that Gurmukhi letter." };
      }
      useGurmukhi = true;
    }
  }

  const needle = typeof meaning === "string" ? meaning.trim().toLowerCase() : "";

  const names = NAMES.filter((entry) => {
    if (useRoman && entry.initial !== wantedLetter) return false;
    if (useGurmukhi && entry.gurmukhiInitial !== wantedGurmukhi) return false;
    if (usage !== "any" && entry.usage !== usage) return false;
    if (needle && !entry.meaning.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return { names, matched: names.length, total: NAMES.length };
}

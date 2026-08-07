/**
 * Kannada Gaade (ಗಾದೆ) Explorer — data and pure search helpers.
 *
 * A "gaade" is a complete, self-standing sentence carrying a general truth, as
 * distinct from a "nudigattu" (fixed phrase). Every entry below is a proverb in
 * common circulation in Kannada; each carries the Kannada text, an ISO-15919
 * flavoured Roman transliteration, a word-for-word literal reading, the sense in
 * which it is actually used, and the nearest English proverb where one exists.
 */

/** Theme buckets used for filtering. Ids are stable and used in the UI. */
export const THEMES = [
  { id: "money", label: "Money & thrift" },
  { id: "work", label: "Work & effort" },
  { id: "words", label: "Speech & silence" },
  { id: "greed", label: "Greed & desire" },
  { id: "character", label: "Character & habit" },
  { id: "family", label: "Family & community" },
  { id: "folly", label: "Folly & mistakes" },
  { id: "fate", label: "Fate & fortune" },
  { id: "wisdom", label: "Wisdom & judgement" },
];

export const PROVERBS = [
  {
    id: "ati-aase",
    kannada: "ಅತಿ ಆಸೆ ಗತಿ ಕೇಡು",
    roman: "Ati āse gati kēḍu",
    literal: "Excessive desire, ruined destiny.",
    meaning:
      "Wanting far more than you need destroys what you already have. Used to warn someone chasing an unrealistic gain.",
    english: "Grasp all, lose all.",
    theme: "greed",
  },
  {
    id: "haasige-kaalu",
    kannada: "ಹಾಸಿಗೆ ಇದ್ದಷ್ಟು ಕಾಲು ಚಾಚು",
    roman: "Hāsige iddaṣṭu kālu cācu",
    literal: "Stretch your legs only as far as the bedding goes.",
    meaning:
      "Spend and commit within your means. The standard Kannada advice against borrowing for display.",
    english: "Cut your coat according to your cloth.",
    theme: "money",
  },
  {
    id: "kai-kesara",
    kannada: "ಕೈ ಕೆಸರಾದರೆ ಬಾಯಿ ಮೊಸರು",
    roman: "Kai kesarādare bāyi mosaru",
    literal: "If the hands get muddy, the mouth gets curd.",
    meaning:
      "Physical effort is what produces food and reward. Said to encourage someone avoiding hard work.",
    english: "No pain, no gain.",
    theme: "work",
  },
  {
    id: "hani-hani",
    kannada: "ಹನಿ ಹನಿ ಕೂಡಿದರೆ ಹಳ್ಳ",
    roman: "Hani hani kūḍidare haḷḷa",
    literal: "Drop joining drop becomes a stream.",
    meaning:
      "Small, regular savings or small repeated efforts accumulate into something substantial.",
    english: "Many a little makes a mickle.",
    theme: "money",
  },
  {
    id: "maatu-ballavanige",
    kannada: "ಮಾತು ಬಲ್ಲವನಿಗೆ ಜಗಳವಿಲ್ಲ, ಊಟ ಬಲ್ಲವನಿಗೆ ರೋಗವಿಲ್ಲ",
    roman: "Mātu ballavanige jagaḷavilla, ūṭa ballavanige rōgavilla",
    literal:
      "For one who knows how to speak there is no quarrel; for one who knows how to eat there is no disease.",
    meaning:
      "Skill in speaking prevents conflict just as restraint in eating prevents illness. Quoted in disputes and in health advice alike.",
    english: "A soft answer turneth away wrath.",
    theme: "words",
  },
  {
    id: "aaseye-moola",
    kannada: "ಆಸೆಯೇ ದುಃಖಕ್ಕೆ ಮೂಲ",
    roman: "Āseyē duḥkhakke mūla",
    literal: "Desire itself is the root of sorrow.",
    meaning:
      "A proverb of Buddhist descent used in everyday Kannada to counsel contentment when someone is unhappy about what they lack.",
    english: "He who wants everything loses everything.",
    theme: "greed",
  },
  {
    id: "beleyuva-siri",
    kannada: "ಬೆಳೆಯುವ ಸಿರಿ ಮೊಳಕೆಯಲ್ಲಿ",
    roman: "Beḷeyuva siri moḷakeyalli",
    literal: "The prosperity that is going to grow shows in the sprout.",
    meaning:
      "Real promise is visible early. Used about a bright child or a venture that shows quality from the start.",
    english: "The child is father of the man.",
    theme: "character",
  },
  {
    id: "huttisida-devaru",
    kannada: "ಹುಟ್ಟಿಸಿದ ದೇವರು ಹುಲ್ಲು ಮೇಯಿಸುತ್ತಾನೆಯೇ?",
    roman: "Huṭṭisida dēvaru hullu mēyisuttāneyē?",
    literal: "Will the god who created you make you graze grass?",
    meaning:
      "Reassurance that a livelihood will be found. Said to someone panicking about how they will survive.",
    english: "God never sends mouths but He sends meat.",
    theme: "fate",
  },
  {
    id: "angai-hunnu",
    kannada: "ಅಂಗೈ ಹುಣ್ಣಿಗೆ ಕನ್ನಡಿ ಬೇಕೆ?",
    roman: "Aṅgai huṇṇige kannaḍi bēke?",
    literal: "Do you need a mirror to see a sore on your own palm?",
    meaning:
      "Something plainly obvious needs no proof or explanation. Used to cut short a pointless argument.",
    english: "It goes without saying.",
    theme: "wisdom",
  },
  {
    id: "kumbalakayi-kalla",
    kannada: "ಕುಂಬಳಕಾಯಿ ಕಳ್ಳ ಅಂದ್ರೆ ಹೆಗಲು ಮುಟ್ಟಿ ನೋಡಿಕೊಂಡ",
    roman: "Kumbaḷakāyi kaḷḷa andare hegalu muṭṭi nōḍikoṇḍa",
    literal:
      "Say 'pumpkin thief' and he immediately feels his own shoulder.",
    meaning:
      "The guilty give themselves away by reacting to a general remark. One of the most quoted Kannada gaades.",
    english: "A guilty conscience needs no accuser.",
    theme: "character",
  },
  {
    id: "maatu-belli",
    kannada: "ಮಾತು ಬೆಳ್ಳಿ, ಮೌನ ಬಂಗಾರ",
    roman: "Mātu beḷḷi, mauna baṅgāra",
    literal: "Speech is silver, silence is gold.",
    meaning:
      "Knowing when not to speak is worth more than speaking well. Common in classroom and workplace advice.",
    english: "Speech is silver, silence is golden.",
    theme: "words",
  },
  {
    id: "oorige-bandavalu",
    kannada: "ಊರಿಗೆ ಬಂದವಳು ನೀರಿಗೆ ಬರದೇ ಇರುತ್ತಾಳೆಯೇ?",
    roman: "Ūrige bandavaḷu nīrige baradē iruttāḷeyē?",
    literal:
      "Will the woman who has come to the village not come to the water?",
    meaning:
      "Someone who is nearby will inevitably show up; a meeting cannot be avoided forever. Often used half-teasingly.",
    english: "We shall meet before long.",
    theme: "fate",
  },
  {
    id: "adikege-hoda-maana",
    kannada: "ಅಡಿಕೆಗೆ ಹೋದ ಮಾನ ಆನೆ ಕೊಟ್ಟರೂ ಬಾರದು",
    roman: "Aḍikege hōda māna āne koṭṭarū bāradu",
    literal:
      "Honour lost over an areca nut will not come back even if you give an elephant.",
    meaning:
      "Reputation is cheap to lose and impossible to buy back. Quoted when someone risks their name for a trivial gain.",
    english: "A good name is sooner lost than won.",
    theme: "character",
  },
  {
    id: "gidavagi-baggaddu",
    kannada: "ಗಿಡವಾಗಿ ಬಗ್ಗದ್ದು ಮರವಾಗಿ ಬಗ್ಗೀತೆ?",
    roman: "Giḍavāgi baggaddu maravāgi baggīte?",
    literal:
      "What would not bend as a sapling, will it bend once it is a tree?",
    meaning:
      "Habits and discipline must be set in childhood; they harden with age. Standard parenting proverb.",
    english: "As the twig is bent, so grows the tree.",
    theme: "character",
  },
  {
    id: "ettige-jvara",
    kannada: "ಎತ್ತಿಗೆ ಜ್ವರ ಬಂದರೆ ಎಮ್ಮೆಗೆ ಬರೆ ಹಾಕಿದರು",
    roman: "Ettige jvara bandare emmege bare hākidaru",
    literal: "The ox ran a fever, so they branded the buffalo.",
    meaning:
      "A remedy aimed at completely the wrong target. Used to mock misdirected policy or blame.",
    english: "Barking up the wrong tree.",
    theme: "folly",
  },
  {
    id: "haavu-kolu",
    kannada: "ಹಾವೂ ಸಾಯಬಾರದು, ಕೋಲೂ ಮುರಿಯಬಾರದು",
    roman: "Hāvū sāyabāradu, kōlū muriyabāradu",
    literal: "The snake should not die and the stick should not break.",
    meaning:
      "Settle the matter without destroying either side. Describes a careful, face-saving compromise.",
    english: "Kill two birds with one stone — without breaking either.",
    theme: "wisdom",
  },
  {
    id: "ondu-kannige-benne",
    kannada: "ಒಂದು ಕಣ್ಣಿಗೆ ಬೆಣ್ಣೆ, ಇನ್ನೊಂದು ಕಣ್ಣಿಗೆ ಸುಣ್ಣ",
    roman: "Ondu kaṇṇige beṇṇe, innondu kaṇṇige suṇṇa",
    literal: "Butter for one eye, quicklime for the other.",
    meaning:
      "Blatant favouritism — treating two people in the same position completely differently.",
    english: "To have one law for the rich and another for the poor.",
    theme: "family",
  },
  {
    id: "doorada-betta",
    kannada: "ದೂರದ ಬೆಟ್ಟ ನುಣ್ಣಗೆ",
    roman: "Dūrada beṭṭa nuṇṇage",
    literal: "The distant hill looks smooth.",
    meaning:
      "Anything seen from far away looks easier and better than it is. Said about other people's jobs, cities and marriages.",
    english: "The grass is always greener on the other side.",
    theme: "greed",
  },
  {
    id: "koosu-kulaavi",
    kannada: "ಕೂಸು ಹುಟ್ಟುವ ಮೊದಲೇ ಕುಲಾವಿ ಹೊಲಿಸಿದರು",
    roman: "Kūsu huṭṭuva modalē kulāvi holisidaru",
    literal: "They had the baby's cap stitched before the baby was born.",
    meaning:
      "Planning for a result that has not arrived yet. The Kannada equivalent of counting your chickens early.",
    english: "Don't count your chickens before they hatch.",
    theme: "folly",
  },
  {
    id: "bekkige-chellaata",
    kannada: "ಬೆಕ್ಕಿಗೆ ಚೆಲ್ಲಾಟ, ಇಲಿಗೆ ಪ್ರಾಣಸಂಕಟ",
    roman: "Bekkige cellāṭa, ilige prāṇasaṅkaṭa",
    literal: "Play for the cat is a death agony for the mouse.",
    meaning:
      "What one side treats as harmless fun is survival for the weaker side. Used about bullying and about casual cruelty.",
    english: "One man's sport is another man's death.",
    theme: "wisdom",
  },
  {
    id: "hottege-hittu",
    kannada: "ಹೊಟ್ಟೆಗೆ ಹಿಟ್ಟಿಲ್ಲದಿದ್ದರೂ ಜುಟ್ಟಿಗೆ ಮಲ್ಲಿಗೆ ಹೂವು",
    roman: "Hoṭṭege hiṭṭilladiddarū juṭṭige mallige hūvu",
    literal:
      "No flour for the stomach, but jasmine flowers for the hair-knot.",
    meaning:
      "Spending on show while the basics are unmet. The classic Kannada jibe at status spending.",
    english: "Fur coat and no knickers.",
    theme: "money",
  },
  {
    id: "kottavanu-kodangi",
    kannada: "ಕೊಟ್ಟವನು ಕೋಡಂಗಿ, ಇಸ್ಕೊಂಡವನು ಈರಭದ್ರ",
    roman: "Koṭṭavanu kōḍaṅgi, iskoṇḍavanu īrabhadra",
    literal: "The one who lent is the clown, the one who borrowed is the hero.",
    meaning:
      "The lender ends up begging while the borrower behaves as if he did a favour. Quoted about informal loans to friends.",
    english: "Lend your money and lose your friend.",
    theme: "money",
  },
  {
    id: "chinte-illadavanige",
    kannada: "ಚಿಂತೆ ಇಲ್ಲದವನಿಗೆ ಸಂತೆಯಲ್ಲೂ ನಿದ್ದೆ",
    roman: "Cinte illadavanige santeyallū nidde",
    literal: "One who has no worry sleeps even in the middle of a market.",
    meaning:
      "A clear conscience and few obligations bring rest anywhere; anxiety, not surroundings, is what keeps people awake.",
    english: "A quiet conscience sleeps in thunder.",
    theme: "wisdom",
  },
  {
    id: "ajjige-arive",
    kannada: "ಅಜ್ಜಿಗೆ ಅರಿವೆ ಚಿಂತೆ, ಮೊಮ್ಮಗಳಿಗೆ ಮದುವೆ ಚಿಂತೆ",
    roman: "Ajjige arive cinte, mommagaḷige maduve cinte",
    literal:
      "The grandmother worries about cloth, the granddaughter worries about her wedding.",
    meaning:
      "Each generation is absorbed in its own scale of problem, and neither takes the other's seriously.",
    english: "Every age has its own concerns.",
    theme: "family",
  },
  {
    id: "hittala-gida",
    kannada: "ಹಿತ್ತಲ ಗಿಡ ಮದ್ದಲ್ಲ",
    roman: "Hittala giḍa maddalla",
    literal: "The plant in your own backyard is not considered medicine.",
    meaning:
      "People undervalue the expertise, talent or remedy that is closest to home.",
    english: "A prophet is not honoured in his own country.",
    theme: "wisdom",
  },
];

const THEME_IDS = new Set(THEMES.map((t) => t.id));

/** Lowercase and strip punctuation/extra spaces so search is forgiving. */
function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[.,!?;:'"()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(proverb) {
  return normalise(
    [
      proverb.kannada,
      proverb.roman,
      proverb.literal,
      proverb.meaning,
      proverb.english,
    ].join(" ")
  );
}

/**
 * Filter the proverb list by free text and theme.
 * Every token in the query must appear somewhere in the entry (AND search).
 * Returns { results, total, query, theme } — never throws, never returns NaN.
 */
export function searchProverbs({ query = "", theme = "all" } = {}) {
  const safeTheme = theme === "all" || THEME_IDS.has(theme) ? theme : "all";
  const tokens = normalise(query).split(" ").filter(Boolean);

  const results = PROVERBS.filter((proverb) => {
    if (safeTheme !== "all" && proverb.theme !== safeTheme) return false;
    if (tokens.length === 0) return true;
    const hay = haystack(proverb);
    return tokens.every((token) => hay.includes(token));
  });

  return {
    results,
    total:
      safeTheme === "all"
        ? PROVERBS.length
        : PROVERBS.filter((proverb) => proverb.theme === safeTheme).length,
    matched: results.length,
    query: String(query ?? ""),
    theme: safeTheme,
  };
}

/** How many proverbs sit in each theme. Returns a plain { themeId: count } map. */
export function themeCounts() {
  const counts = {};
  for (const { id } of THEMES) counts[id] = 0;
  for (const proverb of PROVERBS) {
    if (counts[proverb.theme] === undefined) counts[proverb.theme] = 0;
    counts[proverb.theme] += 1;
  }
  return counts;
}

export function getProverbById(id) {
  return PROVERBS.find((proverb) => proverb.id === id) ?? null;
}

/** Days from 1970-01-01 for an ISO date, used only to index the list. */
const MS_PER_DAY = 86400000;

/**
 * Deterministic "gaade of the day" for an ISO date string (YYYY-MM-DD).
 * Pure: the date is an argument, never read from the clock inside this module.
 */
export function proverbOfTheDay(isoDate) {
  const text = String(isoDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { error: "Enter a date as YYYY-MM-DD to pick the gaade of the day." };
  }
  const stamp = Date.parse(`${text}T00:00:00Z`);
  if (!Number.isFinite(stamp)) {
    return { error: "That is not a real calendar date." };
  }
  const dayNumber = Math.floor(stamp / MS_PER_DAY);
  const index = ((dayNumber % PROVERBS.length) + PROVERBS.length) % PROVERBS.length;
  return { proverb: PROVERBS[index], index, date: text };
}

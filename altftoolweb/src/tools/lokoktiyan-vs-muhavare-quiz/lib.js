/**
 * Muhavara vs Lokokti Quiz — data, deterministic question builder and grading.
 *
 * The Hindi grammar rule being tested:
 *
 *   मुहावरा (muhavara / idiom)
 *     - a phrase (वाक्यांश), never a complete sentence
 *     - cited with the verb in the infinitive, so it usually ends in -ना
 *       (होना, करना, देना, लेना, जाना …)
 *     - its form changes with tense, gender and person when used
 *     - it has no meaning on its own; it must be fitted into a sentence
 *     - it states no moral or advice
 *
 *   लोकोक्ति (lokokti / कहावत / proverb)
 *     - a complete sentence (पूर्ण वाक्य) that can be quoted as it stands
 *     - its wording is fixed and does not change with tense or person
 *     - it states folk wisdom, a general truth or a warning
 *
 * The single most reliable exam test: can the line be spoken on its own and
 * still mean something complete? If yes it is a lokokti; if it needs a sentence
 * built around it, it is a muhavara.
 */

export const TYPES = {
  muhavara: {
    id: "muhavara",
    label: "Muhavara (मुहावरा)",
    short: "Idiom — a phrase",
  },
  lokokti: {
    id: "lokokti",
    label: "Lokokti (लोकोक्ति)",
    short: "Proverb — a full sentence",
  },
};

/** The classification rules, in the order a student should apply them. */
export const RULES = [
  "Can the line stand alone as a complete sentence? If yes it is a lokokti.",
  "Does it end in an infinitive verb such as होना, करना, देना or लेना? That is the classic muhavara shape.",
  "Does the wording change with tense, gender or person when you use it? Muhavare change; lokoktiyan stay fixed.",
  "Does it give advice, a warning or a general truth? Only lokoktiyan do that.",
];

export const ITEMS = [
  {
    id: "aankhon-ka-tara",
    hindi: "आँखों का तारा होना",
    roman: "Aankhon ka tara hona",
    type: "muhavara",
    meaning: "To be extremely dear to someone.",
    why: "A phrase ending in होना. On its own it says nothing — you have to say 'वह अपनी माँ की आँखों का तारा है'.",
  },
  {
    id: "nau-do-gyarah",
    hindi: "नौ दो ग्यारह होना",
    roman: "Nau do gyarah hona",
    type: "muhavara",
    meaning: "To run away or disappear quickly.",
    why: "Ends in होना and changes with tense — नौ दो ग्यारह हो गया, हो जाएँगे. That change is the muhavara signature.",
  },
  {
    id: "ab-pachhtaye",
    hindi: "अब पछताए होत क्या जब चिड़िया चुग गई खेत",
    roman: "Ab pachhtaye hot kya jab chidiya chug gayi khet",
    type: "lokokti",
    meaning: "There is no point regretting once the damage is already done.",
    why: "A complete sentence carrying a warning. The wording never changes, whoever is speaking.",
  },
  {
    id: "naach-na-jaane",
    hindi: "नाच न जाने आँगन टेढ़ा",
    roman: "Naach na jaane aangan tedha",
    type: "lokokti",
    meaning: "Blaming circumstances for your own lack of skill.",
    why: "A full sentence with a judgement in it, quotable exactly as it stands.",
  },
  {
    id: "lohe-ke-chane",
    hindi: "लोहे के चने चबाना",
    roman: "Lohe ke chane chabana",
    type: "muhavara",
    meaning: "To face an extremely difficult task.",
    why: "A phrase ending in चबाना. It needs a subject and a tense before it means anything.",
  },
  {
    id: "door-ke-dhol",
    hindi: "दूर के ढोल सुहावने",
    roman: "Door ke dhol suhavane",
    type: "lokokti",
    meaning: "Things look attractive from a distance and disappointing up close.",
    why: "A complete statement of a general truth, with no verb to conjugate.",
  },
  {
    id: "danton-tale",
    hindi: "दाँतों तले उँगली दबाना",
    roman: "Danton tale ungli dabana",
    type: "muhavara",
    meaning: "To be astonished.",
    why: "Infinitive दबाना; used as 'सब ने दाँतों तले उँगली दबा ली'.",
  },
  {
    id: "ek-haath-se-taali",
    hindi: "एक हाथ से ताली नहीं बजती",
    roman: "Ek haath se taali nahin bajti",
    type: "lokokti",
    meaning: "A quarrel needs two sides; blame is rarely one-sided.",
    why: "A complete sentence with a moral, quoted unchanged in every situation.",
  },
  {
    id: "apne-munh-miyan-mitthu",
    hindi: "अपने मुँह मियाँ मिट्ठू बनना",
    roman: "Apne munh miyan mitthu banna",
    type: "muhavara",
    meaning: "To praise oneself.",
    why: "Ends in बनना and must be conjugated — बन रहे हो, बन गया.",
  },
  {
    id: "jiski-lathi",
    hindi: "जिसकी लाठी उसकी भैंस",
    roman: "Jiski lathi uski bhains",
    type: "lokokti",
    meaning: "Whoever has the power controls the property — might is right.",
    why: "A fixed, complete sentence describing how the world works. Nothing in it can be conjugated.",
  },
  {
    id: "eid-ka-chand",
    hindi: "ईद का चाँद होना",
    roman: "Eid ka chand hona",
    type: "muhavara",
    meaning: "To be seen very rarely.",
    why: "Phrase plus होना. Used as 'तुम तो ईद का चाँद हो गए हो'.",
  },
  {
    id: "andhon-mein-kana",
    hindi: "अंधों में काना राजा",
    roman: "Andhon mein kana raja",
    type: "lokokti",
    meaning: "Among the wholly incapable, the slightly capable person rules.",
    why: "A complete nominal sentence stating a general observation; there is no verb to inflect.",
  },
  {
    id: "kaan-bharna",
    hindi: "कान भरना",
    roman: "Kaan bharna",
    type: "muhavara",
    meaning: "To poison someone's mind against another person.",
    why: "A two-word phrase in the infinitive. It has no standalone meaning until placed in a sentence.",
  },
  {
    id: "oonchi-dukan",
    hindi: "ऊँची दुकान फीका पकवान",
    roman: "Oonchi dukan pheeka pakwan",
    type: "lokokti",
    meaning: "A big reputation hiding poor quality.",
    why: "A complete sentence used as a verdict; the wording is fixed.",
  },
  {
    id: "naak-mein-dam",
    hindi: "नाक में दम करना",
    roman: "Naak mein dam karna",
    type: "muhavara",
    meaning: "To harass someone continuously.",
    why: "Infinitive करना; changes freely — कर दिया, कर रखा है.",
  },
  {
    id: "aam-ke-aam",
    hindi: "आम के आम गुठलियों के दाम",
    roman: "Aam ke aam guthliyon ke daam",
    type: "lokokti",
    meaning: "Profit twice over from a single thing.",
    why: "A complete saying with a fixed shape; nothing in it is conjugated.",
  },
  {
    id: "aag-babula",
    hindi: "आग बबूला होना",
    roman: "Aag babula hona",
    type: "muhavara",
    meaning: "To become extremely angry.",
    why: "Ends in होना and takes tense — आग बबूला हो गए.",
  },
  {
    id: "bandar-kya-jaane",
    hindi: "बंदर क्या जाने अदरक का स्वाद",
    roman: "Bandar kya jaane adrak ka swad",
    type: "lokokti",
    meaning: "Someone with no understanding cannot value what is put in front of them.",
    why: "A complete rhetorical sentence quoted exactly as it is.",
  },
  {
    id: "haath-malna",
    hindi: "हाथ मलना",
    roman: "Haath malna",
    type: "muhavara",
    meaning: "To regret bitterly after the chance has gone.",
    why: "Bare infinitive मलना — clearly a phrase, not a sentence.",
  },
  {
    id: "kaala-akshar",
    hindi: "काला अक्षर भैंस बराबर",
    roman: "Kaala akshar bhains barabar",
    type: "lokokti",
    meaning: "Completely illiterate — letters mean nothing to the person.",
    why: "A complete comparison sentence with fixed wording.",
  },
  {
    id: "gagar-mein-sagar",
    hindi: "गागर में सागर भरना",
    roman: "Gagar mein sagar bharna",
    type: "muhavara",
    meaning: "To express a great deal in very few words.",
    why: "Ends in भरना; used as 'कवि ने गागर में सागर भर दिया'.",
  },
  {
    id: "doobte-ko-tinke",
    hindi: "डूबते को तिनके का सहारा",
    roman: "Doobte ko tinke ka sahara",
    type: "lokokti",
    meaning: "In desperation even the smallest help feels like rescue.",
    why: "A complete saying quoted unchanged; it states a general truth about desperation.",
  },
  {
    id: "tedhi-kheer",
    hindi: "टेढ़ी खीर होना",
    roman: "Tedhi kheer hona",
    type: "muhavara",
    meaning: "To be a difficult job.",
    why: "Phrase plus होना — 'यह काम टेढ़ी खीर है'.",
  },
  {
    id: "jaisi-karni",
    hindi: "जैसी करनी वैसी भरनी",
    roman: "Jaisi karni waisi bharni",
    type: "lokokti",
    meaning: "You face the consequences of your own actions.",
    why: "A complete sentence with a moral, fixed in form.",
  },
  {
    id: "angootha-dikhana",
    hindi: "अंगूठा दिखाना",
    roman: "Angootha dikhana",
    type: "muhavara",
    meaning: "To refuse flatly at the last moment after promising help.",
    why: "Infinitive दिखाना; needs a subject and tense to mean anything.",
  },
  {
    id: "ek-anaar",
    hindi: "एक अनार सौ बीमार",
    roman: "Ek anaar sau bimaar",
    type: "lokokti",
    meaning: "Far more claimants than there is supply.",
    why: "A complete nominal sentence, quoted with fixed wording.",
  },
  {
    id: "sir-par-paon",
    hindi: "सिर पर पाँव रखकर भागना",
    roman: "Sir par paon rakhkar bhagna",
    type: "muhavara",
    meaning: "To run away as fast as possible.",
    why: "Ends in भागना and is conjugated in use — भाग खड़ा हुआ.",
  },
  {
    id: "sau-sunar",
    hindi: "सौ सुनार की, एक लोहार की",
    roman: "Sau sunaar ki, ek lohaar ki",
    type: "lokokti",
    meaning: "One decisive blow outweighs a hundred weak ones.",
    why: "A complete two-part saying with fixed wording and a clear lesson.",
  },
  {
    id: "ghee-ke-diye",
    hindi: "घी के दिए जलाना",
    roman: "Ghee ke diye jalana",
    type: "muhavara",
    meaning: "To celebrate joyfully.",
    why: "Infinitive जलाना — a phrase that has to be fitted into a sentence.",
  },
  {
    id: "chor-ki-daadhi",
    hindi: "चोर की दाढ़ी में तिनका",
    roman: "Chor ki daadhi mein tinka",
    type: "lokokti",
    meaning: "The guilty person gives himself away by reacting.",
    why: "A complete sentence stating a general observation; nothing in it inflects.",
  },
  {
    id: "thotha-chana",
    hindi: "थोथा चना बाजे घना",
    roman: "Thotha chana baaje ghana",
    type: "lokokti",
    meaning: "The person with least substance makes the most noise.",
    why: "A complete sentence with a fixed rhyming shape and a moral.",
  },
  {
    id: "man-changa",
    hindi: "मन चंगा तो कठौती में गंगा",
    roman: "Man changa to kathauti mein Ganga",
    type: "lokokti",
    meaning: "If your intention is pure, holiness is present wherever you are.",
    why: "A complete conditional sentence quoted exactly as it stands.",
  },
];

export const QUIZ_LENGTHS = [5, 10, 15, 20];

/** Deterministic 32-bit linear congruential generator (Numerical Recipes constants). */
function makeRandom(seed) {
  let state = Math.abs(Math.trunc(Number(seed))) % 2147483647;
  if (!Number.isFinite(state)) state = 1;
  if (state === 0) state = 1;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

/** Fisher–Yates using the seeded generator, so the same seed gives the same quiz. */
function shuffle(list, random) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

/**
 * Build a quiz round. count is clamped to 1..ITEMS.length; a non-numeric seed
 * falls back to 1. Pure: same (count, seed) always gives the same questions.
 */
export function buildQuiz({ count = 10, seed = 1 } = {}) {
  const rawCount = Number(count);
  if (!Number.isFinite(rawCount) || rawCount < 1) {
    return { error: "Choose how many questions you want — at least one." };
  }
  const size = Math.min(Math.floor(rawCount), ITEMS.length);
  const random = makeRandom(seed);
  const questions = shuffle(ITEMS, random).slice(0, size);
  return { questions, count: size, seed: Math.abs(Math.trunc(Number(seed))) || 1 };
}

const BANDS = [
  { min: 90, label: "Excellent — you can apply the rule reliably." },
  { min: 70, label: "Good — check the ones you missed and try again." },
  { min: 50, label: "Halfway — re-read the four rules before the next round." },
  { min: 0, label: "Start with the rules: a lokokti is a full sentence, a muhavara is a phrase." },
];

/**
 * Grade a round. `answers` is a plain object mapping question id to
 * "muhavara" or "lokokti". Unanswered questions count as wrong but are
 * reported separately. Never returns NaN — an empty round scores 0%.
 */
export function gradeQuiz(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "There are no questions to grade yet." };
  }
  const given = answers && typeof answers === "object" ? answers : {};

  const rows = questions.map((question) => {
    const chosen = given[question.id] ?? null;
    return {
      id: question.id,
      hindi: question.hindi,
      roman: question.roman,
      meaning: question.meaning,
      why: question.why,
      correctType: question.type,
      chosen,
      answered: chosen === "muhavara" || chosen === "lokokti",
      correct: chosen === question.type,
    };
  });

  const total = rows.length;
  const correct = rows.filter((row) => row.correct).length;
  const answered = rows.filter((row) => row.answered).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const band = BANDS.find((entry) => percent >= entry.min)?.label ?? BANDS[BANDS.length - 1].label;

  return { rows, total, correct, answered, unanswered: total - answered, percent, band };
}

/** How many of each type are in the pool — useful as a sanity display. */
export function poolCounts() {
  return {
    muhavara: ITEMS.filter((item) => item.type === "muhavara").length,
    lokokti: ITEMS.filter((item) => item.type === "lokokti").length,
    total: ITEMS.length,
  };
}

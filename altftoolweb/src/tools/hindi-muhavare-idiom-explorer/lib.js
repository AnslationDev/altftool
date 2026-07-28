/**
 * Hindi Muhavare Explorer — idiom bank plus pure browse, daily-pick and quiz logic.
 *
 * A muhavara (मुहावरा) is a phrase whose meaning is not the sum of its words and
 * which cannot stand alone as a sentence; it is bent to fit the sentence it goes
 * into. That is what separates it from a lokokti/kahavat, which is a complete
 * saying used unchanged. Every entry below is a muhavara.
 *
 * No React, no DOM, no Date.now(): the daily pick takes an ISO date argument and
 * the quiz shuffle is seeded, so the same inputs always give the same output.
 */

/** Topic buckets used by the browse filter. */
export const THEMES = [
  "Body",
  "Animals and birds",
  "Nature and sky",
  "Effort and work",
  "Behaviour",
  "Defeat and fear",
];

/** Exam bands, matching how Hindi textbooks and competitive keys group idioms. */
export const EXAM_TAGS = ["Class 6-8", "Class 9-10", "Competitive exams"];

/** 32 widely taught Hindi muhavare. `literal` is the word-for-word sense. */
export const IDIOMS = [
  {
    idiom: "अंगूठा दिखाना",
    roman: "angūṭhā dikhānā",
    literal: "to show the thumb",
    meaningHi: "ऐन मौके पर साफ़ इनकार कर देना",
    meaningEn: "to refuse flatly at the last moment after having promised help",
    exampleHi: "वादा करके ऐन मौके पर उसने अंगूठा दिखा दिया।",
    exampleEn: "After promising, he refused outright at the last moment.",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "आँखों का तारा",
    roman: "ā̃khõ kā tārā",
    literal: "the star of the eyes",
    meaningHi: "बहुत प्यारा होना",
    meaningEn: "to be extremely dear to someone",
    exampleHi: "छोटा बेटा माँ की आँखों का तारा है।",
    exampleEn: "The younger son is the apple of his mother's eye.",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "आँख का काँटा होना",
    roman: "ā̃kh kā kā̃ṭā honā",
    literal: "to be a thorn in the eye",
    meaningHi: "अत्यंत अप्रिय लगना",
    meaningEn: "to be intensely disliked by someone",
    exampleHi: "सच बोलने के कारण वह सबकी आँख का काँटा बन गया।",
    exampleEn: "Because he spoke the truth, everyone came to resent him.",
    theme: "Body",
    exam: "Class 9-10",
  },
  {
    idiom: "आँखें चुराना",
    roman: "ā̃khẽ curānā",
    literal: "to steal one's eyes",
    meaningHi: "सामना करने से कतराना",
    meaningEn: "to avoid facing someone, usually out of guilt",
    exampleHi: "कर्ज लेने के बाद वह मुझसे आँखें चुराने लगा।",
    exampleEn: "After borrowing money he began avoiding me.",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "आस्तीन का साँप",
    roman: "āstīn kā sā̃p",
    literal: "a snake in the sleeve",
    meaningHi: "अपनों में छिपा हुआ शत्रु",
    meaningEn: "a treacherous person hiding among one's own",
    exampleHi: "जिसे मैंने मित्र समझा, वही आस्तीन का साँप निकला।",
    exampleEn: "The one I took for a friend turned out to be a traitor.",
    theme: "Animals and birds",
    exam: "Class 9-10",
  },
  {
    idiom: "ईद का चाँद होना",
    roman: "īd kā cā̃d honā",
    literal: "to be the Eid moon",
    meaningHi: "बहुत दिनों बाद दिखाई देना",
    meaningEn: "to appear very rarely",
    exampleHi: "तुम तो ईद का चाँद हो गए हो, कहाँ रहते हो?",
    exampleEn: "You have become a rare sight — where do you keep yourself?",
    theme: "Nature and sky",
    exam: "Class 6-8",
  },
  {
    idiom: "उँगली पर नचाना",
    roman: "ũglī par nacānā",
    literal: "to make someone dance on a finger",
    meaningHi: "अपने इशारों पर चलाना",
    meaningEn: "to control someone completely",
    exampleHi: "वह अपने भाई को उँगली पर नचाती है।",
    exampleEn: "She has her brother completely under her control.",
    theme: "Body",
    exam: "Class 9-10",
  },
  {
    idiom: "कान भरना",
    roman: "kān bharnā",
    literal: "to fill someone's ears",
    meaningHi: "पीठ पीछे चुगली करना",
    meaningEn: "to poison someone's mind against another by tale-bearing",
    exampleHi: "उसने मालिक के कान भरकर मुझे नौकरी से निकलवा दिया।",
    exampleEn: "He turned the owner against me and got me dismissed.",
    theme: "Behaviour",
    exam: "Class 9-10",
  },
  {
    idiom: "खून पसीना एक करना",
    roman: "khūn pasīnā ek karnā",
    literal: "to make blood and sweat one",
    meaningHi: "अत्यधिक परिश्रम करना",
    meaningEn: "to toil extremely hard",
    exampleHi: "किसान खून पसीना एक करके फसल उगाता है।",
    exampleEn: "The farmer toils relentlessly to raise a crop.",
    theme: "Effort and work",
    exam: "Class 9-10",
  },
  {
    idiom: "गागर में सागर भरना",
    roman: "gāgar mẽ sāgar bharnā",
    literal: "to fill an ocean into a pitcher",
    meaningHi: "थोड़े शब्दों में बहुत कुछ कह देना",
    meaningEn: "to say a great deal in very few words",
    exampleHi: "बिहारी ने अपने दोहों में गागर में सागर भर दिया।",
    exampleEn: "Bihari packed an ocean of meaning into his couplets.",
    theme: "Effort and work",
    exam: "Competitive exams",
  },
  {
    idiom: "घी के दिए जलाना",
    roman: "ghī ke diye jalānā",
    literal: "to light lamps of ghee",
    meaningHi: "बहुत खुशी मनाना",
    meaningEn: "to celebrate with great joy",
    exampleHi: "बेटे के पास होने पर माँ ने घी के दिए जलाए।",
    exampleEn: "When her son passed, his mother celebrated joyfully.",
    theme: "Behaviour",
    exam: "Class 9-10",
  },
  {
    idiom: "चार चाँद लगाना",
    roman: "cār cā̃d lagānā",
    literal: "to attach four moons",
    meaningHi: "शोभा बढ़ा देना",
    meaningEn: "to add lustre or great distinction to something",
    exampleHi: "उसकी उपस्थिति ने समारोह में चार चाँद लगा दिए।",
    exampleEn: "Her presence added real lustre to the function.",
    theme: "Nature and sky",
    exam: "Class 6-8",
  },
  {
    idiom: "छक्के छुड़ाना",
    roman: "chakke chuṛānā",
    literal: "to loosen someone's sixes",
    meaningHi: "बुरी तरह हरा देना",
    meaningEn: "to rout an opponent, to make them lose their nerve",
    exampleHi: "भारतीय गेंदबाजों ने विरोधी टीम के छक्के छुड़ा दिए।",
    exampleEn: "The Indian bowlers completely routed the opposing team.",
    theme: "Defeat and fear",
    exam: "Competitive exams",
  },
  {
    idiom: "टेढ़ी खीर",
    roman: "ṭeṛhī khīr",
    literal: "crooked kheer",
    meaningHi: "बहुत कठिन काम",
    meaningEn: "a task far harder than it looks",
    exampleHi: "गणित का यह सवाल टेढ़ी खीर साबित हुआ।",
    exampleEn: "This maths problem turned out to be a very tough nut.",
    theme: "Effort and work",
    exam: "Class 6-8",
  },
  {
    idiom: "दाल में काला होना",
    roman: "dāl mẽ kālā honā",
    literal: "there is something black in the lentils",
    meaningHi: "कुछ गड़बड़ या संदेह होना",
    meaningEn: "something is suspicious",
    exampleHi: "उसकी बातें सुनकर लगता है दाल में कुछ काला है।",
    exampleEn: "Listening to him, it seems something is not right.",
    theme: "Behaviour",
    exam: "Class 6-8",
  },
  {
    idiom: "दाँतों तले उँगली दबाना",
    roman: "dā̃tõ tale ũglī dabānā",
    literal: "to press a finger under the teeth",
    meaningHi: "आश्चर्यचकित रह जाना",
    meaningEn: "to be astonished",
    exampleHi: "उसका करतब देखकर सबने दाँतों तले उँगली दबा ली।",
    exampleEn: "Everyone was astounded when they saw his feat.",
    theme: "Body",
    exam: "Class 9-10",
  },
  {
    idiom: "नाक कटना",
    roman: "nāk kaṭnā",
    literal: "for the nose to be cut off",
    meaningHi: "इज्जत चली जाना",
    meaningEn: "to lose one's honour publicly",
    exampleHi: "बेटे की हरकत से पिता की नाक कट गई।",
    exampleEn: "The son's behaviour disgraced his father.",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "नौ दो ग्यारह होना",
    roman: "nau do gyārah honā",
    literal: "nine and two make eleven",
    meaningHi: "भाग जाना",
    meaningEn: "to run away, to make oneself scarce",
    exampleHi: "पुलिस को देखते ही चोर नौ दो ग्यारह हो गए।",
    exampleEn: "The thieves fled the moment they saw the police.",
    theme: "Defeat and fear",
    exam: "Class 6-8",
  },
  {
    idiom: "पानी पानी होना",
    roman: "pānī pānī honā",
    literal: "to become water",
    meaningHi: "बहुत लज्जित होना",
    meaningEn: "to be deeply ashamed",
    exampleHi: "चोरी पकड़े जाने पर वह पानी पानी हो गया।",
    exampleEn: "He was mortified when the theft was discovered.",
    theme: "Behaviour",
    exam: "Class 9-10",
  },
  {
    idiom: "पीठ दिखाना",
    roman: "pīṭh dikhānā",
    literal: "to show one's back",
    meaningHi: "युद्ध या मुकाबले से भाग जाना",
    meaningEn: "to flee from a fight or contest",
    exampleHi: "दुश्मन सेना ने युद्ध में पीठ दिखा दी।",
    exampleEn: "The enemy army turned and fled the battle.",
    theme: "Defeat and fear",
    exam: "Class 9-10",
  },
  {
    idiom: "मुँह की खाना",
    roman: "mũh kī khānā",
    literal: "to eat with the face",
    meaningHi: "बुरी तरह हार जाना",
    meaningEn: "to suffer a humiliating defeat",
    exampleHi: "चुनाव में उन्हें मुँह की खानी पड़ी।",
    exampleEn: "They were soundly beaten in the election.",
    theme: "Defeat and fear",
    exam: "Competitive exams",
  },
  {
    idiom: "लोहे के चने चबाना",
    roman: "lohe ke cane cabānā",
    literal: "to chew iron grams",
    meaningHi: "बहुत कठिन काम करना",
    meaningEn: "to face an extremely tough job",
    exampleHi: "इस परीक्षा को पास करना लोहे के चने चबाने जैसा है।",
    exampleEn: "Clearing this exam is like chewing iron.",
    theme: "Effort and work",
    exam: "Competitive exams",
  },
  {
    idiom: "सिर पर पाँव रखकर भागना",
    roman: "sir par pā̃v rakhkar bhāgnā",
    literal: "to run with one's feet on one's head",
    meaningHi: "बहुत तेजी से भाग जाना",
    meaningEn: "to run away as fast as one possibly can",
    exampleHi: "शेर को देखते ही वह सिर पर पाँव रखकर भागा।",
    exampleEn: "He bolted the instant he saw the lion.",
    theme: "Defeat and fear",
    exam: "Class 9-10",
  },
  {
    idiom: "हाथ मलना",
    roman: "hāth malnā",
    literal: "to rub one's hands",
    meaningHi: "पछताना",
    meaningEn: "to regret a missed chance",
    exampleHi: "मौका गँवाकर अब हाथ मलने से क्या फायदा।",
    exampleEn: "What use is regret now that the chance is gone?",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "अपना उल्लू सीधा करना",
    roman: "apnā ullū sīdhā karnā",
    literal: "to straighten one's own owl",
    meaningHi: "स्वार्थ सिद्ध करना",
    meaningEn: "to serve one's own interest at others' cost",
    exampleHi: "वह मीठी बातें करके अपना उल्लू सीधा करता है।",
    exampleEn: "He sweet-talks people purely to serve himself.",
    theme: "Animals and birds",
    exam: "Competitive exams",
  },
  {
    idiom: "कमर कसना",
    roman: "kamar kasnā",
    literal: "to tighten the waistband",
    meaningHi: "तैयार हो जाना",
    meaningEn: "to gird oneself, to get fully prepared",
    exampleHi: "परीक्षा के लिए अब कमर कस लो।",
    exampleEn: "Get yourself properly prepared for the exam now.",
    theme: "Effort and work",
    exam: "Class 6-8",
  },
  {
    idiom: "गले का हार होना",
    roman: "gale kā hār honā",
    literal: "to be a garland round the neck",
    meaningHi: "बहुत प्रिय होना",
    meaningEn: "to be very dear to someone",
    exampleHi: "यह बच्चा दादी के गले का हार है।",
    exampleEn: "This child is his grandmother's treasure.",
    theme: "Body",
    exam: "Class 9-10",
  },
  {
    idiom: "दिन में तारे दिखाई देना",
    roman: "din mẽ tāre dikhāī denā",
    literal: "to see stars in daytime",
    meaningHi: "अत्यधिक कष्ट या घबराहट होना",
    meaningEn: "to be overwhelmed by pain or difficulty",
    exampleHi: "इतनी मेहनत से उसे दिन में तारे दिखाई देने लगे।",
    exampleEn: "The sheer workload left him reeling.",
    theme: "Nature and sky",
    exam: "Class 9-10",
  },
  {
    idiom: "नाक में दम करना",
    roman: "nāk mẽ dam karnā",
    literal: "to put life into someone's nose",
    meaningHi: "बहुत परेशान करना",
    meaningEn: "to harass someone thoroughly",
    exampleHi: "शरारती बच्चों ने अध्यापक की नाक में दम कर दिया।",
    exampleEn: "The mischievous children gave the teacher no peace.",
    theme: "Body",
    exam: "Class 6-8",
  },
  {
    idiom: "आग बबूला होना",
    roman: "āg babūlā honā",
    literal: "to become a whirl of fire",
    meaningHi: "अत्यंत क्रोधित होना",
    meaningEn: "to become furious",
    exampleHi: "सच सुनते ही वह आग बबूला हो गया।",
    exampleEn: "He flew into a rage the moment he heard the truth.",
    theme: "Behaviour",
    exam: "Class 9-10",
  },
  {
    idiom: "अंधे के हाथ बटेर लगना",
    roman: "andhe ke hāth baṭer lagnā",
    literal: "for a quail to fall into a blind man's hand",
    meaningHi: "बिना योग्यता के कीमती चीज़ मिल जाना",
    meaningEn: "to gain something valuable purely by luck",
    exampleHi: "बिना मेहनत नौकरी मिल गई, अंधे के हाथ बटेर लग गई।",
    exampleEn: "He landed the job without effort — sheer luck.",
    theme: "Animals and birds",
    exam: "Competitive exams",
  },
  {
    idiom: "थाली का बैंगन",
    roman: "thālī kā baiṅgan",
    literal: "a brinjal on a plate",
    meaningHi: "जिसका अपना कोई सिद्धांत न हो",
    meaningEn: "a person with no fixed opinion who shifts sides",
    exampleHi: "वह थाली का बैंगन है, कभी इधर कभी उधर।",
    exampleEn: "He is a fence-sitter — first on one side, then the other.",
    theme: "Behaviour",
    exam: "Competitive exams",
  },
];

/** Size of the collection. */
export const TOTAL_IDIOMS = IDIOMS.length;

/** Number of choices in a quiz question. */
export const QUIZ_OPTIONS = 4;

/** Anchor for the idiom-of-the-day rotation: day 1 is 1 January 2024 (UTC). */
export const ROTATION_ANCHOR = "2024-01-01";

/** Milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const MS_PER_DAY = 86400000;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse `YYYY-MM-DD` to a UTC timestamp; null if it is not a real date. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = ISO_DATE.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** 32-bit FNV-1a hash — turns any label into a numeric seed. */
export function hashSeed(text) {
  let hash = 0x811c9dc5;
  const value = String(text);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** mulberry32 — small deterministic PRNG returning values in [0, 1). */
export function makeRng(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Case-insensitive browse across script, transliteration and both meanings. */
export function filterIdioms({ theme = "All", exam = "All", query = "" } = {}) {
  const needle = String(query).trim().toLowerCase();
  return IDIOMS.map((entry, index) => ({ ...entry, index })).filter((entry) => {
    if (theme !== "All" && entry.theme !== theme) return false;
    if (exam !== "All" && entry.exam !== exam) return false;
    if (!needle) return true;
    return (
      entry.idiom.includes(needle) ||
      entry.roman.toLowerCase().includes(needle) ||
      entry.meaningEn.toLowerCase().includes(needle) ||
      entry.meaningHi.includes(needle) ||
      entry.literal.toLowerCase().includes(needle)
    );
  });
}

/** Deterministic idiom of the day for a calendar date. */
export function idiomOfTheDay(isoDate) {
  const start = parseIsoDate(ROTATION_ANCHOR);
  const target = parseIsoDate(isoDate);
  if (target === null) {
    return { error: "Enter a real calendar date in YYYY-MM-DD form." };
  }
  const offset = Math.round((target - start) / MS_PER_DAY);
  const index = ((offset % TOTAL_IDIOMS) + TOTAL_IDIOMS) % TOTAL_IDIOMS;
  return { date: isoDate.trim(), index, ...IDIOMS[index] };
}

/**
 * Build a four-option meaning question.
 * `index` selects the idiom (wrapped into range) and `round` re-seeds the
 * option order, so the same pair always produces the same question.
 */
export function buildQuiz({ index = 0, round = 0, theme = "All", exam = "All" } = {}) {
  const pool = filterIdioms({ theme, exam });
  if (pool.length < QUIZ_OPTIONS) {
    return { error: "Pick a wider filter — a quiz needs at least four idioms." };
  }
  if (!Number.isFinite(index) || !Number.isFinite(round)) {
    return { error: "Question number and round must be whole numbers." };
  }

  const position = ((Math.trunc(index) % pool.length) + pool.length) % pool.length;
  const entry = pool[position];
  const rng = makeRng(hashSeed(`${entry.idiom}:${Math.trunc(round)}`));

  const distractorPool = pool.filter((item) => item.idiom !== entry.idiom);
  for (let i = distractorPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = distractorPool[i];
    distractorPool[i] = distractorPool[j];
    distractorPool[j] = swap;
  }

  const options = [entry.meaningEn].concat(
    distractorPool.slice(0, QUIZ_OPTIONS - 1).map((item) => item.meaningEn),
  );
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = options[i];
    options[i] = options[j];
    options[j] = swap;
  }

  return {
    idiom: entry.idiom,
    roman: entry.roman,
    literal: entry.literal,
    meaningHi: entry.meaningHi,
    meaningEn: entry.meaningEn,
    exampleHi: entry.exampleHi,
    exampleEn: entry.exampleEn,
    theme: entry.theme,
    exam: entry.exam,
    options,
    answerIndex: options.indexOf(entry.meaningEn),
    position,
    poolSize: pool.length,
  };
}

/** Mark one quiz answer. */
export function checkQuiz({ selectedIndex, answerIndex } = {}) {
  if (!Number.isInteger(answerIndex) || answerIndex < 0) {
    return { error: "This question has no answer key." };
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0) {
    return { error: "Choose one of the four meanings first." };
  }
  return { correct: selectedIndex === answerIndex, answerIndex };
}

/** Quiz tally, guarding the divide-by-zero before the first answer. */
export function quizScore({ attempted = 0, correct = 0 } = {}) {
  const tried = Number(attempted);
  const right = Number(correct);
  if (!Number.isFinite(tried) || !Number.isFinite(right) || tried < 0 || right < 0) {
    return { error: "Scores must be zero or a positive whole number." };
  }
  if (right > tried) {
    return { error: "Correct answers cannot exceed the number attempted." };
  }
  if (tried === 0) {
    return { attempted: 0, correct: 0, wrong: 0, accuracyPct: 0 };
  }
  return {
    attempted: tried,
    correct: right,
    wrong: tried - right,
    accuracyPct: Math.round((right / tried) * 100),
  };
}

/** How many idioms sit in each theme — used for the browse summary. */
export function countsByTheme() {
  const counts = {};
  for (const theme of THEMES) counts[theme] = 0;
  for (const entry of IDIOMS) {
    counts[entry.theme] = (counts[entry.theme] || 0) + 1;
  }
  return counts;
}

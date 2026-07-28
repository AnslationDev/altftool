/**
 * British <-> American spelling conversion.
 *
 * Two layers, applied in this order for every alphabetic token:
 *   1. A curated word map (explicit pairs + mechanically generated inflections).
 *   2. Three productive suffix rules that Fowler / Oxford and the Chicago Manual
 *      both describe as regular:
 *        -our / -or      (colour -> color)          restricted to a closed root list
 *        -ise / -ize     (organise -> organize)     with a closed exception list
 *        -yse / -yze     (analyse -> analyze)
 *        -re  / -er      handled through the word map, because the inflections
 *                        are irregular (centre -> centring, center -> centering)
 *
 * Nothing here guesses. A token is only rewritten when it is in the map or when
 * it matches a rule whose root/exception lists were written out by hand, so an
 * unknown word is always left exactly as typed.
 */

export const TARGETS = ["american", "british"];

/* ------------------------------------------------------------------ */
/* Rule 1: -our / -or                                                  */
/* ------------------------------------------------------------------ */

/**
 * Stems that take -our in British English. The rule is only applied when the
 * whole token is root + our/or + one of OUR_TAILS, which keeps "colorectal",
 * "honorary", "humorous" and "laboratory" (identical in both varieties)
 * untouched.
 */
export const OUR_ROOTS = [
  "misdemean",
  "demean",
  "behavi",
  "endeav",
  "splend",
  "neighb",
  "savi",
  "ranc",
  "succ",
  "parl",
  "flav",
  "harb",
  "cand",
  "clam",
  "ferv",
  "arb",
  "ard",
  "arm",
  "col",
  "fav",
  "hon",
  "hum",
  "lab",
  "od",
  "rum",
  "sav",
  "tum",
  "val",
  "vap",
  "vig",
];

/** Suffixes that may follow the -our/-or slot. Deliberately closed. */
export const OUR_TAILS = [
  "lessly",
  "fully",
  "itism",
  "hoods",
  "ites",
  "less",
  "ably",
  "able",
  "hood",
  "ally",
  "iest",
  "ings",
  "ers",
  "ies",
  "ier",
  "ful",
  "ing",
  "ite",
  "al",
  "ed",
  "er",
  "ly",
  "es",
  "s",
  "y",
];

const OUR_TAIL_GROUP = `(?:${OUR_TAILS.join("|")})?`;
const OUR_ROOT_GROUP = `(?:${OUR_ROOTS.join("|")})`;
const BRITISH_OUR_RE = new RegExp(`^(${OUR_ROOT_GROUP})our${OUR_TAIL_GROUP}$`);
const AMERICAN_OR_RE = new RegExp(`^(${OUR_ROOT_GROUP})or${OUR_TAIL_GROUP}$`);

/* ------------------------------------------------------------------ */
/* Rule 2: -ise / -ize  and  Rule 3: -yse / -yze                       */
/* ------------------------------------------------------------------ */

const ISE_RE = /^(.{2,})is(e|es|ed|ing|ingly|er|ers|ation|ations|able|ability)$/;
const IZE_RE = /^(.{2,})iz(e|es|ed|ing|ingly|er|ers|ation|ations|able|ability)$/;
const YSE_RE = /^(.{3,})ys(e|es|ed|ing|er|ers|able)$/;
const YZE_RE = /^(.{3,})yz(e|es|ed|ing|er|ers|able)$/;

/**
 * Words whose "-ise" is part of the stem, not the verb-forming suffix. These
 * are spelled with s in American English too, so they must never be rewritten.
 */
export const ISE_STEM_WORDS = [
  "advertise",
  "advise",
  "apprise",
  "appraise",
  "arise",
  "braise",
  "chastise",
  "circumcise",
  "comprise",
  "compromise",
  "concise",
  "cruise",
  "demise",
  "despise",
  "devise",
  "disguise",
  "enterprise",
  "excise",
  "exercise",
  "expertise",
  "franchise",
  "guise",
  "improvise",
  "incise",
  "liaise",
  "malaise",
  "mayonnaise",
  "merchandise",
  "mortise",
  "noise",
  "paradise",
  "poise",
  "porpoise",
  "praise",
  "precise",
  "premise",
  "prise",
  "promise",
  "raise",
  "reprise",
  "revise",
  "supervise",
  "surmise",
  "surprise",
  "sunrise",
  "televise",
  "tortoise",
  "treatise",
  "turquoise",
  "valise",
  "chemise",
  "anise",
];

/** Words that end in -ize/-yze in both varieties. */
export const IZE_STEM_WORDS = [
  "assize",
  "baize",
  "capsize",
  "downsize",
  "maize",
  "midsize",
  "outsize",
  "oversize",
  "prize",
  "resize",
  "seize",
  "sizeable",
  "sizable",
  "supersize",
  "upsize",
  "geyser",
];

function expandStemExceptions(list) {
  const out = new Set();
  for (const base of list) {
    out.add(base);
    out.add(`${base}s`);
    out.add(`${base}d`);
    out.add(`${base}r`);
    out.add(`${base}rs`);
    out.add(`${base}ment`);
    out.add(`${base}ments`);
    out.add(`${base}ly`);
    if (base.endsWith("e")) {
      const stem = base.slice(0, -1);
      out.add(`${stem}ing`);
      out.add(`${stem}ingly`);
      out.add(`${stem}er`);
      out.add(`${stem}ers`);
      out.add(`${stem}es`);
      out.add(`${stem}ed`);
      out.add(`${stem}able`);
    }
  }
  return out;
}

const ISE_EXCEPTIONS = expandStemExceptions(ISE_STEM_WORDS);
const IZE_EXCEPTIONS = expandStemExceptions(IZE_STEM_WORDS);

/* ------------------------------------------------------------------ */
/* Word map groups                                                     */
/* ------------------------------------------------------------------ */

/**
 * -re (British) / -er (American). Inflections are generated because they are
 * not symmetrical: centre + ing drops the e (centring) while center keeps it
 * (centering).
 */
export const RE_ER_PAIRS = [
  ["centre", "center"],
  ["fibre", "fiber"],
  ["litre", "liter"],
  ["metre", "meter", { reverse: false }],
  ["theatre", "theater"],
  ["amphitheatre", "amphitheater"],
  ["epicentre", "epicenter"],
  ["calibre", "caliber"],
  ["sabre", "saber"],
  ["sombre", "somber"],
  ["spectre", "specter"],
  ["lustre", "luster"],
  ["meagre", "meager"],
  ["mitre", "miter"],
  ["nitre", "niter"],
  ["ochre", "ocher"],
  ["sceptre", "scepter"],
  ["goitre", "goiter"],
  ["louvre", "louver"],
  ["philtre", "philter"],
  ["saltpetre", "saltpeter"],
  ["sepulchre", "sepulcher"],
  ["reconnoitre", "reconnoiter"],
  ["accoutre", "accouter"],
  ["manoeuvre", "maneuver"],
  ["kilometre", "kilometer"],
  ["centimetre", "centimeter"],
  ["millimetre", "millimeter"],
  ["micrometre", "micrometer"],
  ["nanometre", "nanometer"],
  ["millilitre", "milliliter"],
  ["centilitre", "centiliter"],
  ["decilitre", "deciliter"],
];

/**
 * British doubles a final -l before a vowel-initial suffix whatever the stress
 * (travelled); American doubles only when the final syllable is stressed
 * (controlled stays controlled). Stress cannot be derived from spelling, so
 * only these hand-checked unstressed-final stems are used.
 */
export const L_DOUBLING_STEMS = [
  "barrel",
  "bevel",
  "cancel",
  "channel",
  "chisel",
  "counsel",
  "cudgel",
  "dial",
  "dishevel",
  "drivel",
  "duel",
  "enamel",
  "equal",
  "fuel",
  "funnel",
  "gambol",
  "grovel",
  "imperil",
  "initial",
  "jewel",
  "kennel",
  "label",
  "level",
  "libel",
  "marshal",
  "marvel",
  "model",
  "panel",
  "parcel",
  "pedal",
  "pencil",
  "pummel",
  "quarrel",
  "ravel",
  "refuel",
  "revel",
  "rival",
  "shovel",
  "shrivel",
  "signal",
  "snorkel",
  "spiral",
  "stencil",
  "swivel",
  "tassel",
  "tinsel",
  "total",
  "travel",
  "trowel",
  "tunnel",
  "unravel",
  "weasel",
  "yodel",
];

const L_DOUBLING_TAILS = [
  ["led", "ed"],
  ["ling", "ing"],
  ["ler", "er"],
  ["lers", "ers"],
  ["lings", "ings"],
  ["lous", "ous"],
  ["lously", "ously"],
  ["lor", "or"],
  ["lors", "ors"],
];

/** British keeps a single -l where American doubles it. */
export const SINGLE_L_PAIRS = [
  ["enrol", "enroll"],
  ["enrols", "enrolls"],
  ["enrolment", "enrollment"],
  ["enrolments", "enrollments"],
  ["fulfil", "fulfill"],
  ["fulfils", "fulfills"],
  ["fulfilment", "fulfillment"],
  ["fulfilments", "fulfillments"],
  ["instalment", "installment"],
  ["instalments", "installments"],
  ["instil", "instill"],
  ["instils", "instills"],
  ["distil", "distill"],
  ["distils", "distills"],
  ["appal", "appall"],
  ["appals", "appalls"],
  ["enthral", "enthrall"],
  ["enthrals", "enthralls"],
  ["skilful", "skillful"],
  ["skilfully", "skillfully"],
  ["wilful", "willful"],
  ["wilfully", "willfully"],
];

/** ae / oe digraphs kept in British English, simplified to e in American. */
export const AE_OE_PAIRS = [
  ["anaemia", "anemia"],
  ["anaemic", "anemic"],
  ["anaesthesia", "anesthesia"],
  ["anaesthetic", "anesthetic"],
  ["anaesthetics", "anesthetics"],
  ["anaesthetist", "anesthetist"],
  ["caesarean", "cesarean"],
  ["coeliac", "celiac"],
  ["diarrhoea", "diarrhea"],
  ["encyclopaedia", "encyclopedia"],
  ["encyclopaedias", "encyclopedias"],
  ["faeces", "feces"],
  ["faecal", "fecal"],
  ["foetus", "fetus"],
  ["foetal", "fetal"],
  ["gynaecology", "gynecology"],
  ["gynaecologist", "gynecologist"],
  ["haemoglobin", "hemoglobin"],
  ["haemorrhage", "hemorrhage"],
  ["haemorrhoids", "hemorrhoids"],
  ["haematology", "hematology"],
  ["homoeopathy", "homeopathy"],
  ["leukaemia", "leukemia"],
  ["mediaeval", "medieval"],
  ["oedema", "edema"],
  ["oesophagus", "esophagus"],
  ["oestrogen", "estrogen"],
  ["orthopaedic", "orthopedic"],
  ["orthopaedics", "orthopedics"],
  ["paediatric", "pediatric"],
  ["paediatrics", "pediatrics"],
  ["paediatrician", "pediatrician"],
  ["palaeontology", "paleontology"],
];

/** Everything else: -ce/-se, -ogue/-og and one-off spellings. */
export const MISC_PAIRS = [
  ["defence", "defense"],
  ["defences", "defenses"],
  ["defenceless", "defenseless"],
  ["offence", "offense"],
  ["offences", "offenses"],
  ["pretence", "pretense"],
  ["pretences", "pretenses"],
  ["licence", "license", { reverse: false }],
  ["licences", "licenses", { reverse: false }],
  ["practise", "practice", { reverse: false }],
  ["practises", "practices", { reverse: false }],
  ["practised", "practiced", { reverse: false }],
  ["practising", "practicing", { reverse: false }],
  ["catalogue", "catalog"],
  ["catalogues", "catalogs"],
  ["catalogued", "cataloged"],
  ["dialogue", "dialog"],
  ["dialogues", "dialogs"],
  ["analogue", "analog"],
  ["analogues", "analogs"],
  ["aeroplane", "airplane"],
  ["aeroplanes", "airplanes"],
  ["aluminium", "aluminum"],
  ["behove", "behoove"],
  ["chilli", "chili"],
  ["cosy", "cozy"],
  ["cosier", "cozier"],
  ["grey", "gray"],
  ["greyish", "grayish"],
  ["jewellery", "jewelry"],
  ["moustache", "mustache"],
  ["moustaches", "mustaches"],
  ["mould", "mold"],
  ["moulds", "molds"],
  ["moulded", "molded"],
  ["moulding", "molding"],
  ["moult", "molt"],
  ["moulting", "molting"],
  ["plough", "plow"],
  ["ploughs", "plows"],
  ["ploughed", "plowed"],
  ["ploughing", "plowing"],
  ["pyjamas", "pajamas"],
  ["sceptic", "skeptic"],
  ["sceptics", "skeptics"],
  ["sceptical", "skeptical"],
  ["scepticism", "skepticism"],
  ["speciality", "specialty"],
  ["specialities", "specialties"],
  ["sulphur", "sulfur"],
  ["sulphide", "sulfide"],
  ["sulphate", "sulfate"],
  ["artefact", "artifact"],
  ["artefacts", "artifacts"],
  ["manoeuvrable", "maneuverable"],
  ["fibreglass", "fiberglass"],
  ["centrepiece", "centerpiece"],
  ["centrepieces", "centerpieces"],
  ["theatregoer", "theatergoer"],
  ["colourist", "colorist"],
  ["colourists", "colorists"],
  ["behaviourist", "behaviorist"],
  ["behaviourists", "behaviorists"],
  ["woollen", "woolen"],
  ["cheque", "check", { reverse: false }],
  ["cheques", "checks", { reverse: false }],
  ["draught", "draft", { reverse: false }],
  ["draughts", "drafts", { reverse: false }],
  ["gaol", "jail", { reverse: false }],
  ["kerb", "curb", { reverse: false }],
  ["kerbs", "curbs", { reverse: false }],
  ["programme", "program", { reverse: false }],
  ["programmes", "programs", { reverse: false }],
  ["storey", "story", { reverse: false }],
  ["tyre", "tire", { reverse: false }],
  ["tyres", "tires", { reverse: false }],
];

/**
 * Vocabulary rather than spelling. Off by default and one-way only, because
 * the American word is usually ambiguous in reverse ("fall", "hood", "line").
 */
export const VOCABULARY_PAIRS = [
  ["lift", "elevator", { reverse: false }],
  ["lorry", "truck", { reverse: false }],
  ["lorries", "trucks", { reverse: false }],
  ["flat", "apartment", { reverse: false }],
  ["biscuit", "cookie", { reverse: false }],
  ["biscuits", "cookies", { reverse: false }],
  ["bonnet", "hood", { reverse: false }],
  ["boot", "trunk", { reverse: false }],
  ["petrol", "gasoline", { reverse: false }],
  ["pavement", "sidewalk", { reverse: false }],
  ["rubbish", "trash", { reverse: false }],
  ["holiday", "vacation", { reverse: false }],
  ["torch", "flashlight", { reverse: false }],
  ["jumper", "sweater", { reverse: false }],
  ["nappy", "diaper", { reverse: false }],
  ["nappies", "diapers", { reverse: false }],
  ["autumn", "fall", { reverse: false }],
  ["motorway", "highway", { reverse: false }],
  ["aubergine", "eggplant", { reverse: false }],
  ["courgette", "zucchini", { reverse: false }],
  ["coriander", "cilantro", { reverse: false }],
  ["timetable", "schedule", { reverse: false }],
  ["maths", "math", { reverse: false }],
];

/* ------------------------------------------------------------------ */
/* Map construction                                                    */
/* ------------------------------------------------------------------ */

function addPair(map, from, to, rule) {
  if (from === to) return;
  if (!map.has(from)) map.set(from, { to, rule });
}

function expandReEr(pair) {
  const [bre, ame, opts] = pair;
  const breStem = bre.slice(0, -1); // centre -> centr
  return {
    opts: opts || {},
    forms: [
      [bre, ame],
      [`${bre}s`, `${ame}s`],
      [`${bre}d`, `${ame}ed`],
      [`${breStem}ing`, `${ame}ing`],
    ],
  };
}

function expandLDoubling(stem) {
  return L_DOUBLING_TAILS.map(([brTail, amTail]) => [`${stem}${brTail}`, `${stem}${amTail}`]);
}

/**
 * Build the lookup used for one direction.
 * @param {"american"|"british"} target
 * @param {boolean} includeVocabulary
 */
export function buildDictionary(target, includeVocabulary = false) {
  const toAmerican = target === "american";
  const map = new Map();

  const push = (bre, ame, rule, opts = {}) => {
    if (toAmerican) addPair(map, bre, ame, rule);
    else if (opts.reverse !== false) addPair(map, ame, bre, rule);
  };

  for (const pair of RE_ER_PAIRS) {
    const { opts, forms } = expandReEr(pair);
    for (const [bre, ame] of forms) push(bre, ame, "-re / -er", opts);
  }

  for (const stem of L_DOUBLING_STEMS) {
    for (const [bre, ame] of expandLDoubling(stem)) push(bre, ame, "double -l", {});
  }

  for (const [bre, ame] of SINGLE_L_PAIRS) push(bre, ame, "single -l", {});
  for (const [bre, ame] of AE_OE_PAIRS) push(bre, ame, "ae / oe digraph", {});
  for (const [bre, ame, opts] of MISC_PAIRS) push(bre, ame, "word list", opts || {});

  // Special cases the generators cannot produce.
  push("jeweller", "jeweler", "double -l", {});
  push("jewellers", "jewelers", "double -l", {});
  push("councillor", "councilor", "double -l", {});
  push("councillors", "councilors", "double -l", {});
  push("counsellor", "counselor", "double -l", {});
  push("counsellors", "counselors", "double -l", {});

  if (includeVocabulary) {
    for (const [bre, ame, opts] of VOCABULARY_PAIRS) push(bre, ame, "vocabulary", opts || {});
  }

  return map;
}

/* ------------------------------------------------------------------ */
/* Token level conversion                                              */
/* ------------------------------------------------------------------ */

function applySuffixRules(word, target) {
  if (target === "american") {
    const our = BRITISH_OUR_RE.exec(word);
    if (our) return { word: `${our[1]}or${word.slice(our[1].length + 3)}`, rule: "-our / -or" };

    if (!word.endsWith("wise") && !ISE_EXCEPTIONS.has(word)) {
      const ise = ISE_RE.exec(word);
      if (ise) return { word: `${ise[1]}iz${ise[2]}`, rule: "-ise / -ize" };
    }
    if (!IZE_EXCEPTIONS.has(word)) {
      const yse = YSE_RE.exec(word);
      if (yse) return { word: `${yse[1]}yz${yse[2]}`, rule: "-yse / -yze" };
    }
    return null;
  }

  const or = AMERICAN_OR_RE.exec(word);
  if (or) return { word: `${or[1]}our${word.slice(or[1].length + 2)}`, rule: "-or / -our" };

  if (!IZE_EXCEPTIONS.has(word)) {
    const ize = IZE_RE.exec(word);
    if (ize) return { word: `${ize[1]}is${ize[2]}`, rule: "-ize / -ise" };
    const yze = YZE_RE.exec(word);
    if (yze) return { word: `${yze[1]}ys${yze[2]}`, rule: "-yze / -yse" };
  }
  return null;
}

/** Copy the capitalisation of `original` onto `replacement`. */
export function matchCase(original, replacement) {
  if (original.length > 1 && original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/** Maximum characters accepted in one pass, to keep the UI responsive. */
export const MAX_INPUT_CHARS = 200000;

/**
 * Convert text between British and American spelling.
 *
 * @param {object} input
 * @param {string} input.text
 * @param {"american"|"british"} [input.target="american"]
 * @param {boolean} [input.includeVocabulary=false]
 * @param {boolean} [input.useSuffixRules=true]
 * @returns {{output:string,changeCount:number,wordCount:number,changes:Array,dictionarySize:number}|{error:string}}
 */
export function convertSpelling({
  text,
  target = "american",
  includeVocabulary = false,
  useSuffixRules = true,
} = {}) {
  if (typeof text !== "string") return { error: "Enter some text to convert." };
  if (!TARGETS.includes(target)) return { error: "Choose either British or American as the target." };

  const trimmed = text.trim();
  if (!trimmed) return { error: "Paste or type some text to convert." };
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `Text is ${text.length.toLocaleString("en-IN")} characters. Convert up to ${MAX_INPUT_CHARS.toLocaleString("en-IN")} at a time.`,
    };
  }

  const dictionary = buildDictionary(target, includeVocabulary);
  const tally = new Map();
  let wordCount = 0;
  let changeCount = 0;

  const output = text.replace(/[A-Za-z]+/g, (token) => {
    wordCount += 1;
    const lower = token.toLowerCase();

    let hit = dictionary.get(lower);
    if (!hit && useSuffixRules) {
      const ruled = applySuffixRules(lower, target);
      if (ruled) hit = { to: ruled.word, rule: ruled.rule };
    }
    if (!hit || hit.to === lower) return token;

    changeCount += 1;
    const key = `${lower}\0${hit.to}`;
    const seen = tally.get(key);
    if (seen) seen.count += 1;
    else tally.set(key, { from: lower, to: hit.to, rule: hit.rule, count: 1 });

    return matchCase(token, hit.to);
  });

  const changes = [...tally.values()].sort((a, b) => b.count - a.count || a.from.localeCompare(b.from));

  return {
    output,
    changeCount,
    wordCount,
    changes,
    dictionarySize: dictionary.size,
  };
}

/** Convenience wrapper: how many spellings differ, without building the text. */
export function countDifferences(input) {
  const result = convertSpelling(input);
  if (result.error) return result;
  return { changeCount: result.changeCount, distinct: result.changes.length };
}

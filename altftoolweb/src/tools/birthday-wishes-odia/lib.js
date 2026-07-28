/**
 * Odia birthday wishes generator — pure text composition, no I/O.
 *
 * Odia (ଓଡ଼ିଆ) is the classical language of Odisha, written in its own Brahmic
 * script occupying Unicode block U+0B00–U+0B7F. Many people type Odia on phones
 * in Roman letters instead, so every message is stored as a matched
 * Odia / Roman transliteration pair that carries the same meaning.
 *
 * Selection is deterministic: `variantSeed` rotates the pool from
 * `variantSeed % poolLength`. Same input, same output.
 */

/** Longest name we echo back into a message, to keep output readable. */
export const MAX_NAME_LENGTH = 40;
/** Every tone pool holds exactly this many wordings. */
export const MAX_WISHES = 4;
/** Oldest verified human age is 122 (Jeanne Calment, 1997); 130 is a generous ceiling. */
export const MAX_AGE_YEARS = 130;

export const SCRIPTS = [
  { id: "odia", label: "Odia script (ଓଡ଼ିଆ)", lang: "or" },
  { id: "roman", label: "Roman / Odia in English letters", lang: "or-Latn" },
];

export const TONES = [
  { id: "warm", label: "Warm & affectionate" },
  { id: "blessing", label: "Blessing (Jagannath / Ishwara)" },
  { id: "funny", label: "Funny & teasing" },
  { id: "formal", label: "Formal & respectful" },
  { id: "short", label: "Short (status / WhatsApp)" },
];

/**
 * Relationship decides the form of address. `useName` is false for parents,
 * whom Odia speakers address as maa / bapa rather than by first name.
 */
export const RELATIONS = [
  { id: "friend", label: "Friend", odia: "ମୋ ପ୍ରିୟ ବନ୍ଧୁ", roman: "Mo priya bandhu", useName: true },
  { id: "brother", label: "Brother", odia: "ମୋ ଭାଇ", roman: "Mo bhai", useName: true },
  { id: "sister", label: "Sister", odia: "ମୋ ଭଉଣୀ", roman: "Mo bhauni", useName: true },
  { id: "mother", label: "Mother", odia: "ପ୍ରିୟ ମା", roman: "Priya maa", useName: false },
  { id: "father", label: "Father", odia: "ପ୍ରିୟ ବାପା", roman: "Priya bapa", useName: false },
  { id: "son", label: "Son", odia: "ମୋ ପ୍ରିୟ ପୁଅ", roman: "Mo priya pua", useName: true },
  { id: "daughter", label: "Daughter", odia: "ମୋ ପ୍ରିୟ ଝିଅ", roman: "Mo priya jhia", useName: true },
  { id: "spouse", label: "Husband / wife", odia: "ମୋ ଜୀବନସାଥୀ", roman: "Mo jibanasathi", useName: true },
  { id: "colleague", label: "Colleague", odia: "ପ୍ରିୟ", roman: "Priya", useName: true },
  { id: "elder", label: "Elder / respected person", odia: "ଶ୍ରଦ୍ଧେୟ", roman: "Shraddheya", useName: true },
];

/** `{who}` is replaced by the composed form of address. */
export const MESSAGES = {
  warm: [
    {
      odia: "{who}, ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ଈଶ୍ୱର ତୁମକୁ ଦୀର୍ଘାୟୁ, ସୁସ୍ଥ ଶରୀର ଓ ଅସୀମ ଆନନ୍ଦ ଦିଅନ୍ତୁ।",
      roman:
        "{who}, janmadinara hardika shubhechha! Ishwara tumaku dirghayu, susthya sharira o asima ananda diantu.",
    },
    {
      odia: "{who}, ଆଜିର ଦିନଟି ତୁମ ପାଇଁ ବିଶେଷ ଓ ଆମ ପାଇଁ ମଧ୍ୟ। ଶୁଭ ଜନ୍ମଦିନ — ତୁମର ସବୁ ସ୍ୱପ୍ନ ପୂରଣ ହେଉ।",
      roman:
        "{who}, aajira dinati tuma pain bishesha o aama pain madhya. Subha janmadina — tumara sabu swapna purana heu.",
    },
    {
      odia: "{who}, ତୁମର ହସ ଆମ ଘରର ଆଲୁଅ। ଶୁଭ ଜନ୍ମଦିନ — ସବୁବେଳେ ଏମିତି ହସୁଥାଅ।",
      roman: "{who}, tumara hasa aama gharara alua. Subha janmadina — sabubele emiti hasuthaa.",
    },
    {
      odia: "{who}, ତୁମେ ଆମକୁ ଯେତେ ଖୁସି ଦିଅ, ତାହାର ଦୁଇଗୁଣ ତୁମକୁ ମିଳୁ। ଶୁଭ ଜନ୍ମଦିନ!",
      roman: "{who}, tume aamaku jete khusi dia, tahara duiguna tumaku milu. Subha janmadina!",
    },
  ],
  blessing: [
    {
      odia: "{who}, ମହାପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ ତୁମ ଉପରେ ସର୍ବଦା କୃପା ରଖନ୍ତୁ। ଜନ୍ମଦିନର ଶୁଭେଚ୍ଛା।",
      roman:
        "{who}, Mahaprabhu Sri Jagannatha tuma upare sarbada krupa rakhantu. Janmadinara shubhechha.",
    },
    {
      odia: "{who}, ଈଶ୍ୱର ତୁମକୁ ସୁସ୍ଥତା, ଶାନ୍ତି ଓ ସଫଳତା ପ୍ରଦାନ କରନ୍ତୁ। ଶୁଭ ଜନ୍ମଦିନ।",
      roman: "{who}, Ishwara tumaku susthata, shanti o saphalata pradana karantu. Subha janmadina.",
    },
    {
      odia: "{who}, ପ୍ରାର୍ଥନା କରୁଛି ତୁମର ପ୍ରତ୍ୟେକ ଦିନ ସୁଖ ଓ ମଙ୍ଗଳରେ ଭରି ରହୁ। ଜନ୍ମଦିନର ଶୁଭେଚ୍ଛା।",
      roman:
        "{who}, prarthana karuchhi tumara pratyeka dina sukha o mangalare bhari rahu. Janmadinara shubhechha.",
    },
    {
      odia: "{who}, ଈଶ୍ୱରଙ୍କ ଆଶୀର୍ବାଦ ତୁମ ସହିତ ରହୁ ଏବଂ ତୁମେ ଶତାୟୁ ହୁଅ। ଶୁଭ ଜନ୍ମଦିନ।",
      roman:
        "{who}, Ishwaranka ashirbada tuma sahita rahu ebam tume shatayu hua. Subha janmadina.",
    },
  ],
  funny: [
    {
      odia: "{who}, ଆଉ ଏକ ବର୍ଷ ବଡ଼ ହେଲ, ମାତ୍ର ଜ୍ଞାନ ସେହିପରି! ଶୁଭ ଜନ୍ମଦିନ — କେକର ବଡ଼ ଅଂଶ ମୋର।",
      roman:
        "{who}, aau eka barsha bada hela, matra gyana sehipari! Subha janmadina — kekara bada ansha mora.",
    },
    {
      odia: "{who}, ଶୁଭ ଜନ୍ମଦିନ! ମହମବତୀ ଆଉ କେକ ଉପରେ ଧରୁନାହିଁ, ଏଥର ଗୋଟିଏ ହିଁ ଜାଳ।",
      roman:
        "{who}, subha janmadina! Mahamabati aau keka upare dharunahin, ethara gotie hin jala.",
    },
    {
      odia: "{who}, ପାର୍ଟି କେଉଁଠି? ଜନ୍ମଦିନର ଶୁଭେଚ୍ଛା, ମାତ୍ର ବନ୍ଧୁତ୍ୱ ରହିବ ଯଦି ଖାଇବା ଭଲ ହେବ।",
      roman:
        "{who}, party keunthi? Janmadinara shubhechha, matra bandhutwa rahiba jadi khaiba bhala heba.",
    },
    {
      odia: "{who}, ବୟସ କେବଳ ଏକ ସଂଖ୍ୟା — ମାତ୍ର ତୁମର ସଂଖ୍ୟା ବର୍ତ୍ତମାନ ଟିକେ ବଡ଼। ଶୁଭ ଜନ୍ମଦିନ!",
      roman:
        "{who}, bayasa kebala eka sankhya — matra tumara sankhya barttamana tike bada. Subha janmadina!",
    },
  ],
  formal: [
    {
      odia: "{who}, ଆପଣଙ୍କ ଜନ୍ମଦିନ ଅବସରରେ ହାର୍ଦ୍ଦିକ ଅଭିନନ୍ଦନ। ଆପଣଙ୍କ ସୁସ୍ଥତା ଓ ସଫଳତା କାମନା କରୁଛୁ।",
      roman:
        "{who}, apananka janmadina abasarare hardika abhinandana. Apananka susthata o saphalata kamana karuchhu.",
    },
    {
      odia: "{who}, ଶୁଭ ଜନ୍ମଦିନ। ଆଗାମୀ ବର୍ଷ ଆପଣଙ୍କ ପାଇଁ ଉନ୍ନତି ଓ ନୂଆ ସୁଯୋଗ ନେଇ ଆସୁ।",
      roman:
        "{who}, subha janmadina. Aagami barsha apananka pain unnati o nua suyoga nei aasu.",
    },
    {
      odia: "{who}, ଆମ ସମସ୍ତ ପରିବାର ପକ୍ଷରୁ ଜନ୍ମଦିନର ଶୁଭକାମନା। ସୁସ୍ଥ ରୁହନ୍ତୁ, ଆନନ୍ଦରେ ରୁହନ୍ତୁ।",
      roman:
        "{who}, aama samasta paribara pakharu janmadinara subhakamana. Susthya ruhantu, anandare ruhantu.",
    },
    {
      odia: "{who}, ଆପଣଙ୍କ ପରିଶ୍ରମ ଓ ସରଳତା ଆମ ସମସ୍ତଙ୍କ ପାଇଁ ଆଦର୍ଶ। ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା।",
      roman:
        "{who}, apananka parishrama o saralata aama samastanka pain adarsha. Janmadinara hardika shubhechha.",
    },
  ],
  short: [
    { odia: "{who}, ଶୁଭ ଜନ୍ମଦିନ! ଆନନ୍ଦରେ ରୁହ।", roman: "{who}, subha janmadina! Anandare ruha." },
    {
      odia: "{who}, ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା!",
      roman: "{who}, janmadinara hardika shubhechha!",
    },
    {
      odia: "{who}, ଶୁଭ ଜନ୍ମଦିନ — ସୁସ୍ଥ ଓ ସୁଖୀ ରୁହ।",
      roman: "{who}, subha janmadina — susthya o sukhi ruha.",
    },
    { odia: "{who}, ଶତାୟୁ ହୁଅ! ଶୁଭ ଜନ୍ମଦିନ।", roman: "{who}, shatayu hua! Subha janmadina." },
  ],
};

/** Optional extra sentence naming the age reached. */
export const AGE_LINE = {
  odia: "ଜୀବନର {age} ବର୍ଷ ପୂର୍ଣ୍ଣ ହେବାର ଶୁଭେଚ୍ଛା!",
  roman: "Jibanara {age} barsha purna hebara shubhechha!",
};

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

/** Build the form of address, e.g. "ମୋ ଭାଇ ସୁଶାନ୍ତ" / "Mo bhai Sushanta". */
export function buildAddress(relation, name, script) {
  const prefix = script === "roman" ? relation.roman : relation.odia;
  const parts = [];
  if (prefix) parts.push(prefix);
  if (relation.useName && name) parts.push(name);
  const joined = parts.join(" ").trim();
  return joined || name || "";
}

/**
 * Generate Odia birthday wishes.
 *
 * @param {object} input
 * @param {string} input.name        Birthday person's name.
 * @param {string} input.relation    One of RELATIONS[].id
 * @param {string} input.tone        One of TONES[].id
 * @param {string} input.script      "odia" | "roman"
 * @param {number} input.count       How many wishes (1..MAX_WISHES)
 * @param {number|string} input.ageYears  Optional age turned; "" to omit
 * @param {number} input.variantSeed Deterministic rotation offset
 * @returns {{wishes:Array<{id:string,text:string}>, address:string, lang:string, poolSize:number, tone:string, script:string}|{error:string}}
 */
export function generateWishes({
  name = "",
  relation = "friend",
  tone = "warm",
  script = "odia",
  count = 3,
  ageYears = "",
  variantSeed = 0,
} = {}) {
  const cleanName = String(name).replace(/\s+/g, " ").trim();
  const relationDef = findById(RELATIONS, relation);
  const toneDef = findById(TONES, tone);
  const scriptDef = findById(SCRIPTS, script);

  if (!relationDef) return { error: "Choose a relationship from the list." };
  if (!toneDef) return { error: "Choose a tone from the list." };
  if (!scriptDef) return { error: "Choose Odia script or Roman letters." };
  if (relationDef.useName && !cleanName) {
    return { error: "Enter the birthday person's name." };
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one wish." };
  }
  if (wanted > MAX_WISHES) {
    return { error: `You can generate at most ${MAX_WISHES} wishes at a time.` };
  }

  let ageText = "";
  const rawAge = String(ageYears ?? "").trim();
  if (rawAge !== "") {
    const age = Number(rawAge);
    if (!Number.isFinite(age) || !Number.isInteger(age)) {
      return { error: "Age must be a whole number of years, or leave it blank." };
    }
    if (age < 1 || age > MAX_AGE_YEARS) {
      return { error: `Age should be between 1 and ${MAX_AGE_YEARS} years.` };
    }
    ageText = AGE_LINE[script].replace("{age}", String(age));
  }

  const pool = MESSAGES[tone];
  const address = buildAddress(relationDef, cleanName, script);
  const seed = Number.isFinite(Number(variantSeed))
    ? Math.abs(Math.trunc(Number(variantSeed)))
    : 0;
  const total = Math.min(Math.trunc(wanted), pool.length);

  const wishes = [];
  for (let i = 0; i < total; i += 1) {
    const index = (seed + i) % pool.length;
    let text = pool[index][script].replace("{who}", address);
    if (ageText) text = `${text} ${ageText}`;
    wishes.push({ id: `${tone}-${script}-${index}`, text });
  }

  return {
    wishes,
    address,
    lang: scriptDef.lang,
    poolSize: pool.length,
    tone,
    script,
  };
}

/**
 * Punjabi birthday wishes generator — pure text composition, no I/O.
 *
 * Punjabi is written in two scripts in everyday use:
 *   - Gurmukhi (ਗੁਰਮੁਖੀ), the official script of Punjabi in India (Unicode block U+0A00–U+0A7F).
 *   - Roman/Latin transliteration, which is how most people type Punjabi on phones.
 * Every message below is stored once per script so the two versions say the same thing.
 *
 * Selection is deterministic: the caller passes a `variantSeed` integer and the
 * generator rotates through the pool starting at `variantSeed % poolLength`.
 * The same arguments always produce the same wishes.
 */

/** Longest name we will echo back into a message, to keep output readable. */
export const MAX_NAME_LENGTH = 40;
/** Most wishes a single run can return — equal to the size of every tone pool. */
export const MAX_WISHES = 4;
/** Oldest verified human age is 122 (Jeanne Calment, 1997); 130 is a generous ceiling. */
export const MAX_AGE_YEARS = 130;

export const SCRIPTS = [
  { id: "gurmukhi", label: "Gurmukhi (ਗੁਰਮੁਖੀ)" },
  { id: "roman", label: "Roman / Punjabi in English letters" },
];

export const TONES = [
  { id: "warm", label: "Warm & affectionate" },
  { id: "blessing", label: "Blessing (Waheguru)" },
  { id: "funny", label: "Funny & teasing" },
  { id: "formal", label: "Formal & respectful" },
  { id: "short", label: "Short (status / WhatsApp)" },
];

/**
 * Relationship decides the form of address. `useName` is false where Punjabi
 * convention uses the relationship word alone (you do not name your own parents).
 */
export const RELATIONS = [
  { id: "friend", label: "Friend", gurmukhi: "ਮੇਰੇ ਪਿਆਰੇ ਦੋਸਤ", roman: "Mere pyaare dost", useName: true },
  { id: "brother", label: "Brother", gurmukhi: "ਮੇਰੇ ਵੀਰ", roman: "Mere veer", useName: true },
  { id: "sister", label: "Sister", gurmukhi: "ਮੇਰੀ ਭੈਣ", roman: "Meri bhain", useName: true },
  { id: "mother", label: "Mother", gurmukhi: "ਪਿਆਰੀ ਮੰਮੀ ਜੀ", roman: "Pyaari mummy ji", useName: false },
  { id: "father", label: "Father", gurmukhi: "ਪਿਆਰੇ ਪਾਪਾ ਜੀ", roman: "Pyaare papa ji", useName: false },
  { id: "son", label: "Son", gurmukhi: "ਮੇਰੇ ਪਿਆਰੇ ਪੁੱਤਰ", roman: "Mere pyaare puttar", useName: true },
  { id: "daughter", label: "Daughter", gurmukhi: "ਮੇਰੀ ਪਿਆਰੀ ਧੀ", roman: "Meri pyaari dhee", useName: true },
  { id: "wife", label: "Wife", gurmukhi: "ਮੇਰੀ ਜੀਵਨ ਸਾਥਣ", roman: "Meri jeevan saathan", useName: true },
  { id: "husband", label: "Husband", gurmukhi: "ਮੇਰੇ ਜੀਵਨ ਸਾਥੀ", roman: "Mere jeevan saathi", useName: true },
  { id: "colleague", label: "Colleague / boss", gurmukhi: "", roman: "", useName: true, suffixGurmukhi: " ਜੀ", suffixRoman: " ji" },
  { id: "elder", label: "Elder / respected person", gurmukhi: "ਸਤਿਕਾਰਯੋਗ", roman: "Satkaryog", useName: true, suffixGurmukhi: " ਜੀ", suffixRoman: " ji" },
];

/**
 * Message pools. `{who}` is replaced by the composed form of address.
 * Each entry pairs the Gurmukhi original with its Roman transliteration.
 */
export const MESSAGES = {
  warm: [
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਰੱਬ ਤੁਹਾਨੂੰ ਲੰਬੀ ਉਮਰ, ਚੰਗੀ ਸਿਹਤ ਅਤੇ ਬੇਅੰਤ ਖੁਸ਼ੀਆਂ ਬਖ਼ਸ਼ੇ।",
      roman:
        "{who}, janamdin diyan lakh lakh vadhaiyan! Rabb tuhanu lambi umar, changi sehat ate beant khushiyan bakhshe.",
    },
    {
      gurmukhi: "{who}, ਅੱਜ ਦਾ ਦਿਨ ਤੁਹਾਡੇ ਲਈ ਖਾਸ ਹੈ ਤੇ ਸਾਡੇ ਲਈ ਵੀ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ — ਤੁਹਾਡੀ ਹਰ ਖਵਾਹਿਸ਼ ਪੂਰੀ ਹੋਵੇ।",
      roman:
        "{who}, ajj da din tuhade layi khaas hai te saade layi vi. Janamdin mubarak — tuhadi har khwahish poori hove.",
    },
    {
      gurmukhi: "{who}, ਤੁਹਾਡੀ ਹਾਸੀ ਸਾਡੇ ਘਰ ਦੀ ਰੌਣਕ ਹੈ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ — ਹਮੇਸ਼ਾ ਇਸੇ ਤਰ੍ਹਾਂ ਮੁਸਕਰਾਉਂਦੇ ਰਹੋ।",
      roman:
        "{who}, tuhadi haasi saade ghar di raunak hai. Janamdin mubarak — hamesha ise tarah muskraunde raho.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਮੁਬਾਰਕ! ਜਿੰਨੀ ਖੁਸ਼ੀ ਤੁਸੀਂ ਸਾਨੂੰ ਦਿੰਦੇ ਹੋ, ਉਸ ਤੋਂ ਦੁੱਗਣੀ ਤੁਹਾਨੂੰ ਮਿਲੇ।",
      roman:
        "{who}, janamdin mubarak! Jinni khushi tusi saanu dinde ho, us ton dugni tuhanu mile.",
    },
  ],
  blessing: [
    {
      gurmukhi:
        "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ। {who}, ਜਨਮਦਿਨ ਮੁਬਾਰਕ। ਵਾਹਿਗੁਰੂ ਸਦਾ ਮਿਹਰ ਭਰਿਆ ਹੱਥ ਤੁਹਾਡੇ ਸਿਰ ਉੱਤੇ ਰੱਖਣ।",
      roman:
        "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh. {who}, janamdin mubarak. Waheguru sada mehar bharya hath tuhade sir utte rakhan.",
    },
    {
      gurmukhi: "{who}, ਗੁਰੂ ਸਾਹਿਬ ਤੁਹਾਨੂੰ ਚੜ੍ਹਦੀ ਕਲਾ, ਤੰਦਰੁਸਤੀ ਅਤੇ ਸਬਰ ਬਖ਼ਸ਼ਣ। ਜਨਮਦਿਨ ਦੀਆਂ ਵਧਾਈਆਂ।",
      roman:
        "{who}, Guru Sahib tuhanu chardi kala, tandrusti ate sabar bakhshan. Janamdin diyan vadhaiyan.",
    },
    {
      gurmukhi: "{who}, ਅਰਦਾਸ ਹੈ ਕਿ ਤੁਹਾਡਾ ਹਰ ਦਿਨ ਸੁੱਖ, ਸ਼ਾਂਤੀ ਅਤੇ ਬਰਕਤ ਨਾਲ ਭਰਿਆ ਰਹੇ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ।",
      roman:
        "{who}, ardaas hai ki tuhada har din sukh, shanti ate barkat naal bharya rahe. Janamdin mubarak.",
    },
    {
      gurmukhi: "{who}, ਸਤਿਗੁਰੂ ਤੁਹਾਨੂੰ ਨਾਮ ਦੀ ਦਾਤ, ਤੰਦਰੁਸਤੀ ਅਤੇ ਲੰਬੀ ਉਮਰ ਬਖ਼ਸ਼ਣ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ।",
      roman:
        "{who}, Satguru tuhanu naam di daat, tandrusti ate lambi umar bakhshan. Janamdin mubarak.",
    },
  ],
  funny: [
    {
      gurmukhi: "{who}, ਇੱਕ ਸਾਲ ਹੋਰ ਵੱਡੇ ਹੋ ਗਏ, ਸਿਆਣੇ ਅਜੇ ਵੀ ਨਹੀਂ! ਜਨਮਦਿਨ ਮੁਬਾਰਕ — ਕੇਕ ਦਾ ਵੱਡਾ ਟੁਕੜਾ ਮੇਰਾ।",
      roman:
        "{who}, ikk saal hor vadde ho gaye, siyane ajey vi nahi! Janamdin mubarak — cake da vadda tukda mera.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਮੁਬਾਰਕ! ਮੋਮਬੱਤੀਆਂ ਹੁਣ ਕੇਕ ਉੱਤੇ ਨਹੀਂ ਸਮਾਉਂਦੀਆਂ, ਸੋ ਇਸ ਵਾਰ ਸਿੱਧਾ ਲੱਡੂ ਹੀ ਖਾ ਲਓ।",
      roman:
        "{who}, janamdin mubarak! Mombattiyan hun cake utte nahi samaundiyan, so is vaar sidha laddu hi kha lao.",
    },
    {
      gurmukhi: "{who}, ਪਾਰਟੀ ਕਿੱਥੇ ਹੈ? ਜਨਮਦਿਨ ਦੀਆਂ ਵਧਾਈਆਂ, ਪਰ ਯਾਰੀ ਪੱਕੀ ਤਾਂ ਹੀ ਰਹੇਗੀ ਜੇ ਖਾਣਾ ਵਧੀਆ ਹੋਇਆ।",
      roman:
        "{who}, party kithe hai? Janamdin diyan vadhaiyan, par yaari pakki taan hi rahegi je khana vadhiya hoya.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਮੁਬਾਰਕ! ਉਮਰ ਸਿਰਫ਼ ਇੱਕ ਨੰਬਰ ਹੈ — ਪਰ ਤੁਹਾਡਾ ਨੰਬਰ ਹੁਣ ਕਾਫ਼ੀ ਵੱਡਾ ਹੋ ਗਿਆ ਹੈ।",
      roman:
        "{who}, janamdin mubarak! Umar sirf ikk number hai — par tuhada number hun kaafi vadda ho gaya hai.",
    },
  ],
  formal: [
    {
      gurmukhi:
        "ਸਤਿਕਾਰ ਸਹਿਤ {who} — ਤੁਹਾਡੇ ਜਨਮਦਿਨ ਦੇ ਸ਼ੁਭ ਮੌਕੇ ਉੱਤੇ ਦਿਲੋਂ ਵਧਾਈਆਂ। ਤੁਹਾਡੀ ਸਿਹਤ ਅਤੇ ਸਫਲਤਾ ਦੀ ਕਾਮਨਾ ਕਰਦੇ ਹਾਂ।",
      roman:
        "Satkar sahit {who} — tuhade janamdin de shubh mauke utte dilon vadhaiyan. Tuhadi sehat ate safalta di kamna karde haan.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਦੀਆਂ ਹਾਰਦਿਕ ਵਧਾਈਆਂ। ਆਉਣ ਵਾਲਾ ਸਾਲ ਤੁਹਾਡੇ ਲਈ ਤਰੱਕੀ ਅਤੇ ਨਵੇਂ ਮੌਕੇ ਲੈ ਕੇ ਆਵੇ।",
      roman:
        "{who}, janamdin diyan hardik vadhaiyan. Aaun vala saal tuhade layi tarakki ate nave mauke lai ke aave.",
    },
    {
      gurmukhi: "{who}, ਸਾਡੇ ਸਾਰੇ ਪਰਿਵਾਰ ਵੱਲੋਂ ਜਨਮਦਿਨ ਦੀਆਂ ਸ਼ੁਭਕਾਮਨਾਵਾਂ। ਖੁਸ਼ ਰਹੋ, ਤੰਦਰੁਸਤ ਰਹੋ।",
      roman:
        "{who}, saade saare parivaar vallon janamdin diyan shubhkamnavan. Khush raho, tandrust raho.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਦੀਆਂ ਵਧਾਈਆਂ। ਤੁਹਾਡੀ ਮਿਹਨਤ ਅਤੇ ਸਾਦਗੀ ਸਾਡੇ ਸਾਰਿਆਂ ਲਈ ਮਿਸਾਲ ਹੈ।",
      roman:
        "{who}, janamdin diyan vadhaiyan. Tuhadi mehnat ate saadgi saade saariyan layi misaal hai.",
    },
  ],
  short: [
    {
      gurmukhi: "ਜਨਮਦਿਨ ਮੁਬਾਰਕ, {who}! ਚੜ੍ਹਦੀ ਕਲਾ ਵਿੱਚ ਰਹੋ।",
      roman: "Janamdin mubarak, {who}! Chardi kala vich raho.",
    },
    {
      gurmukhi: "{who}, ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਖੁਸ਼ ਰਹੋ।",
      roman: "{who}, lakh lakh vadhaiyan! Khush raho.",
    },
    {
      gurmukhi: "{who}, ਜਨਮਦਿਨ ਦੀਆਂ ਵਧਾਈਆਂ — ਰੱਬ ਰਾਖਾ।",
      roman: "{who}, janamdin diyan vadhaiyan — Rabb rakha.",
    },
    {
      gurmukhi: "{who}, ਸਾਲਗਿਰਾਹ ਮੁਬਾਰਕ! ਜੁੱਗ ਜੁੱਗ ਜੀਓ।",
      roman: "{who}, saalgirah mubarak! Jugg jugg jio.",
    },
  ],
};

/** Optional extra sentence naming the age reached. */
export const AGE_LINE = {
  gurmukhi: "ਜ਼ਿੰਦਗੀ ਦੇ {age} ਸਾਲ ਪੂਰੇ ਹੋਣ ਦੀਆਂ ਵਧਾਈਆਂ!",
  roman: "Zindagi de {age} saal poore hon diyan vadhaiyan!",
};

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

/** Build the form of address for a relationship, e.g. "ਮੇਰੇ ਵੀਰ ਹਰਪ੍ਰੀਤ". */
export function buildAddress(relation, name, script) {
  const prefix = script === "roman" ? relation.roman : relation.gurmukhi;
  const suffix =
    (script === "roman" ? relation.suffixRoman : relation.suffixGurmukhi) || "";
  const parts = [];
  if (prefix) parts.push(prefix);
  if (relation.useName && name) parts.push(name);
  const joined = parts.join(" ").trim();
  if (!joined) return name || "";
  return `${joined}${suffix}`;
}

/**
 * Generate Punjabi birthday wishes.
 *
 * @param {object} input
 * @param {string} input.name         Birthday person's name (required unless the
 *                                    relationship is one that is addressed without a name).
 * @param {string} input.relation     One of RELATIONS[].id
 * @param {string} input.tone         One of TONES[].id
 * @param {string} input.script       "gurmukhi" | "roman"
 * @param {number} input.count        How many wishes to return (1..MAX_WISHES)
 * @param {number|string} input.ageYears  Optional age turned; "" or null to omit
 * @param {number} input.variantSeed  Deterministic rotation offset (integer >= 0)
 * @returns {{wishes: Array<{id:string,text:string}>, address:string, script:string, tone:string, poolSize:number}|{error:string}}
 */
export function generateWishes({
  name = "",
  relation = "friend",
  tone = "warm",
  script = "gurmukhi",
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
  if (!scriptDef) return { error: "Choose Gurmukhi or Roman script." };
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
    script,
    tone,
    poolSize: pool.length,
  };
}

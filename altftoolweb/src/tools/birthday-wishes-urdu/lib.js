/**
 * Urdu birthday wishes generator — pure text composition, no I/O.
 *
 * Urdu is written right-to-left in the Perso-Arabic (Nastaliq) script, Unicode
 * range U+0600–U+06FF plus Urdu-specific letters such as ٹ ڈ ڑ ں ے. Most people
 * type it on phones as "Roman Urdu" with Latin letters, so every message below is
 * stored as a matched Urdu / Roman Urdu pair that says the same thing.
 *
 * Selection is deterministic: the caller passes `variantSeed` and the generator
 * rotates the pool from `variantSeed % poolLength`. Same input, same output.
 */

/** Longest name we echo back into a message, to keep output readable. */
export const MAX_NAME_LENGTH = 40;
/** Every tone pool holds exactly this many wordings. */
export const MAX_WISHES = 4;
/** Oldest verified human age is 122 (Jeanne Calment, 1997); 130 is a generous ceiling. */
export const MAX_AGE_YEARS = 130;

export const SCRIPTS = [
  { id: "urdu", label: "Urdu script (اردو)", dir: "rtl", lang: "ur" },
  { id: "roman", label: "Roman Urdu (English letters)", dir: "ltr", lang: "ur-Latn" },
];

export const TONES = [
  { id: "shayari", label: "Shayari (poetic couplet)" },
  { id: "warm", label: "Warm & affectionate" },
  { id: "dua", label: "Dua (prayer / blessing)" },
  { id: "funny", label: "Funny & teasing" },
  { id: "formal", label: "Formal & respectful" },
  { id: "short", label: "Short (status / WhatsApp)" },
];

/**
 * Relationship decides the form of address. `useName` is false where Urdu
 * convention addresses the person by the relationship word alone (Ammi Jaan,
 * Abbu Jaan) rather than by first name.
 */
export const RELATIONS = [
  { id: "friend", label: "Friend", urdu: "میرے پیارے دوست", roman: "Mere pyare dost", useName: true },
  { id: "brother", label: "Brother", urdu: "میرے بھائی", roman: "Mere bhai", useName: true },
  { id: "sister", label: "Sister", urdu: "میری بہن", roman: "Meri behen", useName: true },
  { id: "mother", label: "Mother", urdu: "پیاری امی جان", roman: "Pyari Ammi Jaan", useName: false },
  { id: "father", label: "Father", urdu: "پیارے ابو جان", roman: "Pyare Abbu Jaan", useName: false },
  { id: "son", label: "Son", urdu: "میرے پیارے بیٹے", roman: "Mere pyare bete", useName: true },
  { id: "daughter", label: "Daughter", urdu: "میری پیاری بیٹی", roman: "Meri pyari beti", useName: true },
  { id: "wife", label: "Wife", urdu: "میری ہمسفر", roman: "Meri humsafar", useName: true },
  { id: "husband", label: "Husband", urdu: "میرے ہمسفر", roman: "Mere humsafar", useName: true },
  {
    id: "teacher",
    label: "Teacher / elder",
    urdu: "محترم",
    roman: "Mohtaram",
    useName: true,
    suffixUrdu: " صاحب",
    suffixRoman: " sahib",
  },
  {
    id: "colleague",
    label: "Colleague / boss",
    urdu: "",
    roman: "",
    useName: true,
    suffixUrdu: " صاحب",
    suffixRoman: " sahib",
  },
];

/** `{who}` is replaced by the composed form of address. */
export const MESSAGES = {
  shayari: [
    {
      urdu: "{who}، ہر خوشی ہو آپ کے دامن میں، ہر غم آپ سے دور رہے۔ سالگرہ مبارک ہو!",
      roman:
        "{who}, har khushi ho aap ke daman mein, har gham aap se door rahe. Saalgirah mubarak ho!",
    },
    {
      urdu: "{who}، چاند سی روشنی ہو آپ کی راہوں میں، پھولوں سی مہک ہو آپ کی سانسوں میں — سالگرہ مبارک!",
      roman:
        "{who}, chaand si roshni ho aap ki raahon mein, phoolon si mehak ho aap ki saanson mein — Saalgirah Mubarak!",
    },
    {
      urdu: "{who}، عمر آپ کی دراز ہو، ہر دن نیا آغاز ہو، خدا کرے کہ آپ کی ہر دعا مستجاب ہو۔",
      roman:
        "{who}, umar aap ki daraaz ho, har din naya aaghaz ho, Khuda kare ke aap ki har dua mustajaab ho.",
    },
    {
      urdu: "{who}، یہ دن بار بار آئے، ہر بار خوشیوں کی بہار لائے۔ سالگرہ مبارک ہو!",
      roman:
        "{who}, yeh din baar baar aaye, har baar khushiyon ki bahaar laaye. Saalgirah mubarak ho!",
    },
  ],
  warm: [
    {
      urdu: "{who}، سالگرہ بہت بہت مبارک ہو! اللہ آپ کو لمبی عمر، اچھی صحت اور بے حساب خوشیاں عطا فرمائے۔",
      roman:
        "{who}, saalgirah bahut bahut mubarak ho! Allah aap ko lambi umar, achhi sehat aur be-hisaab khushiyan ata farmaye.",
    },
    {
      urdu: "{who}، آج کا دن آپ کے نام ہے۔ سالگرہ مبارک — ہمیشہ مسکراتے رہیں۔",
      roman: "{who}, aaj ka din aap ke naam hai. Saalgirah mubarak — hamesha muskurate rahein.",
    },
    {
      urdu: "{who}، آپ کی موجودگی ہمارے گھر کی رونق ہے۔ سالگرہ مبارک ہو، خوش رہیں اور آباد رہیں۔",
      roman:
        "{who}, aap ki maujoodgi humare ghar ki raunaq hai. Saalgirah mubarak ho, khush rahein aur aabad rahein.",
    },
    {
      urdu: "{who}، جتنی خوشی آپ ہمیں دیتے ہیں، اس سے دگنی آپ کو ملے۔ سالگرہ مبارک!",
      roman:
        "{who}, jitni khushi aap humein dete hain, us se dugni aap ko mile. Saalgirah mubarak!",
    },
  ],
  dua: [
    {
      urdu: "{who}، اللہ تعالیٰ آپ کو صحت، عافیت اور رزقِ حلال عطا فرمائے۔ سالگرہ مبارک ہو۔",
      roman:
        "{who}, Allah Ta'ala aap ko sehat, aafiyat aur rizq-e-halal ata farmaye. Saalgirah mubarak ho.",
    },
    {
      urdu: "{who}، دعا ہے کہ آپ کی زندگی سکون اور برکت سے بھری رہے۔ سالگرہ مبارک۔",
      roman: "{who}, dua hai ke aap ki zindagi sukoon aur barkat se bhari rahe. Saalgirah mubarak.",
    },
    {
      urdu: "{who}، رب کریم آپ کے ہر قدم پر آسانیاں پیدا فرمائے۔ سالگرہ بہت مبارک۔",
      roman:
        "{who}, Rabb-e-Kareem aap ke har qadam par aasaaniyan paida farmaye. Saalgirah bahut mubarak.",
    },
    {
      urdu: "{who}، خدا کرے آپ کا ہر دن پہلے سے بہتر ہو۔ سالگرہ مبارک ہو۔",
      roman: "{who}, Khuda kare aap ka har din pehle se behtar ho. Saalgirah mubarak ho.",
    },
  ],
  funny: [
    {
      urdu: "{who}، ایک سال اور بڑھ گئے، عقل ابھی تک وہیں ہے! سالگرہ مبارک — کیک کا بڑا حصہ میرا۔",
      roman:
        "{who}, ek saal aur badh gaye, aqal abhi tak wahin hai! Saalgirah mubarak — cake ka bada hissa mera.",
    },
    {
      urdu: "{who}، سالگرہ مبارک! موم بتیاں اب کیک پر نہیں سماتیں، اس بار صرف ایک جلا لیجیے۔",
      roman:
        "{who}, saalgirah mubarak! Mombattiyan ab cake par nahin samatin, is baar sirf ek jala lijiye.",
    },
    {
      urdu: "{who}، پارٹی کہاں ہے؟ سالگرہ مبارک، مگر دوستی تبھی قائم رہے گی جب کھانا اچھا ہو۔",
      roman:
        "{who}, party kahan hai? Saalgirah mubarak, magar dosti tabhi qaaim rahegi jab khana achha ho.",
    },
    {
      urdu: "{who}، عمر صرف ایک عدد ہے — لیکن آپ کا عدد اب کافی بڑا ہو چکا ہے۔ سالگرہ مبارک!",
      roman:
        "{who}, umar sirf ek adad hai — lekin aap ka adad ab kaafi bada ho chuka hai. Saalgirah mubarak!",
    },
  ],
  formal: [
    {
      urdu: "{who}، آپ کی سالگرہ کے مبارک موقع پر دلی مبارکباد۔ آپ کی صحت اور کامیابی کے لیے نیک تمنائیں۔",
      roman:
        "{who}, aap ki saalgirah ke mubarak mauqe par dili mubarakbaad. Aap ki sehat aur kamyabi ke liye nek tamannayein.",
    },
    {
      urdu: "{who}، سالگرہ مبارک ہو۔ آنے والا سال آپ کے لیے ترقی اور نئے مواقع لائے۔",
      roman: "{who}, saalgirah mubarak ho. Aane wala saal aap ke liye taraqqi aur naye mawaqe laaye.",
    },
    {
      urdu: "{who}، ہمارے پورے خاندان کی جانب سے سالگرہ کی مبارکباد۔ خوش رہیں، صحت مند رہیں۔",
      roman:
        "{who}, humare poore khandan ki jaanib se saalgirah ki mubarakbaad. Khush rahein, sehatmand rahein.",
    },
    {
      urdu: "{who}، آپ کی محنت اور خلوص ہم سب کے لیے مثال ہے۔ سالگرہ بہت مبارک ہو۔",
      roman: "{who}, aap ki mehnat aur khuloos hum sab ke liye misaal hai. Saalgirah bahut mubarak ho.",
    },
  ],
  short: [
    {
      urdu: "{who}، سالگرہ مبارک ہو! خوش رہیں۔",
      roman: "{who}, saalgirah mubarak ho! Khush rahein.",
    },
    {
      urdu: "{who}، جنم دن مبارک! اللہ آپ کو خوش رکھے۔",
      roman: "{who}, janam din mubarak! Allah aap ko khush rakhe.",
    },
    {
      urdu: "{who}، سالگرہ مبارک — ڈھیر ساری دعائیں۔",
      roman: "{who}, saalgirah mubarak — dher saari duaein.",
    },
    {
      urdu: "{who}، جیتے رہیے، مسکراتے رہیے۔ سالگرہ مبارک!",
      roman: "{who}, jeete rahiye, muskurate rahiye. Saalgirah mubarak!",
    },
  ],
};

/** Optional extra sentence naming the age reached. */
export const AGE_LINE = {
  urdu: "زندگی کے {age} سال مکمل ہونے پر مبارکباد!",
  roman: "Zindagi ke {age} saal mukammal hone par mubarakbaad!",
};

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

/** Build the form of address, e.g. "محترم احمد صاحب" / "Mohtaram Ahmad sahib". */
export function buildAddress(relation, name, script) {
  const prefix = script === "roman" ? relation.roman : relation.urdu;
  const suffix = (script === "roman" ? relation.suffixRoman : relation.suffixUrdu) || "";
  const parts = [];
  if (prefix) parts.push(prefix);
  if (relation.useName && name) parts.push(name);
  const joined = parts.join(" ").trim();
  if (!joined) return name || "";
  return `${joined}${suffix}`;
}

/**
 * Generate Urdu birthday wishes.
 *
 * @param {object} input
 * @param {string} input.name        Birthday person's name.
 * @param {string} input.relation    One of RELATIONS[].id
 * @param {string} input.tone        One of TONES[].id
 * @param {string} input.script      "urdu" | "roman"
 * @param {number} input.count       How many wishes (1..MAX_WISHES)
 * @param {number|string} input.ageYears  Optional age turned; "" to omit
 * @param {number} input.variantSeed Deterministic rotation offset
 * @returns {{wishes:Array<{id:string,text:string}>, address:string, dir:string, lang:string, poolSize:number, tone:string, script:string}|{error:string}}
 */
export function generateWishes({
  name = "",
  relation = "friend",
  tone = "shayari",
  script = "urdu",
  count = 3,
  ageYears = "",
  variantSeed = 0,
} = {}) {
  const cleanName = String(name).replace(/\s+/g, " ").trim();
  const relationDef = findById(RELATIONS, relation);
  const toneDef = findById(TONES, tone);
  const scriptDef = findById(SCRIPTS, script);

  if (!relationDef) return { error: "Choose a relationship from the list." };
  if (!toneDef) return { error: "Choose a style from the list." };
  if (!scriptDef) return { error: "Choose Urdu script or Roman Urdu." };
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
    dir: scriptDef.dir,
    lang: scriptDef.lang,
    poolSize: pool.length,
    tone,
    script,
  };
}

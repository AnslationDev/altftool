/**
 * Two-line shayari (couplet) composer.
 *
 * Pure: no React, no DOM, no Date.now(). Same (inputs, seed) always produce
 * the same couplets. Every couplet below is hand-written, pre-rhymed content
 * (not algorithmically generated), selected by mood/theme and language mix.
 */

export const MAX_VARIANTS = 3;
export const MAX_NAME_LENGTH = 40;

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

export const MOODS = [
  { id: "romantic", label: "Romantic" },
  { id: "heartbreak", label: "Heartbreak / sad" },
  { id: "friendship", label: "Friendship" },
  { id: "motivational", label: "Motivational" },
  { id: "festival", label: "Festival" },
  { id: "witty", label: "Witty / humour" },
];

export const LANGUAGES = [
  { id: "hinglish", label: "Hinglish (Roman, Hindi-English mix)" },
  { id: "hindi", label: "Hindi (Devanagari)" },
];

/* ------------------------------------------------------------------ *
 * Couplet bank. Each mood has 3 pre-written, pre-rhymed two-line
 * couplets per language. Devanagari and Hinglish entries carry the same
 * meaning; the Hinglish set mixes in a few English loanwords (Monday,
 * boss, diet, plan) the way everyday Hinglish captions do.
 * ------------------------------------------------------------------ */

const COUPLETS = {
  hindi: {
    romantic: [
      ["तेरी हर बात में एक नयी बहार है,", "तेरे साथ हर पल दिल को क़रार है।"],
      ["तेरी आँखों में मेरा पूरा जहाँ बसा है,", "तेरे नाम से ही यह दिल हँसा है।"],
      ["मोहब्बत तेरे नाम से रोशन यह शाम है,", "तेरे बिना अधूरा हर एक पैग़ाम है।"],
    ],
    heartbreak: [
      ["तेरे जाने से यह घर सूना पड़ा है,", "हर एक कोना अब बस याद का घड़ा है।"],
      ["दिल में अब भी वही पुराना दर्द है,", "हर धड़कन में छुपा एक सर्द है।"],
      ["टूटे हुए ख़्वाबों का यही सिलसिला है,", "हर साँस में अब तेरा गिला है।"],
    ],
    friendship: [
      ["यारों की महफ़िल में तू ख़ास है,", "तेरे बिना अधूरा हर एहसास है।"],
      ["दोस्ती का रिश्ता कोई मामूली नहीं,", "तेरे जैसा यार मिलना आसानी नहीं।"],
      ["हर मुश्किल घड़ी में साथ निभाया है,", "तेरी दोस्ती ने हर ग़म को भुलाया है।"],
    ],
    motivational: [
      ["हार कर बैठना कभी मंज़िल नहीं होती,", "मेहनत की राहें कभी मुश्किल नहीं होतीं।"],
      ["गिरने से पहले जो सम्भलना सीख ले,", "वो ज़िंदगी की हर लड़ाई जीत ले।"],
      ["मुश्किलें रस्ता रोकेंगी मगर डटे रहो,", "मंज़िल तुम्हारी है, बस चलते रहो।"],
    ],
    festival: [
      ["दीयों की रौशनी से भरा हर आँगन है,", "इस त्योहार में खुशियों का बंधन है।"],
      ["रंगों की बौछार लाई है यह त्योहार,", "हर चेहरे पे बिखरा है खुशियों का हार।"],
      ["मिठाई की खुशबू से महका हर द्वार,", "यह त्योहार लाए ढेरों प्यार और दुलार।"],
    ],
    witty: [
      ["नींद और काम में जंग रोज़ होती है,", "हर बार नींद की ही जीत होती है।"],
      ["हर सोमवार दिल करता है छुट्टी मनाऊं,", "पर बॉस के सामने बस मुस्कुरा के जाऊं।"],
      ["डाइट का प्लान बनाया बड़े शौक़ से,", "टूट गया वो पहले ही पकौड़े के चौक़ से।"],
    ],
  },
  hinglish: {
    romantic: [
      ["Teri har baat mein ek nayi si bahaar hai,", "Tere saath har pal dil ko qarar hai."],
      ["Teri aankhon mein mera pura jahaan basa hai,", "Tere naam se hi yeh dil hansa hai."],
      ["Mohabbat teri naam se roshan yeh shaam hai,", "Tere bina adhoora har ek paigaam hai."],
    ],
    heartbreak: [
      ["Tere jaane se yeh ghar suna pada hai,", "Har ek kona ab bas yaad ka ghada hai."],
      ["Dil mein ab bhi wahi purana dard hai,", "Har dhadkan mein chhupa ek sard hai."],
      ["Toote hue khwabon ka yehi silsila hai,", "Har saans mein ab tera gila hai."],
    ],
    friendship: [
      ["Yaaron ki mehfil mein tu khaas hai,", "Tere bina adhoora har ehsaas hai."],
      ["Dosti ka rishta koi mamuli nahi,", "Tere jaisa yaar milna aasani nahi."],
      ["Har mushkil ghadi mein saath nibhaya hai,", "Teri dosti ne har gham ko bhulaya hai."],
    ],
    motivational: [
      ["Haar kar baithna kabhi manzil nahi hoti,", "Mehnat ki raahein kabhi mushkil nahi hotin."],
      ["Girne se pehle jo sambhalna seekh le,", "Woh zindagi ki har ladai jeet le."],
      ["Mushkilein rasta rokengi magar date raho,", "Manzil tumhari hai, bas chalte raho."],
    ],
    festival: [
      ["Diyon ki roshni se bhara har aangan hai,", "Is tyohaar mein khushiyon ka bandhan hai."],
      ["Rangon ki baauchaar laayi hai yeh tyohaar,", "Har chehre pe bikhra hai khushiyon ka haar."],
      ["Mithai ki khushbu se mehka har dwaar,", "Yeh tyohaar laaye dheron pyaar aur dulaar."],
    ],
    witty: [
      ["Neend aur kaam mein jung roz hoti hai,", "Har baar neend ki hi jeet hoti hai."],
      ["Har Monday dil karta hai chutti manaaun,", "Par boss ke saamne bas muskura ke jaaun."],
      ["Diet ka plan banaya bade shauk se,", "Toot gaya woh pehle hi pakode ke chauk se."],
    ],
  },
};

/** Optional dedication line appended when a name is supplied. */
const DEDICATION = {
  hindi: "— {name} के लिए",
  hinglish: "— for {name}",
};

/* ------------------------------------------------------------------ *
 * Compose
 * ------------------------------------------------------------------ */

/** mulberry32 — deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotate(list, offset, step) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[(offset + step) % list.length];
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/**
 * Build two-line shayari drafts for a mood/theme and language mix.
 *
 * @returns {{variants:Array<{id:number,lines:string[],dedication:string,
 *            text:string,chars:number,words:number}>,
 *            mood:string, language:string}|{error:string}}
 */
export function buildShayari({
  mood = "romantic",
  language = "hinglish",
  dedicatedTo = "",
  seed = 1,
  count = 3,
} = {}) {
  const moodEntry = MOODS.find((item) => item.id === mood) ?? MOODS[0];
  const langEntry = LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
  const pool = COUPLETS[langEntry.id]?.[moodEntry.id] ?? [];

  if (pool.length === 0) {
    return { error: "No couplets available for that mood and language combination." };
  }

  const name = clean(dedicatedTo);
  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const offset = Math.floor(rng() * 997);
  const dedicationTemplate = DEDICATION[langEntry.id] ?? DEDICATION.hinglish;
  const tokens = { name };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const couplet = rotate(pool, offset, step) ?? pool[0];
    const dedication = name ? fill(dedicationTemplate, tokens) : "";
    const lines = dedication ? [...couplet, dedication] : [...couplet];
    const text = lines.join("\n");
    const trimmed = text.trim();
    variants.push({
      id: step + 1,
      lines,
      dedication,
      text,
      chars: [...text].length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
    });
  }

  return {
    variants,
    mood: moodEntry.label,
    language: langEntry.label,
  };
}

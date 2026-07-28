/**
 * Raksha Bandhan Wishes Generator — data + pure logic.
 *
 * No React, no DOM, no Date.now(). generateWishes is total: invalid input
 * returns { error }, and the same seed always reproduces the same messages.
 */

/**
 * Raksha Bandhan is observed on Shravana Purnima, the full-moon day of the
 * Shravana month, which falls between late July and August. The same tithi is
 * Narali Purnima on the Konkan coast, Avani Avittam / Upakarma for many South
 * Indian Brahmin communities, and Jhulan Purnima in Bengal. The rakhi is
 * traditionally tied after the Bhadra period has ended, usually in the
 * aparahna (afternoon) window.
 */
export const FESTIVAL_FACTS = {
  tithi: "Shravana Purnima",
  gregorianWindow: "late July to August",
  preferredWindow: "aparahna, after Bhadra ends",
  alsoCalled: ["Rakhi Purnima", "Narali Purnima", "Jhulan Purnima", "Avani Avittam"],
};

export const LANGUAGES = [
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
  { id: "english", label: "English", native: "English" },
  { id: "marathi", label: "Marathi", native: "मराठी" },
  { id: "gujarati", label: "Gujarati", native: "ગુજરાતી" },
  { id: "punjabi", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "bengali", label: "Bengali", native: "বাংলা" },
];

/** Who is writing to whom. Every template is tagged with the ties it suits. */
export const RELATIONSHIPS = [
  { id: "sisterToBrother", label: "Sister to brother" },
  { id: "brotherToSister", label: "Brother to sister" },
  { id: "sisterToSister", label: "Between sisters" },
  { id: "cousin", label: "Cousins & chosen family" },
  { id: "distance", label: "Long distance or abroad" },
  { id: "caption", label: "Status / caption" },
];

export const SALUTATIONS = {
  hindi: "प्रिय {name},",
  english: "Dear {name},",
  marathi: "प्रिय {name},",
  gujarati: "પ્રિય {name},",
  punjabi: "ਪਿਆਰੇ {name},",
  bengali: "প্রিয় {name},",
};

export const TEMPLATES = {
  hindi: [
    {
      text: "यह राखी सिर्फ़ धागा नहीं — मेरे विश्वास और दुआओं की डोर है. रक्षाबंधन की हार्दिक शुभकामनाएँ!",
      tags: ["sisterToBrother"],
    },
    {
      text: "जब तक तेरी कलाई पर मेरी राखी है, कोई मुश्किल तुझे छू नहीं सकती. शुभ रक्षाबंधन!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "तेरी हर मुस्कान की हिफ़ाज़त मेरा वादा है. रक्षाबंधन की ढेर सारी शुभकामनाएँ!",
      tags: ["brotherToSister"],
    },
    {
      text: "तू कितनी भी दूर रहे, तेरा भाई हमेशा एक कॉल की दूरी पर है. शुभ रक्षाबंधन.",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "बहनें सिर्फ़ बहनें नहीं होतीं, सबसे पहली दोस्त होती हैं. इस रक्षाबंधन तुझे ढेर सारा प्यार.",
      tags: ["sisterToSister"],
    },
    {
      text: "ख़ून का रिश्ता हो या दिल का — राखी का धागा दोनों को बराबर मज़बूती से बाँधता है. रक्षाबंधन की शुभकामनाएँ!",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "दूरी सिर्फ़ किलोमीटर की है, रिश्ते की नहीं. राखी डाक से सही, दुआएँ सीधे दिल से. शुभ रक्षाबंधन.",
      tags: ["distance", "cousin"],
    },
    { text: "एक धागा, अनगिनत यादें. शुभ रक्षाबंधन! #रक्षाबंधन", tags: ["caption"] },
    {
      text: "भाई-बहन का रिश्ता: लड़ाई भी सबसे ज़्यादा, प्यार भी सबसे ज़्यादा. शुभ रक्षाबंधन!",
      tags: ["caption", "cousin"],
    },
    { text: "राखी बंध गई, अब गिफ़्ट की बारी. शुभ रक्षाबंधन! #राखी", tags: ["caption"] },
  ],
  english: [
    {
      text: "This rakhi is not just a thread — it carries every prayer I have said for you. Happy Raksha Bandhan, bhai.",
      tags: ["sisterToBrother"],
    },
    {
      text: "You have been my first defender and my loudest critic since day one. Wear this rakhi proudly. Happy Raksha Bandhan!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "Whatever this year throws at you, I am one call away. Happy Raksha Bandhan.",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "Thank you for the rakhi, the lectures and an unreasonable amount of love. Happy Raksha Bandhan!",
      tags: ["brotherToSister"],
    },
    {
      text: "Sisters are the first friends and the last people who will ever let you off easy. Happy Raksha Bandhan.",
      tags: ["sisterToSister"],
    },
    {
      text: "Blood or chosen, the thread ties the same knot. Happy Raksha Bandhan to my favourite partner in crime.",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "The kilometres are the only thing standing between us. Rakhi by post, blessings straight from the heart.",
      tags: ["distance", "cousin"],
    },
    {
      text: "One thread, a lifetime of stories. Happy Raksha Bandhan. #RakshaBandhan",
      tags: ["caption"],
    },
    {
      text: "Fought the most, loved the most. That is the sibling deal. Happy Raksha Bandhan!",
      tags: ["caption", "cousin"],
    },
    { text: "Rakhi tied. Gift pending. Happy Raksha Bandhan. #Rakhi", tags: ["caption"] },
  ],
  marathi: [
    {
      text: "ही राखी फक्त धागा नाही — माझ्या विश्वासाची आणि प्रार्थनेची दोरी आहे. रक्षाबंधनाच्या हार्दिक शुभेच्छा!",
      tags: ["sisterToBrother"],
    },
    {
      text: "तुझ्या मनगटावर माझी राखी आहे तोपर्यंत कुठलंही संकट तुला स्पर्श करू शकत नाही. शुभ रक्षाबंधन!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "तुझ्या प्रत्येक हसण्याची जबाबदारी माझी. रक्षाबंधनाच्या मन:पूर्वक शुभेच्छा!",
      tags: ["brotherToSister"],
    },
    {
      text: "कितीही दूर असलीस तरी तुझा भाऊ एका फोनच्या अंतरावर आहे. शुभ रक्षाबंधन.",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "बहिणी म्हणजे आयुष्यातली पहिली मैत्रीण. या रक्षाबंधनाला तुला खूप सारं प्रेम.",
      tags: ["sisterToSister"],
    },
    {
      text: "नातं रक्ताचं असो वा मनाचं — राखीचा धागा दोघांनाही सारखाच बांधतो. रक्षाबंधनाच्या शुभेच्छा!",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "अंतर फक्त किलोमीटरचं आहे, नात्याचं नाही. राखी पोस्टानं, शुभेच्छा थेट मनातून.",
      tags: ["distance", "cousin"],
    },
    { text: "एक धागा, असंख्य आठवणी. शुभ रक्षाबंधन! #रक्षाबंधन", tags: ["caption"] },
    {
      text: "भाऊ-बहिणीचं नातं: भांडणही सर्वात जास्त, प्रेमही सर्वात जास्त. शुभ रक्षाबंधन!",
      tags: ["caption", "cousin"],
    },
    { text: "राखी बांधून झाली, आता गिफ्टची पाळी. शुभ रक्षाबंधन! #राखी", tags: ["caption"] },
  ],
  gujarati: [
    {
      text: "આ રાખડી માત્ર દોરો નથી — મારા વિશ્વાસ અને પ્રાર્થનાની દોરી છે. રક્ષાબંધનની હાર્દિક શુભકામનાઓ!",
      tags: ["sisterToBrother"],
    },
    {
      text: "તારા કાંડા પર મારી રાખડી છે ત્યાં સુધી કોઈ મુશ્કેલી તને સ્પર્શી નહીં શકે. શુભ રક્ષાબંધન!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "તારા દરેક સ્મિતની જવાબદારી મારી. રક્ષાબંધનની ઢગલાબંધ શુભકામનાઓ!",
      tags: ["brotherToSister"],
    },
    {
      text: "તું ગમે તેટલી દૂર હોય, તારો ભાઈ હંમેશા એક ફોન દૂર છે. શુભ રક્ષાબંધન.",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "બહેનો જીવનની પહેલી બહેનપણી હોય છે. આ રક્ષાબંધને તને ખૂબ પ્રેમ.",
      tags: ["sisterToSister"],
    },
    {
      text: "લોહીનો સંબંધ હોય કે દિલનો — રાખડીનો દોરો બંનેને સરખો બાંધે છે. શુભ રક્ષાબંધન!",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "અંતર માત્ર કિલોમીટરનું છે, સંબંધનું નહીં. રાખડી ટપાલથી, શુભેચ્છાઓ સીધી દિલથી.",
      tags: ["distance", "cousin"],
    },
    { text: "એક દોરો, અગણિત યાદો. શુભ રક્ષાબંધન! #રક્ષાબંધન", tags: ["caption"] },
    {
      text: "ભાઈ-બહેનનો સંબંધ: ઝઘડો પણ સૌથી વધુ, પ્રેમ પણ સૌથી વધુ. શુભ રક્ષાબંધન!",
      tags: ["caption", "cousin"],
    },
    { text: "રાખડી બંધાઈ ગઈ, હવે ગિફ્ટનો વારો. શુભ રક્ષાબંધન! #રાખડી", tags: ["caption"] },
  ],
  punjabi: [
    {
      text: "ਇਹ ਰੱਖੜੀ ਸਿਰਫ਼ ਧਾਗਾ ਨਹੀਂ — ਮੇਰੇ ਭਰੋਸੇ ਤੇ ਅਰਦਾਸ ਦੀ ਡੋਰ ਹੈ. ਰੱਖੜੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ!",
      tags: ["sisterToBrother"],
    },
    {
      text: "ਜਿੰਨਾ ਚਿਰ ਤੇਰੇ ਗੁੱਟ ਉੱਤੇ ਮੇਰੀ ਰੱਖੜੀ ਹੈ, ਕੋਈ ਔਖ ਤੈਨੂੰ ਛੂਹ ਨਹੀਂ ਸਕਦੀ. ਰੱਖੜੀ ਮੁਬਾਰਕ!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "ਤੇਰੀ ਹਰ ਮੁਸਕਾਨ ਦੀ ਜ਼ਿੰਮੇਵਾਰੀ ਮੇਰੀ. ਰੱਖੜੀ ਦੀਆਂ ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ!",
      tags: ["brotherToSister"],
    },
    {
      text: "ਤੂੰ ਕਿੰਨੀ ਵੀ ਦੂਰ ਹੋਵੇਂ, ਤੇਰਾ ਵੀਰ ਹਮੇਸ਼ਾ ਇੱਕ ਫ਼ੋਨ ਦੀ ਦੂਰੀ ਉੱਤੇ ਹੈ. ਰੱਖੜੀ ਮੁਬਾਰਕ.",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "ਭੈਣਾਂ ਪਹਿਲੀਆਂ ਸਹੇਲੀਆਂ ਹੁੰਦੀਆਂ ਨੇ. ਇਸ ਰੱਖੜੀ ਉੱਤੇ ਤੈਨੂੰ ਬਹੁਤ ਸਾਰਾ ਪਿਆਰ.",
      tags: ["sisterToSister"],
    },
    {
      text: "ਖ਼ੂਨ ਦਾ ਰਿਸ਼ਤਾ ਹੋਵੇ ਜਾਂ ਦਿਲ ਦਾ — ਰੱਖੜੀ ਦਾ ਧਾਗਾ ਦੋਹਾਂ ਨੂੰ ਬਰਾਬਰ ਬੰਨ੍ਹਦਾ ਹੈ. ਵਧਾਈਆਂ!",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "ਦੂਰੀ ਸਿਰਫ਼ ਕਿਲੋਮੀਟਰਾਂ ਦੀ ਹੈ, ਰਿਸ਼ਤੇ ਦੀ ਨਹੀਂ. ਰੱਖੜੀ ਡਾਕ ਰਾਹੀਂ, ਦੁਆਵਾਂ ਸਿੱਧੀਆਂ ਦਿਲੋਂ.",
      tags: ["distance", "cousin"],
    },
    { text: "ਇੱਕ ਧਾਗਾ, ਅਣਗਿਣਤ ਯਾਦਾਂ. ਰੱਖੜੀ ਮੁਬਾਰਕ! #ਰੱਖੜੀ", tags: ["caption"] },
    {
      text: "ਭੈਣ-ਭਰਾ ਦਾ ਰਿਸ਼ਤਾ: ਲੜਾਈ ਵੀ ਸਭ ਤੋਂ ਵੱਧ, ਪਿਆਰ ਵੀ ਸਭ ਤੋਂ ਵੱਧ. ਰੱਖੜੀ ਮੁਬਾਰਕ!",
      tags: ["caption", "cousin"],
    },
    { text: "ਰੱਖੜੀ ਬੰਨ੍ਹ ਹੋ ਗਈ, ਹੁਣ ਗਿਫ਼ਟ ਦੀ ਵਾਰੀ. ਰੱਖੜੀ ਮੁਬਾਰਕ! #ਰੱਖੜੀ", tags: ["caption"] },
  ],
  bengali: [
    {
      text: "এই রাখি শুধু সুতো নয় — আমার বিশ্বাস আর প্রার্থনার বাঁধন। রাখি পূর্ণিমার শুভেচ্ছা!",
      tags: ["sisterToBrother"],
    },
    {
      text: "তোর হাতে আমার রাখি থাকতে কোনো বিপদ তোকে ছুঁতে পারবে না। শুভ রাখি বন্ধন!",
      tags: ["sisterToBrother", "distance"],
    },
    {
      text: "তোর প্রতিটি হাসির দায়িত্ব আমার। রাখি বন্ধনের অনেক শুভেচ্ছা!",
      tags: ["brotherToSister"],
    },
    {
      text: "যত দূরেই থাকিস, তোর দাদা সবসময় এক ফোন দূরে। শুভ রাখি।",
      tags: ["brotherToSister", "distance"],
    },
    {
      text: "বোনেরাই জীবনের প্রথম বন্ধু। এই রাখিতে তোকে অনেক ভালোবাসা।",
      tags: ["sisterToSister"],
    },
    {
      text: "রক্তের সম্পর্ক হোক বা মনের — রাখির সুতো দুজনকেই সমান বাঁধে। শুভ রাখি বন্ধন!",
      tags: ["cousin", "sisterToSister"],
    },
    {
      text: "দূরত্বটা শুধু কিলোমিটারের, সম্পর্কের নয়। রাখি ডাকে, আশীর্বাদ সরাসরি মন থেকে।",
      tags: ["distance", "cousin"],
    },
    { text: "একটা সুতো, অজস্র স্মৃতি। শুভ রাখি বন্ধন! #রাখিবন্ধন", tags: ["caption"] },
    {
      text: "ভাই-বোনের সম্পর্ক: ঝগড়াও সবচেয়ে বেশি, ভালোবাসাও সবচেয়ে বেশি। শুভ রাখি বন্ধন!",
      tags: ["caption", "cousin"],
    },
    { text: "রাখি বাঁধা হয়ে গেল, এবার উপহারের পালা। শুভ রাখি! #রাখিবন্ধন", tags: ["caption"] },
  ],
};

export const MAX_MESSAGES = 8;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per concatenated part.
 * Indic scripts force UCS-2 at 70 and 67 respectively.
 */
export const SMS_LIMITS = {
  gsm7: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

const GSM7_SAFE = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅå_ÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const GSM7_EXTENDED = /[\^{}\\[\]~|€]/g;

export function countSmsSegments(text) {
  const body = typeof text === "string" ? text : "";
  const isGsm = GSM7_SAFE.test(body.replace(GSM7_EXTENDED, ""));
  const limits = isGsm ? SMS_LIMITS.gsm7 : SMS_LIMITS.ucs2;
  const units = isGsm
    ? [...body].length + (body.match(GSM7_EXTENDED) || []).length
    : [...body].length;
  const segments =
    units === 0 ? 1 : units <= limits.single ? 1 : Math.ceil(units / limits.concatenated);
  return { encoding: isGsm ? "GSM-7" : "UCS-2", units, segments };
}

/** mulberry32 — deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function cleanName(raw) {
  return String(raw == null ? "" : raw)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Build the personalised rakhi messages.
 *
 * @param {object} options
 * @param {string} options.language      LANGUAGES[].id
 * @param {string} options.relationship  RELATIONSHIPS[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]       1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  language,
  relationship,
  recipientName = "",
  senderName = "",
  count = 3,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[language];
  if (!bank) return { error: "Pick a language from the list." };
  if (!RELATIONSHIPS.some((item) => item.id === relationship)) {
    return { error: "Pick who you are writing to." };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_MESSAGES) {
    return { error: `Ask for ${MAX_MESSAGES} messages or fewer in one go.` };
  }

  const pool = bank.filter((item) => item.tags.includes(relationship));
  if (pool.length === 0) {
    return { error: "No wording in this language fits that relationship yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + 1);
  const picked = shuffle(pool, rng).slice(0, Math.min(Math.trunc(wanted), pool.length));

  const name = cleanName(recipientName);
  const sender = cleanName(senderName);
  const salutation = SALUTATIONS[language];

  const messages = picked.map((item, index) => {
    const parts = [];
    if (name) parts.push(salutation.replace("{name}", name));
    parts.push(item.text);
    if (sender) parts.push(`— ${sender}`);
    const text = parts.join("\n");
    const sms = countSmsSegments(text);
    return {
      id: `${language}-${relationship}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    language,
    relationship,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}

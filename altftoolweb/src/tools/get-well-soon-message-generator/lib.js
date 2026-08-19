/**
 * Get well soon message composer.
 *
 * Pure: no React, no DOM, no Date.now(). Same (inputs, seed) always produce the
 * same messages.
 */

export const MAX_VARIANTS = 6;
export const MAX_NAME_LENGTH = 60;

/* ------------------------------------------------------------------ *
 * SMS sizing — GSM 03.38 / 3GPP TS 23.038
 * ------------------------------------------------------------------ */

export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";

/** Characters, words and SMS part count for a finished message. */
export function messageStats(text) {
  const value = String(text ?? "");
  const chars = [...value].length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  let septets = 0;
  let gsmSafe = true;
  for (const ch of value) {
    if (GSM7_BASIC.includes(ch)) septets += 1;
    else if (GSM7_EXTENDED.includes(ch)) septets += 2;
    else {
      gsmSafe = false;
      break;
    }
  }

  const encoding = gsmSafe ? "GSM-7" : "UCS-2";
  const units = gsmSafe ? septets : chars;
  const single = gsmSafe ? GSM7_SINGLE : UCS2_SINGLE;
  const concat = gsmSafe ? GSM7_CONCAT : UCS2_CONCAT;
  const smsParts = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / concat);

  return { chars, words, encoding, smsParts };
}

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
  if (!Array.isArray(list) || list.length === 0) return "";
  return list[(offset + step) % list.length];
}

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish (Roman)" },
  { id: "hi", label: "हिन्दी" },
  { id: "mr", label: "मराठी" },
  { id: "bn", label: "বাংলা" },
  { id: "ta", label: "தமிழ்" },
];

/** Relationship decides the closing register, not the whole message. */
export const RELATIONSHIPS = [
  { id: "friend", label: "Friend", group: "personal" },
  { id: "family", label: "Family member", group: "personal" },
  { id: "partner", label: "Partner or spouse", group: "personal" },
  { id: "neighbour", label: "Neighbour", group: "personal" },
  { id: "colleague", label: "Colleague", group: "work" },
  { id: "teammate", label: "Team member you manage", group: "work" },
  { id: "boss", label: "Manager or senior", group: "formal" },
  { id: "client", label: "Client", group: "formal" },
  { id: "teacher", label: "Teacher or mentor", group: "formal" },
];

/**
 * `serious` situations are the ones where a joke usually lands badly, so the
 * humorous tone is refused for them rather than silently softened.
 */
export const SITUATIONS = [
  { id: "flu", label: "Fever, flu or viral", serious: false },
  { id: "illness", label: "General illness", serious: false },
  { id: "accident", label: "Accident, fracture or sprain", serious: false },
  { id: "surgery", label: "Surgery or procedure", serious: true },
  { id: "hospital", label: "Admitted in hospital", serious: true },
  { id: "chronic", label: "Long-term or serious illness", serious: true },
];

export const TONES = [
  { id: "warm", label: "Warm" },
  { id: "cheerful", label: "Cheerful" },
  { id: "formal", label: "Formal" },
  { id: "funny", label: "Light-hearted" },
  { id: "prayerful", label: "Prayerful" },
];

export const LENGTHS = [
  { id: "short", label: "Short (one line)" },
  { id: "medium", label: "Medium" },
  { id: "long", label: "Long" },
];

/* ------------------------------------------------------------------ *
 * Wording banks
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    greeting: "Dear {name},",
    openings: [
      "I heard you have not been keeping well.",
      "Just heard the news — I am thinking of you.",
      "Sorry to hear you are unwell right now.",
    ],
    context: {
      flu: "A fever knocks the wind out of anyone; give it the rest it demands.",
      illness: "Take the medicines on time and let your body do the rest.",
      accident: "Bones heal, but only if you actually stay off them for a while.",
      surgery: "The hardest part is behind you now; recovery just takes its own time.",
      hospital: "Hospital days are long and dull — I hope they pass quickly for you.",
      chronic: "Some days will be better than others, and that is completely normal.",
    },
    tones: {
      warm: [
        "Wishing you a smooth and complete recovery.",
        "Get well soon — you are missed.",
      ],
      cheerful: [
        "Back on your feet in no time, I am sure of it.",
        "Rest up now, celebrate later.",
      ],
      formal: [
        "Wishing you a swift and full recovery.",
        "I hope you regain your health at the earliest.",
      ],
      funny: [
        "Doctor's orders beat everyone else's orders, so enjoy the excuse.",
        "Consider this your official permission to lie in bed and do nothing.",
      ],
      prayerful: [
        "You are in my prayers for a quick recovery.",
        "May you be granted strength and complete healing.",
      ],
    },
    closings: {
      personal: ["Call me if you need anything at all.", "I will drop by soon."],
      work: ["Nothing at work is urgent enough to worry about — rest.", "The team has it covered; take your time."],
      formal: ["Please take all the time you need to recover.", "Looking forward to seeing you back in good health."],
    },
    signoff: "- {sender}",
  },

  hinglish: {
    greeting: "Priya {name},",
    openings: [
      "Suna hai aapki tabiyat theek nahi hai.",
      "Abhi pata chala, aapka bahut khayal aa raha hai.",
      "Sunkar dukh hua ki aap abhi theek nahi hain.",
    ],
    context: {
      flu: "Bukhaar sabko thaka deta hai; jitna aaram chahiye utna lijiye.",
      illness: "Dawa samay par lijiye, baaki kaam shareer khud kar lega.",
      accident: "Chot theek ho jaayegi, bas thoda aaram zaroori hai.",
      surgery: "Sabse mushkil hissa nikal gaya; ab recovery apna waqt legi.",
      hospital: "Hospital ke din lambe lagte hain, umeed hai jaldi kat jaayein.",
      chronic: "Kuch din behtar honge, kuch mushkil — yeh bilkul normal hai.",
    },
    tones: {
      warm: [
        "Jaldi se poori tarah swasth ho jaaiye.",
        "Get well soon — aapki kami mehsoos ho rahi hai.",
      ],
      cheerful: [
        "Jaldi hi phir se chalte-phirte nazar aaiyega.",
        "Abhi aaram, celebration baad mein.",
      ],
      formal: [
        "Aapke sheeghra swasthya labh ki kamna karta hoon.",
        "Ummeed hai aap jald hi poori tarah theek ho jaayenge.",
      ],
      funny: [
        "Doctor ka order sabse upar hota hai, to bahana enjoy kijiye.",
        "Yeh rahi bistar par pade rehne ki official permission.",
      ],
      prayerful: [
        "Aapke jald theek hone ki dua karta hoon.",
        "Ishwar aapko himmat aur poora swasthya de.",
      ],
    },
    closings: {
      personal: ["Kisi bhi cheez ki zarurat ho to phone kijiye.", "Jaldi milne aata hoon."],
      work: ["Office ka koi kaam itna zaroori nahi — aaram kijiye.", "Team sab sambhal legi, aap waqt lijiye."],
      formal: ["Kripya jitna samay chahiye aaram kijiye.", "Aapke swasth hokar lautne ka intezaar rahega."],
    },
    signoff: "- {sender}",
  },

  hi: {
    greeting: "प्रिय {name},",
    openings: [
      "सुना है आपकी तबीयत ठीक नहीं है।",
      "अभी पता चला, आपका बहुत ध्यान आ रहा है।",
      "सुनकर दुःख हुआ कि आप अभी स्वस्थ नहीं हैं।",
    ],
    context: {
      flu: "बुख़ार सबको थका देता है; जितना आराम चाहिए उतना लीजिए।",
      illness: "दवा समय पर लीजिए, बाकी काम शरीर स्वयं कर लेगा।",
      accident: "चोट ठीक हो जाएगी, बस थोड़ा आराम ज़रूरी है।",
      surgery: "सबसे कठिन हिस्सा निकल गया; अब स्वास्थ्य लाभ अपना समय लेगा।",
      hospital: "अस्पताल के दिन लंबे लगते हैं, आशा है जल्दी कट जाएँ।",
      chronic: "कुछ दिन बेहतर होंगे, कुछ कठिन — यह बिल्कुल स्वाभाविक है।",
    },
    tones: {
      warm: [
        "शीघ्र और पूर्ण स्वास्थ्य लाभ की कामना है।",
        "जल्दी स्वस्थ हो जाइए — आपकी कमी महसूस हो रही है।",
      ],
      cheerful: [
        "जल्द ही फिर से चलते-फिरते नज़र आइएगा।",
        "अभी आराम, उत्सव बाद में।",
      ],
      formal: [
        "आपके शीघ्र स्वास्थ्य लाभ की कामना करता हूँ।",
        "आशा है आप शीघ्र ही पूर्णतः स्वस्थ हो जाएँगे।",
      ],
      funny: [
        "डॉक्टर का आदेश सबसे ऊपर होता है, तो बहाने का आनंद लीजिए।",
        "यह रही बिस्तर पर पड़े रहने की आधिकारिक अनुमति।",
      ],
      prayerful: [
        "आपके शीघ्र स्वस्थ होने की प्रार्थना करता हूँ।",
        "ईश्वर आपको शक्ति और पूर्ण आरोग्य प्रदान करें।",
      ],
    },
    closings: {
      personal: ["किसी भी वस्तु की आवश्यकता हो तो फ़ोन कीजिए।", "जल्दी मिलने आता हूँ।"],
      work: ["कार्यालय का कोई काम इतना ज़रूरी नहीं — आराम कीजिए।", "टीम सब सँभाल लेगी, आप समय लीजिए।"],
      formal: ["कृपया जितना समय चाहिए आराम कीजिए।", "आपके स्वस्थ होकर लौटने की प्रतीक्षा रहेगी।"],
    },
    signoff: "- {sender}",
  },

  mr: {
    greeting: "प्रिय {name},",
    openings: [
      "ऐकले की तुमची तब्येत बरी नाही.",
      "आत्ताच कळले, तुमची खूप आठवण येते आहे.",
      "तुम्ही बरे नाही आहात हे ऐकून वाईट वाटले.",
    ],
    context: {
      flu: "ताप कोणालाही थकवतो; हवा तेवढा आराम करा.",
      illness: "औषध वेळेवर घ्या, बाकीचे शरीर स्वतः करेल.",
      accident: "जखम भरून येईल, फक्त थोडा आराम आवश्यक आहे.",
      surgery: "सर्वात कठीण भाग संपला; आता बरे होण्यास वेळ लागेल.",
      hospital: "रुग्णालयातील दिवस लांब वाटतात, लवकर संपोत.",
      chronic: "काही दिवस बरे जातील, काही कठीण — हे अगदी स्वाभाविक आहे.",
    },
    tones: {
      warm: [
        "लवकर आणि पूर्ण बरे व्हा हीच सदिच्छा.",
        "लवकर बरे व्हा — तुमची उणीव जाणवते आहे.",
      ],
      cheerful: [
        "लवकरच पुन्हा फिरताना दिसाल याची खात्री आहे.",
        "आत्ता आराम, आनंद नंतर.",
      ],
      formal: [
        "आपल्या शीघ्र आरोग्यलाभासाठी शुभेच्छा.",
        "आपण लवकरच पूर्णपणे बरे व्हाल अशी आशा आहे.",
      ],
      funny: [
        "डॉक्टरांचा आदेश सर्वात वरचा, तेव्हा या सबबीचा आनंद घ्या.",
        "ही घ्या अंथरुणात लोळण्याची अधिकृत परवानगी.",
      ],
      prayerful: [
        "तुम्ही लवकर बरे व्हावे अशी प्रार्थना करतो.",
        "देव तुम्हाला बळ आणि पूर्ण आरोग्य देवो.",
      ],
    },
    closings: {
      personal: ["काहीही लागले तर फोन करा.", "लवकरच भेटायला येतो."],
      work: ["ऑफिसचे कोणतेही काम इतके तातडीचे नाही — आराम करा.", "टीम सगळे सांभाळेल, तुम्ही वेळ घ्या."],
      formal: ["कृपया हवा तेवढा आराम करा.", "तुम्ही बरे होऊन परत येण्याची वाट पाहतो."],
    },
    signoff: "- {sender}",
  },

  bn: {
    greeting: "প্রিয় {name},",
    openings: [
      "শুনলাম আপনার শরীর ভালো যাচ্ছে না।",
      "এইমাত্র জানলাম, আপনার কথা খুব মনে পড়ছে।",
      "আপনি অসুস্থ শুনে খারাপ লাগল।",
    ],
    context: {
      flu: "জ্বর সবাইকেই কাবু করে; যতটা বিশ্রাম দরকার নিন।",
      illness: "ওষুধ সময়মতো খান, বাকিটা শরীর নিজেই সামলে নেবে।",
      accident: "চোট সেরে যাবে, শুধু একটু বিশ্রাম দরকার।",
      surgery: "সবচেয়ে কঠিন ধাপটা পেরিয়ে গেছেন; সেরে উঠতে সময় লাগবেই।",
      hospital: "হাসপাতালের দিনগুলো লম্বা মনে হয়, তাড়াতাড়ি কেটে যাক।",
      chronic: "কিছু দিন ভালো যাবে, কিছু কঠিন — এটাই স্বাভাবিক।",
    },
    tones: {
      warm: [
        "দ্রুত ও সম্পূর্ণ সুস্থতা কামনা করি।",
        "তাড়াতাড়ি সুস্থ হয়ে উঠুন — আপনার অভাব বোধ করছি।",
      ],
      cheerful: [
        "খুব শিগগিরই আবার ঘুরে বেড়াবেন, নিশ্চিত।",
        "এখন বিশ্রাম, উদযাপন পরে।",
      ],
      formal: [
        "আপনার দ্রুত আরোগ্য কামনা করি।",
        "আশা করি আপনি শীঘ্রই সম্পূর্ণ সুস্থ হয়ে উঠবেন।",
      ],
      funny: [
        "ডাক্তারের আদেশ সবার উপরে, তাই অজুহাতটা উপভোগ করুন।",
        "এই নিন বিছানায় শুয়ে থাকার সরকারি অনুমতি।",
      ],
      prayerful: [
        "আপনার দ্রুত আরোগ্যের জন্য প্রার্থনা করি।",
        "ঈশ্বর আপনাকে শক্তি ও পূর্ণ সুস্থতা দিন।",
      ],
    },
    closings: {
      personal: ["কিছু দরকার হলে ফোন করবেন।", "শিগগিরই দেখা করতে আসছি।"],
      work: ["অফিসের কোনো কাজই এত জরুরি নয় — বিশ্রাম নিন।", "টিম সব সামলে নেবে, আপনি সময় নিন।"],
      formal: ["অনুগ্রহ করে যত সময় দরকার বিশ্রাম নিন।", "আপনি সুস্থ হয়ে ফিরবেন, সেই অপেক্ষায় রইলাম।"],
    },
    signoff: "- {sender}",
  },

  ta: {
    greeting: "அன்புள்ள {name},",
    openings: [
      "உங்கள் உடல்நிலை சரியில்லை என்று கேள்விப்பட்டேன்.",
      "இப்போதுதான் தெரிந்தது, உங்கள் நினைவாகவே இருக்கிறேன்.",
      "நீங்கள் உடல்நலம் இல்லாமல் இருப்பது கேட்டு வருத்தமாக இருக்கிறது.",
    ],
    context: {
      flu: "காய்ச்சல் யாரையும் சோர்வடையச் செய்யும்; தேவையான ஓய்வு எடுங்கள்.",
      illness: "மருந்தை நேரத்தில் எடுத்துக் கொள்ளுங்கள், மீதியை உடல் பார்த்துக் கொள்ளும்.",
      accident: "காயம் ஆறிவிடும், கொஞ்சம் ஓய்வு மட்டும் தேவை.",
      surgery: "கடினமான பகுதி முடிந்துவிட்டது; குணமாக சிறிது காலம் ஆகும்.",
      hospital: "மருத்துவமனை நாட்கள் நீளமாகத் தோன்றும், விரைவில் கடக்கட்டும்.",
      chronic: "சில நாட்கள் நன்றாக இருக்கும், சில கடினமாக — இது இயல்பானதே.",
    },
    tones: {
      warm: [
        "விரைவில் முழுமையாக குணமடைய வாழ்த்துக்கள்.",
        "சீக்கிரம் குணமாகுங்கள் — உங்கள் இல்லாமை உணரப்படுகிறது.",
      ],
      cheerful: [
        "விரைவில் மீண்டும் நடமாடுவீர்கள், உறுதி.",
        "இப்போது ஓய்வு, கொண்டாட்டம் பிறகு.",
      ],
      formal: [
        "உங்கள் விரைவான நலம் பெற வாழ்த்துகிறேன்.",
        "விரைவில் முற்றிலும் குணமடைவீர்கள் என நம்புகிறேன்.",
      ],
      funny: [
        "மருத்துவரின் உத்தரவு அனைத்தையும் விட மேலானது, சாக்கை அனுபவியுங்கள்.",
        "படுக்கையில் சும்மா படுத்திருக்க இதோ அதிகாரப்பூர்வ அனுமதி.",
      ],
      prayerful: [
        "நீங்கள் விரைவில் குணமாக பிரார்த்திக்கிறேன்.",
        "இறைவன் உங்களுக்கு பலமும் முழு நலமும் அருளட்டும்.",
      ],
    },
    closings: {
      personal: ["எதுவும் தேவைப்பட்டால் அழையுங்கள்.", "விரைவில் பார்க்க வருகிறேன்."],
      work: ["அலுவலக வேலை எதுவும் அவ்வளவு அவசரம் இல்லை — ஓய்வெடுங்கள்.", "குழு பார்த்துக் கொள்ளும், நேரம் எடுத்துக் கொள்ளுங்கள்."],
      formal: ["தேவையான நேரம் ஓய்வெடுங்கள்.", "நலமுடன் திரும்பி வருவீர்கள் என எதிர்பார்க்கிறேன்."],
    },
    signoff: "- {sender}",
  },
};

/* ------------------------------------------------------------------ *
 * Compose
 * ------------------------------------------------------------------ */

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/**
 * Build get well soon message drafts.
 *
 * @returns {{variants:Array<{id:number,text:string,stats:object}>,
 *            situation:string, relationship:string}|{error:string}}
 */
export function buildGetWellMessages({
  name = "",
  relationship = "friend",
  situation = "flu",
  tone = "warm",
  language = "en",
  length = "medium",
  sender = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const relEntry = RELATIONSHIPS.find((item) => item.id === relationship) ?? RELATIONSHIPS[0];
  const sitEntry = SITUATIONS.find((item) => item.id === situation) ?? SITUATIONS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "warm";
  const lenId = LENGTHS.some((item) => item.id === length) ? length : "medium";

  const person = clean(name);
  if (!person) return { error: "Add the name of the person you are writing to." };

  if (sitEntry.serious && toneId === "funny") {
    return {
      error: `Humour rarely lands for "${sitEntry.label.toLowerCase()}". Pick warm, formal or prayerful instead.`,
    };
  }

  const senderName = clean(sender);
  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const toneOffset = Math.floor(rng() * 997);
  const closeOffset = Math.floor(rng() * 997);

  const tokens = { name: person, sender: senderName };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const parts = [];

    if (lenId === "short") {
      const line = `${person}, ${rotate(pack.tones[toneId], toneOffset, step)}`;
      parts.push(senderName ? `${line} — ${senderName}` : line);
    } else {
      parts.push(fill(pack.greeting, tokens));
      parts.push(rotate(pack.openings, openOffset, step));
      if (lenId === "long") parts.push(pack.context[sitEntry.id]);
      parts.push(rotate(pack.tones[toneId], toneOffset, step));
      parts.push(rotate(pack.closings[relEntry.group], closeOffset, step));
      if (senderName) parts.push(fill(pack.signoff, tokens));
    }

    const text = parts.join("\n");
    variants.push({ id: step + 1, text, stats: messageStats(text) });
  }

  return {
    variants,
    situation: sitEntry.label,
    relationship: relEntry.label,
    tone: toneId,
    length: lenId,
  };
}

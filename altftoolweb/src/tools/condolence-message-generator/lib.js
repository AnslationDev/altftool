/**
 * Condolence message composer.
 *
 * Pure text composition — no React, no DOM, no Date.now(). Every message is a
 * deterministic function of (inputs, seed).
 */

/** More than six drafts is noise when you are choosing words for a bereavement. */
export const MAX_VARIANTS = 6;
/** Names longer than this are almost always a paste accident. */
export const MAX_NAME_LENGTH = 80;

/* ------------------------------------------------------------------ *
 * SMS sizing — GSM 03.38 / 3GPP TS 23.038
 * ------------------------------------------------------------------ */

/** Single-part SMS in the 7-bit GSM default alphabet. */
export const GSM7_SINGLE = 160;
/** Per-part payload once a GSM-7 message is concatenated (6-byte UDH header). */
export const GSM7_CONCAT = 153;
/** Single-part SMS once any character forces UCS-2 (16-bit) encoding. */
export const UCS2_SINGLE = 70;
/** Per-part payload for a concatenated UCS-2 message. */
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

/** mulberry32 — small, deterministic 32-bit PRNG. */
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

export const RELATIONSHIPS = [
  { id: "close", label: "Close friend or family" },
  { id: "friend", label: "Friend" },
  { id: "colleague", label: "Colleague" },
  { id: "manager", label: "Manager or senior" },
  { id: "client", label: "Client or business contact" },
  { id: "neighbour", label: "Neighbour or acquaintance" },
];

export const KINSHIPS = [
  { id: "father", label: "Father" },
  { id: "mother", label: "Mother" },
  { id: "husband", label: "Husband" },
  { id: "wife", label: "Wife" },
  { id: "son", label: "Son" },
  { id: "daughter", label: "Daughter" },
  { id: "brother", label: "Brother" },
  { id: "sister", label: "Sister" },
  { id: "grandfather", label: "Grandfather" },
  { id: "grandmother", label: "Grandmother" },
];

/**
 * Faith traditions and the closing phrase each community actually uses.
 * These are the customary condolence formulas, not religious instruction.
 */
export const TRADITIONS = [
  { id: "secular", label: "No faith reference", note: "Safe when you are unsure" },
  { id: "hindu", label: "Hindu", note: "Om Shanti" },
  { id: "muslim", label: "Muslim", note: "Inna lillahi wa inna ilayhi raji'un" },
  { id: "christian", label: "Christian", note: "Rest in peace" },
  { id: "sikh", label: "Sikh", note: "Waheguru ji" },
  { id: "jain", label: "Jain", note: "Om Shanti" },
  { id: "buddhist", label: "Buddhist", note: "May they find peace" },
  { id: "parsi", label: "Parsi / Zoroastrian", note: "Eternal peace" },
];

export const LENGTHS = [
  { id: "short", label: "Short (SMS)", parts: 2 },
  { id: "medium", label: "Medium", parts: 3 },
  { id: "long", label: "Letter", parts: 4 },
];

/* ------------------------------------------------------------------ *
 * Wording banks
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    kinship: {
      father: "your father",
      mother: "your mother",
      husband: "your husband",
      wife: "your wife",
      son: "your son",
      daughter: "your daughter",
      brother: "your brother",
      sister: "your sister",
      grandfather: "your grandfather",
      grandmother: "your grandmother",
    },
    greeting: "Dear {recipient},",
    openings: [
      "I was deeply saddened to hear about the passing of {subject}.",
      "Words fall short today. I am so sorry about {subject}.",
      "My heart goes out to you and your family on the loss of {subject}.",
      "I only just heard about {subject}, and I am truly sorry.",
    ],
    supports: {
      close: [
        "Please know that you do not have to carry this alone.",
        "I will remember the warmth of that home for a very long time.",
        "Grieve at your own pace; there is no timetable for this.",
      ],
      friend: [
        "Please take whatever time you need. I am thinking of you.",
        "Hold on to the good memories; they are yours to keep.",
        "You and your family are in my thoughts.",
      ],
      colleague: [
        "Please do not worry about anything at work right now.",
        "The whole team is thinking of you and your family.",
        "Take the time you need; the desk can wait.",
      ],
      manager: [
        "Please take all the time you need away from work.",
        "The team sends its sincere condolences to you and your family.",
        "Nothing here is more important than being with your family right now.",
      ],
      client: [
        "Please do not think about any pending work at this time.",
        "Our whole team sends its heartfelt condolences.",
        "We will pick things up whenever you are ready, and not a day before.",
      ],
      neighbour: [
        "Please do not hesitate to knock if you need anything at all.",
        "The whole street is thinking of your family.",
        "We are close by if there is anything you need.",
      ],
    },
    offers: [
      "If there is anything at all I can do — errands, calls, paperwork — please just say the word.",
      "I can help with the arrangements or simply sit with you; whichever is more useful.",
      "Call me at any hour, even if it is only to talk.",
    ],
    closings: {
      secular: "With deepest sympathy,",
      hindu: "Om Shanti. May the departed soul rest in peace.",
      muslim: "Inna lillahi wa inna ilayhi raji'un. May Allah grant the departed a place in Jannah and give your family sabr.",
      christian: "May the soul rest in eternal peace, and may God comfort your family.",
      sikh: "Waheguru ji bless the departed soul with eternal peace and give your family strength.",
      jain: "Om Shanti. May the departed soul progress towards liberation.",
      buddhist: "May the departed find peace, and may your family find comfort.",
      parsi: "May the soul rest in everlasting peace.",
    },
    signoff: "With sympathy, {sender}",
  },

  hinglish: {
    kinship: {
      father: "aapke pitaji",
      mother: "aapki mataji",
      husband: "aapke pati",
      wife: "aapki patni",
      son: "aapke bete",
      daughter: "aapki beti",
      brother: "aapke bhai",
      sister: "aapki behen",
      grandfather: "aapke dadaji",
      grandmother: "aapki dadiji",
    },
    greeting: "Priya {recipient},",
    openings: [
      "{subject} ke nidhan ka samachar sunkar bahut dukh hua.",
      "Is samay shabd kam pad jaate hain. {subject} ke liye dil se afsos hai.",
      "{subject} ke jaane ka dukh main shabdon mein nahi keh sakta.",
      "Abhi {subject} ke baare mein pata chala, bahut dukh hua.",
    ],
    supports: {
      close: [
        "Yaad rakhiye, is dukh mein aap akele nahi hain.",
        "Us ghar ki apnaayat main kabhi nahi bhool paunga.",
        "Apne samay ke hisab se sambhaliye, koi jaldi nahi hai.",
      ],
      friend: [
        "Jitna waqt chahiye lijiye. Main aapke saath hoon.",
        "Achhi yaadein sambhal kar rakhiye, wahi humesha rahengi.",
        "Aap aur aapka parivaar mere khayalon mein hain.",
      ],
      colleague: [
        "Office ki kisi baat ki chinta abhi mat kijiye.",
        "Poori team aapke aur aapke parivaar ke saath hai.",
        "Jitni chhutti chahiye lijiye, kaam ruk sakta hai.",
      ],
      manager: [
        "Kripya jitna samay chahiye parivaar ke saath rahiye.",
        "Team ki taraf se dil se shok sanvedna.",
        "Is waqt parivaar se badhkar kuch bhi zaroori nahi hai.",
      ],
      client: [
        "Kisi pending kaam ki chinta abhi bilkul mat kijiye.",
        "Hamari poori team ki taraf se hardik shok sanvedna.",
        "Jab aap taiyar honge tab hi hum aage badhenge.",
      ],
      neighbour: [
        "Kisi bhi cheez ki zarurat ho to bilkul sankoch mat kijiye.",
        "Poora mohalla aapke parivaar ke saath hai.",
        "Hum paas hi hain, kabhi bhi awaaz de dijiye.",
      ],
    },
    offers: [
      "Koi bhi kaam ho — bazaar, phone, kagzi kaarvai — bas keh dijiye.",
      "Intezaam mein madad karun ya bas saath baithun, jo aapko theek lage.",
      "Kisi bhi waqt phone kijiye, sirf baat karne ke liye hi sahi.",
    ],
    closings: {
      secular: "Gehri sanvedna ke saath,",
      hindu: "Om Shanti. Divangat aatma ko shanti mile.",
      muslim: "Inna lillahi wa inna ilayhi raji'un. Allah marhoom ko jannat ata kare aur aapke parivaar ko sabr de.",
      christian: "Aatma ko sada ki shanti mile aur Prabhu aapke parivaar ko dhairya de.",
      sikh: "Waheguru ji divangat aatma ko shanti aur parivaar ko himmat den.",
      jain: "Om Shanti. Divangat aatma uttam gati ko prapt ho.",
      buddhist: "Divangat aatma ko shanti mile aur aapke parivaar ko dhairya.",
      parsi: "Aatma ko sada ki shanti prapt ho.",
    },
    signoff: "Shok ke saath, {sender}",
  },

  hi: {
    kinship: {
      father: "आपके पिताजी",
      mother: "आपकी माताजी",
      husband: "आपके पति",
      wife: "आपकी पत्नी",
      son: "आपके पुत्र",
      daughter: "आपकी पुत्री",
      brother: "आपके भाई",
      sister: "आपकी बहन",
      grandfather: "आपके दादाजी",
      grandmother: "आपकी दादीजी",
    },
    greeting: "आदरणीय {recipient},",
    openings: [
      "{subject} के निधन का समाचार सुनकर अत्यंत दुःख हुआ।",
      "इस समय शब्द कम पड़ जाते हैं। {subject} के लिए हार्दिक शोक।",
      "{subject} के जाने का दुःख शब्दों में नहीं कहा जा सकता।",
      "अभी-अभी {subject} के बारे में पता चला, मन बहुत व्यथित है।",
    ],
    supports: {
      close: [
        "याद रखिए, इस दुःख में आप अकेले नहीं हैं।",
        "उस घर का अपनापन मैं कभी नहीं भूल पाऊँगा।",
        "अपने समय से सँभलिए, कोई जल्दी नहीं है।",
      ],
      friend: [
        "जितना समय चाहिए लीजिए। मैं आपके साथ हूँ।",
        "अच्छी यादें सँभालकर रखिए, वही सदा रहेंगी।",
        "आप और आपका परिवार मेरे विचारों में हैं।",
      ],
      colleague: [
        "कार्यालय की किसी बात की चिंता अभी न कीजिए।",
        "पूरी टीम आपके और आपके परिवार के साथ है।",
        "जितनी छुट्टी चाहिए लीजिए, काम रुक सकता है।",
      ],
      manager: [
        "कृपया जितना समय चाहिए परिवार के साथ रहिए।",
        "टीम की ओर से हार्दिक शोक संवेदना।",
        "इस समय परिवार से बढ़कर कुछ भी आवश्यक नहीं है।",
      ],
      client: [
        "किसी लंबित कार्य की चिंता अभी बिल्कुल न कीजिए।",
        "हमारी पूरी टीम की ओर से हार्दिक शोक संवेदना।",
        "जब आप तैयार होंगे तभी हम आगे बढ़ेंगे।",
      ],
      neighbour: [
        "किसी भी वस्तु की आवश्यकता हो तो संकोच न कीजिए।",
        "पूरा मोहल्ला आपके परिवार के साथ है।",
        "हम पास ही हैं, कभी भी आवाज़ दीजिए।",
      ],
    },
    offers: [
      "कोई भी काम हो — बाज़ार, फ़ोन, कागज़ी कार्रवाई — बस कह दीजिए।",
      "व्यवस्था में सहायता करूँ या बस साथ बैठूँ, जो आपको ठीक लगे।",
      "किसी भी समय फ़ोन कीजिए, केवल बात करने के लिए ही सही।",
    ],
    closings: {
      secular: "गहरी संवेदना के साथ,",
      hindu: "ॐ शांति। दिवंगत आत्मा को शांति मिले।",
      muslim: "इन्ना लिल्लाहि व इन्ना इलैहि राजिऊन। अल्लाह मरहूम को जन्नत अता करे और परिवार को सब्र दे।",
      christian: "आत्मा को सदा की शांति मिले और प्रभु आपके परिवार को धैर्य दें।",
      sikh: "वाहेगुरु जी दिवंगत आत्मा को शांति और परिवार को हिम्मत दें।",
      jain: "ॐ शांति। दिवंगत आत्मा उत्तम गति को प्राप्त हो।",
      buddhist: "दिवंगत आत्मा को शांति मिले और परिवार को धैर्य।",
      parsi: "आत्मा को सदा की शांति प्राप्त हो।",
    },
    signoff: "शोक सहित, {sender}",
  },

  mr: {
    kinship: {
      father: "तुमचे वडील",
      mother: "तुमच्या आई",
      husband: "तुमचे पती",
      wife: "तुमच्या पत्नी",
      son: "तुमचा मुलगा",
      daughter: "तुमची मुलगी",
      brother: "तुमचा भाऊ",
      sister: "तुमची बहीण",
      grandfather: "तुमचे आजोबा",
      grandmother: "तुमच्या आजी",
    },
    greeting: "आदरणीय {recipient},",
    openings: [
      "{subject} यांच्या निधनाची बातमी ऐकून खूप दुःख झाले.",
      "अशा वेळी शब्द अपुरे पडतात. {subject} यांच्यासाठी मनःपूर्वक श्रद्धांजली.",
      "{subject} यांच्या जाण्याचे दुःख शब्दांत मांडता येत नाही.",
      "आत्ताच {subject} यांच्याबद्दल कळले, मन सुन्न झाले.",
    ],
    supports: {
      close: [
        "लक्षात ठेवा, या दुःखात तुम्ही एकटे नाही आहात.",
        "त्या घरातील आपुलकी मी कधीच विसरणार नाही.",
        "स्वतःच्या वेगाने सावरा, घाई अजिबात नाही.",
      ],
      friend: [
        "हवा तेवढा वेळ घ्या. मी तुमच्यासोबत आहे.",
        "चांगल्या आठवणी जपून ठेवा, त्याच कायम राहतील.",
        "तुम्ही आणि तुमचे कुटुंब माझ्या विचारांत आहात.",
      ],
      colleague: [
        "ऑफिसच्या कोणत्याही गोष्टीची काळजी आत्ता करू नका.",
        "संपूर्ण टीम तुमच्या आणि कुटुंबाच्या पाठीशी आहे.",
        "हवी तेवढी रजा घ्या, काम थांबू शकते.",
      ],
      manager: [
        "कृपया हवा तेवढा वेळ कुटुंबासोबत घालवा.",
        "टीमकडून मनःपूर्वक शोक संवेदना.",
        "या वेळी कुटुंबापेक्षा महत्त्वाचे काहीही नाही.",
      ],
      client: [
        "प्रलंबित कामाची काळजी आत्ता अजिबात करू नका.",
        "आमच्या संपूर्ण टीमकडून हार्दिक श्रद्धांजली.",
        "तुम्ही तयार असाल तेव्हाच आपण पुढे जाऊ.",
      ],
      neighbour: [
        "कोणतीही गरज असल्यास अजिबात संकोच करू नका.",
        "संपूर्ण सोसायटी तुमच्या कुटुंबासोबत आहे.",
        "आम्ही जवळच आहोत, कधीही हाक मारा.",
      ],
    },
    offers: [
      "कोणतेही काम असो — बाजार, फोन, कागदपत्रे — फक्त सांगा.",
      "व्यवस्थेत मदत करू की फक्त सोबत बसू, जे तुम्हाला योग्य वाटेल.",
      "कधीही फोन करा, फक्त बोलण्यासाठी असले तरी चालेल.",
    ],
    closings: {
      secular: "मनःपूर्वक सहवेदना,",
      hindu: "ॐ शांती. दिवंगत आत्म्यास शांती लाभो.",
      muslim: "इन्ना लिल्लाहि व इन्ना इलैहि राजिऊन. अल्लाह मरहूमांना जन्नत देवो आणि कुटुंबाला सबर देवो.",
      christian: "आत्म्यास चिरशांती लाभो आणि परमेश्वर कुटुंबाला धीर देवो.",
      sikh: "वाहेगुरु जी दिवंगत आत्म्यास शांती आणि कुटुंबाला बळ देवोत.",
      jain: "ॐ शांती. दिवंगत आत्म्यास उत्तम गती लाभो.",
      buddhist: "दिवंगत आत्म्यास शांती आणि कुटुंबाला धीर लाभो.",
      parsi: "आत्म्यास चिरंतन शांती लाभो.",
    },
    signoff: "सहवेदनेसह, {sender}",
  },

  bn: {
    kinship: {
      father: "আপনার বাবা",
      mother: "আপনার মা",
      husband: "আপনার স্বামী",
      wife: "আপনার স্ত্রী",
      son: "আপনার ছেলে",
      daughter: "আপনার মেয়ে",
      brother: "আপনার ভাই",
      sister: "আপনার বোন",
      grandfather: "আপনার দাদু",
      grandmother: "আপনার ঠাকুমা",
    },
    greeting: "শ্রদ্ধেয় {recipient},",
    openings: [
      "{subject}-এর প্রয়াণের খবর শুনে গভীরভাবে ব্যথিত হলাম।",
      "এই সময়ে ভাষা অপ্রতুল। {subject}-এর জন্য আন্তরিক শোক জানাই।",
      "{subject}-কে হারানোর কষ্ট ভাষায় প্রকাশ করা যায় না।",
      "সবেমাত্র {subject}-এর কথা জানলাম, মন ভীষণ ভারাক্রান্ত।",
    ],
    supports: {
      close: [
        "মনে রাখবেন, এই শোকে আপনি একা নন।",
        "সেই বাড়ির আন্তরিকতা আমি কোনোদিন ভুলব না।",
        "নিজের মতো করে সামলে উঠুন, কোনো তাড়া নেই।",
      ],
      friend: [
        "যত সময় দরকার নিন। আমি আপনার পাশে আছি।",
        "ভালো স্মৃতিগুলো ধরে রাখুন, ওগুলোই থেকে যাবে।",
        "আপনি ও আপনার পরিবার আমার ভাবনায় আছেন।",
      ],
      colleague: [
        "অফিসের কোনো কিছু নিয়ে এখন ভাববেন না।",
        "গোটা টিম আপনার ও আপনার পরিবারের পাশে আছে।",
        "যত ছুটি দরকার নিন, কাজ অপেক্ষা করতে পারে।",
      ],
      manager: [
        "অনুগ্রহ করে যত সময় দরকার পরিবারের সঙ্গে থাকুন।",
        "টিমের পক্ষ থেকে আন্তরিক শোক জানাই।",
        "এই মুহূর্তে পরিবারের চেয়ে জরুরি কিছুই নয়।",
      ],
      client: [
        "বকেয়া কাজ নিয়ে এখন একদমই চিন্তা করবেন না।",
        "আমাদের গোটা টিমের পক্ষ থেকে আন্তরিক সমবেদনা।",
        "আপনি প্রস্তুত হলে তবেই আমরা এগোব।",
      ],
      neighbour: [
        "কোনো কিছু প্রয়োজন হলে নির্দ্বিধায় বলবেন।",
        "গোটা পাড়া আপনার পরিবারের পাশে আছে।",
        "আমরা কাছেই আছি, যেকোনো সময় ডাকবেন।",
      ],
    },
    offers: [
      "যেকোনো কাজ — বাজার, ফোন, কাগজপত্র — শুধু বলুন।",
      "ব্যবস্থায় সাহায্য করব নাকি শুধু পাশে বসব, যেটা আপনার ভালো লাগে।",
      "যেকোনো সময় ফোন করবেন, শুধু কথা বলার জন্য হলেও।",
    ],
    closings: {
      secular: "গভীর সমবেদনা সহ,",
      hindu: "ॐ শান্তি। প্রয়াত আত্মা শান্তি পাক।",
      muslim: "ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন। আল্লাহ মরহুমকে জান্নাত দিন ও পরিবারকে সবর দিন।",
      christian: "আত্মা চিরশান্তি পাক এবং ঈশ্বর পরিবারকে সান্ত্বনা দিন।",
      sikh: "ওয়াহেগুরু জি প্রয়াত আত্মাকে শান্তি ও পরিবারকে শক্তি দিন।",
      jain: "ॐ শান্তি। প্রয়াত আত্মা উত্তম গতি লাভ করুক।",
      buddhist: "প্রয়াত আত্মা শান্তি পাক, পরিবার সান্ত্বনা পাক।",
      parsi: "আত্মা চিরন্তন শান্তি লাভ করুক।",
    },
    signoff: "সমবেদনা সহ, {sender}",
  },

  ta: {
    kinship: {
      father: "உங்கள் தந்தை",
      mother: "உங்கள் தாயார்",
      husband: "உங்கள் கணவர்",
      wife: "உங்கள் மனைவி",
      son: "உங்கள் மகன்",
      daughter: "உங்கள் மகள்",
      brother: "உங்கள் சகோதரர்",
      sister: "உங்கள் சகோதரி",
      grandfather: "உங்கள் தாத்தா",
      grandmother: "உங்கள் பாட்டி",
    },
    greeting: "அன்புள்ள {recipient},",
    openings: [
      "{subject} அவர்களின் மறைவுச் செய்தி கேட்டு மிகுந்த வேதனை அடைந்தேன்.",
      "இந்த நேரத்தில் வார்த்தைகள் போதாது. {subject} அவர்களுக்கு எனது ஆழ்ந்த இரங்கல்.",
      "{subject} அவர்களை இழந்த துயரை வார்த்தைகளில் சொல்ல முடியவில்லை.",
      "இப்போதுதான் {subject} பற்றி அறிந்தேன், மனம் மிகவும் கனத்துப் போனது.",
    ],
    supports: {
      close: [
        "இந்தத் துயரில் நீங்கள் தனியாக இல்லை என்பதை நினைவில் கொள்ளுங்கள்.",
        "அந்த வீட்டின் அன்பை நான் ஒருபோதும் மறக்க மாட்டேன்.",
        "உங்கள் வேகத்தில் தேறி வாருங்கள், அவசரம் எதுவும் இல்லை.",
      ],
      friend: [
        "தேவையான நேரம் எடுத்துக் கொள்ளுங்கள். நான் உங்களுடன் இருக்கிறேன்.",
        "நல்ல நினைவுகளைப் பத்திரமாக வைத்திருங்கள், அவை நிரந்தரம்.",
        "நீங்களும் உங்கள் குடும்பமும் என் நினைவில் இருக்கிறீர்கள்.",
      ],
      colleague: [
        "அலுவலக விஷயங்களைப் பற்றி இப்போது கவலைப்பட வேண்டாம்.",
        "முழு குழுவும் உங்களுடனும் உங்கள் குடும்பத்துடனும் இருக்கிறது.",
        "தேவையான விடுப்பு எடுத்துக் கொள்ளுங்கள், வேலை காத்திருக்கும்.",
      ],
      manager: [
        "தேவையான நேரம் குடும்பத்துடன் இருங்கள்.",
        "குழுவின் சார்பாக ஆழ்ந்த இரங்கல்.",
        "இந்த நேரத்தில் குடும்பத்தை விட முக்கியமானது எதுவும் இல்லை.",
      ],
      client: [
        "நிலுவையில் உள்ள வேலைகளைப் பற்றி இப்போது கவலை வேண்டாம்.",
        "எங்கள் குழு முழுவதும் சார்பாக ஆழ்ந்த இரங்கல்.",
        "நீங்கள் தயாராகும் போதுதான் நாங்கள் தொடர்வோம்.",
      ],
      neighbour: [
        "எதுவும் தேவைப்பட்டால் தயங்காமல் சொல்லுங்கள்.",
        "தெரு முழுவதும் உங்கள் குடும்பத்துடன் இருக்கிறது.",
        "நாங்கள் அருகிலேயே இருக்கிறோம், எப்போது வேண்டுமானாலும் கூப்பிடுங்கள்.",
      ],
    },
    offers: [
      "எந்த வேலையாக இருந்தாலும் — கடை, தொலைபேசி, ஆவணங்கள் — சொன்னால் போதும்.",
      "ஏற்பாடுகளில் உதவட்டுமா அல்லது உடன் அமரட்டுமா, உங்களுக்கு எது சரியோ அது.",
      "எந்த நேரத்திலும் அழையுங்கள், பேசுவதற்காக மட்டுமே ஆனாலும் சரி.",
    ],
    closings: {
      secular: "ஆழ்ந்த இரங்கலுடன்,",
      hindu: "ॐ சாந்தி. மறைந்த ஆன்மா அமைதி பெறட்டும்.",
      muslim: "இன்னா லில்லாஹி வ இன்னா இலைஹி ராஜிஊன். அல்லாஹ் மறைந்தவருக்கு ஜன்னத்தையும் குடும்பத்திற்கு பொறுமையையும் அருள்வாராக.",
      christian: "ஆன்மா நித்திய அமைதி பெறட்டும், இறைவன் உங்கள் குடும்பத்திற்கு ஆறுதல் தரட்டும்.",
      sikh: "வாஹிகுரு ஜி மறைந்த ஆன்மாவுக்கு அமைதியையும் குடும்பத்திற்கு பலத்தையும் அருள்வாராக.",
      jain: "ॐ சாந்தி. மறைந்த ஆன்மா உயர்நிலை அடையட்டும்.",
      buddhist: "மறைந்த ஆன்மா அமைதி பெறட்டும், குடும்பம் ஆறுதல் பெறட்டும்.",
      parsi: "ஆன்மா நிரந்தர அமைதி பெறட்டும்.",
    },
    signoff: "இரங்கலுடன், {sender}",
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
 * Build condolence message drafts.
 *
 * @returns {{variants: Array<{id:number,text:string,stats:object}>, subject:string}
 *           |{error:string}}
 */
export function buildCondolences({
  recipient = "",
  deceased = "",
  kinship = "father",
  relationship = "friend",
  tradition = "secular",
  language = "en",
  length = "medium",
  sender = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const kinId = KINSHIPS.some((item) => item.id === kinship) ? kinship : "father";
  const relId = RELATIONSHIPS.some((item) => item.id === relationship) ? relationship : "friend";
  const tradId = TRADITIONS.some((item) => item.id === tradition) ? tradition : "secular";
  const lenId = LENGTHS.some((item) => item.id === length) ? length : "medium";

  const recipientName = clean(recipient);
  if (!recipientName) return { error: "Add the name of the person you are writing to." };

  const deceasedName = clean(deceased);
  const senderName = clean(sender);

  const kinPhrase = pack.kinship[kinId];
  const subject = deceasedName ? `${kinPhrase}, ${deceasedName}` : kinPhrase;

  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const supportOffset = Math.floor(rng() * 997);
  const offerOffset = Math.floor(rng() * 997);

  const tokens = { recipient: recipientName, subject, sender: senderName || "" };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const parts = [fill(pack.greeting, tokens), fill(rotate(pack.openings, openOffset, step), tokens)];

    if (lenId !== "short") {
      parts.push(fill(rotate(pack.supports[relId], supportOffset, step), tokens));
    }
    if (lenId === "long") {
      parts.push(fill(rotate(pack.offers, offerOffset, step), tokens));
    }

    parts.push(pack.closings[tradId]);
    if (senderName) parts.push(fill(pack.signoff, tokens));

    const text = parts.join("\n");
    variants.push({ id: step + 1, text, stats: messageStats(text) });
  }

  return { variants, subject, tradition: tradId, length: lenId };
}

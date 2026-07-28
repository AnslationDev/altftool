/**
 * WhatsApp Business reply template builder.
 *
 * Fills a set of customer-reply templates with your business details and checks
 * each one against the limits the WhatsApp Business app enforces on quick replies.
 *
 * Pure module — no React, no DOM, no network, no clock reads.
 */

/** Quick-reply shortcut limit in the WhatsApp Business app. */
export const SHORTCUT_MAX_CHARS = 25;

/** Quick-reply message body limit in the WhatsApp Business app. */
export const MESSAGE_MAX_CHARS = 1024;

/** The app allows a maximum of 50 saved quick replies per account. */
export const MAX_QUICK_REPLIES = 50;

/** Greeting and away messages are separate settings, not quick replies. */
export const AUTOMATED_IDS = ["greeting", "away"];

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिंदी" },
  { id: "hinglish", label: "Hinglish" },
];

/**
 * Placeholders are replaced before export. WhatsApp quick replies have no
 * variables of their own, so anything left unresolved would be sent literally.
 */
export const PLACEHOLDERS = [
  { token: "{{business}}", label: "Business name" },
  { token: "{{agent}}", label: "Your name" },
  { token: "{{hours}}", label: "Business hours" },
  { token: "{{eta}}", label: "Delivery time" },
  { token: "{{validity}}", label: "Quote validity" },
  { token: "{{catalogue}}", label: "Catalogue link" },
  { token: "{{phone}}", label: "Phone number" },
];

export const CATEGORIES = [
  {
    id: "greeting",
    label: "Greeting message",
    shortcut: "hi",
    text: {
      en: "Hi! Thanks for messaging {{business}}. I am {{agent}} and I will reply within business hours ({{hours}}). Tell me what you are looking for and I will send options and prices.",
      hi: "नमस्ते! {{business}} को संदेश भेजने के लिए धन्यवाद। मैं {{agent}} हूँ और {{hours}} के बीच उत्तर दूँगा/दूँगी। बताइए आपको क्या चाहिए, मैं विकल्प और दाम भेज देता/देती हूँ।",
      hinglish:
        "Hi! {{business}} ko message karne ke liye thank you. Main {{agent}} hoon, {{hours}} ke beech reply karta/karti hoon. Bataiye kya chahiye, main options aur price bhej deta/deti hoon.",
    },
  },
  {
    id: "away",
    label: "Away / after hours",
    shortcut: "away",
    text: {
      en: "Thanks for your message. We are closed right now. Our hours are {{hours}}. Leave your question here and we will reply on the next working day.",
      hi: "आपके संदेश के लिए धन्यवाद। अभी हम बंद हैं। हमारा समय {{hours}} है। अपना प्रश्न यहीं छोड़ दीजिए, अगले कार्यदिवस पर उत्तर मिलेगा।",
      hinglish:
        "Message ke liye thanks. Abhi hum band hain. Humara time {{hours}} hai. Apna question yahin likh dijiye, next working day par reply milega.",
    },
  },
  {
    id: "hours",
    label: "Business hours",
    shortcut: "hours",
    text: {
      en: "We are open {{hours}}. You can message any time and we will answer in that window. For anything urgent, call {{phone}}.",
      hi: "हम {{hours}} खुले रहते हैं। आप कभी भी संदेश भेज सकते हैं, उत्तर इसी समय में मिलेगा। ज़रूरी काम के लिए {{phone}} पर कॉल करें।",
      hinglish:
        "Hum {{hours}} open rehte hain. Aap kabhi bhi message kar sakte hain, reply isi time me milega. Urgent ho to {{phone}} par call kijiye.",
    },
  },
  {
    id: "catalogue",
    label: "Price list / catalogue",
    shortcut: "price",
    text: {
      en: "Here is our full catalogue with current prices: {{catalogue}}. Send me the item name or a screenshot and I will confirm availability and the final price including delivery.",
      hi: "यह रही हमारी पूरी सूची और मौजूदा दाम: {{catalogue}}। आइटम का नाम या स्क्रीनशॉट भेजिए, मैं उपलब्धता और डिलीवरी सहित अंतिम कीमत बता दूँगा/दूँगी।",
      hinglish:
        "Ye hai humara pura catalogue aur current price: {{catalogue}}. Item ka naam ya screenshot bhejiye, main availability aur delivery ke saath final price bata deta/deti hoon.",
    },
  },
  {
    id: "order-status",
    label: "Order status",
    shortcut: "status",
    text: {
      en: "Your order is packed and moving. Expected delivery is {{eta}}. Share your order number and I will send the tracking link right away.",
      hi: "आपका ऑर्डर पैक होकर रवाना हो चुका है। अनुमानित डिलीवरी {{eta}} है। ऑर्डर नंबर भेजिए, मैं तुरंत ट्रैकिंग लिंक भेज देता/देती हूँ।",
      hinglish:
        "Aapka order pack hokar nikal chuka hai. Expected delivery {{eta}} hai. Order number bhejiye, main turant tracking link bhej deta/deti hoon.",
    },
  },
  {
    id: "delay",
    label: "Delivery delay",
    shortcut: "delay",
    text: {
      en: "I am sorry — your order is running late. The new expected date is {{eta}}. I have flagged it with our courier and will update you here the moment it moves.",
      hi: "क्षमा कीजिए — आपका ऑर्डर देर से चल रहा है। नई अनुमानित तारीख {{eta}} है। हमने कूरियर को सूचित कर दिया है और आगे बढ़ते ही यहीं अपडेट देंगे।",
      hinglish:
        "Sorry — aapka order late chal raha hai. Nayi expected date {{eta}} hai. Humne courier ko bata diya hai, movement hote hi yahin update denge.",
    },
  },
  {
    id: "payment",
    label: "Payment details",
    shortcut: "pay",
    text: {
      en: "To confirm the order, please pay to the UPI ID shown on our verified {{business}} profile and send the payment screenshot here. We never ask for OTPs or card details on chat.",
      hi: "ऑर्डर पक्का करने के लिए हमारे सत्यापित {{business}} प्रोफ़ाइल पर दिखे UPI ID पर भुगतान करें और स्क्रीनशॉट यहाँ भेजें। हम चैट पर कभी OTP या कार्ड विवरण नहीं माँगते।",
      hinglish:
        "Order confirm karne ke liye humare verified {{business}} profile par diye UPI ID par payment karke screenshot yahan bhejiye. Hum chat par kabhi OTP ya card details nahi mangte.",
    },
  },
  {
    id: "refund",
    label: "Return / refund policy",
    shortcut: "refund",
    text: {
      en: "Returns are accepted within 7 days of delivery if the item is unused and in its original packing. Send a photo and your order number here and I will start the pickup.",
      hi: "डिलीवरी के 7 दिनों के भीतर वापसी स्वीकार है, बशर्ते सामान अप्रयुक्त और मूल पैकिंग में हो। फ़ोटो और ऑर्डर नंबर यहाँ भेजिए, मैं पिकअप शुरू करवा दूँगा/दूँगी।",
      hinglish:
        "Delivery ke 7 din ke andar return accept hai, agar item unused aur original packing me ho. Photo aur order number yahan bhejiye, main pickup start karwa deta/deti hoon.",
    },
  },
  {
    id: "thanks",
    label: "Thank you after purchase",
    shortcut: "thanks",
    text: {
      en: "Thank you for your order. It really helps a small business like {{business}}. If anything is not right, message here first and we will fix it.",
      hi: "आपके ऑर्डर के लिए धन्यवाद। {{business}} जैसे छोटे व्यवसाय के लिए यह बहुत मायने रखता है। कुछ भी ठीक न लगे तो पहले यहीं संदेश भेजिए, हम सुधार देंगे।",
      hinglish:
        "Order ke liye thank you. {{business}} jaise chhote business ke liye ye bahut matter karta hai. Kuch bhi theek na lage to pehle yahin message kijiye, hum sort kar denge.",
    },
  },
  {
    id: "followup",
    label: "Follow-up on a quote",
    shortcut: "followup",
    text: {
      en: "Just checking in on the quote I sent. It holds until {{validity}}. Happy to adjust the quantity or the delivery date if that helps — tell me what would work.",
      hi: "मैंने जो भाव भेजा था, उसी पर पूछ रहा/रही हूँ। यह {{validity}} तक मान्य है। मात्रा या डिलीवरी तारीख बदलनी हो तो बता दीजिए, समायोजन कर देंगे।",
      hinglish:
        "Jo quote bheja tha uske baare me pooch raha/rahi hoon. Ye {{validity}} tak valid hai. Quantity ya delivery date change karni ho to bataiye, adjust kar denge.",
    },
  },
];

/** WhatsApp shortcuts are typed after "/" and cannot contain spaces. */
export function normalizeShortcut(raw) {
  const base = String(raw ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, SHORTCUT_MAX_CHARS);
}

export function fillTemplate(text, values = {}) {
  if (typeof text !== "string") return "";
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    return typeof value === "string" && value.trim() ? value.trim() : match;
  });
}

/** Tokens still present after substitution — these would be sent literally. */
export function findUnresolved(text) {
  if (typeof text !== "string") return [];
  const found = text.match(/\{\{\w+\}\}/g);
  return found ? Array.from(new Set(found)) : [];
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Build the filled template set.
 * Returns { items, exportText, ... } or { error }.
 */
export function buildTemplateSet(input = {}) {
  const language = LANGUAGES.find((item) => item.id === clean(input.language))
    ? clean(input.language)
    : "en";

  const business = clean(input.business);
  if (!business) return { error: "Add your business name — most replies open with it." };

  const selected = Array.isArray(input.selected) ? input.selected : [];
  const chosen = CATEGORIES.filter((category) => selected.includes(category.id));
  if (chosen.length === 0) {
    return { error: "Select at least one reply template to build." };
  }
  if (chosen.length > MAX_QUICK_REPLIES) {
    return { error: `WhatsApp Business stores at most ${MAX_QUICK_REPLIES} quick replies.` };
  }

  const values = {
    business,
    agent: clean(input.agent) || business,
    hours: clean(input.hours) || "Mon-Sat, 10am to 7pm",
    eta: clean(input.eta) || "3-5 days",
    validity: clean(input.validity) || "the end of this week",
    catalogue: clean(input.catalogue),
    phone: clean(input.phone),
  };

  const seen = new Set();
  const items = chosen.map((category) => {
    const message = fillTemplate(category.text[language] || category.text.en, values);
    let shortcut = normalizeShortcut(category.shortcut);
    // Shortcuts must be unique inside the app; suffix duplicates deterministically.
    let suffix = 2;
    while (seen.has(shortcut)) {
      const trimmed = shortcut.slice(0, SHORTCUT_MAX_CHARS - String(suffix).length - 1);
      shortcut = `${trimmed}-${suffix}`;
      suffix += 1;
    }
    seen.add(shortcut);

    const chars = message.length;
    const unresolved = findUnresolved(message);
    return {
      id: category.id,
      label: category.label,
      shortcut: `/${shortcut}`,
      message,
      chars,
      overLimit: chars > MESSAGE_MAX_CHARS,
      unresolved,
      isAutomated: AUTOMATED_IDS.includes(category.id),
    };
  });

  const quickReplyCount = items.filter((item) => !item.isAutomated).length;
  const automatedCount = items.length - quickReplyCount;
  const totalChars = items.reduce((sum, item) => sum + item.chars, 0);
  const longest = items.reduce(
    (best, item) => (item.chars > best.chars ? item : best),
    items[0],
  );
  const unresolvedTokens = Array.from(
    new Set(items.flatMap((item) => item.unresolved)),
  );

  const exportText = items
    .map((item) =>
      [
        `${item.label}${item.isAutomated ? " (automated message setting)" : ` — shortcut ${item.shortcut}`}`,
        item.message,
      ].join("\n"),
    )
    .join("\n\n---\n\n");

  return {
    language,
    items,
    exportText,
    totalChars,
    averageChars: Math.round(totalChars / items.length),
    longestLabel: longest.label,
    longestChars: longest.chars,
    quickReplyCount,
    automatedCount,
    unresolvedTokens,
    anyOverLimit: items.some((item) => item.overLimit),
  };
}

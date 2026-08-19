/**
 * Restaurant phrasebook generator.
 *
 * A fixed set of 16 phrases that cover getting a table, ordering, stating a
 * dietary restriction, paying and leaving, translated into eight languages with
 * the native script and a plain romanisation. Romanisation is written for an
 * English speaker to read aloud, not as a linguistic transliteration standard.
 *
 * Selection logic only: no network, no storage.
 */

export const CATEGORIES = [
  { id: "seating", label: "Getting a table" },
  { id: "ordering", label: "Ordering" },
  { id: "dietary", label: "Dietary needs and allergies" },
  { id: "paying", label: "Paying" },
  { id: "courtesy", label: "Courtesy and leaving" },
];

export const CATEGORY_IDS = CATEGORIES.map((item) => item.id);

/**
 * Dietary profiles map to the phrases worth carrying. "none" keeps every
 * dietary phrase so you can browse them all.
 */
export const DIETARY_PROFILES = {
  none: { label: "Show all dietary phrases", phrases: null },
  vegetarian: { label: "Vegetarian", phrases: ["veg", "no-meat"] },
  vegan: { label: "Vegan", phrases: ["veg", "no-meat", "no-dairy"] },
  jain: { label: "Jain / no onion or garlic", phrases: ["veg", "no-meat", "no-onion-garlic"] },
  halal: { label: "No pork", phrases: ["no-pork"] },
  nutAllergy: { label: "Peanut allergy", phrases: ["nut-allergy"] },
};

export const PROFILE_KEYS = Object.keys(DIETARY_PROFILES);

/** The English side of the phrasebook. */
export const PHRASES = [
  { id: "table-two", category: "seating", english: "A table for two, please." },
  { id: "menu", category: "ordering", english: "The menu, please." },
  { id: "recommend", category: "ordering", english: "What do you recommend?" },
  { id: "this-one", category: "ordering", english: "I would like this one, please." },
  { id: "spicy", category: "ordering", english: "Is this spicy?" },
  { id: "water", category: "ordering", english: "Water, please." },
  { id: "veg", category: "dietary", english: "I am vegetarian." },
  { id: "no-meat", category: "dietary", english: "I do not eat meat." },
  { id: "no-pork", category: "dietary", english: "I do not eat pork." },
  { id: "no-dairy", category: "dietary", english: "No milk, cheese or butter, please." },
  { id: "no-onion-garlic", category: "dietary", english: "No onion or garlic, please." },
  { id: "nut-allergy", category: "dietary", english: "I am allergic to peanuts." },
  { id: "bill", category: "paying", english: "The bill, please." },
  { id: "card", category: "paying", english: "Can I pay by card?" },
  { id: "delicious", category: "courtesy", english: "It was delicious." },
  { id: "toilet", category: "courtesy", english: "Where is the toilet?" },
];

export const LANGUAGES = {
  hindi: { label: "Hindi", native: "हिन्दी", script: "Devanagari" },
  bengali: { label: "Bengali", native: "বাংলা", script: "Bengali" },
  tamil: { label: "Tamil", native: "தமிழ்", script: "Tamil" },
  spanish: { label: "Spanish", native: "Español", script: "Latin" },
  french: { label: "French", native: "Français", script: "Latin" },
  german: { label: "German", native: "Deutsch", script: "Latin" },
  italian: { label: "Italian", native: "Italiano", script: "Latin" },
  japanese: { label: "Japanese", native: "日本語", script: "Japanese" },
};

export const LANGUAGE_KEYS = Object.keys(LANGUAGES);

/**
 * Translations. `script` is the phrase as written; `roman` is how to say it.
 * For Latin-script languages the two are the same and `roman` is omitted.
 */
export const TRANSLATIONS = {
  hindi: {
    "table-two": { script: "दो लोगों के लिए टेबल चाहिए।", roman: "Do logon ke liye table chahiye." },
    menu: { script: "मेन्यू दिखाइए।", roman: "Menu dikhaiye." },
    recommend: { script: "आप क्या सुझाएँगे?", roman: "Aap kya sujhaenge?" },
    "this-one": { script: "मुझे यह चाहिए।", roman: "Mujhe yeh chahiye." },
    spicy: { script: "क्या यह तीखा है?", roman: "Kya yeh teekha hai?" },
    water: { script: "पानी दीजिए।", roman: "Paani dijiye." },
    veg: { script: "मैं शाकाहारी हूँ।", roman: "Main shakahari hoon." },
    "no-meat": { script: "मैं मांस नहीं खाता।", roman: "Main maans nahin khata.", note: "Women say khati." },
    "no-pork": { script: "मैं सूअर का मांस नहीं खाता।", roman: "Main suar ka maans nahin khata." },
    "no-dairy": { script: "दूध, पनीर, मक्खन नहीं चाहिए।", roman: "Doodh, paneer, makkhan nahin chahiye." },
    "no-onion-garlic": { script: "प्याज़ लहसुन मत डालिए।", roman: "Pyaaz lahsun mat daaliye." },
    "nut-allergy": { script: "मुझे मूँगफली से एलर्जी है।", roman: "Mujhe moongphali se allergy hai." },
    bill: { script: "बिल दीजिए।", roman: "Bill dijiye." },
    card: { script: "क्या कार्ड चलेगा?", roman: "Kya card chalega?" },
    delicious: { script: "खाना बहुत स्वादिष्ट था।", roman: "Khana bahut swadisht tha." },
    toilet: { script: "बाथरूम कहाँ है?", roman: "Bathroom kahan hai?" },
  },
  bengali: {
    "table-two": { script: "দুজনের জন্য টেবিল হবে?", roman: "Dujoner jonno table hobe?" },
    menu: { script: "মেনুটা দিন।", roman: "Menu-ta din." },
    recommend: { script: "আপনি কী খেতে বলবেন?", roman: "Apni ki khete bolben?" },
    "this-one": { script: "আমি এটা নেব।", roman: "Ami eta nebo." },
    spicy: { script: "এটা কি ঝাল?", roman: "Eta ki jhaal?" },
    water: { script: "একটু জল দিন।", roman: "Ektu jol din." },
    veg: { script: "আমি নিরামিষ খাই।", roman: "Ami niramish khai." },
    "no-meat": { script: "আমি মাংস খাই না।", roman: "Ami mangsho khai na." },
    "no-pork": { script: "আমি শুয়োরের মাংস খাই না।", roman: "Ami shuorer mangsho khai na." },
    "no-dairy": { script: "দুধ, পনির, মাখন ছাড়া দিন।", roman: "Dudh, poneer, makhon chhara din." },
    "no-onion-garlic": { script: "পেঁয়াজ রসুন ছাড়া দিন।", roman: "Peyanj roshun chhara din." },
    "nut-allergy": { script: "আমার চিনাবাদামে অ্যালার্জি আছে।", roman: "Amar chinabadame allergy achhe." },
    bill: { script: "বিলটা দিন।", roman: "Bill-ta din." },
    card: { script: "কার্ডে দেওয়া যাবে?", roman: "Card-e dewa jabe?" },
    delicious: { script: "খুব ভালো লেগেছে।", roman: "Khub bhalo legechhe." },
    toilet: { script: "বাথরুম কোথায়?", roman: "Bathroom kothay?" },
  },
  tamil: {
    "table-two": { script: "இரண்டு பேருக்கு இடம் வேண்டும்.", roman: "Irandu perukku idam vendum." },
    menu: { script: "மெனு தாருங்கள்.", roman: "Menu tharungal." },
    recommend: { script: "நீங்கள் என்ன பரிந்துரைக்கிறீர்கள்?", roman: "Neengal enna parinthuraikkireergal?" },
    "this-one": { script: "இது வேண்டும்.", roman: "Idhu vendum." },
    spicy: { script: "இது காரமாக இருக்கிறதா?", roman: "Idhu kaaramaaga irukkiratha?" },
    water: { script: "தண்ணீர் தாருங்கள்.", roman: "Thanneer tharungal." },
    veg: { script: "நான் சைவம்.", roman: "Naan saivam." },
    "no-meat": { script: "நான் இறைச்சி சாப்பிட மாட்டேன்.", roman: "Naan iraichi saappida maatten." },
    "no-pork": { script: "நான் பன்றி இறைச்சி சாப்பிட மாட்டேன்.", roman: "Naan pandri iraichi saappida maatten." },
    "no-dairy": { script: "பால் பொருட்கள் வேண்டாம்.", roman: "Paal porutkal vendaam." },
    "no-onion-garlic": { script: "வெங்காயம் பூண்டு வேண்டாம்.", roman: "Vengaayam poondu vendaam." },
    "nut-allergy": { script: "எனக்கு நிலக்கடலை ஒவ்வாமை.", roman: "Enakku nilakkadalai ovvaamai." },
    bill: { script: "பில் தாருங்கள்.", roman: "Bill tharungal." },
    card: { script: "கார்டில் பணம் கட்டலாமா?", roman: "Cardil panam kattalaamaa?" },
    delicious: { script: "மிகவும் சுவையாக இருந்தது.", roman: "Migavum suvaiyaaga irundhathu." },
    toilet: { script: "கழிப்பறை எங்கே?", roman: "Kazhipparai enge?" },
  },
  spanish: {
    "table-two": { script: "Una mesa para dos, por favor." },
    menu: { script: "La carta, por favor." },
    recommend: { script: "¿Qué me recomienda?" },
    "this-one": { script: "Quisiera esto, por favor." },
    spicy: { script: "¿Esto pica?" },
    water: { script: "Agua, por favor." },
    veg: { script: "Soy vegetariano.", note: "Women say vegetariana." },
    "no-meat": { script: "No como carne." },
    "no-pork": { script: "No como cerdo." },
    "no-dairy": { script: "Sin leche, queso ni mantequilla, por favor." },
    "no-onion-garlic": { script: "Sin cebolla ni ajo, por favor." },
    "nut-allergy": { script: "Soy alérgico a los cacahuetes.", note: "Women say alérgica." },
    bill: { script: "La cuenta, por favor." },
    card: { script: "¿Puedo pagar con tarjeta?" },
    delicious: { script: "Estaba delicioso." },
    toilet: { script: "¿Dónde está el baño?" },
  },
  french: {
    "table-two": { script: "Une table pour deux, s'il vous plaît." },
    menu: { script: "La carte, s'il vous plaît." },
    recommend: { script: "Que me conseillez-vous ?" },
    "this-one": { script: "Je voudrais ceci, s'il vous plaît." },
    spicy: { script: "Est-ce que c'est épicé ?" },
    water: { script: "De l'eau, s'il vous plaît." },
    veg: { script: "Je suis végétarien.", note: "Women say végétarienne." },
    "no-meat": { script: "Je ne mange pas de viande." },
    "no-pork": { script: "Je ne mange pas de porc." },
    "no-dairy": { script: "Sans lait, fromage ni beurre, s'il vous plaît." },
    "no-onion-garlic": { script: "Sans oignon ni ail, s'il vous plaît." },
    "nut-allergy": { script: "Je suis allergique aux cacahuètes." },
    bill: { script: "L'addition, s'il vous plaît." },
    card: { script: "Je peux payer par carte ?" },
    delicious: { script: "C'était délicieux." },
    toilet: { script: "Où sont les toilettes ?" },
  },
  german: {
    "table-two": { script: "Einen Tisch für zwei, bitte." },
    menu: { script: "Die Speisekarte, bitte." },
    recommend: { script: "Was empfehlen Sie?" },
    "this-one": { script: "Ich hätte gern das hier." },
    spicy: { script: "Ist das scharf?" },
    water: { script: "Wasser, bitte." },
    veg: { script: "Ich bin Vegetarier.", note: "Women say Vegetarierin." },
    "no-meat": { script: "Ich esse kein Fleisch." },
    "no-pork": { script: "Ich esse kein Schweinefleisch." },
    "no-dairy": { script: "Ohne Milch, Käse und Butter, bitte." },
    "no-onion-garlic": { script: "Ohne Zwiebeln und Knoblauch, bitte." },
    "nut-allergy": { script: "Ich bin allergisch gegen Erdnüsse." },
    bill: { script: "Die Rechnung, bitte." },
    card: { script: "Kann ich mit Karte zahlen?" },
    delicious: { script: "Es hat sehr gut geschmeckt." },
    toilet: { script: "Wo ist die Toilette?" },
  },
  italian: {
    "table-two": { script: "Un tavolo per due, per favore." },
    menu: { script: "Il menù, per favore." },
    recommend: { script: "Cosa mi consiglia?" },
    "this-one": { script: "Vorrei questo, per favore." },
    spicy: { script: "È piccante?" },
    water: { script: "Acqua, per favore." },
    veg: { script: "Sono vegetariano.", note: "Women say vegetariana." },
    "no-meat": { script: "Non mangio carne." },
    "no-pork": { script: "Non mangio maiale." },
    "no-dairy": { script: "Senza latte, formaggio e burro, per favore." },
    "no-onion-garlic": { script: "Senza cipolla e aglio, per favore." },
    "nut-allergy": { script: "Sono allergico alle arachidi." },
    bill: { script: "Il conto, per favore." },
    card: { script: "Posso pagare con la carta?" },
    delicious: { script: "Era delizioso." },
    toilet: { script: "Dov'è il bagno?" },
  },
  japanese: {
    "table-two": { script: "二人です。", roman: "Futari desu.", note: "Said on arrival; staff seat you." },
    menu: { script: "メニューをお願いします。", roman: "Menyu o onegaishimasu." },
    recommend: { script: "おすすめは何ですか。", roman: "Osusume wa nan desu ka." },
    "this-one": { script: "これをください。", roman: "Kore o kudasai.", note: "Point at the menu item." },
    spicy: { script: "これは辛いですか。", roman: "Kore wa karai desu ka." },
    water: { script: "お水をください。", roman: "Omizu o kudasai." },
    veg: { script: "ベジタリアンです。", roman: "Bejitarian desu." },
    "no-meat": { script: "肉は食べません。", roman: "Niku wa tabemasen." },
    "no-pork": { script: "豚肉は食べません。", roman: "Butaniku wa tabemasen." },
    "no-dairy": { script: "乳製品は入れないでください。", roman: "Nyuseihin wa irenaide kudasai." },
    "no-onion-garlic": { script: "玉ねぎとにんにく抜きでお願いします。", roman: "Tamanegi to ninniku nuki de onegaishimasu." },
    "nut-allergy": { script: "ピーナッツアレルギーがあります。", roman: "Pinattsu arerugi ga arimasu." },
    bill: { script: "お会計をお願いします。", roman: "Okaikei o onegaishimasu." },
    card: { script: "カードで払えますか。", roman: "Kado de haraemasu ka." },
    delicious: { script: "おいしかったです。", roman: "Oishikatta desu." },
    toilet: { script: "トイレはどこですか。", roman: "Toire wa doko desu ka." },
  },
};

/**
 * Build the phrasebook.
 *
 * @param {object} input
 * @param {string} input.language        key of LANGUAGES
 * @param {string[]} input.categories    ids from CATEGORY_IDS
 * @param {string} [input.dietaryProfile] key of DIETARY_PROFILES
 * @returns {{language:object,phrases:object[],count:number,categories:string[]}|{error:string}}
 */
export function buildPhrasebook({ language, categories, dietaryProfile = "none" } = {}) {
  const meta = LANGUAGES[language];
  if (!meta) return { error: "Choose one of the supported languages." };

  const chosen = Array.isArray(categories) ? categories.filter((id) => CATEGORY_IDS.includes(id)) : [];
  if (chosen.length === 0) return { error: "Pick at least one category of phrases." };

  const profile = DIETARY_PROFILES[dietaryProfile];
  if (!profile) return { error: "Choose a dietary profile, or select show all." };

  const table = TRANSLATIONS[language];
  const phrases = PHRASES.filter((phrase) => {
    if (!chosen.includes(phrase.category)) return false;
    if (phrase.category !== "dietary") return true;
    if (!profile.phrases) return true;
    return profile.phrases.includes(phrase.id);
  }).map((phrase) => {
    const entry = table[phrase.id] || {};
    return {
      id: phrase.id,
      category: phrase.category,
      english: phrase.english,
      script: entry.script || "",
      roman: entry.roman || entry.script || "",
      note: entry.note || "",
      needsRomanisation: Boolean(entry.roman),
    };
  });

  if (phrases.length === 0) {
    return { error: "That combination of categories and dietary profile has no phrases. Add a category." };
  }

  return {
    language: { key: language, ...meta },
    profile: { key: dietaryProfile, ...profile },
    categories: chosen,
    phrases,
    count: phrases.length,
  };
}

export const OUTPUT_FORMATS = ["card", "markdown", "csv"];

const csvField = (value) => (/[",\r\n]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value));

/**
 * Render the phrasebook for printing, a wiki or a spreadsheet.
 * @returns {{output:string,lines:number}|{error:string}}
 */
export function formatPhrasebook(book, format = "card") {
  if (!book || book.error) return { error: book && book.error ? book.error : "Build a phrasebook first." };
  if (!OUTPUT_FORMATS.includes(format)) return { error: "Choose the card, Markdown or CSV format." };

  const title = `Restaurant phrasebook — ${book.language.label} (${book.language.native})`;
  let output = "";

  if (format === "card") {
    output = [
      title,
      "=".repeat([...title].length),
      "",
      ...book.phrases.map((phrase) => {
        const lines = [phrase.english, `  ${phrase.script}`];
        if (phrase.needsRomanisation) lines.push(`  say: ${phrase.roman}`);
        if (phrase.note) lines.push(`  (${phrase.note})`);
        return lines.join("\n");
      }),
    ].join("\n\n");
  } else if (format === "markdown") {
    output = [
      `# ${title}`,
      "",
      "| English | In language | Say it as | Note |",
      "| --- | --- | --- | --- |",
      ...book.phrases.map(
        (phrase) =>
          `| ${phrase.english} | ${phrase.script} | ${phrase.needsRomanisation ? phrase.roman : "—"} | ${phrase.note || "—"} |`,
      ),
    ].join("\n");
  } else {
    output = [
      "English,Phrase,Romanisation,Note",
      ...book.phrases.map((phrase) =>
        [phrase.english, phrase.script, phrase.needsRomanisation ? phrase.roman : "", phrase.note]
          .map(csvField)
          .join(","),
      ),
    ].join("\r\n");
  }

  return { output, lines: output.split(/\r?\n/).length };
}

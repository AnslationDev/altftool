/**
 * Travel medical emergency card builder.
 *
 * Assembles three things into one printable card:
 *   1. Your own medical facts, entered here and never sent anywhere.
 *   2. The emergency service numbers for the country you are visiting.
 *   3. Ten critical phrases in the local language, with romanisation where the
 *      script is not Latin.
 *
 * Emergency numbers are the published national numbers. 112 works from any
 * mobile across the EU/EEA, the UK, India and many other GSM networks, and is
 * listed as the general number where that applies. Always confirm locally: some
 * countries route 112 through a translation desk with a delay, and a few use
 * different numbers by state or province.
 */

export const BLOOD_GROUPS = ["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const MAX_NAME = 60;
export const MAX_ITEM = 60;
export const MAX_ITEMS = 12;
export const MAX_NOTE = 200;

/** Published national emergency numbers. */
export const COUNTRIES = {
  india: { label: "India", general: "112", ambulance: "108", police: "100", fire: "101" },
  uk: { label: "United Kingdom", general: "999", note: "112 also connects to the same operator." },
  ireland: { label: "Ireland", general: "112", note: "999 works as well." },
  usa: { label: "United States", general: "911" },
  canada: { label: "Canada", general: "911" },
  mexico: { label: "Mexico", general: "911" },
  brazil: { label: "Brazil", ambulance: "192", police: "190", fire: "193" },
  australia: { label: "Australia", general: "000", note: "112 works from any mobile handset." },
  newzealand: { label: "New Zealand", general: "111" },
  germany: { label: "Germany", general: "112", police: "110" },
  france: { label: "France", general: "112", ambulance: "15", police: "17", fire: "18" },
  spain: { label: "Spain", general: "112" },
  italy: { label: "Italy", general: "112" },
  netherlands: { label: "Netherlands", general: "112" },
  portugal: { label: "Portugal", general: "112" },
  greece: { label: "Greece", general: "112", ambulance: "166" },
  switzerland: { label: "Switzerland", general: "112", ambulance: "144", police: "117", fire: "118" },
  austria: { label: "Austria", general: "112", ambulance: "144" },
  poland: { label: "Poland", general: "112" },
  sweden: { label: "Sweden", general: "112" },
  norway: { label: "Norway", general: "112", ambulance: "113", fire: "110" },
  turkey: { label: "Turkey", general: "112" },
  russia: { label: "Russia", general: "112", ambulance: "103" },
  japan: { label: "Japan", ambulance: "119", police: "110", fire: "119" },
  southkorea: { label: "South Korea", ambulance: "119", police: "112", fire: "119" },
  china: { label: "China", ambulance: "120", police: "110", fire: "119" },
  singapore: { label: "Singapore", ambulance: "995", police: "999", fire: "995" },
  malaysia: { label: "Malaysia", general: "999", note: "112 works from a mobile." },
  thailand: { label: "Thailand", ambulance: "1669", police: "191", note: "Tourist police: 1155." },
  indonesia: { label: "Indonesia", general: "112" },
  vietnam: { label: "Vietnam", ambulance: "115", police: "113", fire: "114" },
  uae: { label: "United Arab Emirates", ambulance: "998", police: "999", fire: "997" },
  saudi: { label: "Saudi Arabia", ambulance: "997", police: "999", fire: "998" },
  qatar: { label: "Qatar", general: "999" },
  nepal: { label: "Nepal", ambulance: "102", police: "100" },
  srilanka: { label: "Sri Lanka", ambulance: "1990", police: "119" },
  bangladesh: { label: "Bangladesh", general: "999" },
  pakistan: { label: "Pakistan", police: "15", note: "Rescue 1122 covers ambulance and fire in most provinces." },
  southafrica: { label: "South Africa", general: "112", ambulance: "10177", police: "10111" },
  kenya: { label: "Kenya", general: "999", note: "112 also works from a mobile." },
  egypt: { label: "Egypt", ambulance: "123", police: "122", fire: "180" },
};

export const COUNTRY_KEYS = Object.keys(COUNTRIES).sort((a, b) =>
  COUNTRIES[a].label.localeCompare(COUNTRIES[b].label),
);

export const LANGUAGES = {
  none: { label: "English only", native: "English" },
  hindi: { label: "Hindi", native: "हिन्दी" },
  spanish: { label: "Spanish", native: "Español" },
  french: { label: "French", native: "Français" },
  german: { label: "German", native: "Deutsch" },
  italian: { label: "Italian", native: "Italiano" },
  japanese: { label: "Japanese", native: "日本語" },
};

export const LANGUAGE_KEYS = Object.keys(LANGUAGES);

export const PHRASES = [
  { id: "doctor", english: "I need a doctor." },
  { id: "ambulance", english: "Please call an ambulance." },
  { id: "chest", english: "I have chest pain." },
  { id: "breathe", english: "I cannot breathe." },
  { id: "diabetic", english: "I am diabetic." },
  { id: "penicillin", english: "I am allergic to penicillin." },
  { id: "medicine", english: "I take this medicine every day." },
  { id: "hospital", english: "Where is the nearest hospital?" },
  { id: "pharmacy", english: "Where is the nearest pharmacy?" },
  { id: "callnumber", english: "Please call this number." },
];

export const TRANSLATIONS = {
  hindi: {
    doctor: { script: "मुझे डॉक्टर चाहिए।", roman: "Mujhe doctor chahiye." },
    ambulance: { script: "एम्बुलेंस बुलाइए।", roman: "Ambulance bulaiye." },
    chest: { script: "मेरे सीने में दर्द है।", roman: "Mere seene mein dard hai." },
    breathe: { script: "मुझे साँस लेने में तकलीफ़ है।", roman: "Mujhe saans lene mein takleef hai." },
    diabetic: { script: "मुझे मधुमेह है।", roman: "Mujhe madhumeh hai." },
    penicillin: { script: "मुझे पेनिसिलिन से एलर्जी है।", roman: "Mujhe penicillin se allergy hai." },
    medicine: { script: "मैं यह दवा रोज़ लेता हूँ।", roman: "Main yeh dawa roz leta hoon." },
    hospital: { script: "सबसे नज़दीकी अस्पताल कहाँ है?", roman: "Sabse nazdeeki aspataal kahan hai?" },
    pharmacy: { script: "सबसे नज़दीकी दवाख़ाना कहाँ है?", roman: "Sabse nazdeeki dawakhana kahan hai?" },
    callnumber: { script: "इस नंबर पर फ़ोन कीजिए।", roman: "Is number par phone kijiye." },
  },
  spanish: {
    doctor: { script: "Necesito un médico." },
    ambulance: { script: "Llame a una ambulancia, por favor." },
    chest: { script: "Tengo dolor en el pecho." },
    breathe: { script: "No puedo respirar." },
    diabetic: { script: "Soy diabético.", note: "Women say diabética." },
    penicillin: { script: "Soy alérgico a la penicilina.", note: "Women say alérgica." },
    medicine: { script: "Tomo esta medicina todos los días." },
    hospital: { script: "¿Dónde está el hospital más cercano?" },
    pharmacy: { script: "¿Dónde está la farmacia más cercana?" },
    callnumber: { script: "Llame a este número, por favor." },
  },
  french: {
    doctor: { script: "J'ai besoin d'un médecin." },
    ambulance: { script: "Appelez une ambulance, s'il vous plaît." },
    chest: { script: "J'ai mal à la poitrine." },
    breathe: { script: "Je n'arrive pas à respirer." },
    diabetic: { script: "Je suis diabétique." },
    penicillin: { script: "Je suis allergique à la pénicilline." },
    medicine: { script: "Je prends ce médicament tous les jours." },
    hospital: { script: "Où est l'hôpital le plus proche ?" },
    pharmacy: { script: "Où est la pharmacie la plus proche ?" },
    callnumber: { script: "Appelez ce numéro, s'il vous plaît." },
  },
  german: {
    doctor: { script: "Ich brauche einen Arzt." },
    ambulance: { script: "Bitte rufen Sie einen Krankenwagen." },
    chest: { script: "Ich habe Schmerzen in der Brust." },
    breathe: { script: "Ich bekomme keine Luft." },
    diabetic: { script: "Ich bin Diabetiker.", note: "Women say Diabetikerin." },
    penicillin: { script: "Ich bin allergisch gegen Penicillin." },
    medicine: { script: "Ich nehme dieses Medikament jeden Tag." },
    hospital: { script: "Wo ist das nächste Krankenhaus?" },
    pharmacy: { script: "Wo ist die nächste Apotheke?" },
    callnumber: { script: "Bitte rufen Sie diese Nummer an." },
  },
  italian: {
    doctor: { script: "Ho bisogno di un medico." },
    ambulance: { script: "Chiami un'ambulanza, per favore." },
    chest: { script: "Ho dolore al petto." },
    breathe: { script: "Non riesco a respirare." },
    diabetic: { script: "Sono diabetico.", note: "Women say diabetica." },
    penicillin: { script: "Sono allergico alla penicillina." },
    medicine: { script: "Prendo questa medicina ogni giorno." },
    hospital: { script: "Dov'è l'ospedale più vicino?" },
    pharmacy: { script: "Dov'è la farmacia più vicina?" },
    callnumber: { script: "Chiami questo numero, per favore." },
  },
  japanese: {
    doctor: { script: "医者が必要です。", roman: "Isha ga hitsuyo desu." },
    ambulance: { script: "救急車を呼んでください。", roman: "Kyukyusha o yonde kudasai." },
    chest: { script: "胸が痛いです。", roman: "Mune ga itai desu." },
    breathe: { script: "息ができません。", roman: "Iki ga dekimasen." },
    diabetic: { script: "糖尿病です。", roman: "Tonyobyo desu." },
    penicillin: { script: "ペニシリンアレルギーがあります。", roman: "Penishirin arerugi ga arimasu." },
    medicine: { script: "この薬を毎日飲んでいます。", roman: "Kono kusuri o mainichi nonde imasu." },
    hospital: { script: "一番近い病院はどこですか。", roman: "Ichiban chikai byoin wa doko desu ka." },
    pharmacy: { script: "一番近い薬局はどこですか。", roman: "Ichiban chikai yakkyoku wa doko desu ka." },
    callnumber: { script: "この番号に電話してください。", roman: "Kono bango ni denwa shite kudasai." },
  },
};

/* ------------------------------------------------------------------ */

const clean = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();

/** Split a comma or newline separated field into a trimmed list. */
export function parseList(value) {
  return String(value == null ? "" : value)
    .split(/[,\n;]+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Phone numbers may hold digits, spaces, hyphens, brackets and one plus. */
export function isValidPhone(value) {
  const text = clean(value);
  if (!text) return false;
  if (!/^\+?[\d\s()-]{6,20}$/.test(text)) return false;
  return (text.match(/\d/g) || []).length >= 6;
}

/** The emergency numbers for a country, as label/number pairs. */
export function emergencyNumbersFor(countryKey) {
  const country = COUNTRIES[countryKey];
  if (!country) return [];
  const rows = [];
  if (country.general) rows.push({ label: "All emergencies", number: country.general });
  if (country.ambulance) rows.push({ label: "Ambulance", number: country.ambulance });
  if (country.police) rows.push({ label: "Police", number: country.police });
  if (country.fire) rows.push({ label: "Fire", number: country.fire });
  return rows;
}

/**
 * Build the card.
 *
 * @param {object} input
 * @returns {object|{error:string}}
 */
export function buildCard({
  name,
  bloodGroup = "Unknown",
  allergies = "",
  conditions = "",
  medications = "",
  contactName = "",
  contactPhone = "",
  insurance = "",
  country,
  language = "none",
} = {}) {
  const holder = clean(name);
  if (!holder) return { error: "Enter the name of the person this card is for." };
  if (holder.length > MAX_NAME) return { error: `Keep the name under ${MAX_NAME} characters.` };

  if (!BLOOD_GROUPS.includes(bloodGroup)) return { error: "Choose a blood group, or leave it as Unknown." };

  const country_ = COUNTRIES[country];
  if (!country_) return { error: "Choose the country you are travelling to." };

  if (!LANGUAGES[language]) return { error: "Choose a language for the phrases, or English only." };

  const lists = {
    allergies: parseList(allergies),
    conditions: parseList(conditions),
    medications: parseList(medications),
  };
  for (const [field, items] of Object.entries(lists)) {
    if (items.length > MAX_ITEMS) {
      return { error: `List at most ${MAX_ITEMS} ${field}. Put the rest in a separate letter from your doctor.` };
    }
    const tooLong = items.find((item) => item.length > MAX_ITEM);
    if (tooLong) return { error: `"${tooLong.slice(0, 24)}…" is too long for a card line.` };
  }

  const contact = clean(contactName);
  const phone = clean(contactPhone);
  if (phone && !isValidPhone(phone)) {
    return { error: "The emergency contact number should be 6 to 20 digits, optionally starting with +." };
  }
  if (contact && !phone) return { error: "Add a phone number for the emergency contact." };
  if (phone && !contact) return { error: "Add a name for the emergency contact." };

  const insuranceRef = clean(insurance);
  if (insuranceRef.length > MAX_NOTE) return { error: `Keep the insurance line under ${MAX_NOTE} characters.` };

  const warnings = [];
  if (lists.allergies.length === 0) warnings.push("No allergies listed. Write \"None known\" so a reader knows it was not left blank.");
  if (bloodGroup === "Unknown") warnings.push("Blood group is Unknown. Clinicians will cross-match anyway, but it is worth confirming.");
  if (!phone) warnings.push("No emergency contact. This is the single most useful line on the card.");

  const table = language === "none" ? null : TRANSLATIONS[language];
  const phrases = PHRASES.map((phrase) => {
    const entry = table ? table[phrase.id] || {} : {};
    return {
      id: phrase.id,
      english: phrase.english,
      script: entry.script || "",
      roman: entry.roman || "",
      note: entry.note || "",
    };
  });

  const numbers = emergencyNumbersFor(country);

  const lines = [
    "EMERGENCY MEDICAL CARD",
    `Name: ${holder}`,
    `Blood group: ${bloodGroup}`,
    `Allergies: ${lists.allergies.length ? lists.allergies.join(", ") : "None listed"}`,
    `Conditions: ${lists.conditions.length ? lists.conditions.join(", ") : "None listed"}`,
    `Medication: ${lists.medications.length ? lists.medications.join(", ") : "None listed"}`,
    contact ? `In an emergency call ${contact} on ${phone}` : "Emergency contact: not provided",
    insuranceRef ? `Insurance: ${insuranceRef}` : null,
    "",
    `Emergency numbers in ${country_.label}: ${numbers.map((row) => `${row.label} ${row.number}`).join(" · ") || "check locally"}`,
    country_.note ? country_.note : null,
    "",
    language === "none" ? "Phrases (English):" : `Phrases (${LANGUAGES[language].label}):`,
    ...phrases.map((phrase) => {
      if (language === "none") return `- ${phrase.english}`;
      const spoken = phrase.roman ? ` [${phrase.roman}]` : "";
      return `- ${phrase.english}\n  ${phrase.script}${spoken}`;
    }),
  ].filter((line) => line !== null);

  return {
    holder,
    bloodGroup,
    lists,
    contact,
    phone,
    insurance: insuranceRef,
    country: { key: country, ...country_ },
    language: { key: language, ...LANGUAGES[language] },
    numbers,
    phrases,
    warnings,
    text: lines.join("\n"),
    lineCount: lines.length,
    fieldsFilled: [
      holder,
      bloodGroup !== "Unknown" ? bloodGroup : "",
      lists.allergies.length ? "a" : "",
      lists.conditions.length ? "c" : "",
      lists.medications.length ? "m" : "",
      phone,
      insuranceRef,
    ].filter(Boolean).length,
    fieldsTotal: 7,
  };
}

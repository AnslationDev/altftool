/**
 * French New Year wishes composer.
 *
 * Everything here is data + pure functions. The two rules that actually drive the
 * output are French usage rules, not invented ones:
 *
 * 1. T-V distinction. French has two second-person forms: "tu" (one person you are
 *    close to) and "vous" (a person you address formally, or several people). The
 *    pronoun changes the verb and the possessive, so every template stores a fully
 *    written "tu" line and a fully written "vous" line rather than swapping a word.
 * 2. Timing. "Bonne année" is said from 1 January onwards. Before midnight on
 *    31 December the customary formulas are "Bonnes fêtes de fin d'année" and
 *    "Bon réveillon"; wishing "Bonne année" early is traditionally held to bring
 *    bad luck. Templates are therefore tagged before / after / any.
 */

/** Second-person forms available in French. */
export const ADDRESS_FORMS = [
  { id: "tu", label: "tu (informal, one person)" },
  { id: "vous", label: "vous (formal, or several people)" },
];

/** When the message is sent, relative to 1 January. */
export const TIMINGS = [
  { id: "before", label: "Before 1 January (fêtes de fin d'année)" },
  { id: "after", label: "On or after 1 January (bonne année)" },
];

/**
 * Custom, not law: in France New Year wishes are exchanged throughout January and
 * are considered late after 31 January. Used only for the on-screen note.
 */
export const WISHES_DEADLINE_DAY = 31;
export const WISHES_DEADLINE_MONTH = "janvier";

/**
 * Recipients. `address` is the pronoun French speakers would normally use for that
 * relationship; the caller may override it. `salutation` varies with grammatical
 * gender because "cher" agrees with the person addressed (cher / chère).
 */
export const RECIPIENTS = [
  {
    id: "friend",
    label: "Friend",
    address: "tu",
    salutation: { masculine: "Salut {name} !", feminine: "Salut {name} !", neutral: "Salut {name} !" },
    signoff: "Amitiés,",
  },
  {
    id: "family",
    label: "Family member",
    address: "tu",
    salutation: { masculine: "Cher {name},", feminine: "Chère {name},", neutral: "Coucou {name}," },
    signoff: "Je t'embrasse,",
  },
  {
    id: "partner",
    label: "Partner",
    address: "tu",
    salutation: { masculine: "Mon cher {name},", feminine: "Ma chère {name},", neutral: "Coucou {name}," },
    signoff: "Je t'embrasse fort,",
  },
  {
    id: "colleague",
    label: "Colleague",
    address: "vous",
    salutation: { masculine: "Cher {name},", feminine: "Chère {name},", neutral: "Bonjour {name}," },
    signoff: "Bien cordialement,",
  },
  {
    id: "manager",
    label: "Manager or senior",
    address: "vous",
    salutation: { masculine: "Cher Monsieur {name},", feminine: "Chère Madame {name},", neutral: "Bonjour {name}," },
    signoff: "Bien respectueusement,",
  },
  {
    id: "client",
    label: "Client",
    address: "vous",
    salutation: { masculine: "Cher Monsieur {name},", feminine: "Chère Madame {name},", neutral: "Madame, Monsieur," },
    signoff: "Bien cordialement,",
  },
  {
    id: "teacher",
    label: "Teacher or professor",
    address: "vous",
    salutation: { masculine: "Cher Monsieur {name},", feminine: "Chère Madame {name},", neutral: "Bonjour {name}," },
    signoff: "Respectueusement,",
  },
  {
    id: "group",
    label: "A whole group",
    address: "vous",
    salutation: { masculine: "Chers tous,", feminine: "Chères toutes,", neutral: "Bonjour à toutes et à tous," },
    signoff: "Bien à vous,",
  },
];

/** Grammatical gender of the person addressed — it only changes the salutation. */
export const GENDERS = [
  { id: "neutral", label: "Prefer not to say" },
  { id: "masculine", label: "Masculine (cher)" },
  { id: "feminine", label: "Feminine (chère)" },
];

export const TONES = [
  { id: "any", label: "Any tone" },
  { id: "classique", label: "Classique — the standard formula" },
  { id: "chaleureux", label: "Chaleureux — warm and personal" },
  { id: "professionnel", label: "Professionnel — work and clients" },
  { id: "humoristique", label: "Humoristique — light-hearted" },
  { id: "poetique", label: "Poétique — a little literary" },
];

/**
 * Message bodies. {year} is the incoming year, {days} the real number of days in it.
 * `tu` and `vous` are written out separately so the verbs and possessives are right.
 */
export const TEMPLATES = [
  {
    id: "classique-sante",
    tone: "classique",
    timing: "after",
    tu: "Bonne année {year} ! Je te souhaite une excellente santé et beaucoup de bonheur.",
    vous: "Bonne année {year} ! Je vous souhaite une excellente santé et beaucoup de bonheur.",
    english: "Happy New Year {year}! I wish you excellent health and a great deal of happiness.",
  },
  {
    id: "classique-voeux",
    tone: "classique",
    timing: "after",
    tu: "Tous mes meilleurs vœux pour l'année {year} : santé, bonheur et réussite.",
    vous: "Tous mes meilleurs vœux pour l'année {year} : santé, bonheur et réussite.",
    english: "All my best wishes for {year}: health, happiness and success.",
  },
  {
    id: "classique-courte",
    tone: "classique",
    timing: "after",
    tu: "Bonne et heureuse année {year} !",
    vous: "Bonne et heureuse année {year} !",
    english: "A good and happy {year}!",
  },
  {
    id: "chaleureux-espoir",
    tone: "chaleureux",
    timing: "after",
    tu: "Que cette nouvelle année t'apporte tout ce que tu espères, et un peu plus encore.",
    vous: "Que cette nouvelle année vous apporte tout ce que vous espérez, et un peu plus encore.",
    english: "May this new year bring you everything you hope for, and then a little more.",
  },
  {
    id: "chaleureux-merci",
    tone: "chaleureux",
    timing: "any",
    tu: "Merci pour tous les beaux moments de l'année qui s'achève. J'ai hâte de voir ce que {year} nous réserve.",
    vous: "Merci pour tous les beaux moments de l'année qui s'achève. J'ai hâte de voir ce que {year} nous réserve.",
    english: "Thank you for all the good moments of the year now ending. I can't wait to see what {year} has in store for us.",
  },
  {
    id: "chaleureux-soin",
    tone: "chaleureux",
    timing: "after",
    tu: "Bonne année ! Prends bien soin de toi et des tiens.",
    vous: "Bonne année ! Prenez bien soin de vous et des vôtres.",
    english: "Happy New Year! Take good care of yourself and of your family.",
  },
  {
    id: "pro-equipe",
    tone: "professionnel",
    timing: "after",
    tu: "Je te présente mes meilleurs vœux de santé et de réussite pour {year}.",
    vous: "Toute l'équipe se joint à moi pour vous présenter nos meilleurs vœux de santé et de réussite pour {year}.",
    english: "Please accept my (our) best wishes of health and success for {year}.",
  },
  {
    id: "pro-confiance",
    tone: "professionnel",
    timing: "after",
    tu: "Merci pour ta confiance tout au long de l'année écoulée ; je te souhaite une année {year} pleine de succès.",
    vous: "Nous vous remercions de votre confiance tout au long de l'année écoulée et vous souhaitons une année {year} pleine de succès.",
    english: "Thank you for your trust over the past year; wishing you a {year} full of success.",
  },
  {
    id: "pro-collaboration",
    tone: "professionnel",
    timing: "any",
    tu: "Au plaisir de continuer à travailler avec toi en {year}.",
    vous: "Au plaisir de poursuivre notre collaboration en {year}.",
    english: "Looking forward to continuing to work together in {year}.",
  },
  {
    id: "humour-calendrier",
    tone: "humoristique",
    timing: "after",
    tu: "Bonne année ! Je te souhaite 12 mois de bonheur, 52 semaines de joie et {days} jours sans réveil difficile.",
    vous: "Bonne année ! Je vous souhaite 12 mois de bonheur, 52 semaines de joie et {days} jours sans réveil difficile.",
    english: "Happy New Year! Wishing you 12 months of happiness, 52 weeks of joy and {days} days without a rough morning.",
  },
  {
    id: "humour-resolutions",
    tone: "humoristique",
    timing: "after",
    tu: "Bonne année ! Cette fois c'est promis : tu tiendras tes bonnes résolutions au moins jusqu'au 15 janvier.",
    vous: "Bonne année ! Cette fois c'est promis : vous tiendrez vos bonnes résolutions au moins jusqu'au 15 janvier.",
    english: "Happy New Year! This time it's a promise: you'll keep your resolutions at least until 15 January.",
  },
  {
    id: "poetique-page",
    tone: "poetique",
    timing: "any",
    tu: "Une nouvelle page se tourne : je te souhaite d'y écrire de très belles choses.",
    vous: "Une nouvelle page se tourne : je vous souhaite d'y écrire de très belles choses.",
    english: "A new page is turning: I hope you write beautiful things on it.",
  },
  {
    id: "poetique-projets",
    tone: "poetique",
    timing: "after",
    tu: "Que {year} t'offre des projets qui te ressemblent, des rires qui durent et des jours qui comptent.",
    vous: "Que {year} vous offre des projets qui vous ressemblent, des rires qui durent et des jours qui comptent.",
    english: "May {year} bring you projects that look like you, laughter that lasts and days that count.",
  },
  {
    id: "avant-fetes",
    tone: "classique",
    timing: "before",
    tu: "Je te souhaite de très belles fêtes de fin d'année et un excellent réveillon.",
    vous: "Je vous souhaite de très belles fêtes de fin d'année et un excellent réveillon.",
    english: "Wishing you a lovely end-of-year holiday season and a great New Year's Eve.",
  },
  {
    id: "avant-retrouve",
    tone: "chaleureux",
    timing: "before",
    tu: "Bonnes fêtes ! On se retrouve de l'autre côté, en {year}.",
    vous: "Bonnes fêtes ! Nous nous retrouvons de l'autre côté, en {year}.",
    english: "Happy holidays! See you on the other side, in {year}.",
  },
  {
    id: "avant-pro",
    tone: "professionnel",
    timing: "before",
    tu: "Je te souhaite d'excellentes fêtes de fin d'année et un repos bien mérité.",
    vous: "Toute l'équipe vous souhaite d'excellentes fêtes de fin d'année et un repos bien mérité.",
    english: "Wishing you an excellent end-of-year break and a well-earned rest.",
  },
  {
    id: "avant-poetique",
    tone: "poetique",
    timing: "before",
    tu: "Que les derniers jours de l'année te soient doux, et que {year} commence en douceur.",
    vous: "Que les derniers jours de l'année vous soient doux, et que {year} commence en douceur.",
    english: "May the last days of the year be gentle with you, and may {year} begin softly.",
  },
];

/** Guard rails on the free-text fields and on how many messages we return. */
export const MAX_NAME_LENGTH = 60;
export const MAX_MESSAGES = 6;
/** Gregorian calendar was introduced in October 1582, so 1583 is the first full year. */
export const MIN_YEAR = 1583;
export const MAX_YEAR = 2999;

/** Gregorian leap-year rule: divisible by 4, except centuries not divisible by 400. */
export function isLeapYear(year) {
  if (!Number.isInteger(year)) return false;
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** 366 in a leap year, otherwise 365. */
export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Next seed in a fixed sequence, so a "shuffle" button stays pure and reproducible.
 * Uses the Numerical Recipes LCG constants, kept inside 31 bits.
 */
export function nextSeed(seed) {
  const current = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 1;
  return (current * 1664525 + 1013904223) % 2147483647 || 1;
}

/** Deterministic 32-bit PRNG (mulberry32) so the same seed always gives the same picks. */
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

/** Fisher-Yates driven by the seeded PRNG. Does not mutate the input. */
function seededShuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const fill = (text, { year, days }) =>
  text.replaceAll("{year}", String(year)).replaceAll("{days}", String(days));

/** Trim, collapse inner whitespace, drop control characters. */
function cleanName(raw) {
  if (raw === undefined || raw === null) return "";
  return String(raw)
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build the greeting line. With no name we fall back to a name-free salutation so the
 * output never contains a dangling "Cher ,".
 */
export function buildSalutation({ recipient, gender, name }) {
  if (!name) {
    if (recipient.id === "group") return recipient.salutation.neutral.replace("{name}", "").trim();
    return gender === "masculine" ? "Cher ami," : gender === "feminine" ? "Chère amie," : "Bonjour,";
  }
  const key = gender === "masculine" || gender === "feminine" ? gender : "neutral";
  const template = recipient.salutation[key] || recipient.salutation.neutral;
  return template.replaceAll("{name}", name);
}

/**
 * Compose French New Year messages.
 *
 * @param {object} input
 * @param {string} [input.name] person addressed
 * @param {"masculine"|"feminine"|"neutral"} [input.gender]
 * @param {string} [input.recipientId] one of RECIPIENTS
 * @param {"tu"|"vous"|"auto"} [input.address] pronoun; "auto" uses the recipient default
 * @param {"before"|"after"} [input.timing]
 * @param {string} [input.tone] one of TONES
 * @param {number} [input.year] the incoming year
 * @param {number} [input.count] how many messages, 1..MAX_MESSAGES
 * @param {number} [input.seed] integer; same seed gives the same messages
 * @param {string} [input.senderName] signed under the sign-off
 * @returns {{messages:Array, ...}|{error:string}}
 */
export function generateFrenchNewYearWishes({
  name = "",
  gender = "neutral",
  recipientId = "friend",
  address = "auto",
  timing = "after",
  tone = "any",
  year = 2027,
  count = 3,
  seed = 1,
  senderName = "",
} = {}) {
  const recipient = RECIPIENTS.find((item) => item.id === recipientId);
  if (!recipient) return { error: "Choose who the message is for." };

  if (!TONES.some((item) => item.id === tone)) return { error: "Choose a valid tone." };
  if (!TIMINGS.some((item) => item.id === timing)) return { error: "Choose when the message is sent." };
  if (address !== "auto" && !ADDRESS_FORMS.some((item) => item.id === address)) {
    return { error: "Choose tu, vous or automatic." };
  }

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }
  const cleanedSender = cleanName(senderName);
  if (cleanedSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep your own name under ${MAX_NAME_LENGTH} characters.` };
  }

  const pronoun = address === "auto" ? recipient.address : address;
  const days = daysInYear(year);

  let pool = TEMPLATES.filter((item) => item.timing === timing || item.timing === "any");
  if (tone !== "any") {
    const toned = pool.filter((item) => item.tone === tone);
    if (toned.length > 0) pool = toned;
  }
  if (pool.length === 0) return { error: "No message matches that combination — try another tone." };

  const picked = seededShuffle(pool, Math.abs(Math.trunc(seed)) || 1).slice(0, Math.min(count, pool.length));
  const salutation = buildSalutation({ recipient, gender, name: cleanedName });
  const signature = cleanedSender ? `${recipient.signoff}\n${cleanedSender}` : recipient.signoff;

  const messages = picked.map((item) => {
    const body = fill(item[pronoun], { year, days });
    return {
      id: item.id,
      tone: item.tone,
      timing: item.timing,
      body,
      english: fill(item.english, { year, days }),
      full: `${salutation}\n\n${body}\n\n${signature}`,
    };
  });

  return {
    messages,
    salutation,
    signoff: recipient.signoff,
    pronoun,
    recipient,
    tone,
    timing,
    year,
    days,
    leapYear: isLeapYear(year),
    requested: count,
    delivered: messages.length,
    poolSize: pool.length,
  };
}

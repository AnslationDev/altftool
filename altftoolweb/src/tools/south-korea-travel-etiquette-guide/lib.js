/**
 * South Korea travel etiquette model.
 *
 * The rule set is data and it is scored rather than listed:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you tick, except those marked
 * `legal: true` or `always: true`, which are always shown. Korea's photography
 * and smoking rules belong in that group: both are enforced with fines rather
 * than disapproval.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, that you have already ticked as known.
 *
 * The organising idea behind almost every rule here is relative age and
 * seniority. It decides who speaks first, who pours, who starts eating, who
 * pays, and which grammatical form of the language is used.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "South Korea",
  adjective: "Korean",
  language: "Korean",
  currencyNote:
    "Card and phone payment work almost everywhere, including market stalls and buses, and a transit card doubles as a convenience-store card.",
  headline:
    "Korean etiquette runs on relative age and seniority: it decides who greets first, who pours the drink, who starts eating and which form of the language is used.",
};

export const SEVERITIES = [
  {
    id: "critical",
    label: "Get this wrong and it is a real problem",
    weight: 5,
    note: "Causes genuine offence, or breaks a rule enforced with a fine.",
  },
  {
    id: "important",
    label: "Locals will notice",
    weight: 3,
    note: "Marks you out at once, even if nobody says anything.",
  },
  {
    id: "nice",
    label: "Nice to know",
    weight: 1,
    note: "Small courtesies that smooth the trip.",
  },
];

export const CATEGORIES = [
  "Greetings",
  "Dress and shoes",
  "Dining",
  "Drinking",
  "Sacred places",
  "Photography",
  "Public behaviour",
  "Money",
  "Transport",
  "Law and risk",
  "Business",
];

export const CONTEXTS = [
  { id: "restaurants", label: "Restaurants and cafés", note: "Korean barbecue, kimbap counters, chains." },
  { id: "drinking", label: "Drinking and hoesik", note: "Soju, makgeolli, a work or family dinner." },
  { id: "transport", label: "Subway, buses and taxis", note: "Seoul Metro, KTX, city buses." },
  { id: "temples", label: "Palaces and temples", note: "Gyeongbokgung, Bulguksa, a temple stay." },
  { id: "shops", label: "Shops and markets", note: "Convenience stores, Namdaemun, department stores." },
  { id: "homes", label: "Visiting a Korean home", note: "Including a homestay or a guesthouse." },
  { id: "business", label: "Business meetings", note: "Offices, client dinners, conferences." },
  { id: "streets", label: "Streets and public spaces", note: "Walking, queueing, smoking, photographs." },
];

export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.4, Photography: 1.4, Transport: 1.3 } },
  { id: "business", label: "Business trip", emphasis: { Business: 1.8, Greetings: 1.5, Drinking: 1.6 } },
  { id: "food", label: "Food and drink trip", emphasis: { Dining: 1.7, Drinking: 1.6, Money: 1.2 } },
  { id: "family", label: "Visiting family or friends", emphasis: { Greetings: 1.4, "Dress and shoes": 1.4, Dining: 1.3 } },
  { id: "first", label: "First time in Korea", emphasis: { "Public behaviour": 1.4, Transport: 1.3, "Law and risk": 1.3 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

export const RULES = [
  {
    id: "two-hands",
    category: "Greetings",
    severity: "critical",
    contexts: ["business", "homes", "shops", "restaurants", "drinking"],
    title: "Give and receive with two hands",
    action: "Use both hands for anything you hand over — money, a card, a gift, a glass — or support your right forearm with your left hand.",
    avoid: "One-handed passing to anyone older or senior, and taking change with a single hand.",
    why: "It is the single most visible marker of respect in Korea, and it costs nothing. The forearm-support version is what you will see at tills all day.",
  },
  {
    id: "seniority",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["restaurants", "drinking", "business", "homes"],
    title: "Age and seniority set the order of everything",
    action: "Let the eldest sit first, start eating first and lead the conversation; expect to be asked your age early, which is information-gathering, not rudeness.",
    avoid: "Starting to eat before the senior person has, or taking the seat furthest from the door, which is usually theirs.",
    why: "Korean has different speech levels for different relative ages, so the question decides how the whole conversation will be conducted.",
  },
  {
    id: "pour",
    category: "Drinking",
    severity: "critical",
    contexts: ["drinking", "restaurants", "business"],
    title: "Never pour your own drink",
    action: "Pour for others with two hands, keep an eye on their glass, and let someone pour for you.",
    avoid: "Topping up your own soju, and filling a glass that is not yet empty.",
    why: "Pouring is how the table looks after each other. An empty glass in front of you is a cue to someone else, not a problem for you to solve.",
  },
  {
    id: "turn-away",
    category: "Drinking",
    severity: "important",
    contexts: ["drinking", "business"],
    title: "Turn your head away when drinking with an elder",
    action: "Turn slightly to the side, away from the senior person, and cover the glass with your hand as you drink.",
    avoid: "Drinking face-on to someone much older or senior.",
    why: "It is a small physical gesture of deference that is still widely observed, especially at a work dinner.",
  },
  {
    id: "shoes",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["homes", "temples", "restaurants"],
    title: "Shoes off, and expect to sit on the floor",
    action: "Take shoes off at the door of a home, a temple hall, a guesthouse and any restaurant with a raised floor and low tables.",
    avoid: "Stretching your legs out or pointing your feet at anyone once you are down there.",
    why: "Floor seating is normal in traditional restaurants and homes, so your socks will be on show far more often than you expect.",
  },
  {
    id: "no-tipping",
    category: "Money",
    severity: "critical",
    contexts: ["restaurants", "shops", "transport", "drinking"],
    title: "Do not tip",
    action: "Pay the marked price. Taxis are metered and restaurants include service.",
    avoid: "Leaving change on the table, which may be brought out to you in the street.",
    why: "Tipping is not part of the system and can read as implying the staff need charity. Hotel porters at international chains are the narrow exception.",
  },
  {
    id: "priority-seats",
    category: "Transport",
    severity: "critical",
    contexts: ["transport"],
    title: "Leave the priority seats empty",
    action: "Stand rather than take the marked seats at the end of each subway carriage, even when the carriage is empty.",
    avoid: "Sitting there because nobody is using them, and taking the pink seats reserved for pregnant passengers.",
    why: "Korea treats priority seating as genuinely reserved, not as first-come. Sitting in one when an older passenger boards is the fastest way to be told off in public.",
  },
  {
    id: "photo-consent",
    category: "Photography",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["streets", "shops", "temples", "restaurants"],
    title: "Do not photograph people without consent",
    action: "Ask first, and keep cameras away from changing rooms, swimming pools, escalators and anywhere someone could think you were filming them.",
    avoid: "Street photography of strangers' faces, and any attempt to silence your phone's shutter.",
    why: "South Korea's laws against illegal filming are strict and vigorously enforced, and phones sold in Korea make a shutter sound that cannot be turned off. A misunderstanding here is a police matter, not an argument.",
  },
  {
    id: "smoking",
    category: "Law and risk",
    severity: "important",
    legal: true,
    always: true,
    contexts: ["streets", "restaurants", "drinking"],
    title: "Smoke only in the marked areas",
    action: "Use the designated smoking booths and rooms; look for the signs before lighting up.",
    avoid: "Smoking in any restaurant, café, bar, bus stop or station, and in the many street-level no-smoking zones.",
    why: "Indoor smoking is banned nationwide and local no-smoking zones carry on-the-spot fines. Enforcement in Seoul is routine.",
  },
  {
    id: "chopsticks",
    category: "Dining",
    severity: "important",
    contexts: ["restaurants", "homes", "drinking"],
    title: "The spoon does the work, and the bowl stays down",
    action: "Eat rice and soup with the spoon and side dishes with the metal chopsticks, keeping the bowl on the table.",
    avoid: "Lifting the rice bowl to your mouth, holding the spoon and chopsticks at once, or standing chopsticks upright in rice.",
    why: "Lifting the bowl is Japanese and Chinese practice, not Korean. Upright chopsticks recall an offering to the dead, as they do across the region.",
  },
  {
    id: "banchan",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes"],
    title: "Side dishes are shared and refilled free",
    action: "Take from the banchan with your own chopsticks a little at a time, and ask for a refill if you finish one.",
    avoid: "Piling them onto your own plate, or leaving a bowl untouched to be polite.",
    why: "Banchan come with the meal at no charge and are refilled on request. They are meant to be eaten alongside every mouthful, not as starters.",
  },
  {
    id: "who-pays",
    category: "Money",
    severity: "important",
    contexts: ["restaurants", "drinking", "business"],
    title: "One person usually pays the whole bill",
    action: "Expect the eldest or the person who invited you to pay, and offer to get the next round or the coffee afterwards.",
    avoid: "Insisting on splitting to the won at the table, which can embarrass the host.",
    why: "Paying in turn across an evening is the norm, though dutch pay is now common among younger people and there are apps built for it.",
  },
  {
    id: "titles",
    category: "Greetings",
    severity: "important",
    contexts: ["business", "homes", "restaurants"],
    title: "Use titles, not first names",
    action: "Address people by surname plus title — Kim seonsaengnim, Park bujangnim — or by their job title alone.",
    avoid: "Going straight to a first name, which is reserved for close friends and juniors.",
    why: "Names carry rank in Korean. Getting this right in the first five minutes of a meeting matters more than anything you say later.",
  },
  {
    id: "bow",
    category: "Greetings",
    severity: "important",
    contexts: ["business", "shops", "homes", "temples"],
    title: "Bow, and shake hands with support",
    action: "A short bow from the neck for everyday greetings; for a handshake, offer the right hand and lightly support your right forearm with the left.",
    avoid: "A firm two-pump handshake with strong eye contact, which reads as aggressive with someone senior.",
    why: "The bow is the greeting; the handshake is the addition. The supported forearm is the polite version.",
  },
  {
    id: "subway-conduct",
    category: "Transport",
    severity: "important",
    contexts: ["transport"],
    title: "Keep the subway quiet and food-free",
    action: "Use headphones, keep calls short and quiet, and let passengers off before boarding.",
    avoid: "Eating or drinking on the subway, and loud group conversation in a carriage.",
    why: "Carriages are noticeably quieter than in most countries and eating on them is frowned on, though a coffee cup with a lid passes without comment.",
  },
  {
    id: "recycling",
    category: "Public behaviour",
    severity: "important",
    contexts: ["homes", "streets", "shops"],
    title: "Rubbish is sorted, and the bag itself is the fee",
    action: "Separate food waste, plastics, paper, glass and general waste, and use the official district bags for general rubbish.",
    avoid: "Putting everything in one bag, or leaving rubbish out in a supermarket carrier.",
    why: "Korea's volume-based waste system charges for disposal through the price of the mandatory bag, and using the wrong one can attract a fine for the household you are staying with.",
  },
  {
    id: "temple",
    category: "Sacred places",
    severity: "important",
    contexts: ["temples"],
    title: "Move quietly and to the side in a temple",
    action: "Enter a hall by the side door rather than the central one, keep shoulders and knees covered, and step around anyone bowing.",
    avoid: "Walking between a worshipper and the Buddha image, or photographing people at prayer.",
    why: "The central door of a hall is traditionally reserved. Korean temples are working monasteries, and many run overnight temple-stay programmes with their own rules.",
  },
  {
    id: "hanbok",
    category: "Money",
    severity: "nice",
    contexts: ["temples", "streets"],
    title: "Hanbok gets you into the palaces free",
    action: "Hire a hanbok near Gyeongbokgung and wear it to the palace gate.",
    avoid: "Treating it as a costume — wear it properly and it is welcomed rather than resented.",
    why: "Seoul's four grand palaces waive admission for visitors in hanbok, which is why the streets around Gyeongbokgung are full of rental shops.",
  },
  {
    id: "red-ink",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["business", "homes", "shops"],
    title: "Do not write a living person's name in red",
    action: "Use black or blue ink for names on anything.",
    avoid: "A red pen on a card, a form or a name tag.",
    why: "Red is traditionally used for the names of the dead in family registers and on funeral records. The association is still felt.",
  },
  {
    id: "number-four",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["shops", "homes", "business"],
    title: "Four is the unlucky number",
    action: "Give gifts in pairs or in threes, and do not be surprised by a lift with an F where the fourth floor should be.",
    avoid: "A set of four of anything as a present.",
    why: "The Sino-Korean word for four is a homophone of the word for death, so buildings and hospitals often skip it.",
  },
  {
    id: "nose",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes", "drinking"],
    title: "Do not blow your nose at the table",
    action: "Step away if the kimchi jjigae gets the better of you.",
    avoid: "Blowing your nose in front of people eating.",
    why: "It is considered as unpleasant as it would be to do it at a formal dinner elsewhere, and Korean food will make it necessary.",
  },
  {
    id: "jaywalking",
    category: "Law and risk",
    severity: "nice",
    legal: true,
    contexts: ["streets"],
    title: "Wait for the green man",
    action: "Cross at the crossing and wait for the signal, even on an empty street.",
    avoid: "Following the habits of your own city here.",
    why: "Jaywalking carries a small fine and is genuinely unusual behaviour in Korean cities. Drivers do not expect it.",
  },
  {
    id: "business-cards",
    category: "Business",
    severity: "critical",
    contexts: ["business"],
    title: "Present a business card with two hands and read it",
    action: "Offer the card facing the recipient, take theirs with both hands, read it, and place it on the table for the meeting.",
    avoid: "Writing on the card, or pocketing it without looking.",
    why: "The card carries the person's rank, which tells you how to address them for the rest of the meeting. Handling it carelessly ignores that.",
  },
  {
    id: "dmz",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["streets", "temples"],
    title: "A DMZ tour has a dress code and needs a passport",
    action: "Take your passport, wear covered shoes and neat clothing, and follow the photography instructions exactly.",
    avoid: "Ripped jeans, sleeveless tops, sandals, and photographing anything you are told not to.",
    why: "Access is controlled by the military and tours are refused at the checkpoint for dress. Photography restrictions inside the Joint Security Area are not negotiable.",
  },
];

export const PHRASES = [
  { roman: "Annyeonghaseyo", script: "안녕하세요", english: "Hello", when: "Entering anywhere, and to anyone." },
  { roman: "Gamsahamnida", script: "감사합니다", english: "Thank you", when: "The polite formal version — use this one." },
  { roman: "Joesonghamnida", script: "죄송합니다", english: "I'm sorry", when: "Bumping into someone, or a real apology." },
  { roman: "Jeogiyo", script: "저기요", english: "Excuse me / over here", when: "Calling a waiter, which is expected rather than rude." },
  { roman: "Eolmayeyo?", script: "얼마예요?", english: "How much is it?", when: "Markets and small shops." },
  { roman: "Igeo juseyo", script: "이거 주세요", english: "This one, please", when: "Pointing at a menu or a display." },
  { roman: "Masisseoyo", script: "맛있어요", english: "It's delicious", when: "Always well received." },
  { roman: "Gwaenchanayo", script: "괜찮아요", english: "It's fine / no thank you", when: "Declining politely." },
];

const isPlainArray = (value) => Array.isArray(value);

export function severityFor(id) {
  return SEVERITIES.find((entry) => entry.id === id) || null;
}

/** severity weight x category emphasis, to two decimals. */
export function rulePriority(rule, purpose) {
  const severity = severityFor(rule.severity);
  if (!severity) return 0;
  const emphasis = (purpose && purpose.emphasis[rule.category]) || 1;
  return Math.round(severity.weight * emphasis * 100) / 100;
}

/**
 * Build the briefing.
 *
 * @param {object} input
 * @param {string[]} input.contextIds places you will be, from CONTEXTS
 * @param {string} input.purposeId a TRIP_PURPOSES id
 * @param {string[]} input.knownRuleIds rules already ticked as known
 * @param {number} input.maxItems how many rules to show
 * @returns {object} the briefing, or { error }
 */
export function buildEtiquetteBriefing({
  contextIds = [],
  purposeId = "leisure",
  knownRuleIds = [],
  maxItems = DEFAULT_ITEMS,
} = {}) {
  if (!isPlainArray(contextIds)) return { error: "Choose at least one place you will be visiting." };
  const validContexts = contextIds.filter((id) => CONTEXTS.some((entry) => entry.id === id));
  if (validContexts.length === 0) {
    return { error: "Choose at least one place you will be visiting." };
  }
  const purpose = TRIP_PURPOSES.find((entry) => entry.id === purposeId);
  if (!purpose) return { error: "Choose what kind of trip this is." };
  if (!isPlainArray(knownRuleIds)) return { error: "The list of known rules is not valid." };
  if (
    typeof maxItems !== "number" ||
    !Number.isFinite(maxItems) ||
    !Number.isInteger(maxItems) ||
    maxItems < MIN_ITEMS ||
    maxItems > MAX_ITEMS
  ) {
    return { error: `Show between ${MIN_ITEMS} and ${MAX_ITEMS} rules.` };
  }

  const known = new Set(knownRuleIds);
  const contextSet = new Set(validContexts);

  const selected = RULES.filter(
    (rule) => rule.always || rule.legal || rule.contexts.some((id) => contextSet.has(id)),
  ).map((rule) => ({
    ...rule,
    priority: rulePriority(rule, purpose),
    severityLabel: severityFor(rule.severity).label,
    severityWeight: severityFor(rule.severity).weight,
    known: known.has(rule.id),
    matchedContexts: rule.contexts.filter((id) => contextSet.has(id)),
  }));

  if (selected.length === 0) {
    return { error: "No rules match that combination. Tick another place you will be visiting." };
  }

  const ranked = [...selected].sort(
    (a, b) =>
      b.priority - a.priority || b.severityWeight - a.severityWeight || a.id.localeCompare(b.id),
  );

  const totalWeight = ranked.reduce((sum, rule) => sum + rule.priority, 0);
  const knownWeight = ranked.reduce((sum, rule) => sum + (rule.known ? rule.priority : 0), 0);
  const readinessPct = totalWeight > 0 ? Math.round((knownWeight / totalWeight) * 100) : 0;

  const shown = ranked.slice(0, maxItems);
  const topMistakes = ranked.filter((rule) => !rule.known).slice(0, 5);
  const legalRisks = ranked.filter((rule) => rule.legal);

  const bySeverity = SEVERITIES.map((severity) => {
    const rules = ranked.filter((rule) => rule.severity === severity.id);
    return {
      id: severity.id,
      label: severity.label,
      count: rules.length,
      knownCount: rules.filter((rule) => rule.known).length,
    };
  }).filter((entry) => entry.count > 0);

  const byCategory = CATEGORIES.map((category) => {
    const rules = ranked.filter((rule) => rule.category === category);
    return {
      category,
      count: rules.length,
      knownCount: rules.filter((rule) => rule.known).length,
      emphasised: Boolean(purpose.emphasis[category]),
    };
  }).filter((entry) => entry.count > 0);

  let readinessLabel = "Start at the top of the list";
  if (readinessPct >= 90) readinessLabel = "You are ready to go";
  else if (readinessPct >= 70) readinessLabel = "Solid — close the last few gaps";
  else if (readinessPct >= 40) readinessLabel = "Halfway there";

  return {
    purpose,
    contexts: validContexts.map((id) => CONTEXTS.find((entry) => entry.id === id)),
    ruleCount: ranked.length,
    knownCount: ranked.filter((rule) => rule.known).length,
    totalWeight: Math.round(totalWeight * 100) / 100,
    knownWeight: Math.round(knownWeight * 100) / 100,
    readinessPct,
    readinessLabel,
    rules: shown,
    hiddenCount: ranked.length - shown.length,
    topMistakes,
    legalRisks,
    bySeverity,
    byCategory,
    phrases: PHRASES,
  };
}

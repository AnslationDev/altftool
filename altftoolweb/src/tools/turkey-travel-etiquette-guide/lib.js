/**
 * Turkey travel etiquette model.
 *
 * The rule set is data and it is scored rather than listed:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you tick, except those marked
 * `legal: true` or `always: true`, which are shown regardless. Turkey has a
 * small number of genuine legal red lines — insulting the memory of Atatürk,
 * photographing military installations, and removing antiquities — that a
 * visitor should see whatever their itinerary.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, that you have already ticked as known.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "Turkey",
  adjective: "Turkish",
  language: "Turkish",
  currencyNote:
    "Cards work in cities and cash matters in villages and small bazaars. Keep small notes for tea, taxis and mosque donations.",
  headline:
    "Turkish etiquette is built on hospitality: you will be offered tea constantly, and the polite move is almost always to accept, sit down and take your time.",
};

export const SEVERITIES = [
  {
    id: "critical",
    label: "Get this wrong and it is a real problem",
    weight: 5,
    note: "Causes serious offence, or breaks a law with a real penalty.",
  },
  {
    id: "important",
    label: "Locals will notice",
    weight: 3,
    note: "Marks you out at once, or costs you money.",
  },
  {
    id: "nice",
    label: "Nice to know",
    weight: 1,
    note: "Small courtesies that make the trip smoother.",
  },
];

export const CATEGORIES = [
  "Greetings",
  "Dress and shoes",
  "Dining",
  "Sacred places",
  "Photography",
  "Public behaviour",
  "Money",
  "Transport",
  "Law and risk",
  "Business",
];

export const CONTEXTS = [
  { id: "mosques", label: "Mosques and religious sites", note: "The Blue Mosque, Hagia Sophia, any neighbourhood cami." },
  { id: "restaurants", label: "Restaurants and meyhane", note: "Lokanta lunches, kebab houses, long raki dinners." },
  { id: "teahouses", label: "Tea houses and cafés", note: "Çay bahçesi, kahvehane, a shopkeeper's back room." },
  { id: "bazaars", label: "Bazaars and shopping", note: "Grand Bazaar, Spice Bazaar, carpet and rug shops." },
  { id: "transport", label: "Transport", note: "Dolmuş, metro, ferries, intercity buses." },
  { id: "homes", label: "Visiting a Turkish home", note: "An invitation you will get sooner than you expect." },
  { id: "hammam", label: "Hammams and spas", note: "Traditional bath houses." },
  { id: "business", label: "Business meetings", note: "Offices, factories, negotiations." },
  { id: "streets", label: "Streets and public spaces", note: "Sightseeing, photography, conversation." },
];

export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.5, Photography: 1.4, "Dress and shoes": 1.3 } },
  { id: "shopping", label: "Shopping and bazaars", emphasis: { Money: 1.8, Greetings: 1.3 } },
  { id: "business", label: "Business trip", emphasis: { Business: 1.8, Greetings: 1.5, Dining: 1.3 } },
  { id: "family", label: "Visiting family or friends", emphasis: { Dining: 1.5, Greetings: 1.4, "Public behaviour": 1.3 } },
  { id: "first", label: "First time in Turkey", emphasis: { "Law and risk": 1.5, "Sacred places": 1.3, "Public behaviour": 1.3 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

export const RULES = [
  {
    id: "ataturk",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["streets", "business", "teahouses"],
    title: "Do not insult Atatürk, in any form",
    action: "Treat Mustafa Kemal Atatürk as beyond criticism in conversation and online, and treat his image and statues with respect.",
    avoid: "Jokes, defacing an image or a banknote, or arguing about his legacy with strangers.",
    why: "Law No. 5816 of 1951 makes insulting the memory of Atatürk a criminal offence punishable by one to three years' imprisonment, with a heavier penalty for damaging statues or memorials. Foreigners have been prosecuted.",
  },
  {
    id: "photo-military",
    category: "Photography",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["streets", "transport"],
    title: "Never photograph military or police installations",
    action: "Put the camera away near barracks, airbases, border areas and checkpoints, and obey any officer who asks you to stop.",
    avoid: "Photographing soldiers, police, or the border regions in the south-east, and flying a drone without a permit.",
    why: "Photographing military and security installations is a criminal matter and detentions do happen. Drone use requires permission from the Turkish civil aviation authority.",
  },
  {
    id: "antiquities",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["bazaars", "streets"],
    title: "Do not take antiquities out of the country",
    action: "Buy from a licensed dealer who provides paperwork, and leave stones, coins and fragments where you find them.",
    avoid: "Pocketing an old-looking coin or a piece of mosaic from a site as a souvenir.",
    why: "Removing antiquities from Turkey is a serious offence with long prison sentences, and the checks at the airport are real. What looks like a trinket in a market can still be a protected object.",
  },
  {
    id: "mosque-dress",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["mosques"],
    title: "Cover up and take your shoes off at a mosque",
    action: "Women cover their hair with a scarf; everyone covers shoulders and knees; shoes come off at the door and go on the racks or in a bag.",
    avoid: "Shorts, vests and bare heads for women. Hagia Sophia has been a working mosque since 2020, so the same rules now apply there.",
    why: "It is a working place of worship, not a museum, and the rules are enforced at the door. Most large mosques lend scarves and wraps free of charge.",
  },
  {
    id: "mosque-prayer",
    category: "Sacred places",
    severity: "critical",
    contexts: ["mosques"],
    title: "Time your visit around the five prayers",
    action: "Visit between prayer times, keep to the back and the sides, and stay quiet.",
    avoid: "Walking in front of someone who is praying, and visiting during the Friday midday prayer, when mosques are closed to visitors.",
    why: "Passing in front of a person at prayer interrupts it. Prayer times shift through the year, and the boards outside each mosque list the day's five.",
  },
  {
    id: "tea",
    category: "Public behaviour",
    severity: "important",
    contexts: ["bazaars", "teahouses", "homes", "business"],
    title: "Accept the tea",
    action: "Take the çay you are offered, hold the tulip glass by the rim, and sit for a few minutes.",
    avoid: "Refusing outright, or assuming the tea in a carpet shop obliges you to buy. It does not.",
    why: "Offering tea is the opening move of almost every Turkish interaction, commercial or social. Refusing it closes the conversation before it starts.",
  },
  {
    id: "shoes-home",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["homes", "mosques"],
    title: "Shoes come off at the front door",
    action: "Take yours off inside the doorway and put on the slippers you are handed.",
    avoid: "Walking through a Turkish home in outdoor shoes, which is close to unthinkable.",
    why: "Floors are for sitting on and children play on them. There will be a pair of guest slippers waiting.",
  },
  {
    id: "gestures",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["streets", "bazaars", "business", "transport"],
    title: "Two common gestures are obscene here",
    action: "Say yes and no with words, and use an open hand to point.",
    avoid: "The thumb-and-forefinger circle, and the fist with the thumb between the first two fingers. Both are seriously offensive in Turkey.",
    why: "The circle sign is not the international OK here, and the second gesture is a direct insult. A thumbs-up is fine in cities.",
  },
  {
    id: "alcohol",
    category: "Law and risk",
    severity: "important",
    legal: true,
    contexts: ["restaurants", "bazaars", "streets"],
    title: "Alcohol is legal but restricted",
    action: "Buy from shops during permitted hours, drink in licensed venues, and be discreet in conservative districts.",
    avoid: "Expecting to buy beer from a shop late at night, or drinking in the street.",
    why: "Retail alcohol sales are prohibited overnight, roughly from 22:00 to 06:00, and advertising is banned. Many neighbourhoods and towns have few licensed venues at all.",
  },
  {
    id: "ramadan",
    category: "Public behaviour",
    severity: "important",
    contexts: ["streets", "restaurants", "teahouses"],
    title: "Be discreet during Ramazan",
    action: "Eat indoors during daylight in conservative areas, and accept an invitation to an iftar table if one is offered.",
    avoid: "Eating, drinking or smoking conspicuously in the street in front of people who are fasting.",
    why: "Eating in public during daylight is not illegal in Turkey and cafés stay open in the big cities, but the atmosphere is different in Konya or eastern Anatolia than in central Istanbul.",
  },
  {
    id: "bargain",
    category: "Money",
    severity: "important",
    contexts: ["bazaars"],
    title: "Bargain in the bazaar, not in the shop",
    action: "Ask the price, take the tea, counter well below, and settle somewhere in the middle over a few minutes.",
    avoid: "Naming a price you are not willing to pay, and haggling where prices are marked.",
    why: "In the Grand Bazaar and with carpets, leather and jewellery the first price is an opening position. In a supermarket or a chain shop it is not.",
  },
  {
    id: "tipping",
    category: "Money",
    severity: "important",
    contexts: ["restaurants", "teahouses", "hammam", "transport"],
    title: "Tip around five to ten per cent, and check for servis",
    action: "Leave 5-10% in a restaurant, round up a taxi fare, and tip the hammam attendant who works on you directly.",
    avoid: "Adding a tip on top of a bill that already shows servis.",
    why: "Tipping is normal but modest by American standards, and a service charge is sometimes already included in tourist areas.",
  },
  {
    id: "hammam",
    category: "Public behaviour",
    severity: "important",
    contexts: ["hammam"],
    title: "Know how a hammam works before you go in",
    action: "Keep the peştemal wrap on, follow the attendant's lead through the hot room, scrub and rinse, and check whether the hours are mixed or single-sex.",
    avoid: "Full nudity in a mixed or general session, and washing directly in the marble basin — you pour water over yourself with the bowl.",
    why: "Most traditional hammams have separate hours or separate sections for men and women, and the sequence is fixed. Underwear stays on in most of them.",
  },
  {
    id: "sole",
    category: "Public behaviour",
    severity: "important",
    contexts: ["homes", "mosques", "teahouses", "restaurants"],
    title: "Do not show the sole of your shoe",
    action: "Keep both feet on the floor when sitting.",
    avoid: "Crossing an ankle over a knee so the sole points at someone, and putting feet on furniture.",
    why: "The sole is the dirtiest part of you and pointing it at a person is an insult, a rule Turkey shares with much of the region.",
  },
  {
    id: "photo-people",
    category: "Photography",
    severity: "important",
    contexts: ["streets", "bazaars", "mosques"],
    title: "Ask before photographing people",
    action: "Gesture at the camera and wait for a nod, especially with women and in conservative or rural areas.",
    avoid: "Photographing worshippers inside a mosque, and photographing children without a parent's agreement.",
    why: "It is a matter of respect rather than law in most places, but it is felt strongly outside the tourist quarters.",
  },
  {
    id: "transport-seat",
    category: "Transport",
    severity: "important",
    contexts: ["transport"],
    title: "Give up your seat, and pass the fare forward",
    action: "Stand for elderly passengers, pregnant women and anyone with a small child; on a dolmuş, pass your fare up through the other passengers to the driver.",
    avoid: "Staying seated and looking at your phone, which will be noticed at once.",
    why: "Both are unspoken but universal. The dolmuş fare chain is one of the small pleasures of travelling in Turkey.",
  },
  {
    id: "refusing-food",
    category: "Dining",
    severity: "important",
    contexts: ["homes", "restaurants"],
    title: "Accept the food, at least a little",
    action: "Take a small portion of everything offered and praise the cooking; expect to be pressed to take more.",
    avoid: "A flat refusal, or explaining a diet at length at someone's table.",
    why: "Feeding a guest is the core of Turkish hospitality. Saying elinize sağlık — health to your hands — to whoever cooked lands better than any compliment.",
  },
  {
    id: "hand-kiss",
    category: "Greetings",
    severity: "nice",
    contexts: ["homes"],
    title: "The hand kiss for elders",
    action: "Take an elderly relative's right hand, kiss the back of it and touch it lightly to your forehead.",
    avoid: "Doing it to someone who is not an elder, where it makes no sense.",
    why: "It is the standard greeting to grandparents and older relatives, and it is expected at Bayram, when children are then given money or sweets.",
  },
  {
    id: "cheek-kiss",
    category: "Greetings",
    severity: "nice",
    contexts: ["homes", "streets", "business"],
    title: "Two cheeks between friends, a handshake to start",
    action: "Shake hands on a first meeting; once you know someone, expect a kiss on both cheeks.",
    avoid: "Initiating a cheek kiss with a woman you have just met unless she offers it first.",
    why: "Same-sex greetings in Turkey are notably warmer and more physical than in northern Europe, and cross-sex ones are more conservative.",
  },
  {
    id: "coffee-water",
    category: "Dining",
    severity: "nice",
    contexts: ["teahouses", "restaurants"],
    title: "Drink the water before the Turkish coffee",
    action: "Take the glass of water first to clear your palate, then sip the coffee and leave the grounds in the bottom of the cup.",
    avoid: "Stirring it or drinking to the bottom.",
    why: "The water is served for that purpose. The grounds are what a fortune reading is made from, if someone offers.",
  },
  {
    id: "personal-space",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets", "transport", "bazaars"],
    title: "Expect to be stood closer to",
    action: "Hold your ground rather than stepping back, and take questions about your family and job as friendly interest.",
    avoid: "Reading physical closeness or personal questions as intrusion.",
    why: "Conversational distance is shorter than in northern Europe, and personal questions early on are the normal way of placing you.",
  },
  {
    id: "nose",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["restaurants", "homes", "teahouses"],
    title: "Do not blow your nose at the table",
    action: "Step outside or to the bathroom.",
    avoid: "Doing it loudly in company.",
    why: "It is considered as unpleasant as it would be at a formal dinner elsewhere.",
  },
];

export const PHRASES = [
  { roman: "Merhaba", script: "Merhaba", english: "Hello", when: "Everywhere, all day." },
  { roman: "Teşekkür ederim", script: "Teşekkür ederim", english: "Thank you", when: "Sağ ol is the shorter, more casual version." },
  { roman: "Lütfen", script: "Lütfen", english: "Please", when: "Ordering and asking." },
  { roman: "Affedersiniz", script: "Affedersiniz", english: "Excuse me", when: "Getting attention or squeezing past." },
  { roman: "Ne kadar?", script: "Ne kadar?", english: "How much?", when: "Bazaars and taxis, before you commit." },
  { roman: "Hesap, lütfen", script: "Hesap, lütfen", english: "The bill, please", when: "It rarely arrives unasked." },
  { roman: "Elinize sağlık", script: "Elinize sağlık", english: "Health to your hands", when: "To whoever cooked. The best thing you can say at a table." },
  { roman: "İstemiyorum, teşekkürler", script: "İstemiyorum, teşekkürler", english: "I don't want it, thank you", when: "A polite firm no in the bazaar." },
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

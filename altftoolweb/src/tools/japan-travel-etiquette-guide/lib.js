/**
 * Japan travel etiquette model.
 *
 * A country etiquette guide is only useful if it tells you which rules apply to
 * the places you are actually going and which of those genuinely matter. This
 * module holds the rule set as data and scores it:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you select, except for rules marked
 * `always: true` (they apply anywhere in the country) and rules marked
 * `legal: true`, which are surfaced regardless because the consequence is a
 * fine or worse rather than an awkward moment.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, that you have already ticked as known. It is a weighted percentage,
 * so knowing one critical rule moves it more than knowing three minor ones.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "Japan",
  adjective: "Japanese",
  language: "Japanese",
  currencyNote:
    "Cash is still normal outside the big cities, and many small shrines, shops and family restaurants take nothing else.",
  headline:
    "Japanese etiquette is mostly about not imposing on other people: keep your voice down, keep your mess to yourself, and follow the queue.",
};

/** Severity bands. The weights drive both the sort order and the score. */
export const SEVERITIES = [
  {
    id: "critical",
    label: "Get this wrong and it is a real problem",
    weight: 5,
    note: "Causes offence, breaks a rule you will be stopped for, or carries a fine.",
  },
  {
    id: "important",
    label: "Locals will notice",
    weight: 3,
    note: "Marks you out immediately, though nobody will say anything.",
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
  "Business",
];

/** Places and situations you can tick. Rules are filtered against these. */
export const CONTEXTS = [
  { id: "temples", label: "Temples and shrines", note: "Kyoto, Nara, Nikko, any neighbourhood shrine." },
  { id: "restaurants", label: "Restaurants and izakaya", note: "Anything from a ramen counter to kaiseki." },
  { id: "trains", label: "Trains and city transport", note: "Shinkansen, commuter lines, buses, escalators." },
  { id: "ryokan", label: "Ryokan, onsen and public baths", note: "Traditional inns and hot springs." },
  { id: "shops", label: "Shops, konbini and markets", note: "Convenience stores, department stores, street food." },
  { id: "homes", label: "Visiting someone's home", note: "Including a homestay or a friend's flat." },
  { id: "business", label: "Business meetings", note: "Offices, conferences, client dinners." },
  { id: "streets", label: "Streets and neighbourhoods", note: "Walking around, queueing, taking photographs." },
];

/**
 * Trip purposes tilt the priority order. The multipliers say which categories
 * matter more for that kind of trip; anything not listed stays at 1.
 */
export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.4, Photography: 1.3, Transport: 1.2 } },
  { id: "business", label: "Business trip", emphasis: { Business: 1.8, Greetings: 1.5, Dining: 1.2 } },
  { id: "family", label: "Visiting family or friends", emphasis: { "Dress and shoes": 1.4, Dining: 1.4, Money: 1.2 } },
  { id: "food", label: "Food-led trip", emphasis: { Dining: 1.8, Money: 1.2 } },
  { id: "first", label: "First time in Japan", emphasis: { "Public behaviour": 1.4, Transport: 1.3, "Dress and shoes": 1.2 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

/**
 * The rule set. `do` is the behaviour to copy, `avoid` is the mistake, and
 * `why` is the reason, which is what actually makes a rule stick.
 */
export const RULES = [
  {
    id: "bow",
    category: "Greetings",
    severity: "important",
    contexts: ["business", "homes", "shops", "temples"],
    title: "Bow rather than shake hands",
    action: "Bow from the waist with your back straight — about 15 degrees in passing, 30 for someone senior.",
    avoid: "Do not combine a bow with a handshake, and do not bow while walking.",
    why: "The bow is the default greeting, apology and thank-you. A handshake is offered to foreigners but is a concession, not the norm.",
  },
  {
    id: "meishi",
    category: "Business",
    severity: "critical",
    contexts: ["business"],
    title: "Handle a business card as if it were the person",
    action: "Offer and receive meishi with both hands, read the card, and set it on the table in front of you for the meeting.",
    avoid: "Never write on a card, bend it, or push it straight into a back pocket.",
    why: "The card stands in for the person and their position. Mishandling it reads as dismissing them.",
  },
  {
    id: "shoes",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["homes", "ryokan", "temples", "restaurants"],
    title: "Take your shoes off at the genkan",
    action: "Step out of your shoes in the sunken entrance, step up onto the raised floor, and turn the shoes to face the door.",
    avoid: "Never step onto the raised floor or a tatami mat in outdoor shoes.",
    why: "The step up marks the boundary between outside and inside. Shoes-off applies in homes, ryokan, temple halls, many clinics and plenty of restaurants.",
  },
  {
    id: "toilet-slippers",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["homes", "ryokan", "restaurants"],
    title: "Toilet slippers stay in the toilet",
    action: "Change into the separate slippers at the toilet door and change back out on the way out.",
    avoid: "Walking back into the room in the toilet slippers is the classic visitor mistake.",
    why: "They mark a separate, less clean zone. Everyone will notice immediately, and it is genuinely embarrassing.",
  },
  {
    id: "socks",
    category: "Dress and shoes",
    severity: "nice",
    contexts: ["homes", "ryokan", "temples", "restaurants"],
    title: "Wear socks you would be happy to show",
    action: "Pack socks without holes, and carry a spare pair in summer.",
    avoid: "Bare feet on someone's tatami are not appreciated.",
    why: "You will be in your socks far more often than you expect, sometimes several times a day.",
  },
  {
    id: "chopsticks-rice",
    category: "Dining",
    severity: "critical",
    contexts: ["restaurants", "homes"],
    title: "Never stand chopsticks upright in rice",
    action: "Rest them on the holder, or lay them across the bowl.",
    avoid: "Standing them in the rice, or passing food chopstick to chopstick.",
    why: "Both actions copy Buddhist funeral rites — rice offered to the dead, and bones passed between relatives after a cremation.",
  },
  {
    id: "shared-plates",
    category: "Dining",
    severity: "important",
    contexts: ["restaurants", "homes", "business"],
    title: "Use the serving chopsticks for shared dishes",
    action: "Take from a communal plate with the serving pair, or turn your own chopsticks round and use the clean ends.",
    avoid: "Digging through a shared plate with the ends you have been eating from.",
    why: "Sharing food is normal; sharing saliva is not.",
  },
  {
    id: "slurp",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants"],
    title: "Slurping noodles is fine",
    action: "Slurp ramen, soba and udon, lift the bowl to drink the broth, and eat while it is hot.",
    avoid: "Do not slurp non-noodle dishes, and do not linger over an empty bowl at a counter.",
    why: "Slurping cools the noodles and is a normal part of eating them. Counter seats are meant to turn over quickly.",
  },
  {
    id: "itadakimasu",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes"],
    title: "Say itadakimasu and gochisousama",
    action: "Itadakimasu before you start, gochisousama deshita when you finish or leave.",
    avoid: "Starting to eat before everyone is served.",
    why: "They thank everyone involved in the meal, not just the cook, and they are said even when eating alone.",
  },
  {
    id: "no-tip",
    category: "Money",
    severity: "critical",
    contexts: ["restaurants", "shops", "ryokan"],
    title: "Do not tip",
    action: "Pay the amount on the bill and say thank you.",
    avoid: "Leaving coins on the table, or pressing cash on a taxi driver or guide.",
    why: "Tipping is not part of the system and creates confusion; staff may chase you down the street to return the money. A ryokan gratuity, kokorozuke, is the rare exception and goes in an envelope.",
  },
  {
    id: "cash-tray",
    category: "Money",
    severity: "important",
    contexts: ["shops", "restaurants"],
    title: "Put money in the tray, not the hand",
    action: "Place notes and cards in the small tray on the counter, and take your change from it.",
    avoid: "Pushing cash at the cashier's hand.",
    why: "The tray keeps the exchange clean and lets both sides count without touching. Nearly every till has one.",
  },
  {
    id: "cash",
    category: "Money",
    severity: "important",
    contexts: ["shops", "temples", "restaurants"],
    title: "Carry cash",
    action: "Keep a few thousand yen in notes and a pocket of coins for shrine offerings, lockers and small restaurants.",
    avoid: "Assuming a card will work in a rural restaurant, a temple office or a small ryokan.",
    why: "Card acceptance has improved in cities but is still patchy elsewhere, and coin lockers and offering boxes are cash only.",
  },
  {
    id: "train-quiet",
    category: "Transport",
    severity: "critical",
    contexts: ["trains"],
    title: "No phone calls on the train",
    action: "Set the phone to silent — manner mode — and text instead of calling.",
    avoid: "Taking a call, playing audio out loud, or talking loudly with friends.",
    why: "Carriages are quiet by convention and announcements ask for it directly. It is the fastest way to annoy an entire carriage.",
  },
  {
    id: "queue",
    category: "Transport",
    severity: "important",
    contexts: ["trains", "streets", "shops"],
    title: "Queue on the marks and let people off first",
    action: "Line up at the painted position on the platform and stand aside as passengers step off.",
    avoid: "Pushing towards the door as it opens.",
    why: "Boarding positions are marked to the centimetre and the whole system depends on them being used.",
  },
  {
    id: "escalator",
    category: "Transport",
    severity: "nice",
    contexts: ["trains", "streets"],
    title: "Know which side to stand on",
    action: "Stand on the left in Tokyo and most of the country, on the right in Osaka.",
    avoid: "Blocking both sides with your luggage.",
    why: "The convention flips between regions. Official campaigns now ask people to stand still on both sides, but the local habit still rules.",
  },
  {
    id: "eating-walking",
    category: "Public behaviour",
    severity: "important",
    contexts: ["streets", "trains", "shops"],
    title: "Do not eat while walking",
    action: "Eat street food beside the stall, then bin the wrapper there.",
    avoid: "Wandering down the street with a skewer, or eating on a commuter train.",
    why: "Several tourist districts, including parts of Kyoto and Kamakura, ask visitors directly not to. Eating on the shinkansen or a long-distance train is fine.",
  },
  {
    id: "rubbish",
    category: "Public behaviour",
    severity: "important",
    contexts: ["streets", "trains"],
    title: "Carry your rubbish until you find the right bin",
    action: "Keep a small bag in your daypack and sort into burnable, plastic bottles and cans at a konbini or station.",
    avoid: "Leaving a cup on a wall, or putting everything into the first bin you see.",
    why: "Public bins are scarce and sorting is taken seriously. Streets stay clean because people carry it home.",
  },
  {
    id: "volume",
    category: "Public behaviour",
    severity: "important",
    contexts: ["streets", "restaurants", "trains", "shops"],
    title: "Keep your voice down",
    action: "Match the volume of the room, which is usually lower than you expect.",
    avoid: "Talking across a restaurant, or a loud group conversation on the street at night.",
    why: "Residential areas and small restaurants are quiet, and noise complaints from visitors are a live issue in Kyoto and Osaka.",
  },
  {
    id: "shrine-path",
    category: "Sacred places",
    severity: "important",
    contexts: ["temples"],
    title: "Do not walk down the middle of the shrine path",
    action: "Bow once at the torii, then walk to one side of the approach.",
    avoid: "Strolling straight up the centre line.",
    why: "The centre of the path is considered the way of the kami. Walking to the side is the visible sign that you know where you are.",
  },
  {
    id: "shrine-prayer",
    category: "Sacred places",
    severity: "nice",
    contexts: ["temples"],
    title: "Two bows, two claps, one bow at a shrine",
    action: "Rinse hands and mouth at the temizuya, offer a coin, ring the bell, then bow twice, clap twice and bow once.",
    avoid: "Clapping at a Buddhist temple — there you put your palms together in silence instead.",
    why: "Shinto shrines and Buddhist temples look similar to a visitor but the practice is different. A torii gate means shrine.",
  },
  {
    id: "onsen-wash",
    category: "Sacred places",
    severity: "critical",
    contexts: ["ryokan"],
    title: "Wash thoroughly before getting into the bath",
    action: "Sit on the stool, soap and rinse completely, then enter the water with nothing on.",
    avoid: "Swimwear in the bath, and letting the small towel touch the water — rest it on your head or the side.",
    why: "The bath is for soaking, not washing. Getting in dirty spoils it for everyone in the pool.",
  },
  {
    id: "tattoo",
    category: "Sacred places",
    severity: "critical",
    contexts: ["ryokan"],
    title: "Check the tattoo policy before you book an onsen",
    action: "Look for a tattoo-friendly bath, book a private family bath, or use waterproof cover patches for small designs.",
    avoid: "Turning up and hoping. Being asked to leave the changing room is worse than asking first.",
    why: "Many public baths, pools and gyms still refuse visible tattoos because of the historic association with organised crime, though the rule is loosening in tourist areas.",
  },
  {
    id: "photo-gion",
    category: "Photography",
    severity: "critical",
    legal: true,
    contexts: ["streets", "temples"],
    title: "Do not photograph geiko, maiko or private lanes in Gion",
    action: "Stay on the main public streets and put the camera away when someone in kimono passes.",
    avoid: "Following, stopping or photographing a maiko, and entering the private alleys off Hanamikoji.",
    why: "Kyoto posted signs from October 2019 warning of a ¥10,000 penalty for photography on the private lanes of Gion, and access to some of them has since been closed to tourists altogether.",
  },
  {
    id: "photo-permission",
    category: "Photography",
    severity: "important",
    contexts: ["streets", "shops", "temples", "restaurants"],
    title: "Look for the no-photography sign before you shoot",
    action: "Ask, or check for the crossed-out camera sign, in shops, museums, temple halls and restaurants.",
    avoid: "Photographing strangers, children or shop interiors without permission.",
    why: "Photography inside temple halls, department stores and many restaurants is restricted, and photographing people without consent is treated seriously.",
  },
  {
    id: "nose",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["restaurants", "trains", "business", "homes"],
    title: "Do not blow your nose in company",
    action: "Step away to a toilet or outside if you need to.",
    avoid: "Blowing your nose at the table.",
    why: "It is treated the way loud throat-clearing is elsewhere. Wearing a mask when you have a cold is normal and appreciated.",
  },
  {
    id: "pointing",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets", "shops", "business"],
    title: "Point with an open hand",
    action: "Gesture with the whole hand, palm up.",
    avoid: "Jabbing a single finger at a person or a menu item.",
    why: "A single finger at a person reads as rude. For yourself, Japanese people point at their own nose rather than their chest.",
  },
  {
    id: "gifts",
    category: "Business",
    severity: "important",
    contexts: ["business", "homes"],
    title: "Bring a small wrapped gift",
    action: "Take omiyage from your home region, wrapped, and present it with both hands near the end of the visit.",
    avoid: "Giving anything in a set of four, and expecting it to be opened in front of you.",
    why: "Gift giving is structural rather than sentimental. Four is avoided because shi also means death.",
  },
  {
    id: "punctual",
    category: "Business",
    severity: "critical",
    contexts: ["business"],
    title: "Be early, not on time",
    action: "Arrive five to ten minutes before a meeting and let reception know you are there.",
    avoid: "Turning up at the exact minute, or apologising with a long explanation for being late.",
    why: "Trains run to the minute, so lateness has no accepted excuse. Arriving early is the baseline, not a courtesy.",
  },
];

/** Phrases worth having ready. Romaji plus the script so you can show a screen. */
export const PHRASES = [
  { roman: "Sumimasen", script: "すみません", english: "Excuse me / sorry / thank you", when: "The single most useful word in the language." },
  { roman: "Arigatou gozaimasu", script: "ありがとうございます", english: "Thank you (polite)", when: "Shops, restaurants, anyone who helps you." },
  { roman: "Onegaishimasu", script: "お願いします", english: "Please / I would like this", when: "Ordering, or handing something over." },
  { roman: "Itadakimasu", script: "いただきます", english: "Said before eating", when: "At the start of any meal." },
  { roman: "Gochisousama deshita", script: "ごちそうさまでした", english: "Thank you for the meal", when: "Leaving a restaurant or a table." },
  { roman: "Eigo no menyuu wa arimasu ka", script: "英語のメニューはありますか", english: "Is there an English menu?", when: "Restaurants without pictures." },
  { roman: "Daijoubu desu", script: "大丈夫です", english: "It's fine / no thank you", when: "Declining a bag, a straw or an offer." },
  { roman: "Toire wa doko desu ka", script: "トイレはどこですか", english: "Where is the toilet?", when: "Stations, department stores, konbini." },
];

const isPlainArray = (value) => Array.isArray(value);

/** Severity record for an id, or null. */
export function severityFor(id) {
  return SEVERITIES.find((entry) => entry.id === id) || null;
}

/**
 * Priority weight of one rule for one trip purpose.
 * severity weight x category emphasis, rounded to two decimals so the numbers
 * shown on screen add up.
 */
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
 * @param {string[]} input.knownRuleIds rules you have ticked as already known
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

  // Sort by priority, then severity weight, then id so the order is stable.
  const ranked = [...selected].sort(
    (a, b) => b.priority - a.priority || b.severityWeight - a.severityWeight || a.id.localeCompare(b.id),
  );

  const totalWeight = ranked.reduce((sum, rule) => sum + rule.priority, 0);
  const knownWeight = ranked.reduce((sum, rule) => sum + (rule.known ? rule.priority : 0), 0);
  const readinessPct = totalWeight > 0 ? Math.round((knownWeight / totalWeight) * 100) : 0;

  const shown = ranked.slice(0, maxItems);
  const topMistakes = shown.filter((rule) => !rule.known).slice(0, 5);
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

  const phrases = PHRASES;

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
    phrases,
  };
}

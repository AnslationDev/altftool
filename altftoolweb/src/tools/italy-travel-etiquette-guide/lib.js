/**
 * Italy travel etiquette model.
 *
 * The rule set is data, and it is scored rather than merely listed:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you tick, except those marked
 * `legal: true` or `always: true`. Italy is unusual in how many of its visitor
 * rules are enforced with an actual fine rather than a raised eyebrow — the ZTL
 * cameras in every historic centre, unvalidated regional train tickets, and the
 * local decoro ordinances in Rome, Florence and Venice all issue penalties.
 * Those are shown whatever your itinerary.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, that you have already ticked as known.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "Italy",
  adjective: "Italian",
  language: "Italian",
  currencyNote:
    "Cards are accepted almost everywhere by law, but small bars and market stalls still prefer cash, and you should always take the receipt.",
  headline:
    "Italian etiquette is about bella figura — presenting yourself well — and about knowing that most of the visitor rules that cost money are enforced by a camera or an inspector, not by a disapproving look.",
};

export const SEVERITIES = [
  {
    id: "critical",
    label: "Get this wrong and it is a real problem",
    weight: 5,
    note: "You are refused entry, fined, or cause genuine offence.",
  },
  {
    id: "important",
    label: "Locals will notice",
    weight: 3,
    note: "Marks you out as a visitor immediately, or costs you money.",
  },
  {
    id: "nice",
    label: "Nice to know",
    weight: 1,
    note: "Small things that make you fit in.",
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
  { id: "churches", label: "Churches and basilicas", note: "St Peter's, the Duomo, any parish church." },
  { id: "restaurants", label: "Restaurants and trattorie", note: "Sit-down meals, lunch and dinner." },
  { id: "cafes", label: "Bars and cafés", note: "The Italian bar: coffee standing up, cornetto, aperitivo." },
  { id: "transport", label: "Trains, buses and driving", note: "Regional trains, city buses, and driving into historic centres." },
  { id: "shops", label: "Shops and markets", note: "Alimentari, fruit stalls, boutiques." },
  { id: "streets", label: "Streets and piazzas", note: "Sightseeing, sitting, eating outdoors, photographs." },
  { id: "homes", label: "Visiting an Italian home", note: "Sunday lunch, a dinner invitation." },
  { id: "business", label: "Business meetings", note: "Offices, client lunches." },
  { id: "coastal", label: "Beach and coastal towns", note: "Amalfi, Sardinia, the Riviera." },
];

export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.5, "Law and risk": 1.4, Photography: 1.2 } },
  { id: "food", label: "Food and wine trip", emphasis: { Dining: 1.8, Money: 1.3 } },
  { id: "driving", label: "Driving or road trip", emphasis: { "Law and risk": 1.8, Transport: 1.6 } },
  { id: "business", label: "Business trip", emphasis: { Business: 1.8, Greetings: 1.4, "Dress and shoes": 1.3 } },
  { id: "family", label: "Visiting family or friends", emphasis: { Dining: 1.4, Greetings: 1.3, "Public behaviour": 1.2 } },
  { id: "first", label: "First time in Italy", emphasis: { "Law and risk": 1.5, Dining: 1.3, "Sacred places": 1.2 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

export const RULES = [
  {
    id: "ztl",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["transport", "streets"],
    title: "Do not drive into a ZTL",
    action: "Park outside the historic centre and walk in. If your hotel is inside the zone, give them your plate in advance so they can register it.",
    avoid: "Following a satnav through a white-and-red circular sign marked Zona a Traffico Limitato.",
    why: "Almost every Italian historic centre has a camera-enforced limited traffic zone. Each pass through generates a separate fine, and they arrive by post months later through the hire company, with an administration charge on top.",
  },
  {
    id: "church-dress",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["churches"],
    title: "Cover shoulders and knees in a church",
    action: "Carry a light scarf or a shirt to throw on; men take hats off inside.",
    avoid: "Vests, shorts above the knee and bare shoulders. St Peter's Basilica and the Duomo in Milan and Florence refuse entry on the spot.",
    why: "It is an enforced dress code at the major basilicas, checked by staff at the door, and there is no negotiating once you are in the queue.",
  },
  {
    id: "validate-ticket",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    contexts: ["transport"],
    title: "Validate a regional train or bus ticket before boarding",
    action: "Stamp a paper regional ticket in the green or white machine on the platform, or on the bus as you get on.",
    avoid: "Boarding with an unstamped paper ticket. A digital ticket bought for a specific train, or a booked high-speed ticket, does not need it.",
    why: "An unvalidated ticket counts as travelling without one and the on-board fine is charged immediately. Pleading tourist does not work; the rule is posted in several languages.",
  },
  {
    id: "sitting-bans",
    category: "Public behaviour",
    severity: "critical",
    legal: true,
    contexts: ["streets"],
    title: "Do not sit or picnic on the monuments",
    action: "Use a bench, a café or a park. Ask a local about the rules in that particular city.",
    avoid: "Sitting on the Spanish Steps in Rome, picnicking in St Mark's Square in Venice, swimming or paddling in the canals or fountains.",
    why: "These are local decoro ordinances with real fines. Rome banned sitting on the Spanish Steps in August 2019 with penalties running into the hundreds of euros, and Venice fines picnicking, swimming in canals and bare torsos in the city.",
  },
  {
    id: "beachwear",
    category: "Dress and shoes",
    severity: "important",
    legal: true,
    contexts: ["coastal", "streets", "shops"],
    title: "Swimwear stays at the beach",
    action: "Put a shirt and shorts on before walking into town.",
    avoid: "Bare torsos and bikinis in the streets of coastal towns.",
    why: "Several coastal municipalities, including towns on the Amalfi coast and in Sardinia, fine walking through town in swimwear. Even where they do not, it reads as scruffy in a country that dresses carefully.",
  },
  {
    id: "greeting",
    category: "Greetings",
    severity: "important",
    contexts: ["shops", "cafes", "restaurants", "business", "homes"],
    title: "Say buongiorno on the way in, and use ciao carefully",
    action: "Greet the room when you enter a shop or bar — buongiorno until mid-afternoon, buonasera after — and say arrivederci on the way out.",
    avoid: "Walking into a shop silently, and using ciao with someone you have just met or someone older.",
    why: "Entering without a greeting is genuinely rude in Italy. Ciao is informal and belongs to people you already know.",
  },
  {
    id: "bar-prices",
    category: "Money",
    severity: "important",
    contexts: ["cafes"],
    title: "Standing at the bar costs less than sitting down",
    action: "Drink your espresso at the counter for the cheaper price, or accept the table price if you want to sit and watch the square.",
    avoid: "Ordering at the counter and then carrying it to a table, which is the one thing that annoys the staff.",
    why: "Bars must display both the counter and table prices, and the difference in a tourist piazza can be several times over. Neither price is a scam; they are two different services.",
  },
  {
    id: "coperto",
    category: "Money",
    severity: "important",
    contexts: ["restaurants"],
    title: "Understand the coperto before you add a tip",
    action: "Look for coperto or servizio on the menu — a per-person cover charge, typically a couple of euros — and round up or leave a small note only if you were looked after well.",
    avoid: "Adding 15 or 20 per cent on top out of habit.",
    why: "The coperto covers the table, bread and service, and Italians tip little or nothing on top of it. It must be shown on the menu, so it is not a surprise charge.",
  },
  {
    id: "the-bill",
    category: "Dining",
    severity: "important",
    contexts: ["restaurants"],
    title: "Ask for the bill; it will not arrive on its own",
    action: "Catch the waiter's eye and say il conto, per favore.",
    avoid: "Waiting and getting annoyed, or expecting an itemised split between eight people.",
    why: "Bringing the bill unasked would be rushing you out. Splitting evenly, alla romana, is the normal way to divide it.",
  },
  {
    id: "meal-times",
    category: "Dining",
    severity: "important",
    contexts: ["restaurants"],
    title: "Kitchens keep Italian hours",
    action: "Lunch roughly 12:30 to 14:30, dinner from 19:30 or 20:00, later the further south you go.",
    avoid: "Turning up hungry at 17:30 and expecting a plate of pasta. Most kitchens are shut between services.",
    why: "A restaurant open all afternoon in a tourist centre is usually a restaurant aimed at tourists.",
  },
  {
    id: "receipt",
    category: "Money",
    severity: "important",
    legal: true,
    contexts: ["cafes", "restaurants", "shops"],
    title: "Take the receipt and keep it until you are outside",
    action: "Accept the scontrino at the till and keep it in your pocket for a little while.",
    avoid: "Waving it away.",
    why: "Italian law obliges the vendor to issue a receipt, and the Guardia di Finanza can in principle check that a customer leaving a bar has one. It is also your only proof if the bill was wrong.",
  },
  {
    id: "church-photos",
    category: "Photography",
    severity: "important",
    contexts: ["churches"],
    title: "No flash, and nothing at all during a service",
    action: "Check for the crossed-out camera sign, keep your phone silent, and stop entirely if a Mass begins.",
    avoid: "Flash photography near frescoes and altarpieces, and photographing a congregation.",
    why: "These are working churches, not only monuments, and flash damages pigment. The Sistine Chapel bans photography completely.",
  },
  {
    id: "cappuccino",
    category: "Dining",
    severity: "nice",
    contexts: ["cafes", "restaurants"],
    title: "Cappuccino is a breakfast drink",
    action: "Order an espresso, a macchiato or a caffè corretto after a meal.",
    avoid: "A cappuccino after dinner — you will get it, but it marks you out. Ordering a latte will get you a glass of milk; ask for a caffellatte.",
    why: "Milky coffee is considered part of breakfast rather than a digestif. Nobody will object, but nobody local does it.",
  },
  {
    id: "parmesan",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes"],
    title: "No cheese on seafood pasta",
    action: "Let the kitchen decide what belongs on the plate; if grated cheese is wanted, it will be offered.",
    avoid: "Asking for parmesan over a vongole or a seafood risotto.",
    why: "Cheese is held to overwhelm the fish. It is the most reliable way to get a raised eyebrow in a trattoria.",
  },
  {
    id: "produce",
    category: "Money",
    severity: "nice",
    contexts: ["shops"],
    title: "Do not handle the fruit",
    action: "Tell the stallholder what you want and let them pick it, or use the plastic gloves provided in a supermarket.",
    avoid: "Squeezing peaches at a market stall.",
    why: "The vendor chooses the produce, and in supermarkets handling fruit without gloves is a hygiene rule with signs to match.",
  },
  {
    id: "kiss",
    category: "Greetings",
    severity: "nice",
    contexts: ["homes", "streets"],
    title: "Two cheeks, starting on the left",
    action: "Lean to your left first, brushing cheeks rather than actually kissing, and only with people you know.",
    avoid: "A cheek kiss on a first business introduction, where a handshake is right.",
    why: "It is a greeting between friends and family. Getting the side right avoids the collision every visitor has once.",
  },
  {
    id: "punctuality",
    category: "Business",
    severity: "important",
    contexts: ["business"],
    title: "Business is punctual, dinner is not",
    action: "Be on time for a meeting; arrive ten to fifteen minutes after the stated time for a dinner invitation at a home.",
    avoid: "Turning up at a private dinner exactly on the hour, when the host is still getting ready.",
    why: "Professional and social time run on different clocks, and the mismatch trips up visitors in both directions.",
  },
  {
    id: "dress-well",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["streets", "restaurants", "business"],
    title: "Dress a notch smarter than you would at home",
    action: "Trade the technical hiking gear and gym clothes for shoes and a shirt when you go out in the evening.",
    avoid: "Sportswear at dinner, which reads as not bothering.",
    why: "Bella figura is a real social expectation, and how you are dressed affects how you are treated in shops and restaurants.",
  },
  {
    id: "closures",
    category: "Public behaviour",
    severity: "important",
    contexts: ["shops", "streets", "business"],
    title: "Expect things to be shut",
    action: "Do your shopping in the morning, and check opening hours around 15 August and on Sunday afternoons.",
    avoid: "Planning a full day of errands in the afternoon, especially in the south.",
    why: "Many shops close for a long lunch, and Ferragosto on 15 August empties whole cities, with family businesses shut for a fortnight around it.",
  },
  {
    id: "museum-sunday",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets"],
    title: "State museums have free days",
    action: "Check the domenica al museo scheme if your dates include the first Sunday of a month.",
    avoid: "Assuming free means quiet — the queues are much longer on those days.",
    why: "Italy's state museums and archaeological sites run free-admission Sundays. Worth planning around in either direction.",
  },
  {
    id: "gestures",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets", "restaurants", "business"],
    title: "Hands talk, so watch what yours are saying",
    action: "Keep gestures relaxed and copy what you see around you.",
    avoid: "The chin flick, and mimicking gestures you have seen in films without knowing what they mean.",
    why: "Italian gesture is a real vocabulary rather than decoration, and a borrowed one can land far ruder than intended.",
  },
  {
    id: "water",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants"],
    title: "Water comes in bottles, and you choose which",
    action: "Say naturale for still or frizzante for sparkling when asked.",
    avoid: "Asking for tap water in a restaurant, which is legal but unusual and mildly awkward.",
    why: "Bottled water is the default at the table. Public drinking fountains, the nasoni in Rome, are excellent and free for refilling during the day.",
  },
];

export const PHRASES = [
  { roman: "Buongiorno", script: "Buongiorno", english: "Good morning / hello", when: "Entering any shop, bar or lift, until mid-afternoon." },
  { roman: "Buonasera", script: "Buonasera", english: "Good evening", when: "From late afternoon onwards." },
  { roman: "Per favore / Grazie", script: "Per favore / Grazie", english: "Please / thank you", when: "Constantly. Prego is the reply." },
  { roman: "Scusi", script: "Scusi", english: "Excuse me (polite)", when: "Getting attention or squeezing past." },
  { roman: "Il conto, per favore", script: "Il conto, per favore", english: "The bill, please", when: "It will not come until you ask." },
  { roman: "Quanto costa?", script: "Quanto costa?", english: "How much is it?", when: "Markets and taxis." },
  { roman: "Un caffè, per favore", script: "Un caffè, per favore", english: "An espresso, please", when: "Caffè on its own means espresso." },
  { roman: "Vorrei...", script: "Vorrei...", english: "I would like...", when: "Ordering anything, and far softer than voglio." },
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

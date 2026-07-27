/**
 * Thailand travel etiquette model.
 *
 * The rule set is held as data and scored, so the output is a ranked briefing
 * for the places you are actually going rather than an undifferentiated list:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you tick, except those marked
 * `legal: true` or `always: true`, which are shown regardless. Thailand has
 * more of those than most countries — lèse-majesté, the ban on vaping, the
 * restrictions on Buddha images and the alcohol sale hours are matters of law,
 * not manners, and a visitor should see them whatever their itinerary.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, already ticked as known.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "Thailand",
  adjective: "Thai",
  language: "Thai",
  currencyNote:
    "Cash still runs the markets and the songthaews, though PromptPay QR payment is now accepted almost everywhere, including street stalls.",
  headline:
    "Thai etiquette turns on two ideas: respect flows upward — to monks, elders and the monarchy — and nobody should be made to lose face in public.",
};

export const SEVERITIES = [
  {
    id: "critical",
    label: "Get this wrong and it is a real problem",
    weight: 5,
    note: "Causes serious offence or breaks a law with a real penalty.",
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
];

export const CONTEXTS = [
  { id: "temples", label: "Temples and the Grand Palace", note: "Any wat, plus royal sites in Bangkok." },
  { id: "restaurants", label: "Restaurants and street food", note: "From a plastic-stool noodle stall upward." },
  { id: "beaches", label: "Beaches and islands", note: "Phuket, Krabi, Samui, the Andaman coast." },
  { id: "transport", label: "Transport", note: "Tuk-tuks, songthaews, BTS and MRT, long-distance buses." },
  { id: "markets", label: "Markets and shops", note: "Chatuchak, night markets, 7-Eleven." },
  { id: "homes", label: "Visiting a Thai home", note: "Including a homestay or a family guesthouse." },
  { id: "business", label: "Business meetings", note: "Offices, factories, client dinners." },
  { id: "nightlife", label: "Bars and nightlife", note: "Where the alcohol and noise rules bite." },
];

export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.5, Photography: 1.3, "Law and risk": 1.3 } },
  { id: "beach", label: "Beach and island trip", emphasis: { "Dress and shoes": 1.5, "Law and risk": 1.3, "Public behaviour": 1.2 } },
  { id: "business", label: "Business trip", emphasis: { Greetings: 1.6, "Public behaviour": 1.4, Dining: 1.2 } },
  { id: "food", label: "Food-led trip", emphasis: { Dining: 1.8, Money: 1.2 } },
  { id: "first", label: "First time in Thailand", emphasis: { "Law and risk": 1.5, "Public behaviour": 1.3, "Sacred places": 1.2 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

export const RULES = [
  {
    id: "monarchy",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["temples", "nightlife", "markets", "business"],
    title: "Never criticise or joke about the monarchy",
    action: "Treat the King, Queen, heir and regent as entirely off limits in conversation, online and in what you carry.",
    avoid: "Jokes, social media posts, defacing banknotes or stepping on a dropped note, which carries the King's image.",
    why: "Section 112 of the Thai Criminal Code punishes defaming, insulting or threatening the King, Queen, heir-apparent or regent with three to fifteen years' imprisonment per count, and anyone may file the complaint. Foreigners have been prosecuted.",
  },
  {
    id: "vape",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["nightlife", "markets", "transport"],
    title: "Leave the vape at home",
    action: "Do not bring an e-cigarette or vaping liquid into Thailand at all.",
    avoid: "Assuming it is tolerated because you see them for sale.",
    why: "The import, sale and possession of e-cigarettes and vaping equipment has been banned in Thailand since 2014, with confiscation, heavy fines and the possibility of imprisonment. Tourists are stopped for it.",
  },
  {
    id: "buddha-images",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    contexts: ["temples", "markets"],
    title: "Buddha images are not souvenirs or decoration",
    action: "If you buy an image, check whether an export licence from the Fine Arts Department is needed before you fly.",
    avoid: "Buddha tattoos on the lower body, Buddha heads as ornaments, and posing for photographs with your back to an image.",
    why: "Taking a Buddha image out of the country generally requires a permit, and the campaign against using the Buddha as decoration is official — the signs at the airport are government-issued.",
  },
  {
    id: "head-feet",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["temples", "homes", "transport", "restaurants", "markets"],
    title: "The head is high, the feet are low",
    action: "Keep your feet on the floor and pointing away from people and Buddha images; step over nothing that belongs to someone.",
    avoid: "Touching anyone's head, including a child's, putting your feet up on a seat, or pointing a foot at a person.",
    why: "The head is the most respected part of the body and the feet the least. This single idea explains more Thai etiquette rules than any other.",
  },
  {
    id: "temple-dress",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["temples"],
    title: "Cover shoulders and knees at a temple",
    action: "Wear a top with sleeves and trousers or a skirt below the knee; carry a light scarf as a cover-up.",
    avoid: "Vests, shorts, short skirts, and see-through fabric. The Grand Palace and Wat Phra Kaew turn people away daily.",
    why: "It is an enforced dress code at major sites, not a suggestion, and the sarong hire queue at the gate is long and expensive.",
  },
  {
    id: "temple-shoes",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["temples", "homes"],
    title: "Shoes off before the hall, and mind the threshold",
    action: "Leave shoes outside the ordination hall or viharn, and step over the raised threshold rather than on it.",
    avoid: "Walking into a hall in shoes, or standing on the door sill.",
    why: "The threshold is said to house a guardian spirit, and going barefoot inside is basic respect at every wat and in most Thai homes.",
  },
  {
    id: "buddha-sit",
    category: "Sacred places",
    severity: "critical",
    contexts: ["temples"],
    title: "Sit with your feet tucked behind you",
    action: "Use the side-saddle posture, feet pointing back and away from the Buddha image, and keep your head lower than any monk or image.",
    avoid: "Crossed legs, stretched-out legs, or standing over people who are seated in prayer.",
    why: "Pointing the soles of your feet at an image of the Buddha is one of the most direct insults available in Thailand.",
  },
  {
    id: "monks",
    category: "Sacred places",
    severity: "critical",
    contexts: ["temples", "transport", "markets"],
    title: "Women must not touch a monk",
    action: "Place anything you are giving on a cloth or table for him to pick up, or pass it through a man.",
    avoid: "Handing an object directly to a monk, brushing past one, or sitting beside one on a bus if you are a woman.",
    why: "Monastic rules forbid physical contact with women. Reserved monk seating at the front of buses and trains exists for the same reason.",
  },
  {
    id: "jai-yen",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["markets", "transport", "restaurants", "business", "nightlife"],
    title: "Never lose your temper in public",
    action: "Keep a cool heart — jai yen — smile, lower your voice and negotiate calmly.",
    avoid: "Raising your voice, arguing over a fare, or demanding an apology in front of others.",
    why: "Public anger makes both sides lose face and ends any chance of the problem being solved. A calm request gets far more than a loud one.",
  },
  {
    id: "wai",
    category: "Greetings",
    severity: "important",
    contexts: ["temples", "homes", "business", "restaurants"],
    title: "Return a wai, but do not hand them out",
    action: "Press your palms together at chest height with a slight bow, higher for monks and elders, and always return one you are given.",
    avoid: "Wai-ing children, waiters or shop staff — a smile and a nod is right there.",
    why: "The wai encodes relative status. Offering one to someone junior puts them in an awkward position rather than honouring them.",
  },
  {
    id: "anthem",
    category: "Public behaviour",
    severity: "important",
    contexts: ["transport", "markets", "nightlife"],
    title: "Stand for the national anthem",
    action: "Stop and stand still when the anthem plays at 08:00 and 18:00 in parks, stations and public spaces, and for the royal anthem in a cinema.",
    avoid: "Carrying on walking or talking through it.",
    why: "It is played twice daily over public address systems and everyone around you will stop. Standing takes a minute and not standing is very visible.",
  },
  {
    id: "alcohol-hours",
    category: "Law and risk",
    severity: "important",
    legal: true,
    contexts: ["nightlife", "markets", "beaches"],
    title: "Alcohol is not sold all day",
    action: "Buy from shops within the permitted afternoon and evening windows, and expect sales to stop entirely on major Buddhist holidays and election days.",
    avoid: "Assuming a 7-Eleven will sell you a beer at breakfast, or on Visakha Bucha day.",
    why: "Retail alcohol sale hours are restricted by law and suspended on the main Buddhist holy days. The exact windows have been under review, so check locally rather than relying on an old blog post.",
  },
  {
    id: "beach-smoking",
    category: "Law and risk",
    severity: "important",
    legal: true,
    contexts: ["beaches"],
    title: "Smoking is banned on many beaches",
    action: "Use the marked smoking zones set back from the sand, and take butts away with you.",
    avoid: "Smoking on the beach itself at the popular resorts.",
    why: "Smoking bans have applied to a list of Thailand's busiest beaches since November 2017, with fines that run into the tens of thousands of baht.",
  },
  {
    id: "dress-off-beach",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["beaches", "markets", "restaurants"],
    title: "Swimwear stays at the beach",
    action: "Put a shirt and shorts on to walk into town, a shop or a restaurant.",
    avoid: "Bare torsos in 7-Eleven, and bikinis on the street. Topless sunbathing is not acceptable on Thai beaches.",
    why: "Thailand is far more modest than the resort strips suggest, and covering up off the sand is the single easiest way to be treated better.",
  },
  {
    id: "shoes-home",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["homes", "markets", "restaurants"],
    title: "Look for shoes at the door",
    action: "Take yours off if there is a pile outside — that applies to homes, guesthouses, some shops and many massage places.",
    avoid: "Walking in and looking down only when someone points.",
    why: "The pile at the door is the sign. It is not restricted to homes.",
  },
  {
    id: "give-right",
    category: "Greetings",
    severity: "important",
    contexts: ["markets", "restaurants", "business", "homes"],
    title: "Give and receive with the right hand",
    action: "Use the right hand, with the left lightly supporting the right forearm for anything important.",
    avoid: "Handing money or a gift with the left hand alone.",
    why: "The left hand is traditionally the unclean one. The two-handed version reads as genuinely respectful.",
  },
  {
    id: "photo-consent",
    category: "Photography",
    severity: "important",
    contexts: ["temples", "markets", "beaches"],
    title: "Ask before photographing people, and always before monks",
    action: "Gesture at the camera and wait for a nod; keep a respectful distance from monks and from anyone praying.",
    avoid: "Photographing inside an ordination hall where it is forbidden, or flying a drone without CAAT registration.",
    why: "Some halls ban photography outright, and drones must be registered with the Civil Aviation Authority of Thailand and NBTC before they are flown.",
  },
  {
    id: "spoon-fork",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes"],
    title: "Spoon in the right hand, fork in the left",
    action: "Push food onto the spoon with the fork and eat from the spoon. Chopsticks are for noodle dishes only.",
    avoid: "Putting the fork in your mouth, or asking for chopsticks with a rice dish.",
    why: "Thai food is eaten with a spoon. Chopsticks arrived with Chinese noodle dishes and stayed only with them.",
  },
  {
    id: "sharing",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants", "homes", "business"],
    title: "Dishes are shared, rice is personal",
    action: "Take a small amount from a shared dish onto your own rice at a time, and let the eldest or the host start.",
    avoid: "Loading your plate in one go, or ordering only for yourself at a group table.",
    why: "A Thai meal is a set of dishes around communal rice rather than a plate per person.",
  },
  {
    id: "tipping",
    category: "Money",
    severity: "nice",
    contexts: ["restaurants", "transport", "markets", "nightlife"],
    title: "Tipping is a courtesy, not an obligation",
    action: "Round up a taxi fare, leave the coins from the change at a casual restaurant, and around 10% where you have had table service.",
    avoid: "Tipping on top of a bill that already shows a 10% service charge plus 7% VAT.",
    why: "Nothing is expected, and staff are not paid on the assumption of tips. Check the bill before adding anything.",
  },
  {
    id: "bargain",
    category: "Money",
    severity: "nice",
    contexts: ["markets"],
    title: "Bargain in markets, not in shops",
    action: "Ask the price, smile, counter at around two-thirds, and settle in the middle.",
    avoid: "Haggling where prices are marked, or grinding hard over an amount that matters more to the seller than to you.",
    why: "Bargaining is normal in markets and with tuk-tuks and expected to be good-humoured. A fixed-price shop is a fixed-price shop.",
  },
  {
    id: "pda",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["beaches", "markets", "transport", "nightlife"],
    title: "Keep affection private",
    action: "Hold hands if you like; leave the rest for later.",
    avoid: "Kissing and embracing in public, especially near a temple.",
    why: "Public displays of affection are still uncommon outside the tourist strips and read as showing off.",
  },
  {
    id: "songkran",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["markets", "transport", "beaches"],
    title: "Songkran means you will get wet",
    action: "Between 13 and 15 April, waterproof your phone and passport and accept it with good humour.",
    avoid: "Throwing water at monks, elderly people or motorcyclists, or using ice water.",
    why: "The Thai New Year water festival is nationwide and unavoidable. The water is a blessing, which is why aiming it at a rider is both rude and dangerous.",
  },
  {
    id: "transport-feet",
    category: "Transport",
    severity: "nice",
    contexts: ["transport"],
    title: "Give up the monk seats and the priority seats",
    action: "Leave the front seats on buses and the marked seats on the BTS and MRT free.",
    avoid: "Eating or drinking on the BTS and MRT, which is prohibited and fined.",
    why: "Bangkok's rail systems enforce the no-food rule with fines, and the reserved seating is used, not decorative.",
  },
];

export const PHRASES = [
  { roman: "Sawatdee khrap / kha", script: "สวัสดี", english: "Hello", when: "Men end with khrap, women with kha — every phrase below takes the same ending." },
  { roman: "Khop khun khrap / kha", script: "ขอบคุณ", english: "Thank you", when: "Anywhere and often." },
  { roman: "Mai pen rai", script: "ไม่เป็นไร", english: "It's nothing / never mind", when: "The national shrug. Defuses almost anything." },
  { roman: "Khor thot", script: "ขอโทษ", english: "Sorry / excuse me", when: "Squeezing past, or getting something wrong." },
  { roman: "Tao rai", script: "เท่าไหร่", english: "How much?", when: "Markets and tuk-tuks, before you get in." },
  { roman: "Mai ao khrap / kha", script: "ไม่เอา", english: "I don't want it", when: "A polite firm no to a tout." },
  { roman: "Mai phet", script: "ไม่เผ็ด", english: "Not spicy", when: "Say it anyway; it will still be spicy." },
  { roman: "Aroy mak", script: "อร่อยมาก", english: "Very tasty", when: "Worth more than a tip at a street stall." },
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

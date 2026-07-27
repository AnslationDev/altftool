/**
 * Vietnam travel etiquette model.
 *
 * The rule set is data and it is scored rather than listed:
 *
 *   priority = severity weight x category emphasis for the trip purpose
 *
 * Rules are filtered to the contexts you tick, except those marked
 * `legal: true` or `always: true`, which are shown regardless — the helmet law,
 * the licence requirement for riding, drone permits and the limits on public
 * political comment are enforced, not merely frowned upon.
 *
 * The readiness score is the share of the selected rule set, by priority
 * weight, that you have already ticked as known.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const COUNTRY = {
  name: "Vietnam",
  adjective: "Vietnamese",
  language: "Vietnamese",
  currencyNote:
    "The dong runs to large numbers, so check the zeros. Cash and QR payment dominate; treat notes with care because they carry Ho Chi Minh's portrait.",
  headline:
    "Vietnamese etiquette turns on age and family relationship — the language has no neutral word for you, so every sentence places you against the person you are speaking to — and on never making anyone lose face in public.",
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
  { id: "pagodas", label: "Pagodas and temples", note: "Any chùa, plus family altars and communal houses." },
  { id: "restaurants", label: "Restaurants and street food", note: "Plastic stools, pho counters, family tables." },
  { id: "markets", label: "Markets and shops", note: "Ben Thanh, Dong Xuan, night markets." },
  { id: "traffic", label: "Traffic, motorbikes and taxis", note: "Riding, being ridden, and crossing the road." },
  { id: "homes", label: "Visiting a Vietnamese home", note: "Including a homestay." },
  { id: "highlands", label: "Northern highlands and minority villages", note: "Sapa, Ha Giang, Mai Chau." },
  { id: "business", label: "Business meetings", note: "Offices, factories, negotiations." },
  { id: "streets", label: "Streets and public spaces", note: "Sightseeing, photographs, conversation." },
];

export const TRIP_PURPOSES = [
  { id: "leisure", label: "Sightseeing holiday", emphasis: { "Sacred places": 1.4, Photography: 1.4, "Law and risk": 1.3 } },
  { id: "motorbike", label: "Motorbike or road trip", emphasis: { Transport: 1.8, "Law and risk": 1.7 } },
  { id: "food", label: "Food-led trip", emphasis: { Dining: 1.8, Money: 1.3 } },
  { id: "business", label: "Business trip", emphasis: { Business: 1.8, Greetings: 1.6, "Public behaviour": 1.3 } },
  { id: "family", label: "Visiting family or friends", emphasis: { Greetings: 1.5, Dining: 1.4, "Dress and shoes": 1.3 } },
  { id: "first", label: "First time in Vietnam", emphasis: { "Law and risk": 1.4, Transport: 1.4, "Public behaviour": 1.3 } },
];

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 60;
export const DEFAULT_ITEMS = 18;

export const RULES = [
  {
    id: "helmet",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["traffic"],
    title: "Helmets are compulsory, for the rider and the passenger",
    action: "Wear a fastened helmet on any motorbike, including a short xe om ride, and check the rental provides one.",
    avoid: "Riding without a licence Vietnam recognises. Most travel insurance is void if you were riding illegally, whatever the helmet situation.",
    why: "Helmets have been compulsory on all roads for riders and passengers since 15 December 2007. Riding a motorbike above 50cc requires a Vietnamese licence or a recognised international permit, and police checks are routine.",
  },
  {
    id: "politics",
    category: "Law and risk",
    severity: "critical",
    legal: true,
    always: true,
    contexts: ["streets", "business", "markets"],
    title: "Keep political comment private",
    action: "Ask questions and listen; leave criticism of the government or the Party out of conversation and off social media while you are there.",
    avoid: "Public criticism online, carrying political material, or photographing military installations, border posts and airports.",
    why: "Public criticism of the state can attract charges under laws on propaganda and cybersecurity, including for foreigners. Vietnamese people will discuss a great deal privately; the risk is in the public record, not the conversation.",
  },
  {
    id: "head-feet",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["pagodas", "homes", "restaurants", "markets"],
    title: "The head is high, the feet are low",
    action: "Keep your feet flat on the floor and pointing away from people and altars.",
    avoid: "Touching an adult's head, patting a child's head, or pointing your feet at an altar, a shrine or a person.",
    why: "The head is the most respected part of the body and the feet the least — the same idea that runs through Thai and Lao etiquette.",
  },
  {
    id: "face",
    category: "Public behaviour",
    severity: "critical",
    contexts: ["markets", "restaurants", "traffic", "business", "streets"],
    title: "Never raise your voice in public",
    action: "Smile, stay calm and repeat the request quietly; if it is going nowhere, walk away.",
    avoid: "Shouting at a driver, arguing about a price in front of a crowd, or demanding an apology.",
    why: "Losing your temper makes both sides lose face and ends any chance of getting what you wanted. It is the single most counterproductive thing a visitor can do.",
  },
  {
    id: "pagoda-dress",
    category: "Dress and shoes",
    severity: "critical",
    contexts: ["pagodas"],
    title: "Cover shoulders and knees at a pagoda",
    action: "Carry a light scarf or a long-sleeved shirt; hats and sunglasses come off inside.",
    avoid: "Vests, shorts and short skirts in the main hall.",
    why: "It is expected at every working pagoda and enforced at major sites. A cover-up in your day bag solves it for the whole trip.",
  },
  {
    id: "pagoda-entry",
    category: "Sacred places",
    severity: "critical",
    contexts: ["pagodas", "homes"],
    title: "Shoes off, and step over the threshold",
    action: "Leave shoes at the door of the main hall, step over the raised sill rather than on it, and use the side entrance where one is marked.",
    avoid: "Standing on the threshold, turning your back on the Buddha for a photograph, or pointing at an image.",
    why: "The raised sill is traditionally held to keep out wandering spirits, and the central door is often reserved. The same shoes-off rule applies in homes and many homestays.",
  },
  {
    id: "chopsticks",
    category: "Dining",
    severity: "critical",
    contexts: ["restaurants", "homes"],
    title: "Never stand chopsticks upright in rice",
    action: "Rest them across the bowl or on the holder between mouthfuls.",
    avoid: "Standing them up in the rice, and tapping the bowl with them.",
    why: "Upright chopsticks copy the incense sticks burned at a family altar for the dead. Tapping a bowl is associated with calling hungry spirits and with begging.",
  },
  {
    id: "two-hands",
    category: "Greetings",
    severity: "important",
    contexts: ["business", "homes", "markets", "restaurants"],
    title: "Give and receive with two hands",
    action: "Use both hands for money, a business card, a gift or a cup of tea, especially with anyone older.",
    avoid: "One-handed passing to an elder, and taking change without acknowledging it.",
    why: "It is the clearest signal of respect available to a visitor who does not speak the language.",
  },
  {
    id: "pronouns",
    category: "Greetings",
    severity: "important",
    contexts: ["restaurants", "markets", "homes", "business"],
    title: "Learn a couple of the family pronouns",
    action: "Use anh for a slightly older man, chị for a slightly older woman, em for someone younger, and bác or cô for someone much older.",
    avoid: "Trying to use one neutral word for you, because Vietnamese does not really have one.",
    why: "Vietnamese address encodes relative age through kinship terms, which is why people ask your age early. Getting even one term right transforms the exchange.",
  },
  {
    id: "elders-first",
    category: "Dining",
    severity: "important",
    contexts: ["restaurants", "homes", "business"],
    title: "The eldest is served first and starts first",
    action: "Wait for the senior person to lift their chopsticks, invite them to eat with moi, and serve them before yourself.",
    avoid: "Starting because your bowl arrived first.",
    why: "The invitation before eating is a small ritual in a Vietnamese family and it is noticed when a guest joins in.",
  },
  {
    id: "crossing",
    category: "Transport",
    severity: "important",
    contexts: ["traffic", "streets"],
    title: "Cross the road slowly and never stop",
    action: "Step off the kerb at a steady walking pace and keep going in a straight line so the motorbikes can flow around you.",
    avoid: "Waiting for a gap that will not come, and above all running or stepping back halfway.",
    why: "Riders read your speed and direction and steer around you. Sudden changes are what cause collisions.",
  },
  {
    id: "bargain",
    category: "Money",
    severity: "important",
    contexts: ["markets"],
    title: "Bargain in the markets, and agree the fare first",
    action: "Ask the price, counter at around half to two-thirds, and settle with good humour. Agree a xe om fare before you get on, or use an app.",
    avoid: "Haggling in shops with marked prices, and grinding a stallholder down over the equivalent of small change.",
    why: "Bargaining is normal in markets and with informal transport. Metered taxis and app rides are fixed and do not need it.",
  },
  {
    id: "photo-consent",
    category: "Photography",
    severity: "important",
    contexts: ["highlands", "markets", "pagodas", "streets"],
    title: "Ask before photographing people",
    action: "Gesture at the camera and wait; buy something from a stall you have photographed.",
    avoid: "Photographing ethnic minority people in Sapa or Ha Giang as scenery, and photographing worshippers at an altar.",
    why: "Highland communities are photographed constantly by visitors, and consent is the difference between a portrait and an intrusion.",
  },
  {
    id: "drone",
    category: "Law and risk",
    severity: "important",
    legal: true,
    contexts: ["highlands", "streets"],
    title: "Drones need permission",
    action: "Apply for a permit through the proper channel well before you travel, and assume the answer near any sensitive site is no.",
    avoid: "Flying near airports, military areas, border regions or Ha Long Bay without clearance.",
    why: "Unmanned aircraft require authorisation in Vietnam, and equipment has been confiscated at the border and on site.",
  },
  {
    id: "shoes-home",
    category: "Dress and shoes",
    severity: "important",
    contexts: ["homes", "markets"],
    title: "Look for the shoes at the door",
    action: "Take yours off if there is a pile outside — homes, homestays, some shops and many small restaurants.",
    avoid: "Waiting for someone to ask you.",
    why: "The pile at the door is the instruction. Slippers are usually provided.",
  },
  {
    id: "war",
    category: "Public behaviour",
    severity: "important",
    contexts: ["streets", "business", "homes"],
    title: "Follow the local lead on the war",
    action: "Let a Vietnamese person raise it first, and use their name for it — the American War, or the resistance war.",
    avoid: "Volunteering opinions, or expecting the museums to present a balanced account.",
    why: "Vietnam's population is overwhelmingly post-war and the subject rarely comes up unprompted. The framing in museums is official, and arguing with a guide about it goes nowhere.",
  },
  {
    id: "money-care",
    category: "Money",
    severity: "nice",
    contexts: ["markets", "restaurants", "traffic"],
    title: "Handle the notes with care, and count the zeros",
    action: "Pass notes flat with two hands and keep them tidy; check whether that is a 20,000 or a 200,000 note before you hand it over.",
    avoid: "Crumpling notes into a pocket, or writing on them.",
    why: "Banknotes carry Ho Chi Minh's portrait and are treated with a degree of respect. The similarly coloured polymer notes are the classic tourist mistake.",
  },
  {
    id: "tipping",
    category: "Money",
    severity: "nice",
    contexts: ["restaurants", "traffic", "markets"],
    title: "Tipping is optional but increasingly usual",
    action: "Round up a fare, leave the small change at a casual restaurant, and 5-10% where you had proper service. Tip a guide or driver directly at the end.",
    avoid: "Adding a tip on top of a bill that already shows a 5% service charge plus VAT.",
    why: "Tipping is not a Vietnamese tradition but it has become normal in tourism. It is never demanded and never required.",
  },
  {
    id: "street-food",
    category: "Dining",
    severity: "nice",
    contexts: ["restaurants"],
    title: "Take the small stool and the busy stall",
    action: "Sit down at a stall that is full of local customers, and use the herbs, lime and chilli on the table as you go.",
    avoid: "Worrying about the low plastic furniture, or leaving rubbish anywhere but the floor bin the stall points at.",
    why: "Turnover is the best guide to freshness anywhere in Vietnam, and the greens are part of the dish rather than a garnish.",
  },
  {
    id: "pda",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets", "highlands", "pagodas"],
    title: "Keep affection low-key",
    action: "Hand-holding is fine in the cities; leave the rest for later.",
    avoid: "Kissing and embracing in rural areas and near religious sites.",
    why: "Cities are relaxed about it, villages considerably less so.",
  },
  {
    id: "begging",
    category: "Public behaviour",
    severity: "nice",
    contexts: ["streets", "highlands", "markets"],
    title: "Do not give money to children",
    action: "Support a local school, a shop or a community project instead, and buy from the adult rather than the child.",
    avoid: "Handing out cash, sweets or pens to children who approach you.",
    why: "Direct giving keeps children out of school and selling on the street, which is why responsible tour operators in Sapa and Ha Giang ask visitors not to.",
  },
  {
    id: "ao-dai",
    category: "Dress and shoes",
    severity: "nice",
    contexts: ["streets", "homes"],
    title: "Wearing ao dai is welcomed, if you wear it properly",
    action: "Have one made — a couple of days in Hoi An or Hanoi — and wear it for a wedding, a festival or a formal dinner.",
    avoid: "Treating it as a costume for a photo shoot at a temple.",
    why: "Vietnamese people are pleased to see visitors in ao dai when it is worn with the right trousers and in the right setting.",
  },
];

export const PHRASES = [
  { roman: "Xin chào", script: "Xin chào", english: "Hello", when: "Universal and safe with anyone." },
  { roman: "Cảm ơn", script: "Cảm ơn", english: "Thank you", when: "Add the person's pronoun — cảm ơn anh, cảm ơn chị." },
  { roman: "Xin lỗi", script: "Xin lỗi", english: "Sorry / excuse me", when: "Squeezing past, or getting something wrong." },
  { roman: "Bao nhiêu tiền?", script: "Bao nhiêu tiền?", english: "How much is it?", when: "Markets and xe om, before you commit." },
  { roman: "Không, cảm ơn", script: "Không, cảm ơn", english: "No, thank you", when: "A polite firm no to a seller." },
  { roman: "Tính tiền", script: "Tính tiền", english: "The bill, please", when: "Restaurants and street stalls." },
  { roman: "Ngon quá", script: "Ngon quá", english: "Very delicious", when: "Worth more to a cook than a tip." },
  { roman: "Dạ", script: "Dạ", english: "Yes / a polite acknowledgement", when: "Softens anything you say to someone older." },
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

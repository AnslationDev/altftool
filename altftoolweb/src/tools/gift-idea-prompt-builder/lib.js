/**
 * Gift Idea Prompt Builder — pure logic.
 *
 *  1. Real budget arithmetic: hold back a reserve for tax and shipping, divide
 *     what is left across recipients, then split each share between a main gift
 *     and small extras.
 *  2. Lead-time arithmetic from two dates passed in as arguments (never a clock
 *     read inside the maths) so the prompt can say how fast shipping must be.
 *  3. Deterministic assembly of the prompt, including a real child-safety rule.
 *
 * No React, no DOM, no Date.now().
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/** Milliseconds in a day, used for the whole-day lead-time difference. */
const MS_PER_DAY = 86400000;

/** Reserve bounds. Sales tax plus shipping rarely exceeds half the basket. */
export const MAX_RESERVE_PCT = 50;
/** The main gift should never be less than 40% of a recipient's share. */
export const MIN_MAIN_SHARE_PCT = 40;
export const MAX_RECIPIENTS = 50;

/**
 * US CPSC small-parts rule (16 CFR Part 1501): a toy intended for children
 * under three years old must not contain a small part that fits entirely inside
 * the standard small-parts cylinder (about 3.2 cm long, 3.1 cm diameter).
 * Surfaced in the prompt whenever a recipient is under 3.
 */
export const SMALL_PARTS_AGE_LIMIT = 3;
export const SMALL_PARTS_RULE =
  "US CPSC 16 CFR Part 1501: toys for children under three must not contain small parts that fit inside the small-parts cylinder (roughly 3.2 cm long by 3.1 cm across).";

/** Shipping tiers by remaining lead time, in whole days. */
export const LEAD_TIME_TIERS = [
  { minDays: 21, label: "Comfortable", note: "Standard shipping is fine, and made-to-order or personalised gifts are still on the table." },
  { minDays: 10, label: "Normal", note: "Standard shipping still works for stocked items; skip anything made to order." },
  { minDays: 4, label: "Tight", note: "Stick to items with guaranteed express delivery, or buy in person." },
  { minDays: 1, label: "Urgent", note: "Next-day delivery, click-and-collect, or something local and physical." },
  { minDays: 0, label: "Same day", note: "Digital gifts, e-gift cards, experiences and anything you can collect today." },
];

/** Gift categories the model can be pointed at. */
export const GIFT_CATEGORIES = [
  "Experiences",
  "Something handmade",
  "Practical and used daily",
  "Hobby equipment",
  "Books and media",
  "Food and drink",
  "Subscription",
  "Personalised keepsake",
];

export const OCCASIONS = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "New baby",
  "Housewarming",
  "Graduation",
  "Retirement",
  "Thank you",
  "Holiday or festival",
  "Just because",
];

function clean(text) {
  return String(text ?? "").trim();
}

function formatMoney(value, currency) {
  if (!Number.isFinite(value)) return "n/a";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
  }
}

/**
 * Whole days from `fromISO` to `toISO`, both "YYYY-MM-DD". Pure: both dates are
 * arguments. Returns null when either date cannot be parsed.
 */
export function daysBetween(fromISO, toISO) {
  const parse = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const stamp = Date.UTC(year, month - 1, day);
    const check = new Date(stamp);
    // Rejects impossible dates such as 2026-02-30, which Date.UTC would roll over.
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
    return stamp;
  };
  const a = parse(fromISO);
  const b = parse(toISO);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

export function leadTimeTier(days) {
  if (!Number.isFinite(days)) return LEAD_TIME_TIERS[LEAD_TIME_TIERS.length - 1];
  return LEAD_TIME_TIERS.find((tier) => days >= tier.minDays) ?? LEAD_TIME_TIERS[LEAD_TIME_TIERS.length - 1];
}

/**
 * Split a total budget into a reserve, a per-recipient share, and a main/extras
 * split of that share.
 */
export function splitBudget({ total, recipients, reservePct, mainSharePct }) {
  const reserve = (total * reservePct) / 100;
  const spendable = total - reserve;
  const perGift = spendable / recipients;
  const mainGift = (perGift * mainSharePct) / 100;
  return { reserve, spendable, perGift, mainGift, extras: perGift - mainGift };
}

/**
 * @returns {{error: string} | object}
 */
export function buildGiftPrompt({
  relationship = "",
  recipientAge = null,
  interests = "",
  dislikes = "",
  occasion = "Birthday",
  currency = "USD",
  totalBudget = 0,
  recipients = 1,
  reservePct = 12,
  mainSharePct = 75,
  todayISO = "",
  occasionISO = "",
  categories = [],
  ideaCount = 8,
} = {}) {
  const relationshipText = clean(relationship);
  const interestText = clean(interests);
  const dislikeText = clean(dislikes);
  const occasionText = clean(occasion) || "Birthday";
  const currencyCode = clean(currency).toUpperCase() || "USD";

  const total = Number(totalBudget);
  const people = Math.round(Number(recipients));
  const reserve = Number(reservePct);
  const mainShare = Number(mainSharePct);
  const ideas = Math.round(Number(ideaCount));
  const age = recipientAge === "" || recipientAge === null ? null : Number(recipientAge);

  if (!relationshipText) return { error: "Say who the gift is for — 'my sister', 'a new colleague', and so on." };
  if (![total, people, reserve, mainShare, ideas].every(Number.isFinite)) {
    return { error: "Budget, recipient count, reserve and idea count must all be numbers." };
  }
  if (!(total > 0)) return { error: "Enter a total budget greater than zero." };
  if (people < 1 || people > MAX_RECIPIENTS) {
    return { error: `Recipient count should be between 1 and ${MAX_RECIPIENTS}.` };
  }
  if (reserve < 0 || reserve > MAX_RESERVE_PCT) {
    return { error: `Tax and shipping reserve should be between 0% and ${MAX_RESERVE_PCT}%.` };
  }
  if (mainShare < MIN_MAIN_SHARE_PCT || mainShare > 100) {
    return { error: `The main gift should take between ${MIN_MAIN_SHARE_PCT}% and 100% of each share.` };
  }
  if (ideas < 3 || ideas > 25) return { error: "Ask for between 3 and 25 ideas." };
  if (age !== null && (!Number.isFinite(age) || age < 0 || age > 120)) {
    return { error: "Recipient age should be between 0 and 120, or left blank." };
  }

  let days = null;
  if (clean(todayISO) && clean(occasionISO)) {
    days = daysBetween(todayISO, occasionISO);
    if (days === null) return { error: "Dates must be real calendar dates in YYYY-MM-DD form." };
    if (days < 0) return { error: "The occasion date has already passed — pick a future date." };
  }

  const money = splitBudget({ total, recipients: people, reservePct: reserve, mainSharePct: mainShare });
  const tier = days === null ? null : leadTimeTier(days);

  const chosenCategories = (Array.isArray(categories) ? categories : []).map(clean).filter(Boolean);
  const isSmallChild = age !== null && age < SMALL_PARTS_AGE_LIMIT;

  const lines = [];
  lines.push(
    `Act as a thoughtful gift adviser. Suggest ${ideas} gift ideas for ${relationshipText}${age !== null ? `, age ${age}` : ""}, for a ${occasionText.toLowerCase()}.`,
  );
  lines.push("");
  lines.push("BUDGET");
  lines.push(`- Total I can spend: ${formatMoney(total, currencyCode)} across ${people} ${people === 1 ? "person" : "people"}`);
  lines.push(`- Held back for tax and shipping (${reserve}%): ${formatMoney(money.reserve, currencyCode)}`);
  lines.push(`- Per person to spend on the gift itself: ${formatMoney(money.perGift, currencyCode)}`);
  lines.push(
    `- Suggested split per person: about ${formatMoney(money.mainGift, currencyCode)} on the main gift and ${formatMoney(money.extras, currencyCode)} on a small extra or card.`,
  );
  lines.push("- Do not suggest anything whose typical price exceeds the per-person figure above.");
  lines.push("");
  lines.push("THE RECIPIENT");
  lines.push(`- Relationship to me: ${relationshipText}`);
  if (age !== null) lines.push(`- Age: ${age}`);
  lines.push(`- Interests: ${interestText || "not specified — ask me two questions before guessing"}`);
  if (dislikeText) lines.push(`- Avoid: ${dislikeText}`);
  if (chosenCategories.length) lines.push(`- Categories I would prefer: ${chosenCategories.join(", ")}`);
  if (isSmallChild) {
    lines.push(`- SAFETY: the recipient is under ${SMALL_PARTS_AGE_LIMIT}. ${SMALL_PARTS_RULE} Flag any suggestion that could contain small parts, button cells, magnets or long cords.`);
  }
  lines.push("");
  lines.push("TIMING");
  if (days === null) {
    lines.push("- No date given. Assume standard shipping and flag anything made to order.");
  } else {
    lines.push(`- ${days} ${days === 1 ? "day" : "days"} until the occasion — lead time is ${tier.label.toLowerCase()}. ${tier.note}`);
  }
  lines.push("");
  lines.push("FORMAT");
  lines.push(`- Give exactly ${ideas} ideas as a numbered list.`);
  lines.push("- For each: the idea in under 12 words, a realistic price, one sentence on why it fits this person specifically, and where it is usually bought.");
  lines.push("- Rank them by how well they match the stated interests, not by price.");
  lines.push("- Include at least two ideas that are not physical objects.");
  lines.push("- Mark any idea that needs personalisation or made-to-order lead time.");
  lines.push("- End with one idea I probably have not thought of, and say why it is a risk.");
  lines.push("");
  lines.push("Do not pad the list with generic items like 'a nice candle' unless the interests actually support it. If you have too little to go on, ask me up to three questions first.");

  const prompt = lines.join("\n");

  return {
    prompt,
    reserveAmount: money.reserve,
    spendable: money.spendable,
    perGift: money.perGift,
    mainGift: money.mainGift,
    extras: money.extras,
    daysUntil: days,
    leadTime: tier,
    smallPartsWarning: isSmallChild,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}

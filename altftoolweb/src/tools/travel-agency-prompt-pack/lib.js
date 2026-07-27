/**
 * Travel Agency Prompt Pack — a prompt library, a pure template engine and a tour
 * package quote calculator covering markup, GST on tour operator services and TCS
 * on overseas tour programme packages.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 * Placeholders inside a template are written as {{snake_case}}.
 */

/** Placeholder syntax, kept as a source string so callers build their own RegExp. */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/** ~4 characters per token of English prose — the vendor rule of thumb for sizing a prompt. */
export const CHARS_PER_TOKEN = 4;

/** Past this estimate a prompt starts to crowd an 8K-token context window. */
export const LONG_PROMPT_TOKENS = 700;

/**
 * GST on a tour operator's service in India: 5% on the gross tour amount charged,
 * with input tax credit blocked except on input services from another tour
 * operator in the same line of business (Notification 11/2017-Central Tax (Rate),
 * heading 9985, as amended). Because the credit is blocked, the tax sits on the
 * full package value rather than on the margin.
 */
export const GST_TOUR_OPERATOR_RATE = 0.05;

/**
 * Tax collected at source on an overseas tour programme package under section
 * 206C(1G) of the Income-tax Act, 1961. From 1 April 2025 the threshold is
 * Rs 10,00,000 of such packages per buyer per financial year: 5% up to the
 * threshold and 20% on the amount above it. TCS is not an extra cost to the
 * traveller — it is credited against their income tax liability and can be
 * claimed in their return.
 */
export const TCS_OVERSEAS_TOUR_THRESHOLD_INR = 1000000;
export const TCS_RATE_UPTO_THRESHOLD = 0.05;
export const TCS_RATE_ABOVE_THRESHOLD = 0.20;

/**
 * Assumption made by this calculator: TCS is computed on the package value before
 * GST. Practice varies — some operators collect it on the invoice total including
 * GST — so confirm the basis your accountant uses before quoting it to a client.
 */
export const TCS_BASE_IS_PRE_GST = true;

/** Sanity bounds so an obvious typo produces a message instead of a nonsense quote. */
const MAX_TRAVELLERS = 200;
const MAX_MARKUP_PERCENT = 300;
const MAX_COST_PER_PERSON = 50000000;

/**
 * Build a tour package quote.
 *
 * @param {object} input
 * @param {number} input.netCostPerPerson Your landed cost per traveller, before markup, in rupees.
 * @param {number} input.markupPercent Markup on the net cost, as a percentage.
 * @param {number} input.travellers Number of paying travellers.
 * @param {boolean} input.overseas True for an overseas tour programme package (TCS applies).
 * @param {number} input.priorPackagesThisYear Value of overseas packages already sold to this
 *   buyer in the same financial year, used to place the quote against the TCS threshold.
 * @returns {object} A quote breakdown, or { error } for invalid input.
 */
export function computeTourQuote({
  netCostPerPerson,
  markupPercent,
  travellers,
  overseas = false,
  priorPackagesThisYear = 0,
} = {}) {
  const cost = Number(netCostPerPerson);
  const markup = Number(markupPercent);
  const heads = Number(travellers);
  const prior = Number(priorPackagesThisYear);

  if (![cost, markup, heads, prior].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (cost <= 0) return { error: "Net cost per person must be greater than zero." };
  if (cost > MAX_COST_PER_PERSON) return { error: "Net cost per person looks like a typo — check the figure." };
  if (markup < 0) return { error: "Markup cannot be negative. Use zero for an at-cost quote." };
  if (markup > MAX_MARKUP_PERCENT) return { error: `Markup above ${MAX_MARKUP_PERCENT}% is almost always a typo.` };
  if (!Number.isInteger(heads) || heads < 1) return { error: "Enter at least one traveller, as a whole number." };
  if (heads > MAX_TRAVELLERS) return { error: `This calculator handles up to ${MAX_TRAVELLERS} travellers per quote.` };
  if (prior < 0) return { error: "Packages already sold this year cannot be negative." };

  const sellingPerPerson = cost * (1 + markup / 100);
  const grossPackage = sellingPerPerson * heads;
  const gst = grossPackage * GST_TOUR_OPERATOR_RATE;

  let tcsAtLowerRate = 0;
  let tcsAtHigherRate = 0;
  let amountAtLowerRate = 0;
  let amountAtHigherRate = 0;

  if (overseas) {
    const headroom = Math.max(0, TCS_OVERSEAS_TOUR_THRESHOLD_INR - prior);
    amountAtLowerRate = Math.min(grossPackage, headroom);
    amountAtHigherRate = grossPackage - amountAtLowerRate;
    tcsAtLowerRate = amountAtLowerRate * TCS_RATE_UPTO_THRESHOLD;
    tcsAtHigherRate = amountAtHigherRate * TCS_RATE_ABOVE_THRESHOLD;
  }

  const tcs = tcsAtLowerRate + tcsAtHigherRate;
  const totalPayable = grossPackage + gst + tcs;
  const agencyMargin = (sellingPerPerson - cost) * heads;

  return {
    sellingPerPerson,
    grossPackage,
    gst,
    tcs,
    amountAtLowerRate,
    amountAtHigherRate,
    tcsAtLowerRate,
    tcsAtHigherRate,
    totalPayable,
    perTravellerPayable: totalPayable / heads,
    agencyMargin,
    marginPercentOfSelling: grossPackage > 0 ? (agencyMargin / grossPackage) * 100 : 0,
    netCost: cost * heads,
    travellers: heads,
    overseas: Boolean(overseas),
  };
}

/** The prompt library. */
export const PROMPTS = [
  {
    id: "package-description",
    title: "Tour package description",
    category: "Package copy",
    goal: "Describe the itinerary in facts a traveller can plan around, not adjectives.",
    tags: ["package", "itinerary", "description", "copy"],
    tip: "Distances, altitudes and walking times sell better than 'breathtaking'.",
    variables: [
      { key: "package", label: "Package and duration", placeholder: "Ladakh 7 nights 8 days, Leh-Nubra-Pangong, June to September" },
      { key: "included", label: "What is included", placeholder: "hotels on twin sharing, breakfast and dinner, Innova with driver, inner line permits" },
      { key: "excluded", label: "What is not included", placeholder: "flights, lunches, oxygen cylinders, monastery entry fees, tips" },
      { key: "audience", label: "Who it suits and who it does not", placeholder: "fit adults 12-60; not for anyone with heart or lung conditions or under 5" },
    ],
    template: `Write a tour package description.

Package and duration: {{package}}
What is included: {{included}}
What is not included: {{excluded}}
Who it suits and who it does not: {{audience}}

Write to facts: distances, drive times, altitudes, walking distances, meal arrangements and check-in times. Do not use "breathtaking", "unforgettable", "hidden gem", "paradise on earth" or any similar filler.

State {{excluded}} in the body of the description, not as small print, and repeat the two exclusions travellers most often assume are included.

Include {{audience}} plainly — say who should not book this. If any part of {{package}} carries a real physical demand such as altitude, cold or a long drive day, name it with the number.

Give me: a 60-word listing summary, a day-by-day itinerary with drive times and overnight stops, and a "who this is not for" block. Then list every claim I must be able to prove if a customer disputes it.`,
  },
  {
    id: "custom-quote-email",
    title: "Custom quote email",
    category: "Quotes",
    goal: "Send a quote a client can compare with another agency's, without hidden extras.",
    tags: ["quote", "email", "price", "proposal"],
    tip: "The number is not the hard part; the exclusions are.",
    variables: [
      { key: "request", label: "What the client asked for", placeholder: "family of 4, Bali 6 nights in October, mid-range, 2 rooms, no early flights" },
      { key: "quote", label: "Your quote", placeholder: "Rs 1,84,000 total including GST and TCS; hotels, transfers, 2 day tours, breakfast" },
      { key: "excluded", label: "Exclusions and optional add-ons", placeholder: "flights, visa on arrival fee, lunches and dinners, water sports, travel insurance" },
      { key: "validity", label: "Validity and next step", placeholder: "rates held until 12 August; 30% to confirm, balance 21 days before departure" },
    ],
    template: `Write a custom travel quote email.

What the client asked for: {{request}}
My quote: {{quote}}
Exclusions and optional add-ons: {{excluded}}
Validity and next step: {{validity}}

Restate {{request}} in one line first so they can see I listened. Then the price as a small table: package value, taxes, and total payable, each labelled.

List {{excluded}} as a plain bulleted list under the heading "Not included", before the call to action. Give an indicative rupee figure for the two exclusions most likely to surprise them.

State {{validity}} with the actual date and what happens if the rate changes after it. Do not use pressure language, invented scarcity or a discount that expires today.

Give me the email, a one-paragraph WhatsApp version, and the three questions a careful client will ask after reading it with the answer I should have ready for each.`,
  },
  {
    id: "quote-followup",
    title: "Follow-up on an unanswered quote",
    category: "Follow-up",
    goal: "Find out what actually stopped them, instead of asking 'any update?'",
    tags: ["follow up", "quote", "nudge", "sales"],
    tip: "A follow-up that adds nothing new is just a reminder that you are waiting.",
    variables: [
      { key: "context", label: "What was quoted and when", placeholder: "Bali quote sent 11 days ago, opened twice, no reply" },
      { key: "new_info", label: "Something genuinely new", placeholder: "the October rate loads 8% from 1 September; also found a hotel 4 minutes closer to the beach at the same price" },
      { key: "likely_block", label: "What you think is blocking it", placeholder: "probably the flight cost, which was not in my quote" },
      { key: "close", label: "How you want to end", placeholder: "either a call this week or a clear no, both fine" },
    ],
    template: `Write a follow-up to a client who has not replied to a travel quote.

What was quoted and when: {{context}}
Something genuinely new: {{new_info}}
What I think is blocking it: {{likely_block}}
How I want to end: {{close}}

Lead with {{new_info}}; it is the reason the message exists. Then one specific question about {{likely_block}} that is easy to answer in four words.

Make {{close}} explicit, including permission to say no. Do not write "just following up", "gentle reminder", "circling back" or "hope you are doing well".

Give me: a WhatsApp message under 60 words, an email under 120 words, and a final message for two weeks later that closes the loop and leaves the door open without asking for anything.

Then tell me which of the three is most likely to get a reply and why.`,
  },
  {
    id: "itinerary-change",
    title: "Telling a client an itinerary has changed",
    category: "Service",
    goal: "Deliver a change with the fix already attached.",
    tags: ["change", "itinerary", "problem", "service"],
    tip: "Never send a problem without at least two options beside it.",
    variables: [
      { key: "change", label: "What has changed", placeholder: "Pangong stay cancelled, road closed by landslide, confirmed this morning" },
      { key: "impact", label: "The real impact", placeholder: "one night moves to Nubra, they lose the Pangong sunrise, one fewer long drive" },
      { key: "options", label: "Options you can actually deliver", placeholder: "extra Nubra night with a camel safari, or Tso Moriri with a longer drive, or a partial refund of Rs 4,800 per person" },
      { key: "deadline", label: "When you need an answer", placeholder: "by 6 pm tomorrow, hotels release the block after that" },
    ],
    template: `Write a message telling a travel client that their itinerary has changed.

What has changed: {{change}}
The real impact: {{impact}}
Options I can actually deliver: {{options}}
When I need an answer: {{deadline}}

Lead with the change and the fact it is confirmed, not with an apology. State {{impact}} honestly, including what they lose. Then {{options}} as a numbered list, each with its cost difference and what it means for the day's driving.

Say what I recommend and why in one sentence, then {{deadline}}. Apologise once, in one sentence, and never blame the supplier by name unless it is a fact I can evidence.

Give me: the WhatsApp message, a call script for a client who will want to talk it through, and the message I send to the rest of the group if this is a group booking.

Then list what I must confirm with suppliers before I send any of it.`,
  },
  {
    id: "visa-document-checklist",
    title: "Visa and document checklist request",
    category: "Operations",
    goal: "Collect documents once, correctly, instead of four times.",
    tags: ["visa", "documents", "checklist", "passport"],
    tip: "Give the deadline as a date, not as 'as soon as possible'.",
    variables: [
      { key: "trip", label: "Destination and travel dates", placeholder: "Schengen, France and Italy, 14-26 October, 4 adults" },
      { key: "documents", label: "Documents needed", placeholder: "passport valid 3 months beyond return, 2 photos to Schengen spec, 6 months bank statements, ITR, leave letter, confirmed bookings" },
      { key: "deadline", label: "Deadline and appointment", placeholder: "all documents by 20 August; VFS appointment 28 August at 9:30 am" },
      { key: "warnings", label: "Common mistakes", placeholder: "photos taken at a local studio are usually rejected; bank statement must be stamped by the branch" },
    ],
    template: `Write a visa document request for travel clients.

Destination and travel dates: {{trip}}
Documents needed: {{documents}}
Deadline and appointment: {{deadline}}
Common mistakes: {{warnings}}

Turn {{documents}} into a numbered checklist where each line says what the document is, the exact form it must be in, and who issues it. Put {{warnings}} next to the item it applies to, not in a separate section at the end.

State {{deadline}} as dates, and say plainly what happens to the appointment if a document is late.

Do not state that a visa is guaranteed, do not predict a processing time as a promise, and do not advise anyone to present a document they do not genuinely hold.

Give me: the email with the checklist, a WhatsApp summary under 100 words, and a short reply I send when someone submits an incorrect document, naming what is wrong and what to do next.`,
  },
  {
    id: "group-departure-brief",
    title: "Pre-departure briefing",
    category: "Operations",
    goal: "Answer the twenty questions that would otherwise arrive the night before.",
    tags: ["briefing", "departure", "packing", "group"],
    tip: "Send it a week out, then send the one-page version the night before.",
    variables: [
      { key: "trip", label: "Trip and group", placeholder: "Ladakh 8 days, group of 14, departing 6 June from Delhi" },
      { key: "logistics", label: "Meeting point and timings", placeholder: "Leh airport arrivals 8:30 am, tour manager Nitin, +91 98xxx, hotel check-in 10 am" },
      { key: "prep", label: "What they must prepare", placeholder: "acclimatisation day with no exertion, 3 litres water daily, sunscreen SPF 50, ID card originals for permits" },
      { key: "risks", label: "Real risks and rules", placeholder: "altitude sickness is common above 3,500 m; mobile data works only on postpaid; ATMs unreliable outside Leh" },
    ],
    template: `Write a pre-departure briefing for a travel group.

Trip and group: {{trip}}
Meeting point and timings: {{logistics}}
What they must prepare: {{prep}}
Real risks and rules: {{risks}}

Open with {{logistics}} — meeting point, time, contact name and number — because that is what people scroll for. Then packing, split into what to carry in the cabin and what can go in the hold.

Present {{risks}} as facts with the number attached, and say what the group will do about each, such as an acclimatisation day. For anything health-related, tell travellers to speak to their own doctor before travelling rather than giving them a health instruction from me.

Give me: a detailed briefing document, a one-page version for the night before, and a WhatsApp pinned message under 200 characters with the meeting point and contact number.

End with the questions this briefing does not answer, so I can add them.`,
  },
  {
    id: "review-request",
    title: "Review request after the trip",
    category: "Follow-up",
    goal: "Ask once, at the right moment, and make it easy to say no.",
    tags: ["review", "feedback", "testimonial", "post trip"],
    tip: "Ask within 72 hours of return, before the photos are archived.",
    variables: [
      { key: "trip", label: "The trip", placeholder: "Kerala 6 nights, honeymoon, returned Tuesday" },
      { key: "moment", label: "A specific moment you remember", placeholder: "the houseboat cook made the fish curry they asked for twice" },
      { key: "issue", label: "Anything that went wrong", placeholder: "the Munnar hotel room was not ready until 3 pm" },
      { key: "ask", label: "What you are asking for", placeholder: "a Google review; one line is plenty" },
    ],
    template: `Write a post-trip review request.

The trip: {{trip}}
A specific moment I remember: {{moment}}
Anything that went wrong: {{issue}}
What I am asking for: {{ask}}

Open with {{moment}} so it reads as a person, not a template. Acknowledge {{issue}} in one sentence with what I did or will do about it — do not hide it and hope the review does not mention it.

Then {{ask}}, with the platform named, how long it takes, and explicit permission to skip it. Do not offer a discount, a gift or an entry into a draw in exchange for a review, and do not ask them to leave a specific rating.

Give me: a WhatsApp message under 80 words, an email version, and a separate private feedback request for the client who is clearly unhappy, which asks for the complaint rather than a public review.`,
  },
  {
    id: "cancellation-refund",
    title: "Cancellation and refund explanation",
    category: "Service",
    goal: "Explain what is refundable and what is not, with the arithmetic shown.",
    tags: ["cancellation", "refund", "policy", "money"],
    tip: "Show the supplier's deduction separately from yours; clients accept the first far more easily.",
    variables: [
      { key: "situation", label: "The cancellation", placeholder: "cancelling 9 days before departure, medical reason, 2 of 4 travellers" },
      { key: "policy", label: "The policy that applies", placeholder: "hotel non-refundable inside 14 days; airline Rs 3,500 per person; my service fee Rs 2,000 per booking" },
      { key: "numbers", label: "The actual arithmetic", placeholder: "paid Rs 1,84,000; recoverable Rs 61,400; refund Rs 61,400 in 7-10 working days" },
      { key: "alternatives", label: "Alternatives you can offer", placeholder: "postpone to March with the hotel credit intact, or transfer the booking to another traveller" },
    ],
    template: `Write a cancellation and refund explanation for a travel client.

The cancellation: {{situation}}
The policy that applies: {{policy}}
The actual arithmetic: {{numbers}}
Alternatives I can offer: {{alternatives}}

Show {{numbers}} as a line-by-line table: what was paid, each deduction with the supplier who imposes it, my own fee shown separately, and the net refund with the date it should arrive.

Quote the specific clause from {{policy}} beside each deduction rather than referring to "our terms". Present {{alternatives}} before the refund total, since one of them may be better for the client.

Do not express an opinion on the reason for cancellation, do not suggest an insurance claim will succeed, and do not promise a refund date I cannot control — say who controls it.

Give me the email, a spoken version for the phone, and the two sentences to use if the client says the deduction is unfair.`,
  },
  {
    id: "supplier-negotiation",
    title: "Negotiating with a hotel or DMC",
    category: "Operations",
    goal: "Ask for a better rate with a reason the supplier can say yes to.",
    tags: ["supplier", "hotel", "dmc", "rate", "negotiation"],
    tip: "Volume, dates and payment terms are the three levers; pick the one you can actually move.",
    variables: [
      { key: "ask", label: "What you want", placeholder: "12% off the published rate for 40 room nights across October" },
      { key: "offer", label: "What you can give", placeholder: "full prepayment 30 days out, midweek arrivals, and no amendments after confirmation" },
      { key: "history", label: "Your history with them", placeholder: "68 room nights last year, zero chargebacks, two group cancellations both replaced" },
      { key: "alternative", label: "Your real alternative", placeholder: "a comparable property 900 m away at 9% less, but with a worse breakfast" },
    ],
    template: `Help me negotiate a rate with a travel supplier.

What I want: {{ask}}
What I can give: {{offer}}
My history with them: {{history}}
My real alternative: {{alternative}}

Write the email: {{ask}} in the first two lines with the number, then {{offer}} as the reason it is worth doing, then {{history}} as evidence, in that order. Keep it under 180 words.

Give me three fallback positions in descending order of value to me, and say which of {{offer}} I should concede at each step.

Say plainly at which point {{alternative}} becomes the better deal, with the arithmetic, so I know when to stop negotiating.

Do not bluff about a competing offer I do not have, do not use a deadline I will not honour, and do not attack their pricing. End with the reply I send if they say no outright.`,
  },
  {
    id: "instagram-package-post",
    title: "Social post for a departure",
    category: "Package copy",
    goal: "Post something specific enough that the right traveller recognises themselves in it.",
    tags: ["instagram", "social", "post", "marketing"],
    tip: "One departure, one date, one price. A carousel of destinations converts nobody.",
    variables: [
      { key: "departure", label: "The departure", placeholder: "fixed departure Spiti 9 days, 15 September, 12 seats, 4 left" },
      { key: "hook", label: "The specific detail", placeholder: "two nights in a Komic homestay at 4,587 m, the highest village with a motorable road" },
      { key: "price", label: "Price and what it covers", placeholder: "Rs 42,500 per person ex-Chandigarh, all stays, all meals, permits and shared transport" },
      { key: "audience", label: "Who you want to reach", placeholder: "solo travellers 25-40 who have done Manali and want something harder" },
    ],
    template: `Write a social media post for a fixed travel departure.

The departure: {{departure}}
The specific detail: {{hook}}
Price and what it covers: {{price}}
Who I want to reach: {{audience}}

Open with {{hook}} as a concrete fact, not a question or a quote about wanderlust. Put {{price}} and what it covers in the caption body, not in a comment.

If {{departure}} contains a real seat count and date, state them exactly; if it does not, leave scarcity out entirely rather than inventing it.

Give me: an Instagram caption under 120 words with the first line written to survive truncation, 12 hashtags that are specific to the region and trip type rather than generic travel tags, three carousel slide texts, and a 15-second reel script with what is on screen for each line.

Then say which single element of the post is doing the work, and what to change if the post underperforms.`,
  },
];

export const CATEGORIES = Array.from(new Set(PROMPTS.map((prompt) => prompt.category)));

/** Every distinct {{placeholder}} in a template, in first-appearance order. */
export function extractVariables(template) {
  if (typeof template !== "string" || template === "") return [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");
  const found = [];
  const seen = new Set();
  let match = pattern.exec(template);
  while (match !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      found.push(key);
    }
    match = pattern.exec(template);
  }
  return found;
}

/** Rough size estimate only — see CHARS_PER_TOKEN. Never negative, never NaN. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function getPrompt(id) {
  return PROMPTS.find((prompt) => prompt.id === id) || null;
}

/** Case-insensitive AND search across title, goal, category and tags. */
export function searchPrompts({ query = "", category = "All" } = {}) {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return PROMPTS.filter((prompt) => {
    if (category && category !== "All" && prompt.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = `${prompt.title} ${prompt.goal} ${prompt.category} ${prompt.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Substitute values into a template. A blank or missing value keeps its
 * {{placeholder}} visible and is reported in `missing`.
 */
export function fillPrompt({ template, values } = {}) {
  if (typeof template !== "string" || template.trim() === "") {
    return { error: "Choose a prompt first — there is no template to fill in." };
  }
  if (values !== undefined && (values === null || typeof values !== "object")) {
    return { error: "Variable values must be given as an object of key/value pairs." };
  }

  const supplied = values || {};
  const variables = extractVariables(template);
  const missing = [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");

  const text = template.replace(pattern, (_whole, key) => {
    const raw = supplied[key];
    const value = raw === undefined || raw === null ? "" : String(raw).trim();
    if (value === "") {
      if (!missing.includes(key)) missing.push(key);
      return `{{${key}}}`;
    }
    return value;
  });

  const estimatedTokens = estimateTokens(text);

  return {
    text,
    variables,
    missing,
    totalCount: variables.length,
    filledCount: variables.length - missing.length,
    characters: text.length,
    words: countWords(text),
    estimatedTokens,
    isLong: estimatedTokens > LONG_PROMPT_TOKENS,
  };
}

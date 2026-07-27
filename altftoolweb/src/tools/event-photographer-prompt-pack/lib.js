/**
 * Event Photographer Prompt Pack — a prompt library, a pure template engine and a
 * shoot planner that turns shooting rate and RAW file size into cards, backup
 * storage and editing hours.
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

/** Binary units. Operating systems report card and disk space in these. */
export const BYTES_PER_MIB = 1024 * 1024;
export const BYTES_PER_GIB = 1024 * 1024 * 1024;

/**
 * Memory card and drive capacities are advertised in decimal gigabytes
 * (1 GB = 1,000,000,000 bytes) but reported by the operating system in binary
 * gibibytes (1 GiB = 1,073,741,824 bytes). A card sold as 128 GB therefore shows
 * about 119 GiB before the file system takes its share.
 */
export const BYTES_PER_DECIMAL_GB = 1000000000;

/**
 * The 3-2-1 backup rule, the long-standing photography and IT convention: three
 * copies of the data, on two different kinds of media, with one copy off site.
 * The camera card counts as a copy only until it is reformatted.
 */
export const BACKUP_RULE_COPIES = 3;

/** Sanity bounds so an obvious typo produces a message instead of a nonsense plan. */
const MAX_HOURS = 48;
const MAX_FRAMES_PER_HOUR = 5000;
const MAX_RAW_MB = 500;
const MAX_COPIES = 6;

/**
 * Plan a shoot: how many frames, how much card space, how much backup storage and
 * how long the edit takes.
 *
 * @param {object} input
 * @param {number} input.hours Length of the shoot in hours.
 * @param {number} input.framesPerHour Frames you actually take per hour, all cameras combined.
 * @param {number} input.avgRawMb Average RAW file size in MB (1 MB = 1,048,576 bytes).
 * @param {number} input.cardRatedGb Capacity printed on the card, in decimal GB.
 * @param {number} input.deliveryRatePercent Share of frames you expect to deliver, as a percentage.
 * @param {number} input.minutesPerEdit Editing minutes per delivered image.
 * @param {number} input.backupCopies Total copies you keep, including the working copy.
 * @returns {object} A plan, or { error } for invalid input.
 */
export function computeShootPlan({
  hours,
  framesPerHour,
  avgRawMb,
  cardRatedGb,
  deliveryRatePercent,
  minutesPerEdit,
  backupCopies = BACKUP_RULE_COPIES,
} = {}) {
  const duration = Number(hours);
  const rate = Number(framesPerHour);
  const rawMb = Number(avgRawMb);
  const cardGb = Number(cardRatedGb);
  const deliveryRate = Number(deliveryRatePercent);
  const editMinutes = Number(minutesPerEdit);
  const copies = Number(backupCopies);

  const numbers = [duration, rate, rawMb, cardGb, deliveryRate, editMinutes, copies];
  if (!numbers.every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (duration <= 0) return { error: "Shoot length must be greater than zero hours." };
  if (duration > MAX_HOURS) return { error: `A single shoot longer than ${MAX_HOURS} hours is probably a typo.` };
  if (rate <= 0) return { error: "Frames per hour must be greater than zero." };
  if (rate > MAX_FRAMES_PER_HOUR) return { error: `Above ${MAX_FRAMES_PER_HOUR} frames an hour is beyond any event pace.` };
  if (rawMb <= 0) return { error: "Average RAW file size must be greater than zero." };
  if (rawMb > MAX_RAW_MB) return { error: `A RAW file over ${MAX_RAW_MB} MB is outside the range of event cameras.` };
  if (cardGb <= 0) return { error: "Card capacity must be greater than zero." };
  if (deliveryRate < 0 || deliveryRate > 100) return { error: "Delivery rate must be between 0% and 100%." };
  if (editMinutes < 0) return { error: "Editing time per image cannot be negative." };
  if (!Number.isInteger(copies) || copies < 1) return { error: "Keep at least one copy, as a whole number." };
  if (copies > MAX_COPIES) return { error: `More than ${MAX_COPIES} copies is unusual — check the figure.` };

  const frames = Math.round(duration * rate);
  const rawBytes = frames * rawMb * BYTES_PER_MIB;
  const rawGib = rawBytes / BYTES_PER_GIB;
  const usableCardGib = (cardGb * BYTES_PER_DECIMAL_GB) / BYTES_PER_GIB;
  const cardsNeeded = Math.max(1, Math.ceil(rawGib / usableCardGib));
  const framesPerCard = Math.floor((usableCardGib * BYTES_PER_GIB) / (rawMb * BYTES_PER_MIB));
  const minutesPerCard = framesPerCard > 0 && rate > 0 ? (framesPerCard / rate) * 60 : 0;

  const delivered = Math.round((frames * deliveryRate) / 100);
  const editHours = (delivered * editMinutes) / 60;
  const archiveGib = rawGib * copies;

  return {
    frames,
    rawGib,
    archiveGib,
    copies,
    usableCardGib,
    cardsNeeded,
    framesPerCard,
    minutesPerCard,
    delivered,
    culled: frames - delivered,
    editHours,
    editDaysAtSix: editHours / 6,
    gibPerHour: rawGib / duration,
  };
}

/** The prompt library. */
export const PROMPTS = [
  {
    id: "wedding-shot-list",
    title: "Wedding shot list from the timeline",
    category: "Shot lists",
    goal: "Turn a day's timeline into a shot list with the light and the location attached to each block.",
    tags: ["wedding", "shot list", "timeline", "planning"],
    tip: "A shot list without times is a wish list. Attach every group to a slot.",
    variables: [
      { key: "timeline", label: "The timeline", placeholder: "2 pm getting ready, 4:30 ceremony outdoors, 6 pm golden hour portraits, 7:30 reception indoors" },
      { key: "people", label: "Key people and groupings", placeholder: "both sets of parents divorced and not to be grouped together; 4 siblings; grandmother uses a wheelchair" },
      { key: "must_have", label: "Must-have shots the client named", placeholder: "grandmother's ring detail, the dog at the ceremony, father-daughter first look" },
      { key: "constraints", label: "Venue and gear constraints", placeholder: "no flash during the ceremony, single shooter, 24-70 and 85 primes only" },
    ],
    template: `Build a wedding shot list from a timeline.

The timeline: {{timeline}}
Key people and groupings: {{people}}
Must-have shots the client named: {{must_have}}
Venue and gear constraints: {{constraints}}

Produce a table with one row per shot: time block, shot, location, likely light, lens from {{constraints}}, and who needs to be gathered.

Handle {{people}} carefully — build the family group order so that nobody who should not be photographed together is scheduled together, and put the grandmother's groups first so she is not kept standing or waiting.

Put every item from {{must_have}} in the table with a specific time, and flag any that conflict with {{constraints}}.

Then give me: the realistic minutes each group block needs at a rate of one setup per 90 seconds; the two moments where the timeline is too tight and what to cut; and a five-line card to hand the person wrangling family groups.

Do not invent traditions, rituals or family roles that I did not give you.`,
  },
  {
    id: "corporate-event-shot-list",
    title: "Corporate event shot list",
    category: "Shot lists",
    goal: "Deliver what the marketing team will actually use, not 400 frames of people eating.",
    tags: ["corporate", "conference", "shot list", "brand"],
    tip: "Ask what the images are for before you ask what the schedule is.",
    variables: [
      { key: "event", label: "The event", placeholder: "one-day product conference, 320 attendees, hotel ballroom plus 3 breakout rooms" },
      { key: "usage", label: "What the images are for", placeholder: "next year's landing page, LinkedIn recaps, and a sponsor report" },
      { key: "vips", label: "Who must be photographed", placeholder: "CEO keynote, 4 sponsor logos in frame, panel of 5, and the award handover at 4 pm" },
      { key: "constraints", label: "Constraints", placeholder: "no flash during keynote, dark room with a bright stage, 90 minutes of overlap between breakouts" },
    ],
    template: `Build a corporate event shot list.

The event: {{event}}
What the images are for: {{usage}}
Who must be photographed: {{vips}}
Constraints: {{constraints}}

Work backwards from {{usage}}: list the specific images each use needs, including aspect ratio and where the copy space must sit in the frame.

Then the shot list as a table: time, shot, room, subject, lens, and whether it is a must-have or a filler. Mark the frames that satisfy {{vips}} and the sponsor visibility requirement explicitly.

Address {{constraints}} with a specific approach for the dark room and bright stage, and give me the plan for the overlapping breakouts, including which one I skip and why.

Finish with: the shots that only exist if there is spare time, the two moments I must not be reloading a card, and a short paragraph I can send the organiser confirming what I will and will not be able to cover.`,
  },
  {
    id: "booking-confirmation",
    title: "Booking confirmation email",
    category: "Client emails",
    goal: "Confirm what is booked so precisely that nothing is argued about later.",
    tags: ["booking", "confirmation", "contract", "email"],
    tip: "Hours, coverage, deliverables, delivery date, payments. Anything missing becomes a dispute.",
    variables: [
      { key: "booking", label: "What is booked", placeholder: "wedding 14 February, 8 hours coverage 1 pm to 9 pm, single shooter, Bengaluru" },
      { key: "deliverables", label: "Deliverables and timeline", placeholder: "roughly 400 edited images in an online gallery within 5 weeks; 30 sneak peeks in 72 hours" },
      { key: "payments", label: "Payment schedule", placeholder: "Rs 25,000 retainer paid, Rs 55,000 due 7 days before the date" },
      { key: "conditions", label: "Conditions worth stating", placeholder: "overtime Rs 6,000 per hour billed in 30-minute blocks; meals for the shooter; retainer non-refundable" },
    ],
    template: `Write a photography booking confirmation email.

What is booked: {{booking}}
Deliverables and timeline: {{deliverables}}
Payment schedule: {{payments}}
Conditions worth stating: {{conditions}}

Set it out as labelled blocks the client can scan: date and hours, coverage, deliverables with the delivery date as an actual date, payments with dates, and conditions.

State {{conditions}} plainly in the body — not as an attachment reference — and give the overtime rate as a number.

Give me the email, a one-screen summary the client can screenshot, and a short list of anything in {{booking}} that is still ambiguous and needs confirming before the day.

Do not promise a specific number of images unless {{deliverables}} gives one; if it gives a range, keep the range. Do not use "unlimited". Do not include terms that contradict the signed contract — flag any that seem to.`,
  },
  {
    id: "timeline-questionnaire",
    title: "Pre-event questionnaire",
    category: "Client emails",
    goal: "Ask the ten questions that decide whether the day goes well.",
    tags: ["questionnaire", "timeline", "planning", "client"],
    tip: "The question people forget: who is allowed to be in the getting-ready room.",
    variables: [
      { key: "event", label: "Event and date", placeholder: "wedding 14 February, ceremony at 4:30 pm, 180 guests" },
      { key: "unknowns", label: "What you still do not know", placeholder: "venue access time, whether there is a second location, family group list" },
      { key: "deadline", label: "When you need the answers", placeholder: "two weeks before, so 31 January" },
      { key: "format", label: "How they should reply", placeholder: "reply to this email or fill the form; a voice note is fine too" },
    ],
    template: `Write a pre-event questionnaire for a photography client.

Event and date: {{event}}
What I still do not know: {{unknowns}}
When I need the answers: {{deadline}}
How they should reply: {{format}}

Ask no more than twelve questions, each one closed enough to answer in a line. Cover {{unknowns}} first, then access and timings, then people, then anything sensitive such as family members who should not appear in the same frame, then the one image they would be upset not to receive.

Explain in one line beside each question why the answer changes what I do. Offer {{format}} so a busy client can reply the easy way.

State {{deadline}} once, with the date, and say what I will assume if I do not hear back.

Give me the email, a printable one-page form, and a two-line reminder to send a week before the deadline.`,
  },
  {
    id: "gallery-description",
    title: "Gallery description and blog post",
    category: "Gallery copy",
    goal: "Describe a gallery so it is findable and so the couple recognise their own day in it.",
    tags: ["gallery", "blog", "seo", "description"],
    tip: "Name the venue, the city and the month; that is what people search.",
    variables: [
      { key: "shoot", label: "The shoot", placeholder: "Aditi and Ravi, wedding at Tamarind Tree, Bengaluru, February, outdoor evening ceremony" },
      { key: "details", label: "Details worth naming", placeholder: "her grandmother's Kanjeevaram, hand-painted invites, a 40-person guest list, sit-down dinner under fig trees" },
      { key: "moment", label: "The moment of the day", placeholder: "his brother's speech stopping halfway through" },
      { key: "credits", label: "Vendors to credit", placeholder: "planner Studio Nine, florals by Bloom Room, catering by Nasi" },
    ],
    template: `Write gallery and blog copy for a photography shoot.

The shoot: {{shoot}}
Details worth naming: {{details}}
The moment of the day: {{moment}}
Vendors to credit: {{credits}}

Write in specifics from {{details}} and {{moment}}. Do not write "magical", "fairytale", "raw and authentic", "we laughed, we cried", or any sentence that would fit any other wedding.

Give me:
1. A gallery introduction of 80-120 words that names the venue, the city and the month in the first two sentences.
2. A blog post of about 400 words that tells the day in order.
3. A meta description under 155 characters.
4. Alt text for eight images, each describing what is actually in the frame rather than repeating the venue name.
5. The vendor credit block from {{credits}}.

Do not invent a proposal story, a first meeting, or any detail about the couple that I did not give you.`,
  },
  {
    id: "delivery-email",
    title: "Gallery delivery email",
    category: "Client emails",
    goal: "Deliver the gallery with the download instructions people actually need.",
    tags: ["delivery", "gallery", "download", "email"],
    tip: "Tell them where the high resolution files are before they ask.",
    variables: [
      { key: "gallery", label: "Gallery details", placeholder: "412 images, link plus PIN, available for 12 months, downloads enabled" },
      { key: "instructions", label: "How to download and print", placeholder: "web size for social, full size for printing; the print shop is linked in the gallery" },
      { key: "extras", label: "What else is available", placeholder: "album design from Rs 18,000, extra retouching Rs 800 per image, raw files not supplied" },
      { key: "ask", label: "What you would like from them", placeholder: "a Google review, and permission to blog three images" },
    ],
    template: `Write a photo gallery delivery email.

Gallery details: {{gallery}}
How to download and print: {{instructions}}
What else is available: {{extras}}
What I would like from them: {{ask}}

Open with the link and the PIN. Then {{instructions}} as three numbered steps, including which size to use for social and which for printing, and the expiry date of the gallery as an actual date.

Mention {{extras}} once, briefly, after the instructions — this email is a delivery, not a sales pitch. State plainly anything that is not included.

Put {{ask}} at the end, separated, easy to decline, with the platform named and the permission request written so a yes or no is enough.

Give me the email, a WhatsApp version under 90 words, and a short reminder to send four weeks before the gallery expires.`,
  },
  {
    id: "difficult-client-reply",
    title: "Replying to a disappointed client",
    category: "Difficult conversations",
    goal: "Answer the actual complaint without either capitulating or arguing.",
    tags: ["complaint", "refund", "unhappy", "reply"],
    tip: "Separate what you can fix from what you cannot; answer the first before the second.",
    variables: [
      { key: "complaint", label: "What they said", placeholder: "says the reception photos are too dark and there are none of her college friends" },
      { key: "facts", label: "What actually happened", placeholder: "venue killed the lights for the dance; no flash was permitted; the friends group was never on the list and left at 9" },
      { key: "fixable", label: "What you can fix", placeholder: "can re-edit 40 reception frames brighter within 4 days" },
      { key: "limit", label: "Where your limit is", placeholder: "cannot create photos of people who had left; no refund of the coverage fee" },
    ],
    template: `Help me reply to a disappointed photography client.

What they said: {{complaint}}
What actually happened: {{facts}}
What I can fix: {{fixable}}
Where my limit is: {{limit}}

Open by naming the specific disappointment, not with "sorry you feel that way". Offer {{fixable}} in the second paragraph with a date, before any explanation.

Give {{facts}} once, factually, without defending myself twice and without blaming the client or the venue by name.

State {{limit}} plainly in one sentence, with the reason, and without an apology attached to it.

Give me: the email; the two sentences to open the phone call if they ring; the reply if they ask for a partial refund; and the reply if they threaten a public review. For the last one, no threats, no legal language, no offer conditional on removing a review.

Then tell me what in {{facts}} I should have set expectations about beforehand, so this does not happen again.`,
  },
  {
    id: "second-shooter-brief",
    title: "Second shooter brief",
    category: "Operations",
    goal: "Brief a second shooter so you never both have the same frame.",
    tags: ["second shooter", "team", "brief", "coverage"],
    tip: "Divide by position, not by subject; two people chasing the same subject waste half the day.",
    variables: [
      { key: "event", label: "Event and coverage", placeholder: "wedding 14 February, 1 pm to 9 pm, ceremony outdoors, reception indoors" },
      { key: "division", label: "How you want to split coverage", placeholder: "I stay wide and central, they work the aisle side and reaction faces" },
      { key: "technical", label: "Technical settings to match", placeholder: "5500K white balance, RAW, sync clocks to my phone, 1/250 minimum during the ceremony" },
      { key: "delivery", label: "Card handover and payment", placeholder: "cards to me at the end of the night, Rs 8,000 paid within 48 hours, no separate posting" },
    ],
    template: `Write a brief for a second shooter.

Event and coverage: {{event}}
How I want to split coverage: {{division}}
Technical settings to match: {{technical}}
Card handover and payment: {{delivery}}

Give the brief in five blocks: timings and call time; position and movement rules from {{division}} for each part of the day; technical settings from {{technical}} including clock sync; what never to shoot because I am covering it; and {{delivery}}.

Add the three moments where we must both be shooting and where each of us stands for them.

Include the etiquette rules explicitly: no direct client contact, no posting before I do, no repositioning guests during the ceremony, and who they ask when something goes wrong.

Give me the written brief, a phone-sized summary card, and the five questions I should ask them the week before to check they have understood.`,
  },
  {
    id: "pricing-enquiry-reply",
    title: "Reply to a pricing enquiry",
    category: "Client emails",
    goal: "Answer the price question directly and still start a conversation.",
    tags: ["pricing", "enquiry", "lead", "reply"],
    tip: "Hiding the number costs you the enquiry from everyone who cannot afford it and annoys everyone who can.",
    variables: [
      { key: "enquiry", label: "What they asked", placeholder: "asks for the price for a 2-day wedding in April, no other detail" },
      { key: "pricing", label: "Your actual pricing", placeholder: "collections from Rs 95,000 for one day; two-day coverage typically Rs 1,60,000 to Rs 2,10,000" },
      { key: "differentiator", label: "What actually makes you different", placeholder: "I shoot alone and stay for the whole day rather than splitting between events" },
      { key: "next", label: "The next step you want", placeholder: "a 15-minute call this week, or their date and venue so I can check availability" },
    ],
    template: `Write a reply to a photography pricing enquiry.

What they asked: {{enquiry}}
My actual pricing: {{pricing}}
What actually makes me different: {{differentiator}}
The next step I want: {{next}}

Answer the price question in the first two lines with the real range from {{pricing}}, before anything else. Say clearly what changes the number.

Then {{differentiator}} in one or two sentences, written as a fact about how I work rather than a claim about quality. Do not call myself passionate, artistic, or the best.

Then {{next}}, with one specific easy action.

Ask at most two questions back, and only the ones that change the price.

Give me: the email under 150 words, a WhatsApp version under 60 words, and the follow-up to send five days later if there is no reply, which adds something rather than repeating the ask.`,
  },
  {
    id: "weather-contingency",
    title: "Weather or venue contingency message",
    category: "Difficult conversations",
    goal: "Present the wet-weather plan early enough that it is a plan, not a panic.",
    tags: ["weather", "rain", "contingency", "plan"],
    tip: "Send it three days before, when the client can still act on it.",
    variables: [
      { key: "risk", label: "The risk", placeholder: "70% chance of rain from 4 pm on the ceremony day; ceremony is outdoors at 4:30" },
      { key: "options", label: "The options", placeholder: "move ceremony 45 minutes earlier, use the covered terrace, or keep the plan and shoot portraits under umbrellas" },
      { key: "impact", label: "Photographic impact of each", placeholder: "terrace is darker and faces the car park; earlier ceremony gives better light but rushes the getting-ready coverage" },
      { key: "decision", label: "Who decides and by when", placeholder: "the couple and the planner, by 10 am on the day" },
    ],
    template: `Write a weather contingency message to a photography client.

The risk: {{risk}}
The options: {{options}}
Photographic impact of each: {{impact}}
Who decides and by when: {{decision}}

State {{risk}} in the first line with the number, and say clearly that no decision is needed yet if that is true.

Give {{options}} as a numbered list, each with {{impact}} attached in plain language — what the pictures will look like, not technical terms.

Say which I would choose and why in one sentence, then hand the decision back with {{decision}}.

Do not predict the weather as a certainty, do not promise that any option will look identical to the original plan, and do not let the message read as though the day is ruined.

Give me the message, a two-line version for the planner, and the message I send on the morning itself once the decision is made.`,
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

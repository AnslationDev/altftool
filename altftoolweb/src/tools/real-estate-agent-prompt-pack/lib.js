/**
 * Real Estate Agent Prompt Pack — prompt library, a pure template engine, and a
 * fair housing language screen.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 * Placeholders inside a template are written as {{snake_case}}.
 */

/**
 * Placeholder syntax. Kept as a source string so callers can build their own
 * stateful RegExp instances instead of sharing lastIndex with this one.
 */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/**
 * ~4 characters per token for English prose is the vendor-published rule of thumb
 * used by OpenAI's tokenizer documentation. It is an estimate for sizing a prompt
 * against a context window, never an exact billing figure.
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Above this estimated size a prompt starts to crowd small context windows
 * (8K-token models leave roughly this much room once a long answer is reserved).
 */
export const LONG_PROMPT_TOKENS = 700;

/**
 * Protected classes under the federal Fair Housing Act, 42 U.S.C. § 3604 —
 * race, colour, religion, sex, national origin (Civil Rights Act of 1968), plus
 * handicap (disability) and familial status added by the Fair Housing Amendments
 * Act of 1988. HUD's February 2021 memorandum applies "sex" to include sexual
 * orientation and gender identity. Many US states and cities add further classes
 * such as source of income, age or marital status.
 */
export const FAIR_HOUSING_PROTECTED_CLASSES = [
  "Race",
  "Colour",
  "Religion",
  "Sex (including sexual orientation and gender identity)",
  "National origin",
  "Disability",
  "Familial status",
];

/**
 * Section 3604(c) of the Fair Housing Act makes it unlawful to make, print or
 * publish any advertisement for the sale or rental of a dwelling that indicates a
 * preference, limitation or discrimination based on a protected class — the words
 * are unlawful whether or not anyone was actually turned away.
 *
 * The phrases below are the ones HUD's advertising guidance and NAR's fair housing
 * materials repeatedly flag. This screen is a drafting prompt, not legal clearance:
 * context can make a listed phrase harmless and an unlisted phrase unlawful.
 */
export const RISKY_LISTING_PHRASES = [
  {
    phrase: "no children",
    basis: "Familial status",
    why: "Excludes households with under-18s, which the 1988 amendments made a protected class.",
    instead: "Describe the home — 'one bedroom, no garden' — and let buyers decide.",
  },
  {
    phrase: "adults only",
    basis: "Familial status",
    why: "Only housing that qualifies for the 55+ or 62+ exemption may advertise an age limit.",
    instead: "Omit it, unless the community is a registered 55+ community and you say so precisely.",
  },
  {
    phrase: "adult community",
    basis: "Familial status",
    why: "Reads as an age restriction without the paperwork that would justify one.",
    instead: "'Qualified 55+ community under the Housing for Older Persons Act', if that is true.",
  },
  {
    phrase: "empty nesters",
    basis: "Familial status",
    why: "Signals a preference for households without children.",
    instead: "Describe the layout: 'single-level, two bedrooms'.",
  },
  {
    phrase: "perfect for families",
    basis: "Familial status",
    why: "States a preferred household type rather than a fact about the property.",
    instead: "'Four bedrooms and a fenced garden' — the feature, not the buyer.",
  },
  {
    phrase: "family-friendly",
    basis: "Familial status",
    why: "Same problem: it describes who should live there.",
    instead: "Name the amenity — 'park at the end of the street'.",
  },
  {
    phrase: "bachelor pad",
    basis: "Familial status / sex",
    why: "Implies a single male occupant.",
    instead: "'Studio' or 'one-bedroom apartment'.",
  },
  {
    phrase: "mature couple",
    basis: "Familial status / age",
    why: "Names a preferred buyer profile.",
    instead: "Delete; describe the property instead.",
  },
  {
    phrase: "no students",
    basis: "Familial status / age (state law)",
    why: "Age and student status are protected in a number of state and city codes.",
    instead: "Apply the same written screening criteria to every applicant.",
  },
  {
    phrase: "christian",
    basis: "Religion",
    why: "Naming a faith in an advertisement indicates a religious preference.",
    instead: "Remove it. Listing places of worship as one of several nearby amenities is safer than naming one.",
  },
  {
    phrase: "church nearby",
    basis: "Religion",
    why: "Singling out one type of religious building signals a preference.",
    instead: "'Shops, schools and places of worship within half a mile.'",
  },
  {
    phrase: "exclusive",
    basis: "Race / national origin",
    why: "Historically used to signal who was kept out; HUD guidance treats it as loaded.",
    instead: "'Gated' or 'private road', if that is the actual feature.",
  },
  {
    phrase: "restricted",
    basis: "Race / national origin",
    why: "Directly echoes racially restrictive covenants.",
    instead: "State the real restriction — 'HOA rules limit short-term lets'.",
  },
  {
    phrase: "safe neighborhood",
    basis: "Race / national origin",
    why: "Crime coding has repeatedly been read as a proxy for the racial make-up of an area.",
    instead: "Give a verifiable fact, or point buyers to public crime statistics themselves.",
  },
  {
    phrase: "safe neighbourhood",
    basis: "Race / national origin",
    why: "Crime coding has repeatedly been read as a proxy for the racial make-up of an area.",
    instead: "Give a verifiable fact, or point buyers to public crime statistics themselves.",
  },
  {
    phrase: "good schools",
    basis: "Race / national origin",
    why: "School-quality claims are a well-documented steering proxy and are rarely verifiable.",
    instead: "Name the district and let the buyer look up the ratings.",
  },
  {
    phrase: "integrated",
    basis: "Race",
    why: "Describes the racial composition of an area, which an advertisement may not do.",
    instead: "Delete.",
  },
  {
    phrase: "traditional neighborhood",
    basis: "Race / national origin",
    why: "Frequently used as a coded description of who lives in an area.",
    instead: "Describe the architecture: '1920s brick terraces'.",
  },
  {
    phrase: "handicapped",
    basis: "Disability",
    why: "Outdated term; describing occupants rather than the building invites a preference reading.",
    instead: "State the feature: 'step-free entrance, 36-inch doorways'.",
  },
  {
    phrase: "able-bodied",
    basis: "Disability",
    why: "Sets a physical requirement on the occupant.",
    instead: "Describe the access honestly: 'third floor, no lift'.",
  },
  {
    phrase: "walking distance",
    basis: "Disability",
    why: "Assumes an ability; HUD guidance prefers a measured distance.",
    instead: "'0.4 miles to the station.'",
  },
  {
    phrase: "no wheelchairs",
    basis: "Disability",
    why: "An outright exclusion on the basis of disability.",
    instead: "Describe the physical limitation of the building, never a rule about people.",
  },
  {
    phrase: "must be employed",
    basis: "Source of income (state and city law)",
    why: "Many jurisdictions protect lawful source of income, including benefits and vouchers.",
    instead: "State an income multiple applied to every applicant equally.",
  },
  {
    phrase: "no section 8",
    basis: "Source of income (state and city law)",
    why: "Refusing housing vouchers is unlawful in a growing list of states and cities.",
    instead: "Remove it and apply the same written criteria to all applicants.",
  },
];

export const CATEGORIES = [
  "Listings",
  "Prospecting",
  "Neighbourhood",
  "Buyers",
  "Negotiation",
  "Follow-up",
];

export const PROMPTS = [
  {
    id: "listing-description",
    title: "Listing description from the raw facts",
    category: "Listings",
    goal: "Turn a fact sheet into copy that sells the house without inventing anything.",
    tags: ["listing", "description", "copywriting", "mls"],
    tip: "Every adjective should be traceable to a fact you gave it — if it is not, cut it.",
    variables: [
      { key: "property", label: "Property basics", placeholder: "1930s semi-detached, 3 bed, 1.5 bath, 1,280 sq ft, Didsbury" },
      { key: "features", label: "Features worth naming", placeholder: "original parquet, south-facing garden, rewired 2022, loft conversion" },
      { key: "flaws", label: "Honest drawbacks", placeholder: "single glazing at the front, kitchen dated, on-street parking only" },
      { key: "buyer", label: "Most likely buyer", placeholder: "second-steppers moving out of a city-centre flat" },
    ],
    template: `Write a property listing description.

Property: {{property}}
Features worth naming: {{features}}
Honest drawbacks: {{flaws}}
Most likely buyer: {{buyer}}

Give me three versions: a 60-word portal summary, a 180-word full description, and a 25-word social caption.

Rules: lead with the single most distinctive thing about the house, not with "welcome to" or "nestled". Every claim must trace back to a fact I gave you — invent nothing about the schools, the commute, the neighbours or the area. Describe the property, never the sort of person who should buy it: no "perfect for families", "ideal for a young professional", "safe area" or "good schools". Replace "walking distance" with a measured distance if I gave you one, otherwise omit it. Use no more than four adjectives in the whole 180-word version.

Handle the drawbacks by naming the two that a buyer will notice at the viewing anyway, framed factually. Then list separately, outside the copy, anything I wrote that you think would breach fair housing advertising rules or a portal's accuracy policy, and why.`,
  },
  {
    id: "listing-headline",
    title: "Headline and first-photo caption set",
    category: "Listings",
    goal: "Ten headlines that survive a scroll on a portal results page.",
    tags: ["headline", "portal", "caption", "listing"],
    tip: "The headline competes against twenty thumbnails, not against other prose — specificity beats mood.",
    variables: [
      { key: "property", label: "Property in one line", placeholder: "3-bed Victorian terrace with a rebuilt rear extension" },
      { key: "hook", label: "The one thing that makes it different", placeholder: "double-height garden room with underfloor heating" },
      { key: "price_position", label: "Where the price sits", placeholder: "GBP 425k, about 4% under the street average" },
      { key: "portal", label: "Where it will run", placeholder: "Rightmove and Instagram" },
    ],
    template: `Write listing headlines for {{portal}}.

Property: {{property}}
The one thing that makes it different: {{hook}}
Where the price sits: {{price_position}}

Give ten headlines under 65 characters each. Vary the angle: the standout feature, the number, the trade-off, the constraint, the specific location detail. No "stunning", "must see", "dream home", "hidden gem", "nestled", "boasts" or exclamation marks. No claim about the buyer or the neighbourhood's character.

Then give the caption for the lead photograph in under 20 words, and a one-line reason each of your top three headlines would stop a scroll. Finally, say which headline you would not run and why.`,
  },
  {
    id: "listing-video-script",
    title: "Ninety-second walkthrough video script",
    category: "Listings",
    goal: "A shot list and voiceover a phone camera can actually execute.",
    tags: ["video", "walkthrough", "script", "reel"],
    tip: "Shoot the route a buyer walks, not the route that shows the most rooms.",
    variables: [
      { key: "property", label: "Property", placeholder: "2-bed ground-floor flat with private courtyard" },
      { key: "route", label: "The natural route through it", placeholder: "front door, hall, kitchen-diner, courtyard, back to bedrooms" },
      { key: "highlight", label: "The moment worth building to", placeholder: "sliding doors open onto the courtyard" },
      { key: "audience", label: "Who this is for", placeholder: "first-time buyers on Instagram Reels" },
    ],
    template: `Write a 90-second property walkthrough script for {{audience}}.

Property: {{property}}
Natural route through it: {{route}}
The moment worth building to: {{highlight}}

Give a table: timestamp, shot (what the camera does, phone-handheld only), what is on screen, and the voiceover line. Keep the whole voiceover under 200 words so it can be read unhurried.

The first three seconds must show {{highlight}} or its result — do not open on the front elevation. Build the rest as the route, ending on the detail a buyer would remember. Include one silent beat where the room speaks for itself.

Describe only what the camera can show. No claims about the area, the schools, the neighbours or the type of household who would suit it. Add: the three shots most likely to look bad on a phone and how to avoid them, plus on-screen text for the two moments that need it because people watch muted.`,
  },
  {
    id: "seller-valuation-letter",
    title: "Valuation appointment outreach",
    category: "Prospecting",
    goal: "A letter or email that earns a valuation without pretending you have a buyer.",
    tags: ["prospecting", "seller", "valuation", "letter"],
    tip: "A fake 'I have a buyer for your house' letter costs you the instruction the moment they ask who.",
    variables: [
      { key: "area", label: "Street or area", placeholder: "Elm Grove and the surrounding streets, Southsea" },
      { key: "evidence", label: "Real local evidence you hold", placeholder: "sold 4 on this street in 14 months, average 1.5% over asking" },
      { key: "trigger", label: "Why write now", placeholder: "two similar houses came to market last month and both went under offer in 10 days" },
      { key: "ask", label: "The ask", placeholder: "a 20-minute valuation, no obligation, evenings available" },
    ],
    template: `Write seller prospecting outreach for {{area}}.

Real local evidence I hold: {{evidence}}
Why I am writing now: {{trigger}}
The ask: {{ask}}

Produce three things: a letter of under 150 words for a printed drop, an email of under 100 words, and a follow-up message for anyone who replies with a question but does not book.

Rules: lead with the evidence, in numbers. Do not claim to have a specific buyer unless I said I do. No fake scarcity, no "the market is moving fast" without the figure that proves it, no "I was just in the area". Make the ask small and specific, and say plainly what happens if they decide not to sell.

Add a version of the letter for a homeowner whose listing with another agent has just expired, and note the one line in it that would be unwise to send too soon.`,
  },
  {
    id: "expired-withdrawn-script",
    title: "Expired or withdrawn listing call script",
    category: "Prospecting",
    goal: "A call that diagnoses why it did not sell instead of blaming the last agent.",
    tags: ["expired", "call script", "prospecting", "listing"],
    tip: "Criticising the previous agent tells the seller you will criticise them next.",
    variables: [
      { key: "property", label: "The property", placeholder: "4-bed detached, listed 7 months, two price reductions, withdrawn" },
      { key: "observation", label: "What you noticed about the campaign", placeholder: "12 dark photos, no floorplan, priced 9% above the last comparable" },
      { key: "seller_situation", label: "What you know about the seller", placeholder: "relocating for work in the spring, already viewed onward properties" },
      { key: "approach", label: "What you would do differently", placeholder: "reshoot, floorplan, relaunch at 429k with a launch weekend" },
    ],
    template: `Write a call script for an expired or withdrawn listing.

Property: {{property}}
What I noticed about the campaign: {{observation}}
What I know about the seller: {{seller_situation}}
What I would do differently: {{approach}}

Give the opener in under 20 seconds, including a straight permission question. Then five diagnostic questions in the order I should ask them, designed to let the seller reach their own conclusion about what went wrong.

Never criticise the previous agent by name or implication — if the seller does it, give me the line that stays neutral. Do not promise a price; give the sentence that explains why I will not quote one on the phone.

Handle these responses word for word: "we've decided not to move", "we're going back with the same agent", "what would you list it at", "every agent says the same thing", and "just send me something in writing". Each gets one honest reply and a clean exit if the answer is still no.`,
  },
  {
    id: "neighbourhood-guide",
    title: "Neighbourhood guide that avoids steering",
    category: "Neighbourhood",
    goal: "Useful area content built on facts a buyer can check, not on who lives there.",
    tags: ["neighbourhood", "area guide", "content", "fair housing"],
    tip: "Steering is unlawful even when it is well meant — describe the place, and let the buyer judge the fit.",
    variables: [
      { key: "area", label: "Area", placeholder: "Chorlton, south Manchester" },
      { key: "facts", label: "Checkable facts you have", placeholder: "Metrolink 12 min to city centre, market on Sat, 3 parks, 1890s-1930s housing stock" },
      { key: "amenities", label: "Amenities worth listing", placeholder: "two GP surgeries, library, leisure centre, 40+ independent shops" },
      { key: "audience", label: "Who will read it", placeholder: "buyers relocating from outside the city" },
    ],
    template: `Write a neighbourhood guide to {{area}} for {{audience}}.

Checkable facts I have: {{facts}}
Amenities worth listing: {{amenities}}

Roughly 500 words, organised as: getting around, what the housing stock is like, day-to-day amenities, green space, and what the area does not have.

Hard constraints, because area copy is where fair housing rules are usually broken: describe the place, never the people. No statement or implication about the racial, religious, ethnic, age or family make-up of residents. No "safe", "up-and-coming", "family neighbourhood", "student area", "good schools" or "the right sort of area". Name school districts factually and tell the reader to check the ratings themselves. Give distances in miles or minutes, not "walking distance".

Every fact must come from what I gave you — if you need something I did not supply, list it at the end as "verify before publishing" rather than filling it in. Finish with the honest downsides paragraph, since leaving it out is what makes area guides read as marketing.`,
  },
  {
    id: "market-update",
    title: "Monthly market update from your own numbers",
    category: "Neighbourhood",
    goal: "A short update that reads as analysis rather than as a boast.",
    tags: ["market update", "newsletter", "data", "content"],
    tip: "One clear number a reader can act on beats six charts they will not read.",
    variables: [
      { key: "area", label: "Area and period", placeholder: "SW18, quarter to September" },
      { key: "numbers", label: "Your actual figures", placeholder: "62 sales, median 612k, 38 days to offer, 2.1% below asking, stock up 14%" },
      { key: "comparison", label: "What to compare against", placeholder: "same quarter last year: 71 sales, 34 days, 0.8% below asking" },
      { key: "audience", label: "Who reads it", placeholder: "past clients and local homeowners on the mailing list" },
    ],
    template: `Write a market update for {{area}} aimed at {{audience}}.

My figures: {{numbers}}
Compared against: {{comparison}}

Under 350 words. Open with the single number that matters most this period and say plainly what changed. Then three short sections: what the data shows, what it means for someone thinking of selling, and what it means for someone buying.

Use only the figures I gave you. Do not forecast prices, do not say the market is "strong", "booming" or "correcting", and do not imply that now is always the right time to act. Where the data is ambiguous, say so — a small sample over one quarter usually is.

Give the subject line, a one-line preview text, and the closing paragraph. Then list the two questions a sceptical reader would ask about these numbers, and how I should answer them honestly.`,
  },
  {
    id: "buyer-needs-brief",
    title: "Buyer needs brief and search criteria",
    category: "Buyers",
    goal: "Separate what a buyer says they want from what they will actually accept.",
    tags: ["buyer", "requirements", "brief", "qualification"],
    tip: "The trade-off question tells you more than the wish list ever will.",
    variables: [
      { key: "buyer", label: "Buyer situation", placeholder: "couple, first-time buyers, 78k deposit, agreement in principle to 340k" },
      { key: "wants", label: "What they say they want", placeholder: "3 beds, garden, parking, near the station, period property" },
      { key: "constraints", label: "Hard constraints", placeholder: "must be within 25 min of the hospital, cat, no chain preferred" },
      { key: "market", label: "What the market actually offers at that budget", placeholder: "at 340k it is 2-bed period or 3-bed 1990s estate, rarely both" },
    ],
    template: `Build a buyer needs brief.

Buyer situation: {{buyer}}
What they say they want: {{wants}}
Hard constraints: {{constraints}}
What the market actually offers at that budget: {{market}}

Give me: a structured brief separating must-haves from nice-to-haves; the five questions that would test whether each "must" is genuine; and the three trade-off questions that force a choice between two things they said they wanted.

Then the honest conversation: the gap between the wish list and {{market}}, written as I would say it out loud, without discouraging them and without pretending the gap is smaller than it is.

Also give the questions I still need answered about their finances and timing before I spend a Saturday on viewings, and a plain sentence explaining that I will show them everything matching the brief and cannot advise on whether an area suits them personally.`,
  },
  {
    id: "viewing-feedback",
    title: "Viewing feedback for the seller",
    category: "Buyers",
    goal: "Feedback that is useful, honest and does not read as a nudge to drop the price.",
    tags: ["feedback", "viewing", "seller", "communication"],
    tip: "Feedback with no pattern in it is not feedback yet — say so rather than manufacturing one.",
    variables: [
      { key: "property", label: "Property and campaign so far", placeholder: "3-bed semi, 5 weeks on, 11 viewings, one offer 6% under" },
      { key: "comments", label: "What viewers actually said", placeholder: "4 mentioned the small third bedroom, 3 the busy road, 2 loved the garden" },
      { key: "seller_state", label: "Where the seller is", placeholder: "anxious, has already offered on an onward purchase" },
      { key: "recommendation", label: "What you actually think", placeholder: "declutter the third bedroom, reshoot, hold price two more weeks" },
    ],
    template: `Write a viewing feedback update for a seller.

Property and campaign so far: {{property}}
What viewers actually said: {{comments}}
Where the seller is: {{seller_state}}
What I actually think: {{recommendation}}

Under 250 words. Structure: the numbers this fortnight, the pattern in the comments, the one thing we can change, and the recommendation with the reason behind it.

Report the comments as viewers said them, including the unflattering ones, without softening them into meaninglessness. Distinguish clearly between a pattern (three or more people saying the same thing) and a one-off. If a price change is the honest recommendation, say so directly with the comparable evidence; if it is not, say that too rather than hinting.

Given {{seller_state}}, add the reassurance that is actually true and nothing more. Finish with the specific next step and the date I will report again.`,
  },
  {
    id: "offer-presentation",
    title: "Presenting an offer to the seller",
    category: "Negotiation",
    goal: "Present the whole offer — price, position, timing and risk — not just the number.",
    tags: ["offer", "negotiation", "seller", "presentation"],
    tip: "A lower cash offer with no chain often beats a higher one; the job is to show why.",
    variables: [
      { key: "offer", label: "The offer", placeholder: "412k against 425k asking, first-time buyer, 25% deposit, mortgage agreed in principle" },
      { key: "buyer_position", label: "Buyer's position", placeholder: "no chain, renting on a rolling contract, can complete in 8 weeks" },
      { key: "context", label: "Campaign context", placeholder: "6 weeks on market, 14 viewings, one earlier offer at 405k withdrawn" },
      { key: "seller_goal", label: "What the seller needs", placeholder: "at least 415k to fund the onward purchase, wants to move by Easter" },
    ],
    template: `Help me present an offer to my seller.

The offer: {{offer}}
Buyer's position: {{buyer_position}}
Campaign context: {{context}}
What the seller needs: {{seller_goal}}

Write the message I send, under 300 words: the offer in full — price, deposit, funding, chain, timescale, conditions — then the strengths, then the risks, then my recommendation and the reason for it.

Value the non-price terms explicitly: say what the absence of a chain and an eight-week completion are plausibly worth against the gap to {{seller_goal}}, and show the reasoning so the seller can disagree with it.

Then give three counter-offer options with the likely reaction to each, the point at which pushing risks losing the buyer, and the questions to ask the buyer's agent before we counter. Do not tell the seller what to feel and do not present my recommendation as the only sensible choice.`,
  },
  {
    id: "difficult-conversation",
    title: "Price reduction or bad news conversation",
    category: "Negotiation",
    goal: "Deliver the news early, with evidence, and without hedging.",
    tags: ["price reduction", "bad news", "seller", "conversation"],
    tip: "The version that is hard to say in week six is much harder in week sixteen.",
    variables: [
      { key: "situation", label: "What has happened", placeholder: "9 weeks, 6 viewings, no offers, two comparables sold 5% below our asking" },
      { key: "evidence", label: "Evidence you can show", placeholder: "portal views down 60% after week 3, both comparables sold within 3 weeks of listing" },
      { key: "recommendation", label: "What you are recommending", placeholder: "reduce from 465k to 439k and relaunch with new photography" },
      { key: "relationship", label: "The relationship", placeholder: "repeat client, sold their last house, expects candour" },
    ],
    template: `Help me have a difficult conversation with a seller.

What has happened: {{situation}}
Evidence I can show: {{evidence}}
What I am recommending: {{recommendation}}
The relationship: {{relationship}}

Give me: the opening two sentences that state the position without a warm-up; the evidence in the order that makes the conclusion obvious before I state it; the recommendation with the specific number and date; and the plain answer to "so you got the price wrong at the start".

Handle these reactions in the seller's likely words: anger, bargaining down to a smaller reduction, "let's give it another month", and silence. For each, one honest reply, and for the smaller reduction, the arithmetic on why a token cut usually fails to reset a listing.

Do not blame the market for something within my control, do not use "we" where I mean "I", and do not soften the number. End with what I commit to doing differently if they agree, written as a checklist with dates.`,
  },
  {
    id: "post-completion-followup",
    title: "Post-completion follow-up and referral ask",
    category: "Follow-up",
    goal: "Stay useful after the keys change hands without becoming a monthly newsletter nobody opens.",
    tags: ["referral", "past client", "follow up", "review"],
    tip: "Ask for the review the week they are happiest, and never bundle it with a request for referrals.",
    variables: [
      { key: "client", label: "Client and transaction", placeholder: "the Ahmeds, sold and bought through me, completed 2 weeks ago" },
      { key: "detail", label: "Something specific you remember", placeholder: "the survey scare over the chimney breast, resolved in four days" },
      { key: "useful_thing", label: "Something genuinely useful you can send", placeholder: "list of local trades I actually use, plus the council bin calendar" },
      { key: "goal", label: "What you want eventually", placeholder: "a Google review, and to be the name they give a neighbour" },
    ],
    template: `Write a post-completion follow-up sequence for {{client}}.

Something specific I remember: {{detail}}
Something genuinely useful I can send: {{useful_thing}}
What I want eventually: {{goal}}

Four touches over twelve months. Touch one lands in the first fortnight and asks for nothing. Each later touch needs its own reason to exist — a useful thing, a relevant local fact, an anniversary that means something to them rather than to me.

Only one touch may contain the review request. Write it so declining is easy, name the platform, and say roughly how long it takes. Never ask for a review and a referral in the same message. No "hope you're settling in well" as the entire content of a message.

For each touch give the timing, the channel, the subject line and the body under 90 words. Then say which touch is most likely to feel intrusive and what would make it welcome instead.`,
  },
];

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

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

function escapeForRegExp(value) {
  return String(value).replace(REGEX_SPECIALS, "\\$&");
}

/**
 * Screen free text for phrases that HUD advertising guidance and NAR fair housing
 * training repeatedly flag under 42 U.S.C. § 3604(c). Matching is whole-phrase and
 * case-insensitive. This is a drafting aid, not legal clearance.
 *
 * @param {string} text Listing or marketing copy to screen.
 * @returns {object} { flags, flagCount, clean, checkedPhrases } or { error }.
 */
export function checkFairHousingLanguage(text) {
  if (typeof text !== "string") {
    return { error: "Give the copy to screen as text." };
  }
  const haystack = text.toLowerCase();
  const flags = [];

  for (const entry of RISKY_LISTING_PHRASES) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeForRegExp(entry.phrase)}([^a-z0-9]|$)`, "i");
    if (pattern.test(haystack)) {
      flags.push(entry);
    }
  }

  return {
    flags,
    flagCount: flags.length,
    clean: flags.length === 0,
    checkedPhrases: RISKY_LISTING_PHRASES.length,
  };
}

/**
 * Substitute values into a template.
 * Blank or missing values keep their {{placeholder}} visible and are reported
 * in `missing` so nothing silently disappears from the copied prompt.
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

  // Screen only what the agent typed. The templates deliberately quote risky
  // phrases in order to forbid them, so screening the whole assembled prompt
  // would flag its own instructions.
  const suppliedText = variables
    .map((key) => (supplied[key] === undefined || supplied[key] === null ? "" : String(supplied[key])))
    .join(" \n ");
  const fairHousing = checkFairHousingLanguage(suppliedText);

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
    fairHousingFlags: fairHousing.flags,
    fairHousingClean: fairHousing.clean,
  };
}

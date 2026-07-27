/**
 * Indian startup pitch prompt builder — pure logic.
 *
 * The finance in this file uses only standard, uncontroversial definitions:
 *   runway (months)   = cash in bank / net monthly burn
 *   post-money value  = round size / equity fraction sold
 *   pre-money value   = post-money - round size
 * Nothing here is investment advice; it is arithmetic on numbers you supply.
 */

/** One crore = 10,000,000 rupees. */
export const CRORE = 1e7;
/** One lakh = 100,000 rupees. */
export const LAKH = 1e5;
/**
 * Founders conventionally start the next raise about 6 months before cash
 * runs out, because a priced round in India typically takes 4-6 months from
 * first meeting to money in the bank.
 */
export const RAISE_LEAD_MONTHS = 6;

export const MIN_PITCH_MINUTES = 2;
export const MAX_PITCH_MINUTES = 60;

/** Funding stages and what an investor is actually testing at each one. */
export const STAGES = {
  idea: {
    label: "Idea / pre-product",
    focus: "Whether the problem is real and painful, and whether this team is the one to solve it.",
    proof: "Customer discovery interviews, letters of intent, a waitlist, a working prototype.",
  },
  "pre-seed": {
    label: "Pre-seed",
    focus: "Whether an early version of the product creates repeatable value for a narrow group.",
    proof: "First 10-50 users, weekly usage, a signed pilot, early revenue however small.",
  },
  seed: {
    label: "Seed",
    focus: "Whether there is product-market fit worth pouring money into.",
    proof: "Month-on-month growth, retention cohorts, first repeatable acquisition channel, early unit economics.",
  },
  "series-a": {
    label: "Series A",
    focus: "Whether growth is a machine that money makes faster, not a series of one-off wins.",
    proof: "Predictable pipeline, CAC payback, net revenue retention, gross margin trend, a second channel working.",
  },
  "series-b": {
    label: "Series B and beyond",
    focus: "Whether the business scales without margin collapse, and whether the market is big enough to matter.",
    proof: "Multi-region or multi-product traction, contribution margin, cohort payback, org depth below the founders.",
  },
};

/** Sector-specific questions Indian investors reliably ask. */
export const SECTORS = {
  saas: {
    label: "B2B SaaS",
    questions:
      "ARR and its growth rate, net revenue retention, logo vs revenue churn, CAC payback in months, India-vs-global pricing, and whether you can sell to US buyers from India.",
  },
  d2c: {
    label: "D2C / consumer brand",
    questions:
      "Contribution margin after all delivery and return costs, repeat rate by cohort, blended vs marginal CAC, share of revenue from marketplaces vs own site, and working capital tied up in inventory.",
  },
  fintech: {
    label: "Fintech",
    questions:
      "Which RBI licence or partner licence you operate under, take rate, credit loss assumptions if you lend, customer acquisition cost against lifetime take, and how you handle KYC and data localisation.",
  },
  agritech: {
    label: "Agritech",
    questions:
      "Farmer acquisition cost, seasonality of revenue, working capital cycle, dependence on mandi or FPO relationships, and how you handle logistics in Tier-3 and rural districts.",
  },
  edtech: {
    label: "Edtech",
    questions:
      "Completion rate, outcome evidence, refund and dropout rate, parent-vs-learner decision maker, and whether growth depends on paid ads or on referrals.",
  },
  healthtech: {
    label: "Healthtech",
    questions:
      "Clinical validation, regulatory path, doctor or hospital adoption cycle, insurance and payer dynamics in India, and unit economics per consultation or per test.",
  },
  logistics: {
    label: "Logistics / supply chain",
    questions:
      "Cost per shipment, density economics by pin code, asset-light vs asset-heavy mix, and how margins hold when fuel or labour costs move.",
  },
  marketplace: {
    label: "Marketplace",
    questions:
      "Take rate, liquidity by city or category, supply-side retention, share of repeat GMV, and how much of demand is paid versus organic.",
  },
  deeptech: {
    label: "Deeptech / AI",
    questions:
      "What is genuinely defensible, cost per inference or per unit, dependence on third-party models or fabs, IP position, and the length of the enterprise sales cycle.",
  },
  climate: {
    label: "Climate / energy",
    questions:
      "Payback period for the customer, dependence on subsidy or policy, unit cost curve, and project finance structure if capex sits on your balance sheet.",
  },
};

/** Deliverables this builder can write a prompt for. */
export const DECK_TYPES = {
  "pitch-deck": {
    label: "Full pitch deck",
    brief: "a slide-by-slide pitch deck outline with the exact headline and the three supporting points for each slide",
  },
  "one-pager": {
    label: "One-pager / teaser",
    brief: "a single-page investor teaser that survives being forwarded without you in the room",
  },
  "investor-update": {
    label: "Monthly investor update",
    brief: "a monthly investor update email in the standard format: highlights, lowlights, metrics, asks",
  },
  "demo-day": {
    label: "Demo day script",
    brief: "a spoken demo-day script with timings, written to be said out loud rather than read",
  },
  "cold-email": {
    label: "Cold intro email to a VC",
    brief: "a cold outreach email under 150 words that earns a first meeting, plus two follow-up variants",
  },
};

/**
 * Pitch slide structure with the share of speaking time each slide deserves.
 * Weights sum to exactly 100.
 */
export const PITCH_SLIDES = [
  ["Problem", 10, "The pain, who has it, and how they cope today."],
  ["Solution", 10, "What you built and why it beats the workaround."],
  ["Product", 12, "A concrete walkthrough, not adjectives."],
  ["Market size", 8, "TAM, SAM and SOM built bottom-up from real Indian unit counts."],
  ["Business model", 8, "How money is made, per unit, with the take rate stated."],
  ["Traction", 15, "The numbers that prove the last slide is happening."],
  ["Go-to-market", 8, "The channel that works and the cost of using it."],
  ["Competition", 7, "Honest positioning against Indian and global players."],
  ["Unit economics", 8, "CAC, contribution margin, payback."],
  ["Team", 6, "Why this team, on this problem, now."],
  ["Ask and use of funds", 8, "Amount, runway bought, and the milestones it unlocks."],
];

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Render a rupee amount in the Indian crore/lakh convention. */
export function toCroreLakh(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= CRORE) return `${sign}₹${round(abs / CRORE, 2)} Cr`;
  if (abs >= LAKH) return `${sign}₹${round(abs / LAKH, 2)} L`;
  return `${sign}₹${Math.round(abs)}`;
}

/**
 * Runway and valuation maths.
 * runway = cash / burn; post-raise runway = (cash + raise) / burn.
 * post-money = raise / (dilution/100); pre-money = post-money - raise.
 */
export function pitchFinancials({ cashInBank, monthlyBurn, raiseAmount, dilutionPct }) {
  const cash = Number(cashInBank);
  const burn = Number(monthlyBurn);
  const raise = Number(raiseAmount);
  const dilution = Number(dilutionPct);

  if (![cash, burn, raise, dilution].every(Number.isFinite)) {
    return { error: "Enter numbers for cash, burn, raise size and dilution." };
  }
  if (cash < 0 || raise < 0) return { error: "Cash and raise amount cannot be negative." };
  if (burn <= 0) return { error: "Monthly net burn must be greater than zero to compute runway." };
  if (dilution <= 0 || dilution >= 100) {
    return { error: "Dilution must be greater than 0% and less than 100%." };
  }

  const currentRunwayMonths = cash / burn;
  const postRaiseRunwayMonths = (cash + raise) / burn;
  const postMoney = raise / (dilution / 100);
  const preMoney = postMoney - raise;
  const startNextRaiseInMonths = postRaiseRunwayMonths - RAISE_LEAD_MONTHS;

  return {
    currentRunwayMonths: round(currentRunwayMonths, 1),
    postRaiseRunwayMonths: round(postRaiseRunwayMonths, 1),
    monthsBought: round(raise / burn, 1),
    postMoney: round(postMoney, 0),
    preMoney: round(preMoney, 0),
    startNextRaiseInMonths: round(Math.max(0, startNextRaiseInMonths), 1),
    raiseIsUrgent: currentRunwayMonths <= RAISE_LEAD_MONTHS,
  };
}

/**
 * Split the pitch into per-slide seconds using the largest-remainder method,
 * so the seconds always add back up to the full pitch length.
 */
export function allocatePitchTime(pitchMinutes) {
  const minutes = Number(pitchMinutes);
  if (!Number.isFinite(minutes)) return { error: "Enter the pitch length in minutes." };
  if (minutes < MIN_PITCH_MINUTES || minutes > MAX_PITCH_MINUTES) {
    return { error: `Pitch length must be between ${MIN_PITCH_MINUTES} and ${MAX_PITCH_MINUTES} minutes.` };
  }

  const totalSeconds = Math.round(minutes * 60);
  const exact = PITCH_SLIDES.map(([name, weight, note]) => ({
    name,
    weight,
    note,
    exact: (totalSeconds * weight) / 100,
  }));

  const slides = exact.map((item) => ({ ...item, seconds: Math.floor(item.exact) }));
  let remainder = totalSeconds - slides.reduce((sum, item) => sum + item.seconds, 0);
  const order = slides
    .map((item, index) => ({ index, frac: item.exact - Math.floor(item.exact) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  let cursor = 0;
  while (remainder > 0) {
    slides[order[cursor % order.length].index].seconds += 1;
    remainder -= 1;
    cursor += 1;
  }

  return {
    totalSeconds,
    slides: slides.map(({ name, weight, note, seconds }) => ({ name, weight, note, seconds })),
  };
}

/**
 * Compose the pitch prompt.
 * Returns { title, prompt, financials, timing, wordCount } or { error }.
 */
export function buildPitchPrompt({
  startupName,
  stage,
  sector,
  deckType,
  oneLiner,
  pitchMinutes,
  cashInBank,
  monthlyBurn,
  raiseAmount,
  dilutionPct,
  audience = "Indian early-stage VC",
}) {
  const stageSpec = STAGES[stage];
  if (!stageSpec) return { error: "Pick a funding stage." };
  const sectorSpec = SECTORS[sector];
  if (!sectorSpec) return { error: "Pick a sector." };
  const deckSpec = DECK_TYPES[deckType];
  if (!deckSpec) return { error: "Pick what you want written." };

  const name = String(startupName || "").trim();
  if (name.length < 2) return { error: "Enter your startup's name." };
  const summary = String(oneLiner || "").trim();
  if (summary.length < 10) {
    return { error: "Describe what you do in at least a short sentence (10 characters)." };
  }

  const financials = pitchFinancials({ cashInBank, monthlyBurn, raiseAmount, dilutionPct });
  if (financials.error) return { error: financials.error };

  const timing = allocatePitchTime(pitchMinutes);
  if (timing.error) return { error: timing.error };

  const slideLines = timing.slides.map(
    (slide) => `   - ${slide.name} (${slide.seconds}s, ${slide.weight}%): ${slide.note}`,
  );

  const lines = [
    `Act as a partner at an Indian early-stage venture fund who has sat through 2,000 pitches, and write ${deckSpec.brief} for the startup below.`,
    "",
    `Startup: ${name}`,
    `What it does: ${summary}`,
    `Sector: ${sectorSpec.label}`,
    `Stage: ${stageSpec.label}`,
    `Audience: ${audience}`,
    "",
    "Numbers to use exactly as given — do not round them into different figures or invent new ones:",
    `   - Cash in bank: ${toCroreLakh(Number(cashInBank))}`,
    `   - Net monthly burn: ${toCroreLakh(Number(monthlyBurn))}`,
    `   - Current runway: ${financials.currentRunwayMonths} months`,
    `   - Raise: ${toCroreLakh(Number(raiseAmount))} for ${Number(dilutionPct)}% equity`,
    `   - That implies a post-money of ${toCroreLakh(financials.postMoney)} and a pre-money of ${toCroreLakh(financials.preMoney)}`,
    `   - The raise buys ${financials.monthsBought} more months, taking runway to ${financials.postRaiseRunwayMonths} months`,
    "",
    `What this investor is testing at ${stageSpec.label}: ${stageSpec.focus}`,
    `Evidence they expect to see: ${stageSpec.proof}`,
    `Sector questions they will ask: ${sectorSpec.questions}`,
    "",
    `Timing — the pitch runs ${Math.round(timing.totalSeconds / 60)} minutes (${timing.totalSeconds} seconds). Budget it like this:`,
    ...slideLines,
    "",
    "Rules:",
    "1. Every claim must be traceable to a number I gave you or clearly marked [FOUNDER TO FILL]. Never invent traction, revenue, market size or customer names.",
    "2. Build market size bottom-up from countable Indian units (number of businesses, households, districts, transactions), not top-down from a report's headline figure.",
    "3. Use rupees in the Indian crore/lakh convention, and state the month for every metric.",
    "4. Write the way founders actually speak in a room — short sentences, no adjectives doing the work of evidence.",
    "5. For each section, add one line: 'Likely pushback:' with the sharpest question an investor would ask, and a one-line honest answer.",
    "6. Flag anything that would need a lawyer, auditor or the company secretary to confirm before it goes into a deck.",
    "",
    "Finish with a 'Weakest link' paragraph naming the single thing most likely to sink this pitch, and what evidence would fix it.",
  ];

  const prompt = lines.join("\n");

  return {
    title: `${name} — ${deckSpec.label} (${stageSpec.label})`,
    prompt,
    financials,
    timing,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}

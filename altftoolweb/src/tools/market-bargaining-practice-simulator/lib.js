/**
 * Bargaining practice simulator.
 *
 * This models a market haggle as the standard two-sided concession dance taught in
 * negotiation training, so you can rehearse the numbers before you are standing in
 * front of a stall with an audience.
 *
 * Three ideas do all the work:
 *
 * 1. MIRRORED ANCHORING. Splitting the difference is the default ending, so your
 *    opening counter should be placed such that the midpoint of the two anchors IS
 *    your target: counter = 2 × target − asking. If the seller opens at 3,000 and you
 *    want to pay 1,000, opening at 800 or 900 is not aggressive, it is arithmetic.
 *
 * 2. DIMINISHING CONCESSIONS. Each side gives away a shrinking share of the remaining
 *    gap. Shrinking steps are the signal that you are near your limit; equal-sized
 *    steps invite the other side to keep pushing.
 *
 * 3. A RESERVE PRICE. The seller has a floor they will not cross, and so should you.
 *    If your walk-away sits below their floor there is no deal to be had, and the model
 *    says so rather than inventing one.
 *
 * Every figure here is derived from your own inputs. The market presets are starting
 * assumptions to rehearse against, not measured statistics — the only reliable way to
 * learn a real local price is to ask a few sellers, or someone who is not selling.
 */

/**
 * Share of the remaining gap each side concedes per round. Both schedules shrink,
 * which is what a genuine approach to a reserve price looks like. The buyer's schedule
 * is deliberately slower than the seller's, because conceding more slowly than the
 * other side is the whole lever an unskilled haggler gives away.
 */
export const SELLER_CONCESSION_SCHEDULE = [0.4, 0.25, 0.15, 0.1, 0.05];
export const BUYER_CONCESSION_SCHEDULE = [0.3, 0.2, 0.12, 0.08, 0.05];

/**
 * An opening counter below this share of your target reads as an insult rather than an
 * offer and usually ends the conversation, so the mirrored anchor is floored here.
 */
export const ANCHOR_FLOOR_RATIO = 0.25;

/**
 * Two sides each conceding a shrinking share of the remaining gap converge on it
 * without ever crossing, which is a true description of the arithmetic and a false
 * description of a market. In practice, once the distance is small relative to the
 * price, somebody says "meet in the middle" and it closes. This is that threshold,
 * expressed as a share of the seller's current asking price.
 */
export const CLOSE_GAP_RATIO = 0.1;

/** Bounds on the inputs, to keep the model inside the range it was designed for. */
export const MAX_ROUNDS = 8;
export const MIN_ROUNDS = 1;
export const MAX_PERCENT = 500;

/**
 * Starting assumptions for rehearsal. openingMarkupPct is how far above a local price
 * the first quote typically sits, and sellerMinMarginPct is the margin below which a
 * seller normally stops. Treat both as adjustable dials, not facts about a country.
 */
export const MARKET_PRESETS = [
  {
    id: "tourist-stall",
    label: "Tourist-strip souvenir stall",
    openingMarkupPct: 200,
    sellerMinMarginPct: 25,
    note: "First quote commonly sits at several times the local price, and the seller expects a counter. Not countering is what surprises them.",
  },
  {
    id: "craft-market",
    label: "Craft or textile market",
    openingMarkupPct: 100,
    sellerMinMarginPct: 30,
    note: "Handmade goods carry real labour cost, so the floor is higher and grinding hard is poor form.",
  },
  {
    id: "produce-market",
    label: "Local produce market",
    openingMarkupPct: 25,
    sellerMinMarginPct: 10,
    note: "Margins are thin and prices are near-fixed. Bargaining hard over food is usually the wrong fight.",
  },
  {
    id: "antiques",
    label: "Antiques, carpets and jewellery",
    openingMarkupPct: 300,
    sellerMinMarginPct: 40,
    note: "Longest dance, largest spread, and the tea is part of the process. Authenticity risk matters more than the price.",
  },
  {
    id: "taxi-tuktuk",
    label: "Unmetered taxi or tuk-tuk fare",
    openingMarkupPct: 150,
    sellerMinMarginPct: 15,
    note: "Agree the number before getting in. Knowing the metered or app fare for the same route is the entire negotiation.",
  },
  {
    id: "fixed-price",
    label: "Fixed-price shop",
    openingMarkupPct: 0,
    sellerMinMarginPct: 0,
    note: "Marked prices, receipts and often a government or cooperative label. Haggling here is simply refused.",
  },
];

const isPositive = (value) => Number.isFinite(value) && value > 0;

const toNumber = (value) => {
  /* Number('') and Number(null) are 0, which would read as a free item, so blanks
     are rejected before coercion. */
  if (value === null || value === undefined || String(value).trim() === "") return NaN;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

const scheduleAt = (schedule, index) =>
  schedule[Math.min(index, schedule.length - 1)];

/**
 * Simulate a haggle and return the numbers to rehearse.
 *
 * @param {object} input
 * @param {number} input.askingPrice          the seller's opening quote
 * @param {number} input.fairPrice            what you believe a local pays
 * @param {number} input.touristPremiumPct    how much over the local price you accept paying
 * @param {number} input.sellerMinMarginPct   margin over the local price below which the seller stops
 * @param {number} input.walkAwayTolerancePct how far above your target you will still pay
 * @param {number} input.rounds               how many rounds of offers to model, 1–8
 * @returns {object} the plan and round-by-round ladder, or { error }
 */
export function simulateHaggle({
  askingPrice,
  fairPrice,
  touristPremiumPct = 20,
  sellerMinMarginPct = 25,
  walkAwayTolerancePct = 15,
  rounds = 5,
} = {}) {
  const asking = toNumber(askingPrice);
  const fair = toNumber(fairPrice);
  const premium = toNumber(touristPremiumPct);
  const sellerMargin = toNumber(sellerMinMarginPct);
  const tolerance = toNumber(walkAwayTolerancePct);
  const roundCount = Math.trunc(toNumber(rounds));

  if (!isPositive(asking)) return { error: "Enter the seller's asking price as a number above zero." };
  if (!isPositive(fair)) return { error: "Enter what you think a local pays, as a number above zero." };
  if (fair > asking) {
    return {
      error:
        "Your researched local price is above the asking price — the quote is already a good one, so buy it.",
    };
  }
  if (!Number.isFinite(premium) || premium < 0 || premium > MAX_PERCENT) {
    return { error: `Tourist premium must be between 0% and ${MAX_PERCENT}%.` };
  }
  if (!Number.isFinite(sellerMargin) || sellerMargin < 0 || sellerMargin > MAX_PERCENT) {
    return { error: `Seller's minimum margin must be between 0% and ${MAX_PERCENT}%.` };
  }
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > MAX_PERCENT) {
    return { error: `Walk-away tolerance must be between 0% and ${MAX_PERCENT}%.` };
  }
  if (!Number.isFinite(roundCount) || roundCount < MIN_ROUNDS || roundCount > MAX_ROUNDS) {
    return { error: `Model between ${MIN_ROUNDS} and ${MAX_ROUNDS} rounds.` };
  }

  const target = fair * (1 + premium / 100);
  if (target >= asking) {
    return {
      error:
        "Your target price already meets or exceeds the seller's quote — there's nothing to negotiate, buy it.",
    };
  }
  const walkAway = target * (1 + tolerance / 100);
  /* A seller's floor cannot sit above their own quote, so the reserve is capped at the
     asking price — otherwise a high assumed margin on a modestly marked-up item would
     produce a floor the seller has already undercut. */
  const sellerReserve = Math.min(fair * (1 + sellerMargin / 100), asking);

  /* Mirrored anchor: place the counter so the midpoint of the two anchors is the target.
     Defense in depth: also clamp to the asking price — the guard above already keeps this
     from firing in practice, but an opening counter can never rationally exceed the
     seller's own quote. */
  const mirroredAnchor = 2 * target - asking;
  const anchorFloor = target * ANCHOR_FLOOR_RATIO;
  const openingCounter = Math.min(Math.max(mirroredAnchor, anchorFloor), asking);
  const anchorWasFloored = mirroredAnchor < anchorFloor;

  /* If the seller cannot go as low as you will go, no agreement exists. */
  const zopaExists = sellerReserve <= walkAway;

  let sellerAsk = asking;
  let buyerOffer = openingCounter;
  const ladder = [];
  let dealPrice = null;
  let dealRound = null;
  let closedBySplit = false;

  for (let r = 0; r < roundCount; r += 1) {
    const gap = sellerAsk - buyerOffer;
    if (gap <= 0) {
      dealPrice = sellerAsk;
      dealRound = r;
      break;
    }

    const nextSellerAsk = Math.max(
      sellerReserve,
      sellerAsk - gap * scheduleAt(SELLER_CONCESSION_SCHEDULE, r),
    );
    const nextBuyerOffer = Math.min(
      walkAway,
      buyerOffer + gap * scheduleAt(BUYER_CONCESSION_SCHEDULE, r),
    );

    sellerAsk = nextSellerAsk;
    buyerOffer = nextBuyerOffer;

    const crossed = nextBuyerOffer >= nextSellerAsk;
    const remaining = Math.max(0, nextSellerAsk - nextBuyerOffer);
    /* Close by splitting the last small gap, clamped so neither side crosses its floor. */
    const splittable =
      !crossed && zopaExists && remaining <= nextSellerAsk * CLOSE_GAP_RATIO;
    const midpoint = (nextSellerAsk + nextBuyerOffer) / 2;

    ladder.push({
      round: r + 1,
      sellerAsk: nextSellerAsk,
      buyerOffer: nextBuyerOffer,
      gap: remaining,
      crossed,
      splittable,
    });

    if (crossed) {
      dealPrice = nextSellerAsk;
      dealRound = r + 1;
      closedBySplit = false;
      break;
    }
    if (splittable) {
      dealPrice = Math.min(Math.max(midpoint, sellerReserve), walkAway);
      dealRound = r + 1;
      closedBySplit = true;
      break;
    }
  }

  const finalGap = Math.max(0, sellerAsk - buyerOffer);
  const settled = dealPrice !== null;

  /**
   * Shrinking concessions converge slowly, so an honest model often ends the rounds
   * still apart even when an overlap exists. That is exactly the moment the walk works:
   * a seller who has a floor below your walk-away will come to it rather than lose the
   * sale, so the price to expect on the way out is their reserve.
   */
  const walkAwayOffer = !settled && zopaExists ? sellerReserve : null;
  const priceToUse = settled ? dealPrice : null;
  const savingVsAsking = settled ? asking - dealPrice : null;
  const savingPct = settled ? ((asking - dealPrice) / asking) * 100 : null;
  const overFairPct = settled ? ((dealPrice - fair) / fair) * 100 : null;
  const openingAsShareOfAsking = (openingCounter / asking) * 100;

  const coaching = [];
  coaching.push(
    `Open at about ${Math.round(openingCounter).toLocaleString("en-IN")} — that is ${openingAsShareOfAsking.toFixed(0)}% of the quote, placed so that splitting the difference lands on your target.`,
  );
  if (anchorWasFloored) {
    coaching.push(
      "The mirrored anchor came out too low to say out loud, so it has been floored at a quarter of your target. When the spread is this wide, ask the seller for their best price first instead of countering.",
    );
  }
  coaching.push(
    "Concede in shrinking steps. Equal-sized concessions tell the seller there is more where that came from.",
  );
  coaching.push(
    `Decide now that ${Math.round(walkAway).toLocaleString("en-IN")} is your walk-away, and be willing to leave. Walking is what produces the final offer, and it only works if you meant it.`,
  );
  if (!zopaExists) {
    coaching.push(
      "On these assumptions the seller's floor sits above your walk-away, so there is no overlap. Either your researched price is too low or this stall is not the one.",
    );
  }
  if (walkAwayOffer !== null) {
    coaching.push(
      `Still apart after ${roundCount} rounds, which is normal — shrinking concessions converge slowly. Thank them and start leaving; the seller's floor here is about ${Math.round(walkAwayOffer).toLocaleString("en-IN")}, and that is the number to expect called after you.`,
    );
  }
  if (closedBySplit) {
    coaching.push(
      "The close here is the classic one: with the gap down to a token amount, somebody proposes meeting in the middle. Let it be them, and let the split be from your number.",
    );
  }
  if (settled && overFairPct !== null && overFairPct <= 0) {
    coaching.push(
      "This lands at or below the local price you researched, which is unlikely in practice — check that the researched figure is real.",
    );
  }

  return {
    asking,
    fair,
    target,
    walkAway,
    sellerReserve,
    openingCounter,
    openingAsShareOfAsking,
    anchorWasFloored,
    zopaExists,
    ladder,
    settled,
    closedBySplit,
    walkAwayOffer,
    dealPrice: priceToUse,
    dealRound,
    finalGap,
    savingVsAsking,
    savingPct,
    overFairPct,
    coaching,
  };
}

export default simulateHaggle;

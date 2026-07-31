import assert from "node:assert/strict";
import test from "node:test";

import {
  analyseOffer,
  buildSchedule,
  compareOffers,
  emiForFlatRate,
  flatToReducing,
  MONTHS_PER_YEAR,
  solveIrr,
} from "./lib.js";

// RBI circular RBI/2024-25/18, DOR.STR.REC.13/13.03.00/2024-25 dated 15 April 2024, "Key Facts
// Statement (KFS) for Loans & Advances", Annex B illustration: 20,000 sanctioned, 24 EMIs of
// 970, 400 of fees, net disbursed 19,600. Running that cash-flow series through solveIrr and
// annualising nominally (x12) gives 17.10%, not 17.07% — this is the regression test referenced
// by the comment at the top of lib.js.
test("solveIrr reproduces the RBI KFS Annex B illustration's cash flows at 17.10% nominal APR", () => {
  const netDisbursed = 20000 - 400;
  const flows = [netDisbursed, ...Array(24).fill(-970)];
  const monthlyIrr = solveIrr(flows);
  const aprNominalPct = monthlyIrr * MONTHS_PER_YEAR * 100;
  assert.equal(Number(aprNominalPct.toFixed(2)), 17.1);
});

test("emiForFlatRate agrees with buildSchedule's flat-rate EMI for the same inputs", () => {
  const principal = 100000;
  const rate = 10;
  const tenure = 36;
  const emi = emiForFlatRate(principal, rate, tenure);
  const schedule = buildSchedule({
    financedPrincipal: principal,
    rateType: "flat",
    nominalRatePct: rate,
    tenureMonths: tenure,
  });
  assert.equal(emi, schedule[0].instalment);
});

test("emiForFlatRate agrees with flatToReducing's internal EMI for the same inputs", () => {
  const principal = 100000;
  const rate = 10;
  const tenure = 36;
  const emi = emiForFlatRate(principal, rate, tenure);
  const gap = flatToReducing(principal, rate, tenure);
  // flatToReducing rounds its returned emi to 2dp; emiForFlatRate does not, so compare rounded.
  assert.equal(Math.round(emi * 100) / 100, gap.emi);
});

test("a shorter-tenure offer that outruns the comparison horizon reports its own natural finish, not a foreclosure", () => {
  const offerA = {
    label: "Offer A",
    principal: "500000",
    tenureMonths: "60",
    nominalRatePct: "14",
    rateType: "reducing",
    rateBasis: "fixed",
    processingFeeMode: "percent",
    processingFeeValue: "0",
    otherChargesAmount: "0",
    insuranceAmount: "0",
    insuranceFinanced: false,
    gstOnFeesPct: "18",
    foreclosurePenaltyPct: "0",
  };
  const offerB = {
    ...offerA,
    label: "Offer B",
    tenureMonths: "24",
    nominalRatePct: "9",
  };
  const result = compareOffers({ offers: [offerA, offerB], horizonMonths: 40, includeInsuranceInApr: true });
  const b = result.offers.find((offer) => offer.label === "Offer B");
  assert.equal(b.forecloses, false);
  assert.equal(b.horizon.months, 24);
  assert.equal(result.lowestHorizonAprLabel, "Offer B");
});

test("analyseOffer no longer exposes the unused equivalentFlatRatePct field", () => {
  const result = analyseOffer(
    {
      label: "Offer",
      principal: "100000",
      tenureMonths: "36",
      nominalRatePct: "10",
      rateType: "flat",
      processingFeeValue: "0",
    },
    { horizonMonths: 36 },
  );
  assert.equal(Object.hasOwn(result, "equivalentFlatRatePct"), false);
});

/**
 * Cost of taking a new domestic piped natural gas (PNG) connection, split the way it actually
 * lands: a refundable security deposit on one side, and non-refundable charges on the other.
 *
 * A city gas distributor's domestic connection bill is built from
 *   registration or application fee   (one-time, not refunded)
 * + interest-free security deposit    (refunded when you surrender the connection)
 * + installation / commissioning      (riser, meter, regulator, isolation valve)
 * + internal piping beyond the length included in a standard installation, per metre
 * + extra gas points beyond the first, per point
 * + core drilling and civil making-good
 * + appliance conversion, because an LPG hob's jets are sized for a different gas
 *
 * Only the non-refundable part is a real cost, so the payback against LPG is computed on that
 * and the deposit is shown separately. LPG and PNG are compared on energy, not volume: a
 * 14.2 kg domestic cylinder carries roughly the same energy as 16.7 SCM of piped gas.
 *
 * Every charge is an input. Tariff cards and connection schemes differ by distributor, by city
 * and by scheme, and are revised — take yours from the distributor's published schedule.
 */

/** Standard Indian domestic LPG cylinder. */
export const LPG_CYLINDER_KG = 14.2;
/** Approximate gross calorific values used for the energy equivalence. */
export const LPG_KCAL_PER_KG = 11000;
export const PNG_KCAL_PER_SCM = 9350;
/** Energy-equivalent piped gas for one domestic cylinder: about 16.7 SCM. */
export const SCM_PER_LPG_CYLINDER = (LPG_CYLINDER_KG * LPG_KCAL_PER_KG) / PNG_KCAL_PER_SCM;

/** Distributors normally include a short run of internal piping in a standard installation. */
export const DEFAULT_FREE_PIPING_M = 5;

export const MONTHS_PER_YEAR = 12;

/** Sanity ceilings. */
export const MAX_PIPING_M = 200;
export const MAX_POINTS = 20;

/**
 * @returns {{error:string}|object} refundable and non-refundable outlay, plus payback vs LPG
 */
export function estimatePngConnection({
  registrationFee = 0,
  securityDeposit = 0,
  installationCharge = 0,
  pipingMetres = 0,
  freePipingMetres = DEFAULT_FREE_PIPING_M,
  pipingRatePerMetre = 0,
  extraPoints = 0,
  ratePerPoint = 0,
  coreHoles = 0,
  coreRate = 0,
  applianceConversion = 0,
  civilWork = 0,
  lpgDepositRefund = 0,
  cylindersPerMonth = 0,
  cylinderPrice = 0,
  pngRatePerScm = 0,
  pngFixedPerMonth = 0,
}) {
  const numbers = [
    registrationFee,
    securityDeposit,
    installationCharge,
    pipingMetres,
    freePipingMetres,
    pipingRatePerMetre,
    extraPoints,
    ratePerPoint,
    coreHoles,
    coreRate,
    applianceConversion,
    civilWork,
    lpgDepositRefund,
    cylindersPerMonth,
    cylinderPrice,
    pngRatePerScm,
    pngFixedPerMonth,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((v) => v < 0)) {
    return { error: "Charges and quantities cannot be negative." };
  }
  if (pipingMetres > MAX_PIPING_M || freePipingMetres > MAX_PIPING_M) {
    return { error: `Internal piping must be ${MAX_PIPING_M} metres or less.` };
  }
  if (!Number.isInteger(extraPoints) || extraPoints > MAX_POINTS) {
    return { error: `Extra gas points must be a whole number, ${MAX_POINTS} or fewer.` };
  }
  if (!Number.isInteger(coreHoles) || coreHoles > 50) {
    return { error: "Core holes must be a whole number, 50 or fewer." };
  }
  if (cylindersPerMonth > 20) {
    return { error: "Cylinders per month must be 20 or fewer." };
  }

  const chargeablePipingM = Math.max(0, pipingMetres - freePipingMetres);
  const pipingCost = chargeablePipingM * pipingRatePerMetre;
  const pointsCost = extraPoints * ratePerPoint;
  const coreCost = coreHoles * coreRate;

  const nonRefundableItems = [
    ["Registration or application fee", registrationFee],
    ["Installation and commissioning", installationCharge],
    [`Internal piping (${chargeablePipingM.toFixed(1)} m beyond ${freePipingMetres} m free)`, pipingCost],
    [`Extra gas points (${extraPoints})`, pointsCost],
    [`Core drilling (${coreHoles} hole${coreHoles === 1 ? "" : "s"})`, coreCost],
    ["Appliance conversion", applianceConversion],
    ["Civil work and making good", civilWork],
  ];
  const nonRefundable = nonRefundableItems.reduce((sum, [, value]) => sum + value, 0);

  const upfrontTotal = nonRefundable + securityDeposit;
  const netUpfrontAfterLpgRefund = upfrontTotal - lpgDepositRefund;

  const monthlyLpgCost = cylindersPerMonth * cylinderPrice;
  const monthlyScm = cylindersPerMonth * SCM_PER_LPG_CYLINDER;
  const monthlyPngGas = monthlyScm * pngRatePerScm;
  const monthlyPngCost = monthlyPngGas + pngFixedPerMonth;
  const monthlySaving = monthlyLpgCost - monthlyPngCost;
  const annualSaving = monthlySaving * MONTHS_PER_YEAR;

  let paybackMonths = null;
  let paybackWithDepositMonths = null;
  if (monthlySaving > 0) {
    if (nonRefundable > 0) paybackMonths = nonRefundable / monthlySaving;
    if (upfrontTotal > 0) paybackWithDepositMonths = upfrontTotal / monthlySaving;
  }

  const notes = [];
  notes.push(
    `${securityDeposit > 0 ? `Of the ${upfrontTotal.toFixed(0)} paid upfront, ${securityDeposit.toFixed(0)} is a refundable interest-free deposit returned when the connection is surrendered — the real cost is the ${nonRefundable.toFixed(0)} that is not.` : "No refundable deposit was entered — check the distributor's scheme, as domestic connections normally carry one."}`,
  );
  if (monthlySaving <= 0 && cylindersPerMonth > 0) {
    notes.push(
      "At these rates piped gas is not cheaper per month than cylinders, so there is no payback. Piped gas is still bought only as used, with no cylinder booking, delivery wait or advance payment.",
    );
  }
  if (cylindersPerMonth === 0) {
    notes.push(
      "Enter your cylinder consumption to compare the running cost. A typical family kitchen uses one 14.2 kg cylinder in roughly four to eight weeks.",
    );
  }
  if (chargeablePipingM > 15) {
    notes.push(
      `${chargeablePipingM.toFixed(1)} m of chargeable piping is a long internal run. Where the meter sits relative to the kitchen is the single biggest lever on this bill — ask for the route to be surveyed before booking.`,
    );
  }
  if (applianceConversion === 0) {
    notes.push(
      "No conversion cost was entered. An LPG hob usually needs its jets changed for PNG because the two gases burn at different pressures and calorific values; some distributors bundle this, most bill it.",
    );
  }
  if (paybackMonths !== null && paybackMonths > 60) {
    notes.push(
      `Payback on the non-refundable charges runs past five years at these rates. The case for piped gas at that point rests on convenience and safety rather than on price.`,
    );
  }

  return {
    chargeablePipingM,
    pipingCost,
    pointsCost,
    coreCost,
    nonRefundableItems,
    nonRefundable,
    securityDeposit,
    upfrontTotal,
    lpgDepositRefund,
    netUpfrontAfterLpgRefund,
    monthlyLpgCost,
    monthlyScm,
    monthlyPngGas,
    monthlyPngCost,
    monthlySaving,
    annualSaving,
    paybackMonths,
    paybackWithDepositMonths,
    scmPerCylinder: SCM_PER_LPG_CYLINDER,
    notes,
  };
}

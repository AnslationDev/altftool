/**
 * Which FSSAI approval a food business needs: basic registration, a state licence, or a
 * central licence.
 *
 * Statutory basis
 *  - Section 31 of the Food Safety and Standards Act, 2006 requires every food business operator
 *    to hold a licence, except a petty food business operator, who registers instead.
 *  - The Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations,
 *    2011 set the eligibility. Regulation 2.1.1 defines a petty food business operator, and
 *    Schedule 1 lists the businesses that need a CENTRAL licence irrespective of turnover, along
 *    with the capacity thresholds that separate registration, state and central.
 *  - Turnover ladder: up to Rs 12 lakh a year the operator is petty and registers; above
 *    Rs 12 lakh and up to Rs 20 crore a state licence applies; above Rs 20 crore a central
 *    licence applies. Wholesalers and transporters carry a higher Rs 30 crore central threshold
 *    under Schedule 1.
 *  - Capacity overrides turnover. A small-turnover unit producing more than 100 kg or litres a
 *    day cannot register as petty, because regulation 2.1.1 caps petty operators by capacity too.
 *  - Registration is applied for in Form A, a licence in Form B, both on the FoSCoS portal that
 *    replaced FLRS in 2020.
 *  - A licence or registration may be issued for 1 to 5 years. Renewal must be applied for
 *    before expiry; an application filed after expiry attracts a late fee of Rs 100 per day.
 *  - Fees: registration Rs 100 a year; state licence Rs 2,000 to Rs 5,000 a year depending on
 *    the category in Schedule 3; central licence Rs 7,500 a year.
 *  - The 14-digit licence or registration number must be displayed on the premises and printed
 *    on every food package label.
 */

/** Turnover ladder, in rupees per year. */
export const PETTY_TURNOVER_LIMIT = 1200000; // Rs 12 lakh
export const STATE_TURNOVER_LIMIT = 200000000; // Rs 20 crore
export const HIGH_TURNOVER_LIMIT = 300000000; // Rs 30 crore, wholesalers and transporters

/** Fees per year, Schedule 3. */
export const FEES = {
  registration: 100,
  stateMin: 2000,
  stateMax: 5000,
  central: 7500,
};

/** Validity and renewal. */
export const MIN_VALIDITY_YEARS = 1;
export const MAX_VALIDITY_YEARS = 5;
export const LATE_RENEWAL_FEE_PER_DAY = 100;

/** Ranking so the strictest trigger always wins. */
const RANK = { registration: 1, state: 2, central: 3 };

/**
 * Activities, with the Schedule 1 capacity thresholds that apply to each.
 *  - registrationMax: at or below this capacity the operator can still be petty. null means the
 *    activity has no registration option at all.
 *  - stateMax: above this capacity a central licence is required.
 *  - centralTurnover: the turnover above which Schedule 1 forces a central licence.
 */
export const ACTIVITIES = [
  {
    id: "manufacturer",
    label: "Food processing or manufacturing unit, including repacker and relabeller",
    capacityUnit: "kg or litres produced per day",
    registrationMax: 100,
    stateMax: 2000,
    capacityNote: "Registration up to 100 kg or litres a day, state licence up to 2 MT a day, central above that.",
  },
  {
    id: "dairy",
    label: "Dairy unit — milk procurement, chilling or handling",
    capacityUnit: "litres of milk per day",
    registrationMax: 500,
    stateMax: 50000,
    capacityNote: "Registration up to 500 litres a day, state up to 50,000 litres a day, central above that.",
  },
  {
    id: "vegetableOil",
    label: "Vegetable oil processing, solvent extraction or refinery",
    capacityUnit: "kg or litres per day",
    registrationMax: 100,
    stateMax: 2000,
    capacityNote: "Registration up to 100 kg or litres a day, state up to 2 MT a day, central above that.",
  },
  {
    id: "slaughter",
    label: "Slaughterhouse",
    capacityUnit: "large animals slaughtered per day",
    registrationMax: 2,
    stateMax: 50,
    capacityNote:
      "Registration up to 2 large animals, 10 small animals or 50 poultry birds a day; state up to 50 large, 150 small or 1,000 poultry; central above that.",
  },
  {
    id: "meatProcessing",
    label: "Meat processing unit",
    capacityUnit: "kg of meat per day",
    registrationMax: null,
    stateMax: 500,
    capacityNote:
      "No registration option. State licence up to 500 kg a day or 150 MT a year, central licence above that.",
  },
  {
    id: "coldStorage",
    label: "Cold or refrigerated storage",
    capacityUnit: "MT of storage capacity",
    registrationMax: null,
    stateMax: 10000,
    capacityNote: "Central licence once capacity exceeds 10,000 MT.",
  },
  {
    id: "controlledStorage",
    label: "Atmosphere-controlled plus cold storage",
    capacityUnit: "MT of storage capacity",
    registrationMax: null,
    stateMax: 1000,
    capacityNote: "Central licence once capacity exceeds 1,000 MT.",
  },
  {
    id: "otherStorage",
    label: "Storage other than cold or atmosphere controlled",
    capacityUnit: "MT of storage capacity",
    registrationMax: null,
    stateMax: 50000,
    capacityNote: "Central licence once capacity exceeds 50,000 MT.",
  },
  {
    id: "transporter",
    label: "Food transporter",
    capacityUnit: "food vehicles or wagons operated",
    registrationMax: null,
    stateMax: 100,
    centralTurnover: HIGH_TURNOVER_LIMIT,
    capacityNote:
      "Central licence once more than 100 vehicles or wagons are run, or turnover exceeds Rs 30 crore.",
  },
  {
    id: "wholesaler",
    label: "Wholesaler",
    capacityUnit: null,
    registrationMax: null,
    stateMax: null,
    centralTurnover: HIGH_TURNOVER_LIMIT,
    capacityNote: "Judged on turnover alone, with a central threshold of Rs 30 crore.",
  },
  {
    id: "distributor",
    label: "Distributor, supplier or marketer",
    capacityUnit: null,
    registrationMax: null,
    stateMax: null,
    capacityNote: "Judged on turnover alone, with a central threshold of Rs 20 crore.",
  },
  {
    id: "retailer",
    label: "Retailer, grocery or food shop",
    capacityUnit: null,
    registrationMax: 0,
    stateMax: null,
    capacityNote: "Judged on turnover alone, with a central threshold of Rs 20 crore.",
  },
  {
    id: "caterer",
    label: "Restaurant, hotel, canteen, club or caterer",
    capacityUnit: null,
    registrationMax: 0,
    stateMax: null,
    capacityNote: "Judged on turnover alone, with a central threshold of Rs 20 crore.",
  },
];

export const ACTIVITY_IDS = ACTIVITIES.map((activity) => activity.id);

/** Schedule 1 situations that force a central licence whatever the turnover. */
export const CENTRAL_TRIGGERS = [
  {
    id: "importer",
    label: "I import food into India",
    reason: "Every food importer needs a central licence under Schedule 1, irrespective of turnover.",
  },
  {
    id: "exportOrientedUnit",
    label: "I am a 100% export oriented unit",
    reason: "A 100% export oriented unit is listed in Schedule 1 as requiring a central licence.",
  },
  {
    id: "ecommerce",
    label: "I sell food through my own e-commerce platform",
    reason: "An e-commerce food business operator is listed in Schedule 1 as requiring a central licence.",
  },
  {
    id: "centralPremises",
    label: "My outlet is inside an airport, seaport, railway or defence establishment",
    reason:
      "Food businesses operating in premises of Central Government agencies such as airports, seaports, railways and defence establishments need a central licence.",
  },
  {
    id: "multiState",
    label: "I operate in two or more states and this is the head office",
    reason:
      "A food business operating in two or more states must hold a central licence for its head or registered office, in addition to the state licence each unit needs.",
  },
  {
    id: "proprietaryFood",
    label: "I make proprietary or novel food, or food for special dietary use",
    reason:
      "Manufacture of proprietary food, novel food, nutraceuticals and food for special dietary use is a Schedule 1 central licence category.",
  },
];

export const TRIGGER_IDS = CENTRAL_TRIGGERS.map((trigger) => trigger.id);

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Rupees to a readable Indian phrase, used inside reasons. */
function crore(value) {
  return `Rs ${(value / 10000000).toFixed(0)} crore`;
}

/**
 * Decide the licence category.
 *
 * @param {object} input
 * @param {string} input.activity        One of ACTIVITY_IDS.
 * @param {number} input.annualTurnover  Turnover in rupees per year.
 * @param {number} input.capacity        Capacity in the activity's own unit; ignored where the
 *                                       activity has no capacity test.
 * @param {string[]} input.triggers      Ids from CENTRAL_TRIGGERS that apply.
 */
export function selectFssaiLicence({
  activity = "caterer",
  annualTurnover = 5000000,
  capacity = 0,
  triggers = [],
}) {
  const meta = ACTIVITIES.find((item) => item.id === activity);
  if (!meta) {
    return { error: "Choose the food business activity you carry on." };
  }
  if (!isNum(annualTurnover) || annualTurnover < 0) {
    return { error: "Annual turnover must be zero or more." };
  }
  if (!isNum(capacity) || capacity < 0) {
    return { error: "Capacity must be zero or more." };
  }
  if (!Array.isArray(triggers)) {
    return { error: "The special situations must be supplied as a list." };
  }
  const unknown = triggers.filter((id) => !TRIGGER_IDS.includes(id));
  if (unknown.length > 0) {
    return { error: `Unrecognised situation: ${unknown.join(", ")}.` };
  }

  const reasons = [];
  let verdict = "registration";
  const raise = (level, reason) => {
    reasons.push(reason);
    if (RANK[level] > RANK[verdict]) verdict = level;
  };

  // 1. Schedule 1 triggers beat everything else.
  const firedTriggers = CENTRAL_TRIGGERS.filter((trigger) => triggers.includes(trigger.id));
  for (const trigger of firedTriggers) {
    raise("central", trigger.reason);
  }

  // 2. Turnover ladder, with the activity's own central threshold where Schedule 1 sets one.
  const centralTurnover = meta.centralTurnover ?? STATE_TURNOVER_LIMIT;
  if (annualTurnover > centralTurnover) {
    raise(
      "central",
      `Turnover of ${Math.round(annualTurnover)} exceeds the ${crore(centralTurnover)} central licence threshold for this activity.`,
    );
  } else if (annualTurnover > PETTY_TURNOVER_LIMIT) {
    raise(
      "state",
      `Turnover of ${Math.round(annualTurnover)} is above the Rs 12 lakh petty operator limit and within ${crore(centralTurnover)}, which is the state licence band.`,
    );
  } else {
    reasons.push(
      `Turnover of ${Math.round(annualTurnover)} is within the Rs 12 lakh petty food business operator limit in regulation 2.1.1.`,
    );
  }

  // 3. Capacity test, which can override a low turnover.
  const hasCapacityTest = meta.stateMax !== null && meta.capacityUnit !== null;
  if (hasCapacityTest) {
    if (capacity > meta.stateMax) {
      raise(
        "central",
        `Capacity of ${capacity} ${meta.capacityUnit} is above the Schedule 1 ceiling of ${meta.stateMax} for a state licence, so a central licence is required whatever the turnover.`,
      );
    } else if (meta.registrationMax === null) {
      raise(
        "state",
        `This activity has no registration option under Schedule 1, so at least a state licence is required whatever the turnover or capacity.`,
      );
    } else if (capacity > meta.registrationMax) {
      raise(
        "state",
        `Capacity of ${capacity} ${meta.capacityUnit} is above the petty operator ceiling of ${meta.registrationMax}, so registration is not available even at a small turnover.`,
      );
    } else if (capacity > 0) {
      reasons.push(
        `Capacity of ${capacity} ${meta.capacityUnit} stays within the petty operator ceiling of ${meta.registrationMax}.`,
      );
    }
  } else if (meta.registrationMax === null && meta.capacityUnit === null) {
    // Wholesalers and distributors have no registration route via capacity, only turnover.
    reasons.push("This activity is judged on turnover alone; Schedule 1 sets no capacity test for it.");
  }

  const headline =
    verdict === "central"
      ? "Central Licence"
      : verdict === "state"
        ? "State Licence"
        : "Basic Registration";

  const form = verdict === "registration" ? "Form A" : "Form B";
  const authority =
    verdict === "central"
      ? "Food Safety and Standards Authority of India, through the regional office"
      : verdict === "state"
        ? "The State Licensing Authority for the district where the premises are"
        : "The Registering Authority — usually the designated officer of the local body";

  const annualFee =
    verdict === "central"
      ? { min: FEES.central, max: FEES.central }
      : verdict === "state"
        ? { min: FEES.stateMin, max: FEES.stateMax }
        : { min: FEES.registration, max: FEES.registration };

  const documents =
    verdict === "registration"
      ? [
          "Completed Form A with a passport size photograph of the proprietor",
          "Photo identity proof issued by a government authority",
          "Proof of premises, such as a rent agreement or an electricity bill",
          "A declaration of the food products handled",
        ]
      : [
          "Completed Form B signed by the proprietor, partner or authorised signatory",
          "Blueprint or layout plan of the processing unit, with area in square metres",
          "List of directors, partners or proprietor with address and contact details",
          "Name and list of equipment and machinery with number and installed capacity",
          "Analysis report of the water used as an ingredient, from a recognised laboratory",
          "Proof of possession of the premises and a photo identity of the signatory",
          "Food safety management system plan, and for a central licence the source of raw material for milk or meat",
        ];

  return {
    verdict,
    headline,
    activityLabel: meta.label,
    capacityUnit: meta.capacityUnit,
    capacityNote: meta.capacityNote,
    form,
    authority,
    annualFee,
    validityYears: { min: MIN_VALIDITY_YEARS, max: MAX_VALIDITY_YEARS },
    lateRenewalFeePerDay: LATE_RENEWAL_FEE_PER_DAY,
    reasons,
    firedTriggers: firedTriggers.map((trigger) => trigger.label),
    documents,
    thresholds: {
      pettyTurnover: PETTY_TURNOVER_LIMIT,
      centralTurnover,
      registrationCapacity: meta.registrationMax,
      stateCapacity: meta.stateMax,
    },
  };
}

/**
 * International Units (IU) to metric mass for the fat-soluble vitamins A, D and E.
 *
 * An IU is defined separately for every vitamin AND for every chemical form of
 * that vitamin, so there is no single "IU to mcg" factor. The factors below are
 * the ones published by the NIH Office of Dietary Supplements and used on the
 * US Nutrition/Supplement Facts label since the 2016 labelling rule.
 */

export const MCG_PER_MG = 1000;

/**
 * Per-form conversion factors, expressed as micrograms per IU.
 *
 * Vitamin A (NIH ODS, in mcg RAE per IU):
 *   retinol 0.3, supplemental beta-carotene 0.15, dietary beta-carotene 0.05,
 *   dietary alpha-carotene / beta-cryptoxanthin 0.025.
 * Vitamin D (NIH ODS): 1 IU = 0.025 mcg cholecalciferol or ergocalciferol,
 *   i.e. 1 mcg = 40 IU.
 * Vitamin E (NIH ODS): 1 IU of natural RRR-alpha-tocopherol = 0.67 mg and
 *   1 IU of synthetic all-rac-alpha-tocopherol = 0.45 mg alpha-tocopherol,
 *   which is 670 mcg and 450 mcg respectively.
 *
 * Daily Values (DV) are the FDA adult/children-4-and-over values:
 *   vitamin A 900 mcg RAE, vitamin D 20 mcg, vitamin E 15 mg alpha-tocopherol.
 * Tolerable Upper Intake Levels (UL) are the Institute of Medicine adult values:
 *   preformed vitamin A 3000 mcg RAE, vitamin D 100 mcg (4000 IU),
 *   supplemental alpha-tocopherol 1000 mg. Provitamin A carotenoids have no UL.
 */
export const VITAMIN_FORMS = [
  {
    id: "a-retinol",
    vitamin: "Vitamin A",
    form: "Retinol (retinyl acetate or palmitate)",
    mcgPerIu: 0.3,
    massLabel: "mcg RAE",
    preferMg: false,
    dvMcg: 900,
    ulMcg: 3000,
    ulNote: "Upper limit applies to preformed vitamin A (retinol) only.",
  },
  {
    id: "a-beta-carotene-supplement",
    vitamin: "Vitamin A",
    form: "Beta-carotene from a supplement",
    mcgPerIu: 0.15,
    massLabel: "mcg RAE",
    preferMg: false,
    dvMcg: 900,
    ulMcg: null,
    ulNote: "Provitamin A carotenoids have no upper intake level; excess is stored, not converted.",
  },
  {
    id: "a-beta-carotene-food",
    vitamin: "Vitamin A",
    form: "Beta-carotene from food",
    mcgPerIu: 0.05,
    massLabel: "mcg RAE",
    preferMg: false,
    dvMcg: 900,
    ulMcg: null,
    ulNote: "Provitamin A carotenoids from food have no upper intake level.",
  },
  {
    id: "a-other-carotenoids-food",
    vitamin: "Vitamin A",
    form: "Alpha-carotene or beta-cryptoxanthin from food",
    mcgPerIu: 0.025,
    massLabel: "mcg RAE",
    preferMg: false,
    dvMcg: 900,
    ulMcg: null,
    ulNote: "These carotenoids convert poorly to retinol and have no upper intake level.",
  },
  {
    id: "d",
    vitamin: "Vitamin D",
    form: "Cholecalciferol (D3) or ergocalciferol (D2)",
    mcgPerIu: 0.025,
    massLabel: "mcg",
    preferMg: false,
    dvMcg: 20,
    ulMcg: 100,
    ulNote: "The adult upper limit is 100 mcg, which is 4000 IU per day.",
  },
  {
    id: "e-natural",
    vitamin: "Vitamin E",
    form: "Natural d-alpha-tocopherol (RRR)",
    mcgPerIu: 670,
    massLabel: "mcg alpha-tocopherol",
    preferMg: true,
    dvMcg: 15000,
    ulMcg: 1000000,
    ulNote: "The adult upper limit is 1000 mg of supplemental alpha-tocopherol per day.",
  },
  {
    id: "e-synthetic",
    vitamin: "Vitamin E",
    form: "Synthetic dl-alpha-tocopherol (all-rac)",
    mcgPerIu: 450,
    massLabel: "mcg alpha-tocopherol",
    preferMg: true,
    dvMcg: 15000,
    ulMcg: 1000000,
    ulNote: "The adult upper limit is 1000 mg of supplemental alpha-tocopherol per day.",
  },
];

export const INPUT_UNITS = ["IU", "mcg", "mg"];

/** Reject entries far past any real label so unit mix-ups surface as an error. */
export const MAX_IU = 100000000;

export function getForm(formId) {
  return VITAMIN_FORMS.find((entry) => entry.id === formId) || null;
}

/**
 * Convert a vitamin amount between IU and metric mass.
 *
 * @param {{ amount: number|string, unit: "IU"|"mcg"|"mg", formId: string }} input
 * @returns {object} { iu, mcg, mg, percentDv, percentUl, ... } or { error }
 */
export function convertVitaminAmount({ amount, unit, formId }) {
  const form = getForm(formId);
  if (!form) return { error: "Pick which vitamin and which chemical form the label lists." };
  if (!INPUT_UNITS.includes(unit)) return { error: "Choose IU, mcg or mg as the unit you are entering." };

  const raw = typeof amount === "string" ? amount.replace(/,/g, "").trim() : amount;
  if (raw === "" || raw === null || raw === undefined) {
    return { error: "Enter the amount printed on the supplement label." };
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return { error: "Enter the amount as a number, for example 1000 or 12.5." };
  }
  if (numeric < 0) return { error: "A vitamin dose cannot be negative." };

  let iu;
  let mcg;
  if (unit === "IU") {
    iu = numeric;
    mcg = numeric * form.mcgPerIu;
  } else {
    mcg = unit === "mg" ? numeric * MCG_PER_MG : numeric;
    iu = mcg / form.mcgPerIu;
  }

  if (iu > MAX_IU) {
    return {
      error: `That works out to more than ${MAX_IU.toLocaleString("en-US")} IU, far beyond any supplement label. Check the units on the bottle.`,
    };
  }

  const percentDv = form.dvMcg > 0 ? (mcg / form.dvMcg) * 100 : null;
  const percentUl = form.ulMcg ? (mcg / form.ulMcg) * 100 : null;

  return {
    form,
    inputAmount: numeric,
    inputUnit: unit,
    iu,
    mcg,
    mg: mcg / MCG_PER_MG,
    mcgPerIu: form.mcgPerIu,
    iuPerMcg: 1 / form.mcgPerIu,
    percentDv,
    percentUl,
    exceedsUl: form.ulMcg ? mcg > form.ulMcg : false,
    dvMcg: form.dvMcg,
    dvIu: form.dvMcg / form.mcgPerIu,
    ulMcg: form.ulMcg,
    ulIu: form.ulMcg ? form.ulMcg / form.mcgPerIu : null,
    ulNote: form.ulNote,
  };
}

/** Common label strengths shown as a quick reference table, in IU. */
export const COMMON_IU_ROWS = {
  d: [400, 800, 1000, 2000, 5000, 10000, 60000],
  "a-retinol": [1000, 2500, 5000, 10000, 25000],
  "e-natural": [30, 100, 200, 400, 1000],
  "e-synthetic": [30, 100, 200, 400, 1000],
  "a-beta-carotene-supplement": [1000, 5000, 10000, 25000],
  "a-beta-carotene-food": [1000, 5000, 10000, 25000],
  "a-other-carotenoids-food": [1000, 5000, 10000, 25000],
};

const seo = {
  title: "Vitamin IU to mcg Converter: Vitamin A, D & E",
  metaDescription:
    "1 IU of vitamin D is 0.025 mcg; retinol is 0.3 mcg RAE and natural vitamin E 0.67 mg. Pick the exact form and get %DV and the upper intake level.",
  steps: [
    "Choose the exact entry under Vitamin and form — Retinol, a carotenoid, Cholecalciferol (D3) or ergocalciferol (D2), or natural versus synthetic alpha-tocopherol.",
    "Type the Amount on the label and set Unit entered to IU, mcg or mg.",
    "Read International Units, Micrograms, Milligrams, Percent of Daily Value and the Adult upper intake level, then press Copy result.",
  ],
  intro:
    "The Vitamin IU to Microgram Converter turns an International Unit figure on a supplement label into micrograms or milligrams using the specific factor for that vitamin and chemical form, because an IU is defined separately for each one. It covers vitamin D (1 IU = 0.025 mcg), vitamin A as retinol or as carotenoids (0.3 down to 0.025 mcg RAE per IU) and vitamin E in natural and synthetic forms (0.67 mg and 0.45 mg per IU), and reports the result against the Daily Value and the adult tolerable upper intake level. Useful for anyone reading an older label in IU next to a newer one in micrograms.",
  useCases: [
    "Check whether a 60,000 IU weekly vitamin D sachet is above the 4000 IU per day upper limit when spread across the week.",
    "Compare a natural d-alpha-tocopherol vitamin E capsule in IU against a newer label that lists milligrams.",
    "Translate an older 5000 IU vitamin A label into mcg RAE so it can be compared with the 900 mcg Daily Value.",
    "Work out how many IU a doctor's instruction of 50 mcg of vitamin D per day actually means on the bottle you own.",
  ],
  benefits: [
    ["Per-form factors", "Separate factors for retinol, supplemental and dietary carotenoids, D2/D3, and natural versus synthetic vitamin E."],
    ["Upper-limit awareness", "Flags doses above the adult tolerable upper intake level instead of just printing a number."],
    ["Both directions", "Enter IU, mcg or mg and get the other two, with the Daily Value percentage alongside."],
  ],
  faqs: [
    [
      "How many IU is 1 mcg of vitamin D?",
      "1 mcg of vitamin D equals 40 IU, because 1 IU is defined as 0.025 mcg of cholecalciferol or ergocalciferol. So 25 mcg is 1000 IU, and the 20 mcg Daily Value is 800 IU.",
    ],
    [
      "Why is there no single IU to mcg conversion?",
      "The IU is a measure of biological activity, defined separately for each vitamin and each chemical form. One IU is 0.025 mcg for vitamin D, 0.3 mcg RAE for retinol and 670 mcg for natural d-alpha-tocopherol, so using the wrong factor can be off by more than twenty-thousand fold.",
    ],
    [
      "How much is 400 IU of vitamin E in milligrams?",
      "400 IU is 268 mg if the capsule is natural d-alpha-tocopherol (0.67 mg per IU) and 180 mg if it is synthetic dl-alpha-tocopherol (0.45 mg per IU). The label word — d- versus dl-, or RRR versus all-rac — decides which factor applies.",
    ],
    [
      "How much vitamin D per day is too much?",
      "The Institute of Medicine sets the adult tolerable upper intake level at 100 mcg, which is 4000 IU per day, from all sources combined. Higher doses are sometimes prescribed for a short correction course, so treat this converter as informational and confirm any long-term high dose with your doctor.",
    ],
  ],
};

export default seo;

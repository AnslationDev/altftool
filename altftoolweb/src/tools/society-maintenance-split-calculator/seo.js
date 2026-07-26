const seo = {
  intro:
    "This calculator takes a housing society's monthly expense budget and divides it across every flat, either equally, strictly per square foot of carpet area, or on a hybrid basis where you choose what proportion is recovered as a flat charge and what proportion follows area. It handles several flat types at once, adds parking charges per slot and an optional sinking fund percentage, and shows the per-flat bill alongside the total the society will collect. It is built for managing committees, treasurers and residents who want to check that the maintenance bill is arithmetically fair.",
  useCases: [
    "A managing committee setting next year's maintenance rate after approving the annual expense budget in the general body meeting",
    "A treasurer checking that per-flat bills for 1 BHK, 2 BHK and 3 BHK owners still add up to the budgeted collection",
    "Residents questioning why a larger flat pays more, and wanting to see the equal versus area-based components separately",
    "Comparing an equal-per-flat model with a per-square-foot model before proposing a bye-law change to the members",
  ],
  benefits: [
    ["Hybrid split, like real bye-laws", "Service charges are usually equal per flat while repairs and property tax follow area — the slider lets you model exactly that mix."],
    ["Multiple flat sizes at once", "Add as many flat types as your society has, each with its own area, count and parking slots."],
    ["Collection always reconciles", "The per-flat amounts are derived from the budget, so the sum of all bills matches the budget to the rupee."],
  ],
  faqs: [
    [
      "Should society maintenance be charged equally or by area?",
      "Co-operative housing society model bye-laws split it: heads like service charges, security, lift running and repairs to common property are recovered equally per flat, while property tax, water charges, sinking fund and expenses on repairs of the building are recovered in proportion to the area of each flat. Most societies therefore end up with a hybrid, which is what this calculator models.",
    ],
    [
      "How is the sinking fund calculated?",
      "Model bye-laws set the sinking fund at a minimum of 0.25% per year of the construction cost of each flat, excluding the land cost, decided by the general body. Many societies instead collect it as a simple percentage on top of the monthly maintenance, which is the option offered here.",
    ],
    [
      "Is GST charged on society maintenance?",
      "GST at 18% applies to maintenance charges only when the society's annual turnover crosses ₹20 lakh and the charge per member per month exceeds ₹7,500. When it applies, it is levied on the whole amount for that member, not only the excess above ₹7,500.",
    ],
    [
      "Can a society charge non-occupancy charges on a rented flat?",
      "Yes, but for Maharashtra societies a government circular caps non-occupancy charges at 10% of the service charges, excluding municipal taxes. Those are billed separately from the maintenance split shown here.",
    ],
  ],
};

export default seo;

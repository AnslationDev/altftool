const seo = {
  title: "Weekly Pill Organiser Builder: 7-Day, 4-Slot Grid",
  metaDescription:
    "Lay out morning, noon, evening and night across all seven days, count tablets per compartment and per week, and flag any slot your box cannot hold.",
  steps: [
    "For each row fill the \"Medicine 1\" name field (placeholder \"Name and strength\") and Tablets per dose, then use the Quick frequency list — Once daily morning, Twice daily (BD), Three times daily (TDS), Four times daily (QDS) — to fill the Morning, Noon, Evening and Night chips under Compartments, or toggle them by hand.",
    "Pick the Days chips or the \"Every day\" shortcut, press \"Add another medicine\" for each further item, and set \"Tablets one compartment holds\" so the builder can test the box's capacity.",
    "Read \"Tablets to load for the week\" with its \"N doses across M of 28 compartments\" line and any over-capacity warning, then The grid and the \"Tablets to count out\" tables, and press Copy layout to save the plan or Reset to clear the list.",
  ],
  intro:
    "This builder turns a medicine list into the 7 x 4 grid a standard weekly pill organiser uses — morning, noon, evening and night for each of the seven days — and counts the tablets that belong in every compartment. Give each medicine its tablets per dose, the compartments it goes in and the days it is taken; the tool works out tablets per week for each medicine, the total for the whole box, and flags any compartment that would hold more tablets than your box physically fits. It is a counting and layout aid to use alongside your prescription, not a dosing decision.",
  useCases: [
    "Setting up a parent's box for the week when six medicines run on three different schedules",
    "Working out how many tablets of each medicine to bring on a seven-day trip",
    "Spotting that the morning compartment is overloaded before you start filling it",
  ],
  benefits: [
    ["Whole week at once", "All 28 compartments laid out so nothing is filled from memory."],
    ["Counts before you count", "Tablets per medicine per week, so you know if the strip will last."],
    ["Catches an overloaded slot", "Warns when one compartment holds more tablets than the box can take."],
  ],
  faqs: [
    [
      "What do the four compartments on a weekly pill box mean?",
      "They correspond to the four standard dosing times prescriptions use: morning (mane), noon (meridie), evening (vespere) and night (nocte). A once-daily medicine uses one, a twice-daily (BD) medicine usually uses morning and night, three times daily (TDS) uses morning, noon and night, and four times daily (QDS) uses all four.",
    ],
    [
      "How many tablets a week does a twice-daily medicine need?",
      "Fourteen, if it is one tablet each time every day: 2 doses x 7 days x 1 tablet. Two tablets per dose makes it 28. The tool does this for every medicine so you can check the strip or bottle has enough before you start filling the box.",
    ],
    [
      "Can all medicines go in a pill organiser?",
      "No. Some tablets and capsules need to stay in their original blister or bottle to stay dry and out of light, dispersible and effervescent forms degrade quickly once out, and some products are dispensed in packs that must not be split. Ask your pharmacist which of your medicines are safe to decant before you fill an organiser.",
    ],
    [
      "How far ahead should I fill a weekly pill box?",
      "One week at a time is the usual practice, which is what the box is designed for and what keeps the layout matching the current prescription. Refill on the same day each week, and redo the layout whenever a dose changes rather than editing the box mid-week.",
    ],
  ],
};

export default seo;

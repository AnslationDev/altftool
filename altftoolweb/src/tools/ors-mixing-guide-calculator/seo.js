const seo = {
  intro:
    "The ORS Mixing Guide Calculator works out how many oral rehydration salt sachets a given volume of clean water needs, the WHO/UNICEF homemade sugar-salt proportions when no sachet is available, and how much solution to give under WHO diarrhoea treatment Plans A and B. The reference formulation is WHO low-osmolarity ORS at 245 mOsm/L — 75 mmol/L sodium, 75 mmol/L glucose, 20 mmol/L potassium, 65 mmol/L chloride and 10 mmol/L citrate. It is informational only: oral rehydration works because glucose and sodium are co-transported across the gut wall in a fixed ratio, and getting that ratio wrong makes the solution less effective or actively harmful.",
  useCases: [
    "Check how many 200 ml sachets go into a 1 litre jug when the pack size does not match the container you have.",
    "Mix a WHO sugar-salt solution during a power cut or while travelling, when no ORS sachet is to hand.",
    "Work out the four-hour Plan B volume for a 12 kg toddler with some dehydration, at 75 ml per kg.",
  ],
  benefits: [
    [
      "Stops the split-sachet mistake",
      "Warns when your water volume needs a partial sachet and suggests the correct whole-sachet volume instead.",
    ],
    [
      "Both recipes side by side",
      "Packaged sachet counts and the homemade six-teaspoons-of-sugar fallback, in level spoons and grams.",
    ],
    [
      "WHO plans, not guesswork",
      "Per-stool volumes by age for Plan A, the 75 ml/kg loading dose for Plan B, and a hard stop for severe dehydration.",
    ],
  ],
  faqs: [
    [
      "How much water do you mix with one ORS sachet?",
      "Exactly the volume printed on the sachet, most often one litre for the WHO standard sachet, though 200 ml and 500 ml sachets are common in India. Never split a sachet to make a smaller batch — the salts are not evenly distributed inside the packet, so half a sachet is not half a dose. Mix the whole sachet into the stated volume and discard what is left after 24 hours.",
    ],
    [
      "What is the homemade ORS recipe?",
      "WHO and UNICEF give six level teaspoons of sugar and half a level teaspoon of salt in one litre of clean drinking water — roughly 25 g of sugar and 2.5 g of salt. Use level spoons, never heaped, and never add extra salt: an over-salted solution can raise blood sodium dangerously, especially in small children. A packaged sachet is always preferable because homemade solution has no potassium or citrate.",
    ],
    [
      "How much ORS should a child drink after each loose stool?",
      "Under WHO Plan A, give 50-100 ml after each loose stool for a child under two, 100-200 ml for a child aged two to ten, and as much as wanted for anyone older. If there are signs of some dehydration — restlessness, thirst, sunken eyes — Plan B applies instead: 75 ml per kg of body weight over four hours, so 900 ml for a 12 kg child.",
    ],
    [
      "Why is low-osmolarity ORS better than the old formula?",
      "The reduced-osmolarity formula at 245 mOsm/L replaced the original 311 mOsm/L recipe in 2003 because trials showed it cut the need for unscheduled intravenous fluids, reduced stool output and reduced vomiting. Its lower sodium and glucose concentrations keep the solution closer to isotonic, so it does not draw water into the gut. Zinc at 10 mg daily under six months, or 20 mg daily thereafter, for 10-14 days is recommended alongside it — check dosing with a clinician.",
    ],
  ],
};

export default seo;

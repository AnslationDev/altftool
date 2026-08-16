const seo = {
  title: "Defrost Time Calculator: Fridge, Water, Microwave",
  metaDescription:
    "Thawing times for nine foods by fridge, cold water or microwave, plus the exact clock time to move it out of the freezer for your cooking hour.",
  steps: [
    "Pick the food — whole chicken, mince, fish fillets, prawns, bread or cooked leftovers — and set the weight anywhere from 0.25 to 6 kg.",
    "Compare the fridge, cold water and microwave panels: 12 hr per kg for a whole chicken, or 30 min per 500 g submerged in cold tap water.",
    "Set the cooking date and time in Today's planner, then press Copy plan for the freezer-out time, water-change times and safe internal temperature.",
  ],
  intro:
    "The Safe Defrost Time Calculator estimates how long frozen food takes to thaw by each of the three safe methods — in the fridge at a per-kilogram rate for that food, in cold water at 30 minutes per 500 g with the water changed every 30 minutes, or on a microwave defrost setting — and then works backwards from your cooking time to the exact moment the food has to leave the freezer. Pick from nine food types, from whole chicken and roasting joints to fish, prawns, mince, bread and cooked leftovers, and it also gives the safe internal cooking temperature for what you selected. It exists because the countertop method that most people default to is the one that makes them ill.",
  useCases: [
    "It is 4 pm, dinner is at 7, and there is a bag of chicken pieces in the freezer — you need to know whether the fridge is still an option or whether it is a cold-water job.",
    "You are planning Sunday's roast and want to know which day the joint has to come down to the fridge so it is ready in time.",
    "You thawed mince in the microwave, changed your mind about cooking it, and want to know whether it can go back in the freezer.",
  ],
  benefits: [
    [
      "Works backwards from dinner",
      "Enter the time you want to cook and it returns the clock time to move the food out of the freezer, plus a cold-water fallback if you have already missed it.",
    ],
    [
      "Per-food thawing rates",
      "Prawns at 6 hours per kg and a whole chicken at 12 are not treated the same, and it flags when a method is wrong for the food — a joint should not be microwave-defrosted, bread should not go in water.",
    ],
    [
      "Tells you the water-change times",
      "For cold-water thawing it lists the actual clock times to swap the water, at 30-minute intervals, rather than leaving you to remember.",
    ],
  ],
  faqs: [
    [
      "How long does it take to defrost chicken in the fridge?",
      "Allow roughly 10 hours per kilogram for chicken pieces and about 12 hours per kilogram for a whole bird, with a minimum of 6 and 12 hours respectively. A 1.5 kg whole chicken therefore needs around 18 hours, which in practice means moving it to the fridge the night before.",
    ],
    [
      "Why can't you defrost meat on the kitchen counter?",
      "Because the surface warms into the 5°C to 60°C danger zone hours before the centre thaws, and bacteria such as salmonella can double roughly every 20 minutes in that range. The limit is 2 hours total above 5°C — 1 hour if the room is above 32°C — and cooking afterwards does not undo it, since some bacteria leave heat-stable toxins behind.",
    ],
    [
      "How do you defrost food quickly and safely?",
      "Seal it in a leak-proof bag, submerge it fully in cold tap water, and allow about 30 minutes per 500 g, changing the water every 30 minutes so it stays cold. Food thawed this way must be cooked immediately and cannot be refrozen raw. Bread is the exception to water thawing — it goes soggy, so use room temperature or a low oven.",
    ],
    [
      "Can you refreeze food after defrosting it?",
      "Yes if it thawed in the fridge and stayed cold, and always yes once it has been cooked and cooled quickly. No if it thawed in cold water or a microwave — cook it first, then freeze the cooked dish — and no if it was left out or feels warm. These are general food-safety guidelines, not medical advice; if you are pregnant, elderly or immunocompromised, follow your local food standards agency and speak to a doctor about any illness.",
    ],
  ],
};

export default seo;

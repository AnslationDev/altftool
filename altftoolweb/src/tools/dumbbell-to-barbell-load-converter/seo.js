const seo = {
  intro:
    "This converter estimates the dumbbell load equivalent to a barbell load on the same lift, using a conversion factor defined as the weight of the dumbbell pair divided by the total barbell load including the bar. A pair of dumbbells is always lighter than the barbell you handle on the same movement because each arm stabilises its own path and the range of motion is longer — on bench press the pair typically lands around 75 percent of the barbell total, on a back squat comparison closer to 60 percent. Every result comes with a range rather than a single figure, and rounds to the dumbbell or plate increments you actually own.",
  useCases: [
    "Work out which dumbbells to grab when the only flat bench with a barbell is taken.",
    "Set a starting load for a hotel or home gym session that only has dumbbells up to 30 kg.",
    "Translate a dumbbell press you have been doing for months back to a barbell load before testing it.",
    "Check whether your dumbbell rack even goes heavy enough to match your current barbell row.",
  ],
  benefits: [
    ["Per-exercise factors", "Bench, press, row, RDL, curl, lunge and squat each use their own conversion band, not one blanket number."],
    ["Range, not false precision", "Every conversion shows a conservative and an optimistic figure so you pick a load to test."],
    ["Rounds to real equipment", "Snaps to your dumbbell increment, or to plates per side on the bar you selected."],
  ],
  faqs: [
    [
      "Is 2 x 30 kg dumbbells the same as 60 kg on a barbell?",
      "No — 30 kg dumbbells in each hand on bench press is roughly equivalent to about 80 kg on a barbell, not 60 kg. The dumbbell pair total is typically around 75 percent of the barbell load, so you divide the pair total by that factor rather than adding the two dumbbells together.",
    ],
    [
      "Why can I lift more with a barbell than with dumbbells?",
      "A barbell locks both hands into one fixed path, so your stabilising muscles do far less work and the strong side can help the weak side. Dumbbells load each limb independently and travel through a longer range, which reduces the weight you can control.",
    ],
    [
      "Does the barbell weight include the bar?",
      "Yes — enter the total on the bar including the bar itself. A standard Olympic men's bar is 20 kg, the women's bar is 15 kg, and training bars are usually 10 kg, so 4 plates of 20 kg plus a men's bar is 100 kg total.",
    ],
    [
      "Which exercises convert worst between dumbbells and a barbell?",
      "Squats. A back squat loads the trunk directly through the bar, while dumbbells are limited by grip and by where you can hold them, so the equivalence falls to roughly 50 to 65 percent. Pressing and rowing convert far more consistently.",
    ],
  ],
};

export default seo;

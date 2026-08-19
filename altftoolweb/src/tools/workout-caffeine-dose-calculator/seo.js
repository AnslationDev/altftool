const seo = {
  title: "Workout Caffeine Calculator: 3-6 mg/kg Timing",
  metaDescription:
    "Scales caffeine to bodyweight at 3-6 mg/kg, sets the clock time to take it so peak lands at your session, and shows what is left at bedtime.",
  steps: [
    "Enter your bodyweight in kg and pick a Dose level — Low 3 mg/kg, Moderate 4.5 mg/kg, High 6 mg/kg, or Custom mg/kg — then set \"Training starts at\" and Bedtime.",
    "Choose \"How you are taking it\" (capsule or brewed coffee lead 60 minutes, pre-workout powder or energy drink 45, caffeine gum 10), adjust \"Your caffeine half-life (hours)\" from the 5-hour default, and add any caffeine already taken today.",
    "The result gives the dose in mg with the clock time to swallow it, the ergogenic range at your weight, milligrams still circulating at bedtime, an hour-by-hour decay table, and servings of coffee, espresso or gum that add up to it.",
  ],
  intro:
    "A workout caffeine dose calculator scales caffeine to bodyweight using the 3-6 mg per kg ergogenic range from the ISSN position stand on caffeine and exercise performance, and tells you what time to take it so peak plasma caffeine lands at the start of your session. It also runs the dose forward through first-order elimination at a roughly five-hour half-life, so you can see how many milligrams are still circulating at bedtime. Safety checkpoints use the EFSA figures of 400 mg per day and 200 mg in a single dose for healthy adults.",
  useCases: [
    "Find the right pre-workout dose for a 75 kg lifter without guessing from a scoop of unlabelled pre-workout.",
    "Decide whether a 6 pm espresso will still be affecting an 11 pm bedtime.",
    "Swap capsules for caffeine gum before a race and shift the timing from 60 minutes to 10.",
    "Add up a morning coffee plus a pre-workout dose to check you are still under the 400 mg daily guideline.",
  ],
  benefits: [
    ["Weight-scaled, not one-size", "Uses mg per kg, so a 55 kg and a 95 kg athlete get genuinely different doses."],
    ["Timing per delivery form", "Capsules and coffee need about 60 minutes; caffeine gum works in roughly 10."],
    ["Sleep impact shown", "Half-life decay shows what is left at bedtime and when you drop below 100 mg."],
  ],
  faqs: [
    [
      "How much caffeine should I take before a workout?",
      "Three to six milligrams per kilogram of bodyweight is the range with the strongest performance evidence — that is 225-450 mg for a 75 kg person. Doses above about 9 mg/kg add no further benefit and increase side effects such as jitteriness, raised heart rate and gut upset.",
    ],
    [
      "How long before exercise should I take caffeine?",
      "About 60 minutes for capsules, coffee or anhydrous caffeine, because plasma caffeine peaks roughly 30 to 120 minutes after swallowing. Caffeine gum is absorbed through the cheek lining and works in around 10 minutes, which is why it is popular for events with unpredictable start times.",
    ],
    [
      "How long does caffeine stay in your system?",
      "The plasma half-life is about 5 hours in healthy adults, with a published range of roughly 3 to 7 hours. A 300 mg dose is therefore down to about 150 mg after 5 hours and 75 mg after 10. Smoking speeds elimination; pregnancy and oral contraceptives slow it considerably.",
    ],
    [
      "How much caffeine per day is safe?",
      "EFSA concluded that habitual intakes up to 400 mg per day, and single doses up to 200 mg, are of no safety concern for healthy adults. The figure drops to 200 mg per day during pregnancy and breastfeeding. If you have a heart rhythm disorder, high blood pressure or an anxiety disorder, talk to a doctor before using caffeine as a performance aid.",
    ],
  ],
};

export default seo;

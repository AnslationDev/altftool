const seo = {
  title: "Calories Burned Lifting Weights: MET by Set and Rest",
  metaDescription:
    "Times working sets, rest and warm-up separately at 3.5-6.0, 1.5 and 2.3 MET from the 2011 Compendium, using the ACSM equation. Gross and net kcal.",
  steps: [
    "Enter your Body weight in kg or lb, the Working sets in the session, Seconds per working set, Rest between sets (seconds) and Warm-up and cool-down (minutes).",
    "Choose What the working sets were — each option shows its MET value, 3.5 for machines and isolation work, 5.0 for compound lifts, 6.0 for hard powerlifting or bodybuilding sets — or tap the Short rest (60s), Standard (90s) or Strength (180s) preset.",
    "Read the Calories burned total with Where the energy actually went splitting sets, rest and warm-up, plus Net of resting metabolism and the same session at each Compendium intensity, then press Copy result.",
  ],
  intro:
    "Most calorie calculators ask how long you were in the gym and multiply by one number. That is the wrong shape for weight training, where a ninety-minute session might contain fifteen minutes of actual work and an hour of standing between sets. This calculator times the three phases separately and applies the published MET value for each: 3.5, 5.0 or 6.0 for the working sets depending on what you lifted (Compendium codes 02054, 02052 and 02050), 1.5 for resting on your feet between them, and 2.3 for the warm-up. Energy comes from the ACSM oxygen-cost equation, kcal = MET x 3.5 x kg / 1000 x 5 x minutes, and the breakdown shows exactly how much of the total each phase contributed — usually a surprise the first time you look.",
  useCases: [
    "Work out why a 90-minute lifting session burns less than a 45-minute run, and see the rest minutes that explain it.",
    "Compare a short-rest hypertrophy session against a long-rest strength session at the same total set count.",
    "Decide whether adding five more sets or cutting rest from three minutes to ninety seconds moves the number more.",
    "Give a client an honest session figure instead of the wildly high number a wrist tracker reports for lifting.",
  ],
  benefits: [
    [
      "Rest is counted properly",
      "Twenty sets have nineteen gaps between them, not twenty, and each gap is priced at 1.5 MET rather than the lifting MET.",
    ],
    [
      "Published MET values, cited",
      "Every intensity carries its 2011 Compendium of Physical Activities code so you can check the source rather than take the number on trust.",
    ],
    [
      "Gross and net both shown",
      "The net figure subtracts the resting metabolism you would have spent anyway over the same minutes — the only figure that belongs in an energy-balance calculation.",
    ],
  ],
  faqs: [
    [
      "How many calories does an hour of weightlifting burn?",
      "For an 80 kg lifter doing twenty 45-second working sets of compound lifts with 90 seconds of rest and a 10-minute warm-up — about 53 minutes in the gym — the total is roughly 197 kcal, of which 105 comes from the sets themselves and 60 from standing around between them. Scale roughly with body weight: a 60 kg lifter doing the same session lands near 148 kcal.",
    ],
    [
      "Why is the number lower than my fitness watch says?",
      "Wrist trackers infer energy from heart rate, and heart rate is a poor proxy during resistance training: it stays elevated between sets from the pressor response rather than from oxygen consumption, so the device keeps billing you for work that is not happening. The MET method prices the actual oxygen cost of each phase, which is why it comes out lower and why it is the method used in the research literature.",
    ],
    [
      "Does lifting burn calories after the session ends?",
      "Some, through excess post-exercise oxygen consumption, and the extra muscle you build raises resting metabolism a little over months. Neither is included here, because neither has a MET value and both vary enormously between people and sessions. This tool reports the session itself and says so rather than padding the figure with a guess.",
    ],
    [
      "Should I cut my rest periods to burn more?",
      "It raises the number in this calculator, because you replace 1.5 MET minutes with nothing or with more 5 MET minutes. Whether it is a good idea depends on what you came for: short rest suits hypertrophy and conditioning, but it costs you load on heavy compound work, and the handful of extra calories is a poor trade for a worse training stimulus.",
    ],
  ],
};

export default seo;

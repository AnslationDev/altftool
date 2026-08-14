const seo = {
  title: "Rock Climbing Calorie Calculator: Wall vs Belay",
  steps: [
    "Enter your body weight in kg or lb and the total session length in minutes.",
    "Choose what you were climbing, from \"Top-rope, easy to moderate routes\" at 5.8 MET to \"Bouldering at your limit / campus work\" at 8.0 MET, then the routes or problems attempted, the minutes on the wall per attempt, and optionally the height gained per attempt in m or ft.",
    "Read the session calories split between wall time and belaying, the kcal per route and average MET, and the physics cross-check giving the mechanical work of the vertical gain.",
  ],
  intro:
    "The Rock Climbing Calorie Calculator estimates a bouldering or roped session by separating minutes actually on the wall from minutes spent belaying, brushing and resting. Wall time uses the rock climbing codes from the Compendium of Physical Activities — 5.8 MET for low-to-moderate difficulty, 7.5 MET for hard ascent — converted with kcal/min = MET x 3.5 x kg / 200, and rest is priced at 2.0 MET. It also reports the pure lifting work, mass times gravity times height, as an independent physical cross-check.",
  useCases: [
    "Log a two-hour gym session where only about 45 minutes were spent on the wall.",
    "Compare a bouldering session of many short burns against a roped session of long routes.",
    "See how much of the energy cost is lifting your body weight and how much is grip and tension.",
    "Check whether the climbing figure your fitness watch reports is plausible.",
  ],
  benefits: [
    ["Belay time counted properly", "Rest is charged at 2.0 MET instead of full climbing intensity."],
    ["Post-2011 MET values", "Uses the measured 7.5 MET figure, not the discredited 11.0 that older tools still use."],
    ["A physics cross-check", "Reports the mechanical work of the vertical gain alongside the MET estimate."],
  ],
  faqs: [
    [
      "How many calories does rock climbing burn per hour?",
      "About 536 kcal per hour of continuous hard lead climbing for a 68 kg climber at 7.5 MET, and roughly 414 kcal per hour on easier top-rope terrain at 5.8 MET. A real two-hour session with 48 minutes on the wall comes to around 600 kcal once belay time is counted at 2.0 MET.",
    ],
    [
      "Does bouldering burn more calories than roped climbing?",
      "Per minute on the wall, usually yes — limit bouldering is rated around 8.0 MET against 7.5 for hard roped climbing. Per session it is often less, because bouldering burns are short and the rest between them is long, so total wall time is smaller.",
    ],
    [
      "Why do older calculators give a much higher number for climbing?",
      "The pre-2011 Compendium listed rock climbing at 11.0 MET. Direct measurement led the 2011 revision to cut it to 7.5 MET for hard ascent, so any tool still using the old figure overstates climbing by about 47%.",
    ],
    [
      "How much of climbing energy is just lifting body weight?",
      "Less than people expect. Raising a 68 kg climber 120 vertical metres is about 80 kJ of mechanical work, roughly 77 kcal at 25% muscular efficiency — around 13% of a 600 kcal session. The rest goes on grip, body tension and holding position.",
    ],
  ],
};

export default seo;

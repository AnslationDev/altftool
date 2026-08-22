const seo = {
  title: "Field Hockey Calories Burned: 7.8 MET",
  metaDescription:
    "Enter body weight and minutes on the pitch. Match play uses the Compendium's 7.8 MET; bench minutes are priced at the 1.3 MET standing rate.",
  steps: [
    "Enter your Body weight in kg or lb, then Minutes actually on the pitch and Minutes on the bench.",
    "Pick a Session type — Match play (7.8 MET), Training drills (7.0 MET) or Skills session (5.0 MET) — or tap the Full match (4 x 15 min), Club format (2 x 35 min) or One quarter chip.",
    "Read Total calories burned in kcal, with Burned on the bench, Per 15-minute quarter and Per 35-minute half broken out below, then press Copy result.",
  ],
  intro:
    "The Field Hockey Calorie Calculator estimates the energy cost of a match, a training session or a skills session from your body weight and the minutes you were actually on the pitch, using the MET equation kcal/min = MET x 3.5 x kg / 200. Match play uses the Compendium of Physical Activities value of 7.8 METs for field hockey; training and skills work use clearly named proxies because the Compendium publishes no hockey-specific training entries. Because hockey allows unlimited rolling substitutions, bench minutes are priced separately at the 1.3 MET standing rate.",
  useCases: [
    "Work out what a full FIH match of four 15-minute quarters costs at your body weight.",
    "Price the traditional club format of two 35-minute halves against the modern quarters format.",
    "Estimate a rotation player's burn when only 45 of the 60 playing minutes were spent on the pitch.",
    "Compare a midweek drills session with a weekend fixture when planning weekly training load.",
  ],
  benefits: [
    ["Rolling subs handled", "Bench minutes are counted at the standing rate rather than the match rate."],
    ["Quarter and half figures", "Shows the cost of a 15-minute quarter and a 35-minute half alongside the session total."],
    ["Named sources", "Says which values are hockey-specific and which are borrowed from a comparable activity."],
  ],
  faqs: [
    [
      "How many calories does a field hockey match burn?",
      "Roughly 530 kcal for a 65 kg outfield player over 60 minutes of playing time, from the Compendium's 7.8 MET value for field hockey. A player who only takes the pitch for 40 of those minutes burns closer to 355 kcal.",
    ],
    [
      "How long is a field hockey match?",
      "International hockey has used four quarters of 15 minutes since 2015, giving 60 minutes of playing time. Many club and school leagues still play two halves of 35 minutes, so the calculator offers both presets.",
    ],
    [
      "Does field hockey burn more calories than football?",
      "Per minute, yes, slightly. The Compendium rates field hockey at 7.8 METs against 7.0 for casual soccer, though competitive soccer is listed at 10.0 METs. The bigger factor is usually how many minutes you actually spend on the pitch.",
    ],
    [
      "Can goalkeepers use this calculator?",
      "Not reliably. Goalkeepers cover far less ground but carry roughly 6 to 8 kg of protective kit, a combination the 7.8 MET outfield value does not describe. Treat all results here as informational and speak to a coach or sports dietitian for position-specific guidance.",
    ],
  ],
};

export default seo;

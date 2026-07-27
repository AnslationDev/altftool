const seo = {
  intro:
    "A sweat rate calculator turns a before-and-after weigh-in into litres of sweat lost per hour, using the standard field formula: body-mass change plus fluid drunk minus urine passed, divided by session time. It is aimed at runners, cyclists, footballers, gym-goers and anyone training in heat who wants a drinking plan based on their own body rather than a generic number. The tool also reports body-mass loss as a percentage — the marker ACSM uses, where losses beyond 2% start to hurt endurance and heat tolerance.",
  useCases: [
    "A marathon runner tests the same 90-minute long run in April and in June to see how much extra fluid the heat costs them per hour.",
    "A football coach measures three players after a full training session and finds one loses nearly twice as much sweat as the rest, so his bottle plan changes.",
    "A cyclist works out how many 750 ml bottles to carry for a four-hour ride, and how much to drink back afterwards before the next day's session.",
  ],
  benefits: [
    ["Your number, not an average", "Sweat rates range from under 0.5 L/h to over 2.5 L/h between people in the same session."],
    ["Turns litres into a schedule", "Converts the hourly rate into a practical millilitres-per-15-minutes drinking target."],
    ["Covers salt as well as water", "Estimates sodium lost from your sweat concentration, so electrolyte choices are informed."],
  ],
  faqs: [
    [
      "How do I calculate my sweat rate?",
      "Sweat loss in litres equals your pre-exercise weight minus your post-exercise weight in kilograms, plus everything you drank in litres, minus any urine passed; divide that by the hours you exercised to get litres per hour. Weigh in minimal dry clothing after emptying your bladder, and towel off fully before the second weigh-in. One kilogram of body-mass change is treated as one litre of body water.",
    ],
    [
      "What is a normal sweat rate per hour?",
      "Most people fall between 0.5 and 2.0 litres per hour during moderate to hard exercise, with well-trained athletes in hot, humid conditions reaching 2.5 to 3.0 litres per hour. Anything much above 3 L/h is rare and usually points to a measurement error rather than an unusual physiology.",
    ],
    [
      "How much should I drink after training?",
      "ACSM guidance is to drink roughly 1.25 to 1.5 litres for every kilogram of body mass lost when your next session is less than about 12 hours away. You need more than the deficit itself because a share of any large drink is passed as urine rather than retained, and including sodium in the drink or the next meal improves how much you hold on to.",
    ],
    [
      "How much sodium do I lose in sweat?",
      "Sweat sodium concentration typically runs between 20 and 80 mmol per litre, which is about 460 to 1,840 mg of sodium per litre of sweat. Salt crusting on your skin or kit after training suggests you sit at the higher end. This is general information, not medical advice — anyone on a sodium-restricted diet or with a heart, kidney or blood-pressure condition should discuss fluid and salt intake with their doctor.",
    ],
  ],
};

export default seo;

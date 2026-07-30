const seo = {
  intro:
    "The Speed Distance Time Calculator divides a distance in kilometres by a time in hours to give average speed, then converts that single figure into km/h, mph and m/s alongside running pace in minutes per kilometre and minutes per mile. It is for drivers estimating a journey, runners and cyclists converting a finish time into pace, and students checking speed = distance ÷ time homework. It also reports how long 100 km takes at that pace, which is the number you need for fuel stops and route planning.",
  useCases: [
    "You drove 150 km in 2 hours 20 minutes and want to know the average speed you actually held, including stops, before deciding how early to leave next time.",
    "You finished a 10 km run in 52 minutes and need the per-kilometre and per-mile pace to enter into a training log or compare against a race target.",
    "A physics question gives distance and time in mixed units and you need the answer in m/s to plug into the next step of the working.",
  ],
  benefits: [
    [
      "One input, five units out",
      "The same average speed is shown as km/h, mph and m/s plus pace per km and per mile, so you never have to run a second conversion by hand.",
    ],
    [
      "Pace in proper mm:ss form",
      "Running pace is rendered as minutes and seconds — 5:12 /km, not 5.2 minutes — with the seconds rolled over correctly at 60.",
    ],
    [
      "Includes the 100 km yardstick",
      "It reports the time to cover 100 km at your average speed, the figure most useful for planning long drives and stage-by-stage rides.",
    ],
  ],
  faqs: [
    [
      "What is the formula for speed?",
      "Speed = distance ÷ time. Enter 150 km over 2 hours and you get 75 km/h. The result is an average over the whole journey, so any stops or slow sections are already baked into the number.",
    ],
    [
      "How do I enter a time like 1 hour 45 minutes?",
      "Convert it to decimal hours: 1 hour 45 minutes is 1.75, 90 minutes is 1.5, and 20 minutes is 0.333. The time field expects hours, so a value entered as 1.45 would be read as 1 hour 27 minutes.",
    ],
    [
      "How do you convert km/h to mph and m/s?",
      "Multiply km/h by 0.621371 for mph and divide by 3.6 for m/s. So 75 km/h is 46.60 mph and 20.83 m/s — both conversions are applied automatically to whatever speed your inputs produce.",
    ],
    [
      "What pace is a 10 km run in 50 minutes?",
      "5:00 per kilometre, which is 8:03 per mile and an average speed of 12 km/h. Pace per mile is pace per km multiplied by 1.609344, the exact number of kilometres in a mile.",
    ],
  ],
};

export default seo;

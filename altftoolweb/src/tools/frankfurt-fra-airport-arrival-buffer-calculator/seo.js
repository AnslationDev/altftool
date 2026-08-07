const seo = {
  intro:
    "This calculator turns a Frankfurt Airport departure time into the single time you need to leave home, working backwards through the boarding-gate close, passport control, security, bag drop and the drive itself. It applies the larger of three deadlines - the airport's advice of about 2 hours for a European flight and 3 hours for an intercontinental one, the airline check-in cut-off, and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. Schengen departures skip passport control entirely, which is the single biggest difference between the two flight types.",
  useCases: [
    "Deciding when to leave a Frankfurt hotel for a morning intercontinental departure from Concourse Z.",
    "Comparing a Schengen hop to Vienna with a long-haul flight from the same terminal on the same day.",
    "Planning a drive in from Mainz, Wiesbaden or Darmstadt with autobahn Stau time built in.",
  ],
  benefits: [
    ["Schengen logic built in", "Passport control is dropped entirely for intra-Schengen flights and added back for anything leaving the area."],
    ["Three deadlines, one answer", "Weighs gate close, check-in cut-off and airport advice together, and says whether your own queue/walk estimate or the airport's published advice is driving the plan."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I be at Frankfurt Airport?",
      "About two hours before a European flight and three hours before an intercontinental one is the guidance for FRA. Lufthansa closes check-in 45 minutes before a European departure and 60 minutes before an intercontinental one, and the boarding gate closes about 20 minutes before departure regardless.",
    ],
    [
      "Do I go through passport control for a flight inside Schengen?",
      "No. Flights between Schengen countries have no border check on departure, so you go from security straight to the gate - though the airline or the gate agent may still verify your identity document. Anything leaving the Schengen area, including flights to the United Kingdom, does pass through a Federal Police border check that typically takes 10 to 25 minutes.",
    ],
    [
      "How long is the walk to the gate at Frankfurt Airport?",
      "Frankfurt is a large airport and the piers are long: budget 20 minutes from security to a Terminal 1 A or B gate and closer to 30 for Concourse Z or a far Terminal 2 stand. Z gates sit above Concourse B and have their own passport control and escalators, which is where most late arrivals come unstuck.",
    ],
    [
      "How do I move between Terminal 1 and Terminal 2 at FRA?",
      "The free Sky Line elevated train runs between the terminals in about 10 minutes, with shuttle buses as a landside alternative. Allow 25 to 30 minutes door to door for a terminal change, and remember that a self-transfer on separate tickets means leaving the secure area and clearing security again.",
    ],
  ],
};

export default seo;

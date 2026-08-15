const seo = {
  title: "Carpool Rotation Scheduler with Fair Turn Counting",
  metaDescription:
    "Each trip date goes to the eligible driver with the fewest turns so far, ties broken by seats then name, and every row is checked against the group size.",
  steps: [
    "Fill Members and driver availability with one line per person in the Member | can drive yes/no | seats including driver format, for example Asha | yes | 4. Seats count the driver, so anyone entered as 1 or marked no stays a passenger.",
    "Paste one date per line into Trip dates. Each date in turn goes to the eligible driver with the fewest assignments so far, ties broken by the larger seat count and then alphabetically, so the same inputs always rebuild the same rota.",
    "The headline reads \"4 trip(s) scheduled\" with an eligible driver(s) caption, over a table of Date, Driver, Seats, Passengers and Check that marks each row Seats fit or Capacity review when the car is smaller than the group. Copy or Download saves it as carpool-rotation-scheduler.txt.",
  ],
  intro:
    "The Carpool Rotation Scheduler assigns a driver to each trip date by always picking the eligible person with the fewest turns so far, breaking ties by the largest vehicle and then alphabetically — so the driving load evens out across the group instead of falling on whoever volunteers most. List members as \"Name | can drive yes/no | seats including driver\" and paste one trip date per line, and you get a table of date, driver, seats, passengers and a capacity check. Only members who can drive and have more than one seat are put into the rotation.",
  useCases: [
    "Four families share the school run and the same two parents keep ending up behind the wheel — a rota built on turn counts settles who drives which week without anyone negotiating.",
    "A commuting group has one member with a three-seater and others with five: the scheduler flags any trip where the assigned car cannot hold everyone, so you know in advance which dates need a second vehicle.",
    "Someone in the group cannot drive at all but still shares the trips; marking them \"no\" keeps them as a passenger on every date without ever appearing in the driver column.",
  ],
  benefits: [
    [
      "Balances turns, not names",
      "Each date goes to whoever has driven least so far, so a rota stays fair even when the member list or the number of trips is uneven.",
    ],
    [
      "Checks the car actually fits",
      "Every row compares the driver's seat count against the group size and marks it \"Seats fit\" or \"Capacity review\" rather than assuming one car covers everyone.",
    ],
    [
      "Deterministic and re-runnable",
      "The same members and dates always produce the same rota, so you can re-generate it after adding a trip and show the group exactly what changed.",
    ],
  ],
  faqs: [
    [
      "How does it decide who drives?",
      "For each date in order, it picks the eligible driver with the fewest assignments so far. Ties go to the driver with more seats, and if that is still level, to the alphabetically first name.",
    ],
    [
      "Who counts as an eligible driver?",
      "Anyone marked yes in the second column with a seat count above 1 — the seats figure includes the driver, so a car entered as 1 carries no passengers and is left out of the rotation. Members marked no are listed as passengers only.",
    ],
    [
      "What does the Capacity review flag mean?",
      "It appears when the assigned driver's seat count is less than the total number of members, meaning at least one person will not fit in that car on that date. Plan a second vehicle or a different pickup for those trips.",
    ],
    [
      "Does this handle insurance or child seats?",
      "No — it only organises the rotation. Licence validity, insurance cover for other people's passengers, child restraints, accessibility, driver fatigue and pickup consent all sit outside the schedule and should be confirmed with the drivers and your insurer before the first trip.",
    ],
  ],
};

export default seo;

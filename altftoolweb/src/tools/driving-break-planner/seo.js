const seo = {
  title: "Driving Break Planner: Real Arrival Time with Stops",
  metaDescription:
    "Distance and a realistic average speed become a stop-by-stop running order: 15-minute breaks every 2 hours, meals, fuel and overnight halts counted.",
  steps: [
    "Under The drive, enter Distance (km), a Realistic average speed (km/h), the Start date and Start time, and a 'Traffic and detour buffer (% added to driving time)'.",
    "Under Stops, set 'Break after this many hours of driving', the length of each break, Meal stops, 'Range on a full tank (km, 0 to skip)', 'Maximum driving hours in a day' and 'Overnight halt (hours)' - or press 'Use the commercial driver rule' for a 30-minute break every 5 hours.",
    "Read the 'You arrive' time with the 'Total time off the road' and 'Effective door-to-door speed' rows, follow the Running order table of Clock, Distance and What happens, then press Copy result.",
  ],
  intro:
    "This planner turns a distance and a realistic average speed into a stop-by-stop running order and an honest arrival time, counting rest breaks, meal halts, refuelling and any overnight stop. The default rhythm is the standard fatigue advice of a 15-minute break after every two hours at the wheel; a preset switches to the commercial rule in the Motor Transport Workers Act, 1961 — eight hours a day with a half-hour rest after five hours of continuous work. Useful for anyone who keeps arriving three hours later than the map app promised.",
  useCases: [
    "Planning a 900 km drive and finding out it needs an overnight halt rather than one heroic day",
    "Setting a departure time that gets you off the highway before dark on a hill route",
    "Checking a commercial trip against the eight-hour daily driving limit before rostering a driver",
  ],
  benefits: [
    ["Stops are counted, not assumed", "Breaks, fuel halts and meals are added to driving time, which is where map estimates go wrong."],
    ["Splits long routes across days", "Applies your daily driving ceiling and adds the overnight halt to the arrival time."],
    ["Two rule sets", "Private-car fatigue advice by default, the commercial statutory limits with one click."],
  ],
  faqs: [
    [
      "How often should you take a break on a long drive?",
      "At least 15 minutes after every two hours at the wheel. That is the interval in standard road-safety guidance, including rule 91 of the UK Highway Code, and it is the default here. Fatigue builds faster at night and after a heavy meal, so shorten the interval rather than stretching it.",
    ],
    [
      "How many hours can you legally drive in a day in India?",
      "For commercial drivers, eight hours a day and forty-eight hours a week under section 13 of the Motor Transport Workers Act, 1961, with a rest interval of at least half an hour after five hours of continuous work. Private drivers have no statutory limit, but eight hours is a sensible ceiling and is what this tool defaults to.",
    ],
    [
      "What average speed should I plan for on an Indian highway?",
      "Far below the speed limit. Between 50 and 60 km/h is realistic for a mixed national-highway route once towns, level crossings and toll queues are counted, and 70 to 80 km/h on a controlled-access expressway. Enter a moving average rather than the limit, and add a traffic buffer for city exits.",
    ],
    [
      "How do I stay awake on a long drive?",
      "Stop. Coffee, loud music and cold air buy minutes, not hours, and a microsleep can happen with no warning at all. The reliable fix is a 15 to 20 minute nap in a safe parking area, and swapping drivers where possible. If the schedule only works by driving tired, the schedule is wrong.",
    ],
  ],
};

export default seo;

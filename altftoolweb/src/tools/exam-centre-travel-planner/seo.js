const seo = {
  title: "Exam Centre Travel Planner: Leave Time and Backup",
  metaDescription:
    "Work back from the gate-closing time on your admit card: when to get ready, when to leave, and the last time the backup route still works.",
  steps: [
    "Enter 'Gate-closing time (from the admit card)', the minutes you want to arrive before it, and 'Time to get ready at home (minutes)'.",
    "Under Primary route pick a Mode of travel such as Car or cab, Metro or City bus, enter Distance to the centre (km), and set Expected traffic from Clear to Severe; keep the backup-route box ticked to fill in a second route.",
    "Read the 'Leave home by' time, the 'Last moment to switch to the backup' row and the Route comparison table of Moving, Waiting and Access + egress, then press Copy result.",
  ],
  intro:
    "This planner works an exam-morning timetable backwards from the gate-closing time on your admit card: when to start getting ready, when to leave on the primary route, and the last moment you can still switch to a backup route and make it. Journey time is built from distance over a door-to-door average speed, plus half the service headway as expected waiting (the standard random-arrival result in transit planning), access and egress time, and a traffic multiplier applied to road modes only. It is for candidates travelling to a JEE, NEET, SSC, bank or board exam centre who want a buffer that is calculated, not guessed.",
  useCases: [
    "A candidate 12 km from the centre by car checking what time to leave so they arrive 30 minutes before a 9:30 am gate closing in weekday traffic",
    "A student comparing a car ride against a metro backup, and finding the exact clock time at which the backup must be taken instead",
    "A parent stress-testing the plan against severe traffic to decide whether the family should travel the evening before",
  ],
  benefits: [
    ["Backwards from the gate", "Every time in the plan is derived from the gate-closing time on the admit card, not from a hopeful departure hour."],
    ["A real switch-by time", "Shows the last clock moment the backup route still works, so a blocked road becomes a decision, not a panic."],
    ["Waiting counted honestly", "Adds half the service interval as expected wait for bus, metro and train, plus access and egress time that clear roads never shrink."],
  ],
  faqs: [
    [
      "How early should I leave for my exam centre?",
      "Leave so that you arrive at least 20-30 minutes before the gate-closing time printed on your admit card, after adding a buffer of about 25% of the journey (minimum 20 minutes) to the door-to-door travel time. Door-to-door time is more than driving time: it includes walking or parking at both ends and, for public transport, an average wait of half the service interval.",
    ],
    [
      "What is a switch-by time and why do I need a backup route?",
      "The switch-by time is the last clock moment at which the backup route can still get you to the centre before your target arrival, calculated as target arrival minus the backup's full journey time. If you are not clearly on your way by then, you take the backup immediately. A single blocked road with no planned alternative is one of the commonest reasons an otherwise prepared candidate misses a paper.",
    ],
    [
      "How much extra time does traffic add to an exam-day journey?",
      "In this planner a normal weekday multiplies road-mode moving time by about 1.25, peak hour by 1.6, and rain, processions or roadwork by around 2.1 — so a 36-minute clear-road drive becomes roughly 58 minutes at peak. Rail and metro running times barely change with traffic, which is why a slightly slower train route often beats a faster road route on an exam morning.",
    ],
    [
      "Can I enter the exam centre after the gate closes?",
      "No. NTA, SSC, IBPS and the board exam authorities all state that no candidate is admitted after the gate-closing or reporting deadline printed on the admit card or call letter, whatever the reason for the delay. That printed time is the only authority — plan to be inside well before it, and treat the times this tool produces as a planning aid, not permission to cut it fine.",
    ],
  ],
};

export default seo;

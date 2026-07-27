const seo = {
  intro:
    "This calculator turns a Delhi DEL departure time into the single time you need to leave home, by working backwards through the boarding-gate close, security, emigration, bag drop and the drive itself. It takes the larger of three deadlines — the airport's published reporting time (2 hours for domestic, 3 hours for international at Indira Gandhi International), your airline's bag-drop cut-off, and the time your own queue and walking estimates actually need — then subtracts the road journey after applying a traffic factor. Useful for early-morning T3 departures from Gurugram, Noida or South Delhi where the drive is the least predictable part of the trip.",
  useCases: [
    "Planning a 6 am international departure from T3 when the cab has to come from Noida through the morning build-up.",
    "Deciding whether a cabin-bag-only domestic flight really needs the full two hours, or whether a later start is safe.",
    "Sharing an exact pickup time with a driver or family member instead of a vague 'leave around five'.",
  ],
  benefits: [
    ["Three deadlines, one answer", "Compares gate close, bag-drop cut-off and airport advice, and reports which one is binding."],
    ["Traffic modelled separately", "Free-flow drive time is multiplied by a road-condition factor, so rush hour and clear roads give different answers."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I reach Delhi airport?",
      "Two hours before a domestic departure and three hours before an international one is the reporting time advised at Delhi airport. If you are checking a bag, the harder deadline is the airline's counter cut-off, which is commonly 45 minutes before a domestic flight and 60 minutes before an international one — miss it and you are refused even if the aircraft has not left.",
    ],
    [
      "How long does security take at Delhi T3?",
      "Budget 20 to 30 minutes for the pre-embarkation security check in a normal hour and closer to 40 during the morning and late-evening departure banks. Passengers enrolled in DigiYatra use a separate facial-recognition entry lane, which cuts the terminal-door queue but not the X-ray queue itself.",
    ],
    [
      "When does the boarding gate close at DEL?",
      "Indian carriers typically close the boarding gate 25 minutes before the scheduled departure time, and no boarding pass is accepted after that. That is why this calculator counts backwards from the gate-close time, not from the departure time.",
    ],
    [
      "Which terminal do I need at Delhi airport?",
      "T3 handles every international flight plus full-service domestic operations, while T1 and T2 handle domestic low-cost flights. The terminals are several kilometres apart with no airside link, so a T1 to T3 self-transfer needs 30 to 45 minutes on the free inter-terminal shuttle — check the terminal printed on your boarding pass before you set off.",
    ],
  ],
};

export default seo;

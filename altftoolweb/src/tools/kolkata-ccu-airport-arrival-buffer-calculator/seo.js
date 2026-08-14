const seo = {
  intro:
    "This calculator turns a Kolkata CCU departure time into the single time you need to leave home, working backwards through the boarding-gate close, security, emigration, bag drop and the drive along VIP Road or the EM Bypass. It uses the larger of two deadlines - the advised reporting time (2 hours domestic, 3 hours international at Netaji Subhas Chandra Bose International) and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. The airline's bag-drop cut-off is shown too, for reference, though it is earlier than both of those deadlines so it does not change the leave-home time.",
  useCases: [
    "Planning a morning domestic departure from Behala or Howrah, where the drive crosses the whole city.",
    "Timing a night flight to Bangkok or Dhaka when the terminal is at its busiest bank.",
    "Adding road time during Durga Puja week, when processions and pandal traffic close normal routes.",
  ],
  benefits: [
    ["Two deadlines, one answer", "Compares your own gate-close estimate against the airport's advised reporting time and reports which one is binding, with the bag-drop cut-off shown for reference."],
    ["Local road model", "Free-flow times from Salt Lake, New Town, Howrah and Behala, each editable with a live maps estimate."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I reach Kolkata airport?",
      "Two hours before a domestic departure and three hours before an international one is the reporting advice at Kolkata. With a checked bag the real deadline is the airline counter cut-off, commonly 45 minutes before domestic and 60 minutes before international departures, after which acceptance is refused.",
    ],
    [
      "How many terminals does Kolkata airport have?",
      "One. Netaji Subhas Chandra Bose International runs a single integrated terminal at Dum Dum where domestic and international check-in rows share the same departure hall, with the two streams separating after check-in at their own security and immigration channels. That removes the inter-terminal transfer risk you get at Delhi or Mumbai.",
    ],
    [
      "How far is Kolkata airport from the city?",
      "Dum Dum is roughly 17 km from Park Street, which is about 45 minutes in normal traffic on VIP Road and longer in the evening peak. Journeys from Howrah or the southern suburbs such as Behala cross the whole city and routinely need an hour or more.",
    ],
    [
      "When does the boarding gate close for a flight from CCU?",
      "Indian carriers typically close the gate 25 minutes before scheduled departure, and no boarding pass is accepted after that. The calculator counts backwards from gate close, so the walk from security to the pier is already included in the leave-home time it returns.",
    ],
  ],
};

export default seo;

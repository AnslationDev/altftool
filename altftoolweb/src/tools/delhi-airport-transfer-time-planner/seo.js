const seo = {
  intro:
    "This planner tells you the clock time to walk out of your door for a flight from Delhi's Indira Gandhi International Airport (DEL), by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. The road leg is free-flow time multiplied by a congestion factor for the hour you are actually travelling, so a 16 km run from Connaught Place is not treated the same at 07:00 and at 18:30. Airport Express metro journeys skip the congestion factor entirely, which is often the point of taking them.",
  useCases: [
    "Decide whether a 06:20 departure from T3 means leaving Gurugram at 03:30 or whether the empty roads let you leave later.",
    "Compare the Airport Express metro against a cab for the same flight when the evening peak is at its worst.",
    "Check whether a hand-baggage-only fare lets you leave later, once the bag-drop deadline stops being the binding constraint.",
  ],
  benefits: [
    [
      "Three deadlines, not one",
      "Shows which of bag drop, gate closing or reporting advice is actually setting your departure time.",
    ],
    [
      "Traffic priced by the hour",
      "The congestion factor is applied for the hour you are on the road, and the tool solves the circular dependency between the two.",
    ],
    [
      "Every lead time editable",
      "Bag-drop and gate cut-offs are airline rules that differ by carrier and fare, so you can replace the defaults with the ones on your booking.",
    ],
  ],
  faqs: [
    [
      "How early should I reach Delhi airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one, and at T3 that advice is usually the binding constraint rather than the airline cut-offs. With a checked bag on a domestic flight, the bag-drop deadline of typically 45 minutes before departure plus the queue is looser than the two-hour advice, so the advice is what should set your leave-home time.",
    ],
    [
      "How long does it take to get to IGI airport from Connaught Place?",
      "About 16 km, which is roughly 25 minutes on clear roads and 40 to 50 minutes through the evening peak by cab. The Airport Express metro covers the same corridor without touching road traffic, so its journey time barely moves between 07:00 and 19:00 — which is why it wins in the peak and loses at 03:00.",
    ],
    [
      "When does check-in close for a flight from Delhi?",
      "Bag drop typically closes 45 minutes before a domestic departure and 60 minutes before an international one, and the boarding gate usually closes 25 minutes before departure on a domestic flight. Those are airline rules rather than airport rules, so they vary by carrier and by fare type — the figure on your booking confirmation is the one that counts.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile — a morning peak roughly 09:00 to 11:00 and a heavier evening one from about 17:00 to 21:00 — with a weekend setting that flattens those peaks. Always check a live map before you leave, and add time for rain, roadworks, VIP movement or a diversion, none of which a typical-day profile can know about.",
    ],
  ],
};

export default seo;

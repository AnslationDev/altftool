const seo = {
  title: "Ahmedabad Airport (AMD): When to Leave for a Flight",
  metaDescription:
    "Hansol is 9 km from Kalupur, so the 2-hour reporting advice usually binds, not the drive. Works back through bag-drop and gate close too.",
  steps: [
    "Set \"Scheduled departure (24-hour)\" and \"Distance to the terminal (km)\", or tap a \"Starting from\" chip such as \"Ahmedabad Jn (Kalupur) · 9 km\" or \"Gandhinagar · 20 km\".",
    "Choose Domestic or International under \"Flight type\", then open \"Adjust the airline and airport lead times\" to replace the defaults for \"Bag drop closes\", \"Boarding gate closes\" and \"Airport reporting advice\" with the figures on your booking.",
    "Read the \"Leave by\" clock time and the \"Deadline set by\" chip — on a short AMD transfer it usually names the reporting advice rather than the drive — then press \"Copy plan\".",
  ],
  intro:
    "This planner gives the clock time to walk out of your door for a flight from Sardar Vallabhbhai Patel International Airport (AMD) at Hansol, by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. The road leg is free-flow time multiplied by a congestion factor for the hour you actually travel. Ahmedabad is a short-transfer city — under 10 km from Kalupur to the terminal — so the useful answer here is usually which terminal-side deadline governs, rather than how bad the traffic is.",
  useCases: [
    "Work out whether a 9 km run from Kalupur for an 07:40 domestic departure means leaving at 05:00 or 05:30.",
    "Plan a Gandhinagar start for an international flight, where the three-hour reporting advice dominates everything else.",
    "Check whether travelling hand baggage only lets you leave later, by seeing whether bag drop was the binding deadline.",
  ],
  benefits: [
    [
      "Short transfers handled honestly",
      "When the drive is 15 minutes, the tool says plainly that the reporting advice, not the road, is setting your alarm.",
    ],
    [
      "Three deadlines, not one",
      "Shows which of bag drop, gate closing or reporting advice is actually setting your departure time.",
    ],
    [
      "Every lead time editable",
      "Bag-drop and gate cut-offs are airline rules that differ by carrier and fare, so you can replace the defaults with the ones on your booking.",
    ],
  ],
  faqs: [
    [
      "How early should I reach Ahmedabad airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one, and at AMD that advice is almost always the binding constraint — the drive is short and the terminal is compact. With a checked bag, the airline's counter typically closes 45 minutes before a domestic departure, which is the looser of the two deadlines.",
    ],
    [
      "How far is Ahmedabad airport from the city centre?",
      "Hansol is about 9 km from Ahmedabad Junction at Kalupur and around 11 km from Ashram Road, which is roughly 20 to 30 minutes by cab depending on the hour. Gandhinagar is about 20 km out, so a start from there adds around 15 minutes on a clear run.",
    ],
    [
      "Which terminal do I need at Ahmedabad airport?",
      "T1 handles domestic departures and T2 handles international, and they are adjacent at Hansol. They are close enough that arriving at the wrong one is recoverable, but it still costs you time you had budgeted for the security queue — check your boarding pass before you set off.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile with a morning peak around 09:00 and an evening one from about 17:00 to 19:00, plus a weekend setting that flattens both. Ahmedabad's peaks are shallower than Mumbai's or Bengaluru's, but check a live map before you leave and add time for roadworks or a diversion.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Pune Airport (PNQ): When to Leave Home for a Flight",
  metaDescription:
    "Works back from departure through bag-drop close, gate close and the 2-hour reporting advice, with an hourly traffic factor. No metro serves Lohegaon.",
  steps: [
    "Set \"Scheduled departure (24-hour)\" and \"Distance to the terminal (km)\", or tap a \"Starting from\" chip such as \"Hinjawadi · 24 km\" or \"Viman Nagar · 4 km\".",
    "Choose Domestic or International under \"Flight type\", pick a mode in \"How are you getting there?\" (app cab, own car, auto rickshaw or PMPML bus — all road-bound at Lohegaon), and set \"Traffic assumption\" to the typical hourly profile or a fixed level.",
    "Read the \"Leave by\" clock time and the \"Deadline set by\" chip naming bag drop, gate close or reporting advice, then check \"The same X km by hour of departure\" table before pressing \"Copy plan\".",
  ],
  intro:
    "This planner gives the clock time to walk out of your door for a flight from Pune International Airport (PNQ) at Lohegaon, by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. The road leg is free-flow time multiplied by a congestion factor for the hour you actually travel. Pune is a case where the hour matters more than the distance: the airport is only 4 km from Viman Nagar, but a peak-hour run from Hinjawadi across the city can take longer than a clear-road trip twice its length.",
  useCases: [
    "Work out when to leave Hinjawadi for an evening flight, when the whole IT corridor is heading the other way.",
    "Check whether a 4 km run from Viman Nagar really lets you leave 90 minutes before departure, or whether the reporting advice says otherwise.",
    "See whether hand baggage only changes your plan, by checking whether bag drop was the binding deadline.",
  ],
  benefits: [
    [
      "Short trips handled honestly",
      "For a 4 km transfer the terminal lead, not the drive, is what sets your leave-home time — and the tool says so explicitly.",
    ],
    [
      "Three deadlines, not one",
      "Shows which of bag drop, gate closing or reporting advice is actually setting your departure time.",
    ],
    [
      "Hour-by-hour comparison table",
      "The same distance costed for every hour of the day, so the cost of crossing the city at 18:00 is visible before you commit.",
    ],
  ],
  faqs: [
    [
      "How early should I reach Pune airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one. PNQ is a compact terminal, so the queues are usually shorter than at a large metro airport — but the advice still governs, and with a checked bag the airline counter typically closes 45 minutes before departure.",
    ],
    [
      "How long does it take to get to Pune airport from Hinjawadi?",
      "About 24 km across the city, roughly 40 minutes on clear roads and comfortably over an hour through the evening peak. That corridor is where Pune's congestion concentrates, so leaving 45 minutes earlier genuinely changes the arithmetic — the hour-by-hour table shows by how much.",
    ],
    [
      "Is there a metro to Pune airport?",
      "No. Pune Metro's operating corridors do not serve Lohegaon, so every option here — cab, own car, auto, bus — shares the same roads and the same congestion factor. That is why the plan needs a real traffic allowance rather than a fixed schedule.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile with a morning peak around 08:00 to 10:00 and an evening one from about 17:00 to 20:00, plus a weekend setting that flattens both. Check a live map before you leave, and add time for rain or roadworks, which a typical-day profile cannot know about.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Chennai Airport (MAA): When to Leave Home",
  metaDescription:
    "Works back from your departure time through bag-drop close, gate close and the 2-hour reporting advice. Metro and Tirusulam rail skip the traffic factor.",
  steps: [
    "Set \"Scheduled departure (24-hour)\" and \"Distance to the terminal (km)\", or tap a \"Starting from\" chip such as \"Chennai Central · 20 km\" or \"T Nagar · 14 km\".",
    "Choose Domestic or International under \"Flight type\", pick a mode in \"How are you getting there?\" — the \"Chennai Metro (Blue Line to the airport terminus)\" and \"Suburban rail to Tirusulam station\" options drop the congestion factor — and tick \"I have a bag to check in\" if you are checking one.",
    "Read the \"Leave by\" clock time and the \"Deadline set by\" chip naming bag drop, gate close or reporting advice, then press \"Copy plan\" for the full door-to-departure breakdown.",
  ],
  intro:
    "This planner gives the clock time to walk out of your door for a flight from Chennai International Airport (MAA), by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. The road leg is free-flow time multiplied by a congestion factor for the hour you actually travel. Chennai is one of the few Indian cities where that factor can be sidestepped entirely: both the metro Blue Line and the suburban railway reach the airport at Tirusulam, and neither is affected by what the roads are doing.",
  useCases: [
    "Work out whether an 06:15 departure from Anna Nagar needs a 03:30 alarm or whether the empty roads let you sleep longer.",
    "Compare the Blue Line metro against a cab from T Nagar during the evening peak.",
    "Check whether a hand-baggage-only fare lets you leave later, once bag drop stops being the binding deadline.",
  ],
  benefits: [
    [
      "Rail options that ignore traffic",
      "Metro and suburban rail journeys are computed without a congestion factor, because at Tirusulam that is genuinely true.",
    ],
    [
      "Three deadlines, not one",
      "Shows which of bag drop, gate closing or reporting advice is actually setting your departure time.",
    ],
    [
      "Hour-by-hour comparison table",
      "The same distance costed for every hour of the day, so you can see what leaving earlier actually buys.",
    ],
  ],
  faqs: [
    [
      "Does the Chennai metro go to the airport?",
      "Yes — the Blue Line terminates at the airport, and the suburban railway also stops at Tirusulam, a short walk from the terminals. Both are immune to road congestion, so their journey times barely change between the morning peak and the middle of the night, which makes them far easier to plan around than a cab.",
    ],
    [
      "How long does it take to get to Chennai airport from Chennai Central?",
      "About 20 km by road, which is roughly 35 minutes on clear roads and 55 minutes or more through the evening peak. The metro covers the same corridor on a fixed schedule, so the gap between the two options widens sharply once the roads slow down.",
    ],
    [
      "How early should I reach Chennai airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one. With a checked bag on a domestic flight the airline's counter typically closes 45 minutes before departure — a looser deadline than the two-hour advice, which is therefore usually what sets the plan.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile with a morning peak around 08:00 to 10:00 and an evening one from about 17:00 to 19:00, plus a weekend setting that flattens both. Check a live map before you leave, and during the north-east monsoon add a generous allowance — waterlogging around the GST Road corridor can add far more than a typical-day profile predicts.",
    ],
  ],
};

export default seo;

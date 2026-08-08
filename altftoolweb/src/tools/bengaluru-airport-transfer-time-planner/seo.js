const seo = {
  title: "When to Leave for BLR: Bengaluru Airport Planner",
  metaDescription:
    "Work back from your BLR departure through bag-drop close, gate close and the 2h/3h reporting advice, with a congestion factor for your hour.",
  steps: [
    "Enter the scheduled departure in 24-hour time and the distance to the terminal in km, or tap an origin chip such as MG Road / city centre - 35 km.",
    "Pick the flight type, how you are getting there — app cab, own car or the BMTC Vayu Vajra airport bus — and the traffic assumption.",
    "Read the Leave by time, whether bag drop, the gate or the airport advice set it, and the hour-by-hour journey table, then press Copy plan.",
  ],
  intro:
    "This planner gives the clock time to walk out of your door for a flight from Kempegowda International Airport (BLR), by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. BLR sits about 35 km north of the city at Devanahalli, so the road leg is usually the largest block in the plan — and the one that swings most. Free-flow time is multiplied by a congestion factor for the hour you actually travel, and Bengaluru's peaks are the steepest of any Indian metro, which is why the same run from Koramangala can differ by close to fifty minutes depending on when you set off, and by nearly an hour if you hit a severe delay.",
  useCases: [
    "Work out whether a 09:30 departure from T1 means leaving Whitefield around 06:10 by app cab, or as early as 05:22 by bus, to clear the morning peak.",
    "Compare the Vayu Vajra bus against a cab from MG Road once the toll road and the congestion factor are both accounted for.",
    "Check whether travelling hand-baggage only changes your leave-home time, by seeing whether bag drop was the binding deadline.",
  ],
  benefits: [
    [
      "Built for a 35 km transfer",
      "The free-flow speed reflects NH-44 and the elevated tollway rather than an inner-city average.",
    ],
    [
      "Three deadlines, not one",
      "Shows which of bag drop, gate closing or reporting advice is actually setting your departure time.",
    ],
    [
      "Hour-by-hour comparison table",
      "The same distance costed for every hour of the day, so you can see exactly what leaving 45 minutes earlier buys you.",
    ],
  ],
  faqs: [
    [
      "How long does it take to reach Bengaluru airport from the city?",
      "MG Road to BLR is about 35 km, which is roughly 50 minutes on a clear night and can stretch to about 90 minutes through the evening peak on the typical weekday profile, or over 100 minutes if you hit a severe delay like heavy rain or a diversion. From Electronic City the same trip is around 55 km and the peak-hour spread is wider still, because the congestion factor compounds over every kilometre of the run.",
    ],
    [
      "How early should I reach BLR airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one. With a checked bag on a domestic flight the airline's bag drop typically closes 45 minutes before departure, which is a looser deadline than the two-hour advice — so at BLR the advice is normally what sets the plan, and the long transfer is what sets your alarm.",
    ],
    [
      "Is there a metro to Bengaluru airport?",
      "Not yet. Namma Metro's airport corridor is under construction, so as of now every option — cab, own car, Vayu Vajra bus — shares the same road and the same congestion. That is the practical reason a BLR transfer needs a larger allowance than one in a city where a rail link is already running.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile with a morning peak around 08:00 to 10:00 and an evening one from about 17:00 to 20:00, plus a weekend setting that flattens both. Check a live map before you leave, and add time for rain — a wet evening on the Hebbal flyover routinely exceeds anything a typical-day profile can predict.",
    ],
  ],
};

export default seo;

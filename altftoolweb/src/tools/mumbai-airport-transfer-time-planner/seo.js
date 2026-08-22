const seo = {
  title: "When to Leave for BOM: Mumbai Airport Planner",
  metaDescription:
    "Work back from your BOM departure through bag-drop close, gate close and the 2h/3h reporting advice; Metro Line 3 skips the congestion factor.",
  steps: [
    "Enter the scheduled departure in 24-hour time and the distance to T1 Santacruz or T2 Sahar, or tap an origin chip such as Colaba / Churchgate - 26 km.",
    "Pick Domestic or International, the mode — app cab, own car, Metro Line 3 (Aqua Line) or bus — and the traffic assumption.",
    "Read the Leave by time, which of bag drop, gate or airport advice set it, and the hour-by-hour journey table, then press Copy plan.",
  ],
  intro:
    "This planner gives the clock time to walk out of your door for a flight from Mumbai's Chhatrapati Shivaji Maharaj International Airport (BOM), by working backwards from the scheduled departure through the strictest of three deadlines: the airline's bag-drop close, the boarding gate close, and the airport's reporting advice of two hours for a domestic flight and three for an international one. The road leg is free-flow time multiplied by a congestion factor for the hour you are actually travelling, which matters more in Mumbai than almost anywhere else — the island city funnels northbound traffic onto a few arterials, so the same 26 km from Colaba can swing by well over half an hour between 03:00 and 18:30. Metro Line 3, which has stations at both terminals, skips the congestion factor entirely.",
  useCases: [
    "Decide what time to leave Colaba for a 07:00 departure from T2 without either missing bag drop or sitting airside for three hours.",
    "Compare the Aqua Line against a cab from Bandra Kurla Complex when the evening peak is at its worst.",
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
      "T1 and T2 handled separately",
      "Santacruz and Sahar are different buildings kilometres apart, so the distance you enter is the one that counts.",
    ],
  ],
  faqs: [
    [
      "How early should I reach Mumbai airport?",
      "Indian airports advise reporting two hours before a domestic departure and three hours before an international one, and at BOM that advice is usually stricter than the airline cut-offs. With a checked bag on a domestic flight, bag drop typically closes 45 minutes before departure, which is looser than the two-hour advice — so the advice, not the counter, should set your leave-home time.",
    ],
    [
      "How long does it take to get from South Mumbai to the airport?",
      "Colaba to T2 is about 26 km. On empty roads at 04:00 that is roughly 50 minutes by cab; through the evening peak it can stretch past 80 minutes. The Sea Link and the coastal road help, but the last stretch through Vile Parle and Sahar is where the time goes, which is why the planner applies the factor to the whole run rather than a flat average.",
    ],
    [
      "Does Metro Line 3 go to Mumbai airport?",
      "Yes — the Aqua Line runs underground with stations serving both Terminal 1 and Terminal 2, so the journey time barely moves between the morning peak and the middle of the night. That reliability is the real advantage: you can plan a metro transfer to the minute, whereas a road transfer needs a congestion allowance on top.",
    ],
    [
      "Is the traffic estimate live?",
      "No. It applies a typical weekday congestion profile — a morning peak roughly 08:00 to 10:00 and a longer evening one from about 17:00 to 21:00 — with a weekend setting that flattens those peaks. Check a live map before you leave, and during the monsoon add a generous allowance: waterlogging on the Western Express Highway can add far more than any typical-day profile predicts.",
    ],
  ],
};

export default seo;

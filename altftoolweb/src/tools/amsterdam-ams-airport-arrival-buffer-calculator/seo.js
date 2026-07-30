const seo = {
  title: "Amsterdam AMS Airport Arrival Buffer Calculator",
  intro:
    "This calculator turns an Amsterdam Schiphol departure time into the single time you need to leave home, working backwards through the boarding-gate close, passport control, security, bag drop and the drive itself. It applies the larger of three deadlines - Schiphol's advice of about 2 hours for a European flight and 3 hours for an intercontinental one, the airline check-in cut-off, and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. Schengen departures skip the border check entirely, which is the biggest single difference between the two flight types.",
  useCases: [
    "Setting a leave time from Amsterdam centre for an early intercontinental departure from Pier E or F.",
    "Checking whether a European flight really needs two hours when you have hand baggage only.",
    "Planning the drive from Utrecht, Rotterdam or The Hague with A4 congestion allowed for.",
  ],
  benefits: [
    ["Schengen logic built in", "Passport control is dropped entirely for Schengen flights and added back for everything else."],
    ["Three deadlines, one answer", "Compares gate close, check-in cut-off and airport advice, and says which one is binding."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I arrive at Schiphol?",
      "About two hours before a European flight and three hours before an intercontinental one. The tighter constraint is usually the bag-drop cut-off: KLM closes check-in 40 minutes before a European departure and 60 minutes before an intercontinental one, and the gate closes around 20 minutes before departure.",
    ],
    [
      "Does Schiphol have one terminal or several?",
      "One terminal with three departure halls that all feed the same airside area, so any hall gets you to any gate - although the walk differs. Schengen flights use piers B, C and the lower level of D, while non-Schengen flights use the upper D, E, F, G and H/M piers behind passport control.",
    ],
    [
      "How long does security take at Schiphol?",
      "Typically 15 to 30 minutes, and Schiphol publishes live security waiting times per departure hall on its own website and app before you set off. Screening is done per departure hall rather than at the gate, so once you are through you can move freely to any gate within your Schengen or non-Schengen zone.",
    ],
    [
      "Do I need passport control for a flight from Amsterdam to another European country?",
      "Only if the destination is outside the Schengen area - flights to the United Kingdom and Ireland, for instance, do pass through a Royal Marechaussee border check. Travel to Schengen countries such as Germany, Spain or Italy has no departure border check, though you still need a valid identity document for the airline.",
    ],
  ],
};

export default seo;

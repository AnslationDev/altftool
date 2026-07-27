const seo = {
  intro:
    "This calculator turns a Dubai DXB departure time into the single time you need to leave home, working backwards through the boarding-gate close, passport control, security, bag drop and the drive itself. It applies the larger of three deadlines - the three-hour arrival that Dubai Airports advises, the airline check-in cut-off, and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. Concourse A departures need extra time because the train ride and pier walk come after passport control.",
  useCases: [
    "Timing a 2 am Emirates long-haul departure from Dubai Marina, when Sheikh Zayed Road is clear but the terminal is at its busiest.",
    "Checking whether a flydubai flight from T2 needs a different leave-home time than a T3 departure from the same address.",
    "Planning a drive in from Abu Dhabi or Sharjah with enough margin for the morning border of the peak.",
  ],
  benefits: [
    ["Terminal-aware walking time", "Long-haul Concourse A and B departures carry a longer post-immigration walk than a regional flight."],
    ["Three deadlines, one answer", "Compares gate close, check-in cut-off and the three-hour airport advice, and says which one is binding."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How many hours before my flight should I arrive at Dubai airport?",
      "Three hours before departure is the arrival time Dubai Airports advises for DXB, and it is the figure this calculator uses by default. Emirates closes check-in 60 minutes before departure and shuts the boarding gate 20 minutes before departure, so the last hour of that three-hour window is not usable for check-in.",
    ],
    [
      "How long does passport control take at DXB?",
      "Usually 10 to 20 minutes. UAE residents and eligible visitors use smart gates that read the passport or Emirates ID and take under a minute once you reach the machine, while manual counters are slower during the heavy overnight departure banks.",
    ],
    [
      "Which terminal is my Dubai flight from?",
      "T3 is Emirates and its Concourses A, B and C; T1 handles most other international carriers through Concourse D; T2 on the north side of the airfield is flydubai and several regional operators. T2 is a separate drive from T1 and T3, so confirm the terminal before choosing a taxi drop-off.",
    ],
    [
      "Is three hours too much for a short flight from Dubai to Doha or Muscat?",
      "The airport still advises three hours, but if you have only cabin baggage, are checked in online and hold a smart-gate eligible passport, the process itself typically needs about 90 minutes to be at the gate before it closes. Set the baggage option to cabin only in the calculator and it will show you what your own steps actually need.",
    ],
  ],
};

export default seo;

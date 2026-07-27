const seo = {
  intro:
    "This calculator turns a Mumbai BOM departure time into the single time you need to leave home, by working backwards through the boarding-gate close, security, emigration, bag drop and the drive itself. It takes the larger of three deadlines - the reporting time the airport advises (2 hours domestic, 3 hours international at Chhatrapati Shivaji Maharaj International), your airline's bag-drop cut-off, and the time your own queue and walking estimates actually need - then subtracts the road journey after applying a traffic factor. Built for a city where the Western Express Highway can turn a 20-minute run into an hour.",
  useCases: [
    "Timing a cab from South Mumbai to T2 for an early-morning Gulf departure, when the drive is the biggest unknown.",
    "Checking whether a T1 domestic flight with only cabin baggage really needs a two-hour lead.",
    "Allowing for a T1 to T2 self-transfer on a separately booked connection, which means exiting one terminal and checking in again at the other.",
  ],
  benefits: [
    ["Three deadlines, one answer", "Compares gate close, bag-drop cut-off and airport advice, and reports which one is binding."],
    ["Monsoon-aware road factor", "A severe setting doubles the free-flow drive time for waterlogging and washed-out arterial roads."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I reach Mumbai airport?",
      "Two hours before a domestic departure and three hours before an international one is the reporting time advised at Mumbai airport. With a checked bag the harder deadline is the airline counter cut-off - commonly 45 minutes before a domestic flight and 60 minutes before an international one - because after that you are refused acceptance even if the aircraft is still on stand.",
    ],
    [
      "Which terminal is my Mumbai flight from, T1 or T2?",
      "T2 at Sahar handles every international flight and the full-service domestic operations, while T1 at Santacruz handles domestic low-cost flights. The two are about 5 km apart by road with no airside connection, so if your itinerary crosses terminals allow 45 minutes plus a fresh check-in - the terminal is printed on your boarding pass and can change between bookings.",
    ],
    [
      "How much time does the drive to Mumbai airport actually need?",
      "Take the free-flow time your maps app shows off-peak and multiply it by roughly 1.7 in weekday rush hour, or by 2 or more during heavy monsoon rain when the Western Express Highway and Andheri subway flood. That factor, not the queues inside the terminal, is what makes most people miss flights out of BOM.",
    ],
    [
      "When does boarding close for a flight from BOM?",
      "Indian carriers typically close the boarding gate 25 minutes before scheduled departure, and a boarding pass will not be accepted after that moment. This calculator therefore counts backwards from the gate-close time and adds the walk to the gate, which in T2 can be 10 to 15 minutes from security to a far pier.",
    ],
  ],
};

export default seo;

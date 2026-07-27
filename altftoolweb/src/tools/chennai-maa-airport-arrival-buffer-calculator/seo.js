const seo = {
  intro:
    "This calculator turns a Chennai MAA departure time into the single time you need to leave home, working backwards through the boarding-gate close, security, emigration, bag drop and the drive down GST Road. It applies the larger of three deadlines - the advised reporting time (2 hours domestic, 3 hours international at Chennai International), the airline bag-drop cut-off, and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. Handy for the heavy late-night bank of Gulf and South-East Asia departures.",
  useCases: [
    "Planning a midnight Singapore or Colombo departure from T1 when the cab has to come from OMR.",
    "Checking whether a domestic morning flight from T4 leaves room for a school drop-off first.",
    "Building extra road time into a northeast-monsoon week when GST Road and the Adyar bridges back up.",
  ],
  benefits: [
    ["Three deadlines, one answer", "Compares gate close, bag-drop cut-off and airport advice, and reports which one is binding."],
    ["Local road model", "Free-flow drive times from Velachery, OMR, Tambaram and other suburbs, multiplied by a traffic factor you choose."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I reach Chennai airport for an international flight?",
      "Three hours before departure is the reporting time advised for international flights at Chennai, and two hours for domestic. The binding deadline with a checked bag is usually the airline counter cut-off, commonly 60 minutes before an international departure and 45 minutes before a domestic one.",
    ],
    [
      "Which terminal do I use at Chennai airport?",
      "T1 handles international departures and T4 handles domestic, with the new integrated T2 taking a growing share of both. They are linked landside within the same complex, but always follow the terminal printed on your boarding pass because airline allocations keep shifting as T2 opens up.",
    ],
    [
      "How far is Chennai airport from the city centre?",
      "The airport is at Tirusulam, roughly 20 km from Chennai Central, which is about 40 minutes off-peak and an hour or more in the evening peak. The Chennai Metro blue line stops at the airport, which sidesteps the Kathipara and GST Road congestion entirely.",
    ],
    [
      "When does the boarding gate close at MAA?",
      "Indian carriers typically close the boarding gate 25 minutes before scheduled departure. Because the calculator counts back from gate close rather than from departure, the walking time from security to a far gate is already inside the answer it gives you.",
    ],
  ],
};

export default seo;

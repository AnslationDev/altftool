const seo = {
  intro:
    "This calculator turns a Singapore Changi departure time into the single time you need to leave home, working backwards through the boarding-gate close, immigration, security, bag drop and the drive itself. It uses the larger of three deadlines - the roughly three-hour arrival Changi advises, the airline check-in cut-off, and the time your own queue and walking estimates need - then subtracts the road journey after a traffic factor. It also accounts for the piers where screening happens at the boarding gate rather than at a central checkpoint, which changes when you have to be standing at the gate.",
  useCases: [
    "Planning a morning departure from the CBD when the ECP is at its busiest.",
    "Working out the leave-home time for a T4 flight, which has no Skytrain link and needs its own drop-off.",
    "Timing the drive up from Johor Bahru with the Woodlands checkpoint queue built in.",
  ],
  benefits: [
    ["Gate screening handled", "Piers that screen at the boarding gate need you there earlier; the calculator models that separately."],
    ["Three deadlines, one answer", "Compares gate close, check-in cut-off and the airport arrival advice, and says which one is binding."],
    ["Full timeline", "Shows the clock time each step starts, from leaving home to the aircraft door shutting."],
  ],
  faqs: [
    [
      "How early should I arrive at Changi Airport?",
      "About three hours before departure is Changi's standard advice, and airline check-in generally opens three hours ahead. Most full-service carriers close check-in 60 minutes before departure and close the boarding gate around 20 minutes before departure, so the practical window for dropping a bag is the first two hours of that period.",
    ],
    [
      "Why does Changi screen passengers at the boarding gate?",
      "Several piers in Terminals 1 and 3 run security screening in the gate hold room rather than at one central checkpoint, which means the gate opens earlier and the queue forms in front of it. If your gate works that way, plan to be there roughly 45 minutes before departure rather than strolling up at the last call.",
    ],
    [
      "How do I get between Changi terminals?",
      "Terminals 1, 2 and 3 are connected airside by the Skytrain and landside through Jewel, taking about 5 to 10 minutes. Terminal 4 is a separate building with no Skytrain link, served by a free shuttle bus that needs 15 to 20 minutes, so a T4 flight should be treated as its own drop-off point.",
    ],
    [
      "How long does immigration take at Singapore Changi?",
      "Usually under 10 minutes. Departure immigration runs on automated lanes that read your passport and biometrics, and Singapore has removed the need for a physical passport stamp for most travellers, so the queue rather than the process is the variable part.",
    ],
  ],
};

export default seo;

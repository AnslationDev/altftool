const seo = {
  intro:
    "This checker compares the weight you actually put on a two-wheeler — rider, pillion, saddlebags and top-box contents — against two separate limits: the payload the vehicle is registered for (gross vehicle weight minus kerb weight, both printed on the Indian RC) and the rear tyre's rated capacity read from the ISO/ETRTO load index table. It also splits the laden weight across the two axles and flags the point where too little weight is left on the front wheel. Use it before a two-up trip to see which limit binds first.",
  useCases: [
    "Planning a two-up highway ride with a top box and checking whether a 100/90-17 55P rear tyre, rated 218 kg, can carry the load",
    "Deciding how much luggage a 130 kg-payload scooter can take once both riders are aboard",
    "Working out why the steering has gone vague after strapping a heavy bag on the rear rack",
  ],
  benefits: [
    ["Two limits, not one", "Payload and rear tyre capacity are checked separately — either can bind first."],
    ["Axle split shown", "See how much weight leaves the front wheel when a pillion and rear luggage go on."],
    ["Rules quoted", "References the MV Act pillion rule and the 30 kg rear-container limit."],
  ],
  faqs: [
    [
      "How much weight can a 150 cc bike carry?",
      "Take the gross vehicle weight from your registration certificate and subtract the kerb weight — on most Indian 125-200 cc two-wheelers that payload works out to roughly 130 to 160 kg, which two average adults and a small bag will already use up. The exact figure is model-specific and is the one that counts, not a rule of thumb.",
    ],
    [
      "How many people can legally ride a two-wheeler in India?",
      "Two: the rider and one pillion. Section 128 of the Motor Vehicles Act 1988 and rule 123 of the Central Motor Vehicles Rules 1989 prohibit carrying more than one person in addition to the driver on a motorcycle, and a third rider is a ticketable offence.",
    ],
    [
      "What does the number in a tyre size like 100/90-17 55P mean?",
      "55 is the load index and P is the speed symbol. Load index 55 corresponds to 218 kg of maximum load for that tyre at its rated pressure; index 41 is 145 kg and index 65 is 290 kg. The rear tyre alone carries the whole rear axle load, so compare the axle figure against it directly.",
    ],
    [
      "Should I change tyre pressure when riding with a pillion?",
      "Yes — almost every owner's manual specifies a higher rear pressure for two-up riding, typically about 0.2 to 0.3 bar (3 to 4 psi) more than the solo figure, along with a stiffer rear preload setting. Running the solo pressure under a full load overheats the tyre and lengthens braking distances; follow the placard on your own bike.",
    ],
  ],
};

export default seo;

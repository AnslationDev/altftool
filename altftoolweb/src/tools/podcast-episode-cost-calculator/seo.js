const seo = {
  intro:
    "The true cost of a podcast episode is the sum of its direct spend (editing, transcription, artwork, music, guest fees), its share of recurring subscriptions such as hosting and software divided by the episodes you publish each month, and the studio gear amortised across the episodes it will serve. This calculator adds those three layers, then converts the total into cost per finished minute and into the sponsor CPM you would need to cover it, using the standard podcast revenue formula of downloads divided by 1,000 multiplied by the CPM rate. It suits independent hosts pricing a show and agencies quoting a production retainer.",
  useCases: [
    "Deciding whether outsourcing editing at an hourly rate still leaves a weekly show viable at four episodes a month",
    "Working out how many downloads an episode needs before a sponsor at a fixed CPM covers production",
    "Splitting a one-off microphone and interface purchase across the first hundred episodes to see the real per-episode load",
  ],
  benefits: [
    ["Three cost layers, one number", "Direct spend, subscription share and gear amortisation are combined rather than guessed."],
    ["Break-even in both directions", "Shows the CPM needed at your download count and the downloads needed at your CPM."],
    ["Cost per finished minute", "A comparable unit for judging whether a long-form format is worth the extra edit time."],
  ],
  faqs: [
    [
      "How much does it cost to produce one podcast episode?",
      "It depends almost entirely on whether you edit yourself. A self-edited show can run under a few hundred rupees an episode once hosting is split across the month, while an outsourced edit at 4 hours and Rs 1,500 an hour adds Rs 6,000 before artwork, music or transcription. Enter your own rates above rather than relying on an average.",
    ],
    [
      "What is CPM in podcast sponsorship?",
      "CPM is the price a sponsor pays per 1,000 downloads of an episode, so revenue equals downloads divided by 1,000 times the CPM. At 2,000 downloads and a Rs 500 CPM an episode earns Rs 1,000, which is why small shows usually need flat-fee or affiliate deals rather than CPM pricing.",
    ],
    [
      "Should podcast equipment be counted in the per-episode cost?",
      "Yes, but spread rather than charged in full. Divide the one-off spend by the number of episodes the gear should last: a Rs 60,000 setup over 100 episodes adds Rs 600 per episode. Charging it all to episode one makes the first episode look impossible and every later one look free.",
    ],
    [
      "How do I lower the cost per podcast episode?",
      "The two biggest levers are edit time and cadence. Tighter recording discipline cuts billed editing hours directly, and publishing more often spreads the same monthly hosting and software fees over more episodes — moving from 2 to 4 episodes a month halves the subscription share carried by each one.",
    ],
  ],
};

export default seo;

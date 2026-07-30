const seo = {
  intro:
    "The Podcast Episode Length Planner fits a running order to a target runtime by holding your fixed segments at the durations you set and splitting whatever time is left between the flexible segments in proportion to their weights. Every block comes back with a start and end timestamp, a share of the episode and a word budget at your chosen speaking rate, which defaults to 150 words per minute. It is for producers who know an episode has to land at, say, 32 minutes and need to know how long the interview can actually run.",
  useCases: [
    "Your show has a hard 30-minute slot, three ad breaks and an intro read, and you need to tell the host how many minutes the main interview can occupy.",
    "You are writing a scripted narrative episode and want a word count per section so the draft comes in at length instead of being cut in the edit.",
    "A sponsor asks for a second mid-roll and you want to see whether the episode's advertising share crosses the point where listeners start noticing.",
  ],
  benefits: [
    [
      "Weights, not guesswork",
      "A flexible segment weighted 3 gets three times the leftover time of one weighted 1, so re-balancing the show is one number rather than a round of manual arithmetic.",
    ],
    [
      "Refuses impossible running orders",
      "If the fixed blocks already exceed the target it tells you by how many minutes instead of quietly handing back a negative interview length.",
    ],
    [
      "Timestamps and scripts in one pass",
      "Each row carries its clock start, its duration in m:ss and its word budget, so the same plan drives both the show notes and the script.",
    ],
  ],
  faqs: [
    [
      "How many words is a minute of podcast audio?",
      "About 150 words per minute for unhurried conversational English, which is the planner's default. Measured conversational speech generally sits in the 140-160 wpm band and audiobook narration is standardised near 150; scripted reads run faster, so the rate is editable anywhere from 80 to 260 wpm.",
    ],
    [
      "How much advertising is too much in an episode?",
      "The planner flags an ad load above 15% of runtime. That is a rule of thumb about where listener complaints tend to start, not a platform limit — on a 30-minute episode it works out to roughly four and a half minutes of spots.",
    ],
    [
      "What ad lengths should I budget for?",
      "The standard audio spot lengths are 15, 30 and 60 seconds. Entering those as fixed segments keeps the plan honest, because a sold 30-second pre-roll takes exactly half a minute regardless of how the rest of the episode moves.",
    ],
    [
      "What happens if all my segments are fixed?",
      "The plan is rejected and you are told the real total, because with no flexible block there is nothing to absorb the difference. Add at least one flexible segment or change the target; the planner also caps episodes at 600 minutes.",
    ],
  ],
};

export default seo;

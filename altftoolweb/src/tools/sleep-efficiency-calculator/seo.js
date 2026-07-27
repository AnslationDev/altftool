const seo = {
  intro:
    "Sleep efficiency is total sleep time divided by time in bed, expressed as a percentage — this calculator derives both from a single night of your sleep diary. It subtracts the time you spent falling asleep, the minutes awake during the night and any time lying awake before getting up, then reports the percentage alongside the 85% benchmark used in adult sleep research and CBT-I. It also shows the time-in-bed window sleep restriction therapy would target for that amount of sleep.",
  useCases: [
    "You are keeping a two-week sleep diary before a clinic appointment and want each night scored consistently.",
    "You suspect you are spending nine hours in bed for six hours of sleep and want the actual percentage.",
    "You are following a CBT-I programme and need to know whether last week's efficiency justifies extending the window by 15 minutes.",
    "You want to see whether a change — later bedtime, no afternoon coffee, a darker room — moved efficiency rather than just total hours.",
  ],
  benefits: [
    ["Consensus diary definitions", "Uses the standard sleep-diary components: latency, wake after sleep onset and time awake before rising."],
    ["Benchmarked, not vague", "Scores against the 85% healthy threshold and the 90% well-consolidated level."],
    ["Shows the therapy window", "Reports the time-in-bed window matching your sleep, floored at the 5-hour minimum used clinically."],
  ],
  faqs: [
    [
      "What is a good sleep efficiency percentage?",
      "85% or higher is generally considered normal for adults, and 90% or above indicates well-consolidated sleep. Efficiency below 85% means a meaningful part of the night is spent awake in bed, which is one of the markers used when assessing insomnia.",
    ],
    [
      "How do you calculate sleep efficiency?",
      "Divide total sleep time by time in bed and multiply by 100. Time in bed runs from when you got in to when you finally got out; total sleep time is that figure minus the minutes to fall asleep, the minutes awake during the night and any time lying awake before rising.",
    ],
    [
      "Can sleep efficiency be too high?",
      "Efficiency close to 100% with short total sleep usually signals sleep deprivation rather than good sleep — you are falling asleep instantly because you are over-tired. Read it together with total sleep time and how you feel during the day, not on its own.",
    ],
    [
      "What is sleep restriction therapy and does this replace it?",
      "It is a CBT-I technique that shortens time in bed to roughly your actual sleep time, then extends it about 15 minutes at a time once efficiency stays above 85%, with a floor of about 5 hours. This calculator only shows the arithmetic — the therapy itself should be run with a clinician, especially if you drive, operate machinery, or have epilepsy or bipolar disorder.",
    ],
  ],
};

export default seo;

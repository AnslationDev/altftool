const seo = {
  title: "Stroop Effect Test: 30 Trials, Interference in ms",
  metaDescription:
    "Name the ink colour, not the word, across 30 trials with a 5-second limit each. Get accuracy, average reaction time and incongruent minus congruent in ms.",
  steps: [
    "Press Start the Experiment, read the three instructions, then press Start Test and wait out the 3-second countdown.",
    "For each of the 30 trials, click the colour button matching the ink colour — or press keys 1-6 — within the 5-second limit, ignoring what the word says.",
    "On Your Stroop Test Results, read Accuracy, Avg Reaction, Congruent RT, Incongruent RT and the Stroop Effect, which is incongruent minus congruent in ms.",
  ],
  intro:
    "The Stroop Effect Test shows you colour words printed in a mismatched ink colour and asks you to name the ink, not the word — then measures how much slower you are on those conflict trials than on matching ones. That difference in milliseconds is your Stroop effect: incongruent average reaction time minus congruent average reaction time, the standard way the effect is quantified since Ridley Stroop's 1935 experiment. You get 30 trials across six colours, a 5-second limit each, and a breakdown of accuracy, average reaction time and the interference cost at the end.",
  useCases: [
    "A psychology student who needs a working demonstration of cognitive interference to describe in a coursework write-up, with their own numbers rather than a textbook figure.",
    "Someone curious whether they focus better in the morning or after a late night, running the same 30-trial test at both times and comparing the interference gap.",
    "A teacher opening a lesson on attention and executive function by having the class take the test and compare congruent versus incongruent timings.",
  ],
  benefits: [
    ["Reports the actual interference cost", "Splits your reaction times into congruent and incongruent averages and subtracts them, instead of showing one blended score."],
    ["Weighted toward conflict trials", "Roughly 70% of the 30 trials are incongruent, so the measurement rests on enough conflict data to be meaningful."],
    ["Timed responses, not untimed guessing", "Each trial expires after 5 seconds and records the miss, so you cannot slow down to eliminate interference."],
  ],
  faqs: [
    [
      "What is a normal Stroop effect score?",
      "Most adults are somewhere between roughly 100 and 200 milliseconds slower on incongruent trials than congruent ones. The size varies with age, tiredness and screen setup, so your own change across repeat sessions is more informative than comparing against a stranger.",
    ],
    [
      "How is the Stroop effect calculated here?",
      "It is your mean reaction time on correct incongruent trials minus your mean on correct congruent trials, in milliseconds. Only correct answers count, so a fast wrong guess cannot shrink the number.",
    ],
    [
      "Why is it so hard to name the colour instead of reading the word?",
      "Reading is automatic for fluent readers, so the word meaning is processed before you can suppress it, and your response has to override that head start. The extra time is the cost of that override, which is why the task is used as a measure of executive control.",
    ],
    [
      "How many trials does the test run and how long do I get?",
      "Thirty trials, with a 5-second limit on each; about 30% show a matching word and colour and the rest are mismatched. A full run takes about two to three minutes including the 3-second countdown.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Attention Span Test: A-not-X CPT in the Browser",
  metaDescription:
    "A browser Continuous Performance Task: letters flash for 250 ms, press space for all but X. Get accuracy, reaction time, omission and commission errors.",
  intro:
    "The Attention Span Test runs an A-not-X Continuous Performance Task in the browser: single letters flash for 250 ms every 1.25 seconds and you press the spacebar for every letter except X, which appears on roughly 15% of trials. It is built for anyone who wants a repeatable, timed measure of sustained attention rather than a personality-style quiz — students checking focus before study blocks, shift workers gauging fatigue, or people curious how their vigilance holds up over minutes. You pick a 1-, 2- or 5-minute run and finish with accuracy, average reaction time, omission errors and commission errors broken out separately.",
  useCases: [
    "Comparing your focus at 9am against the same 2-minute run at 4pm to see whether your afternoon slump is real or imagined.",
    "Checking whether a night of five hours' sleep actually slows you down, by re-running the identical 5-minute test after a normal night and reading the change in average reaction time.",
    "Getting a concrete number to describe 'I keep zoning out' before a conversation with a doctor or a study coach, instead of trying to explain the feeling from memory.",
  ],
  benefits: [
    [
      "Separates zoning out from acting too fast",
      "Missed letters are counted as omission errors and spacebar presses on X as commission errors, so inattention and poor impulse control show up as two different numbers rather than one blended score.",
    ],
    [
      "Millisecond-accurate timing",
      "Reaction time is measured with performance.now() from the exact frame the letter is painted, so results are not rounded to the nearest animation tick or network round trip.",
    ],
    [
      "Long enough to expose fatigue",
      "The 5-minute option runs about 240 trials, which is where vigilance decrement typically appears — a 1-minute check is too short for attention to drift.",
    ],
  ],
  faqs: [
    [
      "What is a Continuous Performance Task?",
      "A Continuous Performance Task is a timed vigilance test where you respond to a fast stream of stimuli and withhold your response for one specific target. This tool uses the A-not-X variant: press the spacebar for every letter, hold back on X. The withholding is the hard part, and it is what makes the task measure inhibitory control as well as attention.",
    ],
    [
      "What is a good reaction time on this test?",
      "Under 400 ms is flagged as a strong result here, 400-600 ms is treated as typical, and above 600 ms is flagged for review. Simple visual reaction times in healthy adults commonly land in the 250-450 ms range, so most people who are rested and undistracted finish somewhere in the middle band.",
    ],
    [
      "How is the attention grade calculated?",
      "The grade comes from two thresholds: 90% or better accuracy on non-X letters with no more than 2 presses on X scores Excellent, and accuracy below 80% or more than 5 presses on X scores Below Average. Everything in between is graded Average. Accuracy is hits divided by the number of non-X trials.",
    ],
    [
      "Can this test diagnose ADHD?",
      "No. This is an informational self-check, not a clinical instrument — it is not normed against an age-matched population and a single browser session cannot control for screen lag, caffeine, sleep or distraction. Clinical CPTs are administered and interpreted alongside history and rating scales, so bring any concerns to a qualified clinician.",
    ],
  ],
};

export default seo;

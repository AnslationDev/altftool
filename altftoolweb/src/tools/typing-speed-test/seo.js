const seo = {
  title: "Typing Speed Test: Net WPM & Accuracy in 30, 60",
  metaDescription:
    "Net WPM counts correct characters ÷ 5 over a 30, 60 or 120 second run. The timer starts on your first keystroke; results add raw WPM and accuracy.",
  steps: [
    "Pick 30s, 60s or 120s, then click the word area — the timer starts on your first keystroke.",
    "Press Space to commit each word; Esc pauses and Resume restarts the countdown, and pasting is blocked.",
    "The results card gives Net WPM with Raw WPM, Accuracy, Correct and Incorrect counts, plus Try again and New words.",
  ],
  intro:
    "This typing speed test measures net words per minute — correctly typed characters divided by five, normalised to a minute — over a 30, 60 or 120 second run against a random stream of common English words. The clock starts on your first keystroke, Space commits each word, and the results card breaks the run into net WPM, raw WPM, accuracy and the exact correct and incorrect character counts. It is for anyone who needs a defensible number rather than a vague sense of being fast, and it keeps your best net WPM so later runs have something to beat.",
  useCases: [
    "A job posting says 45 WPM minimum and you want to check your real 60-second number, with accuracy, before you claim it on an application.",
    "You are comparing two keyboards or two layouts and need the same 120-second test run on each to see which one you are actually faster on.",
    "You want a daily two-minute warm-up before writing, and you use the accuracy figure rather than raw speed to tell whether you are typing carelessly today.",
  ],
  benefits: [
    [
      "Net and raw side by side",
      "The results card shows both, so you can see how much of your raw speed is being eaten by errors.",
    ],
    [
      "Character-level scoring",
      "Every character is compared against its target position, and the space after a word counts correct only if the whole word matched.",
    ],
    [
      "Endless word stream",
      "Words are drawn at random from a ~300-word pool and topped up as you go, so a 120-second run never runs out of text.",
    ],
  ],
  faqs: [
    [
      "What is the difference between net WPM and raw WPM?",
      "Net WPM counts only correctly typed characters divided by 5, while raw WPM counts every character you typed divided by 5 — both scaled to one minute. The gap between the two numbers is the cost of your mistakes, so a large gap means slowing down would raise your net score.",
    ],
    [
      "How long should the test be?",
      "You can run 30, 60 or 120 seconds; 60 seconds is the common benchmark quoted by employers and typing certifications. Because net WPM is normalised to a minute, scores from all three durations are directly comparable, though longer runs average out lucky streaks.",
    ],
    [
      "How is accuracy calculated?",
      "Accuracy is correct characters divided by all evaluated characters, correct plus incorrect, expressed as a percentage. Extra characters typed beyond the target word count as incorrect, and a word committed with any mistake also adds one incorrect character for its trailing space.",
    ],
    [
      "Can I pause or restart mid-test?",
      "Press Escape while typing to pause the countdown, then Resume to continue from the remaining time. Restart resets the run with the same words, and after a finished run you can also request a fresh word set; pasting is blocked so a score always reflects real keystrokes.",
    ],
  ],
};

export default seo;

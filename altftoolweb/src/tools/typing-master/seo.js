const seo = {
  intro:
    "Typing Master is a timed typing drill that scores you on the standard words-per-minute formula — correctly typed characters divided by five, divided by the minutes elapsed — over a 15, 30 or 60 second run. You pick a duration, type the shown paragraph, and get WPM, accuracy percentage, error count and characters typed, with every wrong character turned red as you go. It is built for people who want a short, repeatable drill rather than a course, so you can run the same 60 seconds daily and watch the number move.",
  useCases: [
    "You have a data-entry or support role interview that lists a typing requirement, and you want to know whether your real 60-second WPM clears it before the test day.",
    "You keep making the same mistakes on punctuation and capitals, so you run 15-second bursts and watch which characters light up red to find the pattern.",
    "You are rebuilding speed after switching to a new keyboard layout or a mechanical board and need a fixed drill to compare week to week.",
  ],
  benefits: [
    [
      "Correct characters only",
      "WPM counts only characters that match the target text, so hammering keys randomly cannot inflate the score.",
    ],
    [
      "Three drill lengths",
      "15, 30 and 60 second modes each carry their own paragraph set, so a short warm-up is not the same text as the long run.",
    ],
    [
      "Live error marking",
      "Mismatched characters turn red the moment you type them and the caret stays on the next expected character.",
    ],
  ],
  faqs: [
    [
      "How is WPM calculated here?",
      "WPM is the number of correctly typed characters divided by 5, then divided by the elapsed minutes. The five-character standard word is the convention typing tests use so that long and short words count fairly, and only characters matching the target text are counted.",
    ],
    [
      "What score counts as a good result?",
      "The test grades you WINNER at 50 WPM or more with at least 90% accuracy on the 30 and 60 second runs, and at 30 WPM with 85% accuracy on the 15 second run. Below 20 WPM on the longer runs (10 WPM on the 15 second run) it flags the attempt as a loss.",
    ],
    [
      "How is accuracy different from the error count?",
      "Accuracy is the share of the characters you typed that matched the target, shown as a percentage, while the error count is a running tally of wrong keystrokes. Backspacing removes a character and decrements that tally, so accuracy is the more stable measure of a run.",
    ],
    [
      "Can I practise on different text?",
      "Yes — the Change Paragraph button cycles through the three paragraphs stored for the duration you selected and resets the run. Switching the timer to 15, 30 or 60 seconds also swaps in that mode's own set of texts.",
    ],
  ],
};

export default seo;

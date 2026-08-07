const seo = {
  intro:
    "Typing Tutor is a 20-lesson touch-typing course that runs from home-row drills through numbers, symbols and full paragraphs, scoring each attempt with the standard WPM formula — correct characters divided by five, per minute — alongside accuracy and error count. An on-screen keyboard colour-codes which of the eight fingers owns each key in the current lesson, so you learn placement rather than hunting. Progress, best WPM and best accuracy per lesson are stored in your browser and charted so you can see speed and accuracy trend across sessions.",
  useCases: [
    "You type with four fingers and want to convert to touch typing properly, so you start at the left-hand home row lesson and only move up once accuracy holds.",
    "You are fast on prose but slow on code and passwords, so you drill the numbers row, symbols and technical-text lessons specifically.",
    "You are teaching a child or a student keyboarding and need a fixed lesson ladder with recorded best scores rather than an open-ended speed test.",
  ],
  benefits: [
    [
      "Finger-mapped keyboard",
      "Each active key is tinted by the finger that should press it, with eight distinct colours across pinky, ring, middle and index on both hands.",
    ],
    [
      "Graded lesson ladder",
      "Twenty lessons span Beginner, Intermediate and Advanced, from asdf-jkl; up to punctuation, numbers, symbols and code snippets.",
    ],
    [
      "Per-lesson records kept locally",
      "Best WPM and best accuracy are saved for every lesson and plotted as session history charts, so improvement is visible lesson by lesson.",
    ],
  ],
  faqs: [
    [
      "What order should I do the typing lessons in?",
      "Work through the Beginner set first — left-hand home row, right-hand home row, then the full home row — before the top and bottom rows. The ladder is ordered so each lesson only introduces keys reachable from positions you have already drilled, and the Intermediate and Advanced tiers then add shift, punctuation, numbers and symbols.",
    ],
    [
      "How are WPM and accuracy calculated?",
      "WPM is correctly typed characters divided by 5, divided by the minutes elapsed — the five-character word is the standard convention. Accuracy is correct characters as a percentage of your current keystroke count, which resets when you backspace, so corrected mistakes don't count against your final score.",
    ],
    [
      "What accuracy should I aim for before moving on?",
      "Aim for 90% or better — the tool shows accuracy in green at 90% and above, amber from 75% to 89%, and red below 75%. Speed built on sub-90% accuracy tends to stall, because errors and corrections cost more time than the extra keystrokes gain.",
    ],
    [
      "Is my progress saved if I close the tab?",
      "Yes — lesson records and session history are written to your browser's local storage under the key typing-tutor-progress, so they survive closing the tab. They are per-browser and per-device, so a different browser or a cleared cache starts fresh.",
    ],
  ],
};

export default seo;

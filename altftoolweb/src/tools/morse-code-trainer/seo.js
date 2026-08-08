const seo = {
  title: "Morse Code Trainer with Audio Quiz and 5-40 WPM Tones",
  metaDescription:
    "Learn all 36 Morse characters in four groups, unlocked at 80% accuracy over 5 attempts, with tone playback at 5-40 WPM and a listening quiz.",
  steps: [
    "Open the Learn tab to see the chart for your unlocked group, which starts with E T A N I S.",
    "Switch to Practice and tap \"Dot (.)\" or \"Dash (-)\" to build each character, or Quiz to hear a character and pick it from four options; Playback sounds typed text at 5 to 40 WPM.",
    "Watch the Mastered count and the Group counter — a character counts as mastered at 80% accuracy over at least 5 attempts — with scores kept in your browser's local storage.",
  ],
  intro:
    "The Morse Code Trainer teaches the 36 International Morse characters — 26 letters and 10 digits — in four progressive groups, unlocking the next set only once you can hit 80 percent accuracy over at least five attempts on every character in the current one. Six modes cover it from both directions: a reference chart, text-to-Morse and Morse-to-text conversion, tone playback at 5 to 40 WPM, a tap-the-dots practice drill, and a listening quiz that plays a character and asks you to name it. Per-character accuracy, streaks and unlocked groups are kept in your browser, so progress survives between sessions.",
  useCases: [
    "You are working toward an amateur radio licence and want a drill that keeps score per letter, so the ones you keep failing are visible instead of buried in an overall percentage.",
    "You can read a Morse chart but freeze when you actually hear it, so you run the quiz mode where a character is sounded and you pick it from four options.",
    "You have ten minutes on a commute and want to practise sending rather than receiving, tapping dot and dash buttons to build each character symbol by symbol.",
  ],
  benefits: [
    ["Learning order that matches frequency", "Training starts with E, T, A, N, I and S — the shortest and most common characters — instead of marching through the alphabet from A."],
    ["Mastery is measured, not assumed", "Each character is tracked as new, learning or mastered from your own hit rate, and the next group stays locked until the current one is genuinely solid."],
    ["Sending and receiving both drilled", "The practice mode has you construct characters from dots and dashes, while the quiz mode tests recognition by ear — the two skills that fail separately."],
  ],
  faqs: [
    [
      "What order should I learn Morse code letters in?",
      "This trainer uses four groups: E T A N I S first, then H R D L U C M O, then F P W G Y B V K, and finally J X Q Z with the digits 0–9. The early groups are the shortest and most frequent characters, so you can start forming real words after learning only six of them.",
    ],
    [
      "When does a character count as mastered?",
      "When you have answered it at least 5 times with an accuracy of 80 percent or better. Below 3 attempts a character is still marked as new, and anything in between is shown as learning, so the chart tells you where the practice is actually needed.",
    ],
    [
      "How do I unlock the next group?",
      "Every character in your current group has to reach mastered status — 80 percent accuracy over at least five attempts each. Only then does the next group open, which keeps you from stacking new letters on top of shaky ones.",
    ],
    [
      "Is my progress saved if I close the tab?",
      "Yes. Per-character scores, your streak, your best streak and how many groups you have unlocked are stored in your browser's local storage, so returning later resumes where you stopped. Clearing site data or switching to a different browser or device starts a fresh record.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Typing Tutor: 20 Lessons With WPM and Accuracy",
  metaDescription:
    "Twenty touch-typing lessons from home row to code snippets, scored on WPM and accuracy, with a finger-coloured keyboard and best scores kept per lesson.",
  steps: [
    "On the Lessons tab, filter with the All, Beginner, Intermediate and Advanced chips and open one of the 20 lessons — \"Home Row — Left Hand\" through \"Technical Text\" and \"Speed Builder\".",
    "Type the shown text in the Typing area: matched characters switch to the primary colour and mistakes turn red, the on-screen keyboard tints the key by the finger that owns it, and the WPM, Accuracy and Errors tiles update as you go.",
    "Finish the text and \"Lesson Complete!\" reports your WPM, accuracy and errors and saves your best for that lesson, with Practice Again or Back to Lessons; the Progress tab charts Lessons Done, Sessions, Avg WPM and Avg Accuracy.",
  ],
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
      "WPM is correctly typed characters divided by 5, divided by the minutes elapsed, and accuracy is correct characters as a percentage of all keystrokes. The five-character word is the standard convention, so scores here are comparable to other typing tests.",
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

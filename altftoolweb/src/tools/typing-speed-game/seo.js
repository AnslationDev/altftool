const seo = {
  title: "Typing Speed Test: Gross WPM, Net WPM, Accuracy",
  metaDescription:
    "Type a randomly generated prompt and get gross WPM, net WPM, CPM and accuracy, scored on the 5-keystroke word; the timer starts on your first key.",
  steps: [
    "Pick a Test length in seconds and a Prompt length (words) between 5 and 400 to generate the prompt.",
    "Type into the \"Type here\" box — the clock starts on your first keystroke and every character is marked correct or incorrect as you go.",
    "When the prompt or the timer runs out, read Net words per minute alongside Gross WPM, CPM and Accuracy, then press Copy result, New prompt or Restart same prompt.",
  ],
  intro:
    "The Typing Speed Game measures how fast and how accurately you type by timing you against a randomly generated prompt of common English words and scoring the run in words per minute. It uses the standard typing convention that one word equals five keystrokes including the space, so gross WPM is (characters typed ÷ 5) ÷ minutes and net WPM subtracts one word per minute for each uncorrected mistake. It is built for students, job applicants preparing for a typing test, and anyone tracking their own progress with a keyboard.",
  useCases: [
    "Practise for a data-entry or transcription job test that asks for a minimum of 50 net WPM.",
    "Compare your typing speed on a laptop keyboard against an external mechanical keyboard using the same prompt seed.",
    "Track weekly progress by running the same 60-second test and logging net WPM and accuracy.",
  ],
  benefits: [
    ["Standard 5-character word", "Scores the way certification tests do, so the number is comparable to any other WPM figure."],
    ["Accuracy shown separately", "Gross WPM, net WPM and percentage accuracy are reported side by side instead of one blended score."],
    ["Repeatable prompts", "Prompts are generated from a seed, so you can retype the exact same passage to compare runs fairly."],
  ],
  faqs: [
    [
      "How is words per minute calculated in a typing test?",
      "Words per minute is the number of characters you typed divided by 5, divided by the minutes elapsed. Typing 250 characters in 60 seconds is 250 ÷ 5 ÷ 1 = 50 gross WPM, because a 'word' in typing measurement is always five keystrokes including the space, not a real dictionary word.",
    ],
    [
      "What is the difference between gross WPM and net WPM?",
      "Gross WPM counts every keystroke; net WPM deducts one whole word per minute for each uncorrected error. With 250 characters and 5 mistakes left in the text over one minute, gross is 50 WPM and net is 50 − 5 = 45 WPM.",
    ],
    [
      "What is a good typing speed?",
      "Around 40 WPM is the typical speed for an average computer user, 65 to 80 WPM is the range expected of a professional touch typist, and most data-entry roles ask for at least 50 net WPM with 95% or better accuracy.",
    ],
    [
      "Does the timer start before I type?",
      "No. The clock starts on your first keystroke and stops when you finish the prompt or the chosen test length runs out, so reading the prompt first costs you nothing. Runs shorter than 3 seconds are not scored because a single fast burst does not represent sustained typing.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Dual N-Back Working Memory Trainer (Adaptive)",
  metaDescription:
    "Adaptive dual n-back: 20 scored trials, press A for position and L for spoken-letter matches; 80%+ raises the n-level, under 50% lowers it.",
  steps: [
    "Choose Single N-Back (Visual) or Dual N-Back (Visual + Audio), set the N-Level with the + and - buttons, then click Start Session.",
    "During the 20 scored trials, press A when the grid position matches the one from n steps back and L when the spoken letter does.",
    "Review your % score with Position and Audio hits, misses and false alarms — scoring 80% or higher raises the n-level shown on the Continue button.",
  ],
  intro:
    "This is a dual n-back trainer: a square lights up on a 3x3 grid while a letter is spoken, and you press A when the position repeats the one from n steps back and L when the letter does. A session runs 20 scored trials with stimuli shown for 500 ms every 2.5 seconds and roughly 30% of trials set as targets, then scores you as hits minus false alarms over the number of targets. Score 80% or better and it moves you up an n-level; drop below 50% and it steps you back down.",
  useCases: [
    "You want a daily five-minute cognitive drill with an objective score, rather than a puzzle app that only tells you it was 'well done'",
    "You keep losing track of what someone said two sentences ago and want a task that specifically loads holding and updating items, not general trivia",
    "You have been running n-back elsewhere and want the adaptive version — one that raises n on its own once you are consistently above 80%",
  ],
  benefits: [
    ["Hits corrected for false alarms", "Scoring is (hits minus false alarms) divided by targets, so pressing on every trial cannot inflate the result the way raw hit count would."],
    ["Adaptive n, not a fixed level", "The level moves automatically at the 80% and 50% thresholds, keeping the task near the edge of what you can hold."],
    ["Position and sound scored separately", "Dual mode reports hits, misses and false alarms for the visual and auditory streams independently, so you can see which one is dragging."],
  ],
  faqs: [
    [
      "What does n-back actually ask me to do?",
      "You judge whether the current stimulus matches the one that appeared exactly n steps earlier. At 2-back with the sequence 4, 7, 4 the third item is a match; you must hold a rolling window of the last n items and update it on every trial, which is what makes it a working-memory task rather than a memory-span test.",
    ],
    [
      "How long is one session and how fast do the stimuli come?",
      "Twenty scored trials, plus n warm-up trials that cannot be targets. Each stimulus is visible for 500 ms and a new one arrives every 2,500 ms, so a session takes roughly one minute at any n-level.",
    ],
    [
      "Does n-back training actually make you smarter?",
      "The honest answer is that it is contested. The original 2008 dual n-back studies reported gains on fluid-intelligence measures, but later meta-analyses found the improvement is largely task-specific with weak evidence of transfer to unrelated abilities. Treat this as a training exercise and a score to beat, not a clinical intervention — for concerns about memory or attention, speak to a doctor.",
    ],
    [
      "Which keys do I press, and do I need sound on?",
      "A for a position match and L for a letter match. Dual mode speaks the letters through the browser's speech synthesis, so it needs audio; if you cannot use sound, switch to single mode, which scores the visual grid only.",
    ],
  ],
};

export default seo;

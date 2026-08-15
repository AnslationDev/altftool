const seo = {
  title: "HIIT & Tabata Timer: 20/10 x 8, EMOM, Boxing",
  metaDescription:
    "Interval timer with Tabata 20/10 x 8, EMOM 60s and boxing presets, rounds and sets, and a 1245 Hz work tone. Phases run on absolute clock deadlines.",
  intro:
    "This interval timer runs prepare, work, rest, rounds, sets and between-set rest as one scheduled sequence, with Web Audio cues on every phase change and a countdown beep for the last three seconds. Each phase is scheduled against an absolute clock deadline rather than counted down tick by tick, so a 20-minute session ends on time instead of drifting seconds late. Four presets cover the common formats — Tabata 20/10 x 8, EMOM 60s x 10, boxing 3 min / 1 min x 5, and a beginner 30/30 x 6 — and every field is editable.",
  useCases: [
    "You are doing Tabata on an assault bike and need an audible work cue so you never look at the screen mid-effort.",
    "Your session is 3 sets of 10 rounds with 90 seconds between sets, and you want the set breaks built into the sequence instead of timed by hand.",
    "You are running boxing rounds and want the three-second warning tone before the bell so you can set your stance.",
  ],
  benefits: [
    ["Drift-free scheduling", "Phase ends are absolute timestamps checked five times a second, so errors do not accumulate over a long session."],
    ["Sets as well as rounds", "A separate between-set rest phase is inserted automatically, so multi-set circuits do not need two timers."],
    ["Distinct audio cues", "A 1245 Hz tone opens each work phase, short 660 Hz beeps count the final three seconds, and a two-note chime ends the session."],
  ],
  faqs: [
    [
      "What is the standard Tabata protocol?",
      "Twenty seconds of maximal work followed by ten seconds of rest, repeated for eight rounds — four minutes of intervals in total. That is the default configuration here, with a ten-second prepare phase in front of it.",
    ],
    [
      "What is the difference between EMOM and HIIT intervals?",
      "EMOM means every minute on the minute: a fixed 60-second window in which you finish the prescribed work, and whatever time is left over is your rest. It is set up here as a 60-second work phase with zero rest across ten rounds, whereas a classic HIIT interval sets work and rest as separate fixed blocks.",
    ],
    [
      "Will the timer keep working if I switch tabs or lock my phone?",
      "Timing stays correct because each phase end is an absolute timestamp, so the display resynchronises the moment the tab is visible again. Audio cues, however, may be suppressed while a tab is backgrounded or a phone is locked, so keep the screen on if you rely on hearing the beeps.",
    ],
    [
      "What are the maximum values I can set?",
      "Work and rest go up to 3600 seconds each, prepare up to 300 seconds, rounds up to 99 and sets up to 20, with between-set rest also up to 3600 seconds. Rest can be set to zero for continuous formats such as EMOM.",
    ],
  ],
};

export default seo;

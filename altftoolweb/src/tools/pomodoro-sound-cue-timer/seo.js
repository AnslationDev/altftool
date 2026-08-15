const seo = {
  title: "Pomodoro Timer with Sound Cues at Each Phase",
  metaDescription:
    "Runs 25/5 or your own focus and break lengths, playing a two- or three-note cue at each change and four notes at the end, made with the Web Audio API.",
  steps: [
    "Press a preset — Classic 25/5, Deep work 50/10, Short bursts 15/3 or Study 45/15 — or set Focus length, Short break, Long break, Pomodoros before a long break and Pomodoros in this session yourself.",
    "Set the Session start time and Cue volume, then press Test cue once so the browser unlocks audio; the Cues on toggle silences the tones without stopping the timer.",
    "Press Start and the phase and whole-session clocks count down, with a rising two-note tone into focus and a four-note tone at the end; Skip jumps a phase and Copy plan saves the timeline.",
  ],
  intro:
    "Pomodoro Sound Cue Timer runs a complete pomodoro session — focus blocks, short breaks and a long break after every set — and plays a short two- or three-note tone at each focus or break change, plus a distinct four-note tone when the whole session finishes, so you never have to watch the clock. It follows the classic Pomodoro Technique defaults of 25 minutes of focus, a 5 minute short break and a 15 minute long break after four pomodoros, and every interval is adjustable. Tones are generated in the browser with the Web Audio API, so nothing is downloaded and the timer works offline.",
  useCases: [
    "Run four 25-minute pomodoros before lunch and hear a rising two-note cue the moment each break begins.",
    "Switch to a 50/10 deep-work rhythm for writing or coding sessions that need longer uninterrupted blocks.",
    "Plan a study afternoon: set the start time and see exactly what clock time the session finishes.",
    "Work away from the screen — sketching, lab work, practice — and rely on the tone instead of a visual timer.",
  ],
  benefits: [
    ["Audible phase changes", "Distinct rising, falling and three-note cues tell focus, short break and long break apart without looking."],
    ["Whole-session view", "See every focus block and break on one timeline, with total focus time and the finish time."],
    ["No downloads or accounts", "Tones are synthesised locally with the Web Audio API and the timer keeps running offline."],
  ],
  faqs: [
    [
      "How long is a pomodoro and how many breaks do you take?",
      "A classic pomodoro is 25 minutes of focused work followed by a 5-minute break, and after four pomodoros you take a longer break of 15 to 30 minutes. That works out to roughly two hours of focused work plus 30 minutes of rest per set.",
    ],
    [
      "Why won't the timer play a sound?",
      "Browsers block audio until you interact with the page, so press Start or Test cue once to unlock sound. Also check the cue toggle is on, the volume slider is above the minimum, and that the tab is not muted in your browser's tab menu.",
    ],
    [
      "Is 25/5 better than 50/10 for focus?",
      "It depends on the task. Shorter 25-minute blocks suit interruption-prone or aversive work because the finish line is close, while 50-minute blocks suit tasks with a long warm-up such as writing, editing or debugging. Whichever you pick, take the break away from the screen — that is the part that restores attention.",
    ],
    [
      "Does the timer keep running if I switch tabs?",
      "Yes. Elapsed time is measured against the system clock rather than counted frame by frame, so the session stays accurate in a background tab. Some browsers delay audio in inactive tabs, so keep the tab visible if the cue tone matters.",
    ],
  ],
};

export default seo;

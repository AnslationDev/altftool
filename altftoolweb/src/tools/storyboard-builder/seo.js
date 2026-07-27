const seo = {
  intro:
    "A storyboard builder turns an ordered list of shots — each with a size, an action line, dialogue and a duration — into a timed production sheet with running SMPTE ST 12-1 non-drop-frame timecode. It adds up total runtime in seconds and frames at your chosen frame rate, estimates how long each line of dialogue takes at a words-per-minute pace (150 wpm is the broadcast voice-over default), and flags any shot too short to hold its own dialogue. It is for directors, editors and video marketers planning a cut before anything is shot.",
  useCases: [
    "Plan a 30-second ad and see immediately that the boarded shots total 32.5 seconds, so 2.5 seconds has to come out",
    "Catch a shot held for 3 seconds that carries 10 words of dialogue, which needs about 5 seconds with handles",
    "Export the shot list as CSV to hand to a first AD or import into a scheduling sheet",
  ],
  benefits: [
    ["Running timecode", "Every shot gets an in-point in HH:MM:SS:FF at 23.976 through 60 fps."],
    ["Dialogue fits the frame", "Word count divided by your speaking pace, plus half a second of handle at each end."],
    ["Two exports", "A markdown production sheet for the treatment and a CSV for scheduling tools."],
  ],
  faqs: [
    [
      "How long should each storyboard shot be?",
      "Long enough for the eye to read it: roughly 4-5 seconds for an establishing wide, 3 seconds for a medium, 2-2.5 seconds for a close-up and about 1.5 seconds for an insert. Those are the starting durations this tool suggests; dialogue overrides them, since a shot must hold its own line plus about half a second of handle at each end.",
    ],
    [
      "How do I estimate how long dialogue will take?",
      "Divide the word count by the speaking pace in words per minute, then multiply by 60. At the broadcast default of 150 words per minute, 10 words take 4 seconds; conversational dialogue runs 130-160 wpm and fast promo reads reach 180. The tool adds 0.5 seconds of handle at each end so a line never starts on the cut.",
    ],
    [
      "What is SMPTE timecode and which frame rate should I use?",
      "SMPTE timecode labels each frame as HH:MM:SS:FF. Use 24 fps for cinema, 25 for PAL broadcast and most of Europe and India, 30 for NTSC-region video, and 23.976 or 29.97 when delivering to broadcast in NTSC regions. This tool uses non-drop-frame counting, so at 29.97 and 23.976 the timecode drifts slightly from wall-clock time by design.",
    ],
    [
      "What is a good dialogue density for a short film or ad?",
      "There is no rule, but the figure is worth watching: if speech fills more than about 70% of runtime the piece is closer to a radio spot with pictures, and if it fills under 20% the visuals have to carry the story on their own. The tool reports the percentage so you can make that a decision rather than an accident.",
    ],
  ],
};

export default seo;

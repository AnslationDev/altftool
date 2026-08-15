const seo = {
  title: "Slow Down Audio Without Changing Pitch — 0.35× to 1.25×",
  metaDescription:
    "Play a local audio file at 0.35×–1.25× speed in 0.05 steps with pitch preserved. Loop and seek to repeat hard phrases when learning or transcribing.",
  steps: [
    "Pick a recording with the Local audio file chooser (any audio/* file your browser can play).",
    "Drag the Playback speed slider between 0.35× and 1.25× in 0.05 steps and switch on Loop the file.",
    "Play the audio and use the player's seek control to return to a difficult phrase; pitch preservation keeps the voice at its natural register.",
  ],
  intro:
    "The Slow Speech Playback Trainer plays an audio file you already have at 0.35× to 1.25× speed with pitch preservation switched on, so slowed speech stays at its normal voice instead of dropping into a growl. It adds a loop toggle that replays the whole file from 0:00 every time it ends, so listening again without a manual rewind is one click away; isolating a single hard phrase still means dragging the seek bar back to it after each pass. It is built for language learners, people with auditory processing difficulty, and anyone transcribing a fast or accented recording.",
  useCases: [
    "A learner cannot catch a run of words in a native-speed podcast, so they drop to 0.6× and loop that stretch until the word boundaries separate.",
    "Someone transcribing an interview with a fast talker plays it at 0.75× so they can type at a steady pace instead of stopping every few seconds.",
    "A person with auditory processing difficulty replays a recorded lecture at a slower rate to follow it without the pitch shift that makes voices harder to recognise.",
  ],
  benefits: [
    ["Pitch stays where it belongs", "Playback uses the browser's pitch-preservation, so a voice slowed to 0.35× still sounds like that person rather than a deep drone."],
    ["Fine control at the slow end", "The rate moves in 0.05 steps from 0.35× to 1.25×, so you can find the point where speech is comprehensible instead of jumping between fixed 0.5× and 0.75× presets."],
    ["Loop without a manual rewind", "Turn on loop and the file replays automatically from the start every time it ends, so hearing the whole recording again never needs the rewind button."],
  ],
  faqs: [
    [
      "How slow can I play the audio?",
      "Down to 0.35× normal speed — a little over a third of the original pace — adjustable in 0.05 steps up to 1.25×. Most learners find comprehension improves most between 0.6× and 0.8×; below about 0.5× the gaps between syllables can start working against you.",
    ],
    [
      "Does slowing the audio make voices sound deep?",
      "Not here — pitch preservation is enabled, so the rate changes while the perceived pitch stays roughly the same. It relies on the browser's own time-stretching, so quality varies slightly between browsers and very slow rates can sound a little grainy.",
    ],
    [
      "Can I loop just one difficult sentence?",
      "Not automatically. The loop toggle replays the whole file from 0:00 every time it ends — it does not resume from wherever you last sought. To repeat one phrase, drag the seek bar back to it again after each loop finishes. There is no A-B marker or true segment loop yet, so this is a manual repeat rather than an automatic one.",
    ],
    [
      "Is my audio uploaded anywhere?",
      "No. The file is opened directly by the page from your own device and played back locally, so private recordings, lecture captures and client interviews never leave your machine.",
    ],
  ],
};

export default seo;

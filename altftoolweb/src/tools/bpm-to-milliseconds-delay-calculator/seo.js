const seo = {
  title: "BPM to ms Delay Calculator – Dotted & Triplet Times",
  metaDescription:
    "Convert tempo to delay times from 60000/BPM: straight, dotted and triplet notes in ms, Hz and samples — plus a reverse lookup for any ms value.",
  steps: [
    "Enter a \"Tempo (BPM)\" or tap a preset (70 to 174 BPM), then pick a \"Time signature\" and \"Sample rate (for the samples column)\".",
    "Read the Note values table — straight, dotted and triplet — in milliseconds, or tick \"Show the table in samples instead of ms\".",
    "Type a value in \"Delay time you already have (ms)\" to see the closest note value, or click \"Copy result\" for the whole ms table.",
  ],
  intro:
    "BPM To Delay Milliseconds Calculator converts a tempo into the exact note lengths a track runs on, starting from the one rule everything else follows: a quarter note lasts 60000 ÷ BPM milliseconds. From there it derives straight, dotted and triplet values from a whole note down to a 1/64, and shows each as milliseconds, hertz for LFO rates, and samples for code or plugin automation. It also names the closest note value to a delay time you already have.",
  useCases: [
    "Dialling a dotted eighth delay for a guitar or synth line — 375 ms at 120 BPM — without guessing.",
    "Setting an LFO or tremolo to an eighth-note rate by entering the hertz value the plugin asks for.",
    "Choosing reverb pre-delay of a 1/32 or 1/16 so early reflections land on the grid instead of smearing the transient.",
    "Checking whether the 380 ms on a hardware delay is close enough to a tempo-synced value or needs nudging.",
  ],
  benefits: [
    ["One formula, every value", "Straight, dotted and triplet lengths all come from 60000 ÷ BPM, so nothing drifts."],
    ["Three unit systems", "Milliseconds for delays, hertz for LFOs and samples for buffer or code work."],
    ["Reverse lookup", "Enter a delay time you already have and see which note value it is closest to."],
  ],
  faqs: [
    [
      "How do I convert BPM to milliseconds?",
      "Divide 60000 by the tempo to get one quarter note. At 120 BPM that is 500 ms; an eighth is half of it (250 ms) and a sixteenth is a quarter of it (125 ms).",
    ],
    [
      "What delay time is a dotted eighth at 120 BPM?",
      "375 ms. A dot adds half the note's own value, so a dotted eighth is 250 ms × 1.5. This is the setting behind the familiar rhythmic guitar delay sound, usually paired with feedback low enough that the repeats fall away before the next bar.",
    ],
    [
      "How do I set a delay in hertz instead of milliseconds?",
      "Take 1000 divided by the millisecond value. A quarter note at 120 BPM is 500 ms, which is 2 Hz — a useful figure when a modulation source or tremolo only accepts a rate in hertz.",
    ],
    [
      "Does the time signature change the note lengths?",
      "No — BPM always counts quarter notes, so a 1/8 note is the same length in 4/4 and 6/8. What changes is the bar length: 4/4 at 120 BPM is 2000 ms per bar, while 6/8 at the same tempo is 1500 ms because a bar holds six eighth notes.",
    ],
  ],
};

export default seo;

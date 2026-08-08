const seo = {
  title: "DJ Transition Length: Bars to Seconds and Pitch %",
  metaDescription:
    "A 16-bar blend is 64 beats: 31.0s at 124 BPM, 29.5s at 130. See the seconds at both tempos and whether the pitch move fits a ±8% fader.",
  steps: [
    "Enter Outgoing track BPM and Incoming track BPM, then set Blend length (bars) — or tap the 4, 8, 16, 32 and 64 bars chips — and Beats per bar.",
    "Choose a Pitch fader range: ±6% (CDJ fine), ±8% (turntable / CDJ default), ±10% (Technics SL-1200 nominal), ±16% (CDJ wide) or ±50% / WIDE.",
    "Read Blend length, beatmatched to the outgoing track, then the rows for Riding the pitch from one tempo to the other, Pitch move to beatmatch and Fits a ±8% fader; Copy result copies the summary.",
  ],
  intro:
    "The DJ Transition Length Calculator converts a blend measured in bars into real seconds at both tracks' tempos, and works out the pitch move needed to beatmatch them. One beat lasts 60 / BPM seconds, so a 16-bar blend in 4/4 is 64 beats — 31.0 seconds at 124 BPM but only 29.5 at 130. When you ride the tempo across rather than locking it, the elapsed time is the logarithmic mean of the two tempos, which the tool calculates exactly rather than averaging. For DJs planning set timings, radio edits and recorded mixes where the clock actually matters.",
  useCases: [
    "Time a 32-bar intro blend so you know exactly when the incoming track's drop lands.",
    "Check whether a 124 to 140 BPM jump fits inside a ±8% pitch fader before you attempt it live.",
    "Plan a one-hour radio mix by adding up the real seconds each transition consumes.",
    "Decide whether to mix a drum and bass track in at half time so the pitch move stays small.",
  ],
  benefits: [
    [
      "Both tempos timed",
      "Shows the blend length at the outgoing tempo, the incoming tempo and while riding across.",
    ],
    [
      "Pitch range check",
      "Tells you whether the beatmatch fits a ±6, ±8, ±10, ±16 or ±50% fader, and suggests half or double time when it does not.",
    ],
    [
      "Phrase awareness",
      "Flags whether the blend length lands on a whole 8-bar phrase, which is where most tracks change.",
    ],
  ],
  faqs: [
    [
      "How long is a 32-bar transition?",
      "In 4/4 that is 128 beats, so at 128 BPM it runs exactly 60 seconds, at 124 BPM about 61.9 seconds and at 140 BPM about 54.9 seconds. The formula is bars x beats per bar x 60 / BPM.",
    ],
    [
      "How much pitch do I need to beatmatch two tracks?",
      "The percentage is (incoming BPM - outgoing BPM) / outgoing BPM x 100. Going from 124 to 130 BPM needs +4.84%, which fits a standard ±8% fader; going from 124 to 140 needs +12.9%, which does not and requires a wide pitch range or a different approach.",
    ],
    [
      "How many bars should a DJ transition be?",
      "Eight, sixteen or thirty-two bars, because dance music is built in eight-bar phrases and blending across a whole number of phrases keeps both arrangements aligned. Sixteen bars is the common default for house and techno; four or eight suits faster, busier genres.",
    ],
    [
      "Does changing tempo change the key of the track?",
      "Yes, unless key lock is on. Pitching a track up 6% raises it roughly one semitone, which will clash with a harmonically matched incoming track. Key lock preserves the pitch at the cost of some time-stretching artefacts, which become audible past roughly ±8%.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Loop Bars Calculator: Bars, Seconds, Samples, BPM",
  metaDescription:
    "Convert a loop between bars, beats, seconds and samples at any BPM, plus plain, dotted and triplet delay times for every note division.",
  steps: [
    "Enter Loop length (bars), Tempo (BPM) and Beats per bar, then pick a Sample rate (Hz) from the six options between 44100 and 192000 — the 1, 2, 4, 8, 16 and 32 bars chips fill the length in one tap.",
    "Type an Existing clip length (seconds) to run the reverse lookup, which reports Your clip in bars, whether it lands exactly, and the Tempo that fits the clip to the bar count.",
    "Read the loop length as Seconds, Milliseconds, Samples and Video frames (24 / 25 / 30 fps), scroll to the Note / Plain / Dotted / Triplet delay table for that tempo, and press Copy result.",
  ],
  intro:
    "The Loop Bars Calculator converts a loop length between bars, beats, seconds, milliseconds and samples at any tempo, using the single relationship that one beat lasts 60 / BPM seconds. It works both ways: enter bars to get the exact length of the region, or enter the length of an existing clip to find out how many bars it covers and what tempo would make it land on a whole number. It also prints the standard delay-time table — plain, dotted and triplet values from a whole note down to a 1/64 — so tempo-synced delays and reverbs can be dialled in by hand.",
  useCases: [
    "Set an exact region length in a DAW that only accepts seconds or samples, not bars.",
    "Find the tempo that makes a four-second vocal chop fill exactly two bars.",
    "Dial in a dotted eighth delay by hand on a plugin that has no tempo sync.",
    "Cut a music bed to picture by reading the loop length in 24, 25 and 30 fps frames.",
  ],
  benefits: [
    [
      "Works both directions",
      "Bars to seconds and seconds back to bars, with a flag for whether it lands exactly.",
    ],
    [
      "Sample-accurate",
      "Gives the sample count at 44.1, 48, 88.2, 96, 176.4 and 192 kHz for exact edits.",
    ],
    [
      "Full delay table",
      "Plain, dotted and triplet times for every note division at the tempo you enter.",
    ],
  ],
  faqs: [
    [
      "How long is 4 bars at 120 BPM?",
      "Exactly 8 seconds in 4/4. One beat is 60 / 120 = 0.5 seconds, a bar is four of those at 2 seconds, and four bars is 8 seconds — which is 384,000 samples at a 48 kHz sample rate.",
    ],
    [
      "How do I calculate delay time from BPM?",
      "A quarter-note delay is 60,000 / BPM milliseconds, so at 120 BPM it is 500 ms. Halve it for each smaller division: 250 ms for an eighth, 125 ms for a sixteenth. Multiply by 1.5 for dotted and by two thirds for triplet, giving 375 ms and 166.7 ms for a dotted and triplet eighth at 120 BPM.",
    ],
    [
      "What tempo makes my sample loop cleanly?",
      "Use tempo = beats per bar x bars x 60 / seconds. A two-second sample that should be one bar of 4/4 needs 120 BPM; if you want it to cover two bars, it needs 240 BPM, or half-speed at 120. Picking the bar count first is usually what makes a stubborn loop behave.",
    ],
    [
      "Why do producers loop in powers of two?",
      "Because popular music is built in 4-bar and 8-bar phrases, so 1, 2, 4, 8, 16 and 32-bar loops line up with where the arrangement changes. An odd loop length will drift against the phrase and need re-triggering every few passes.",
    ],
  ],
};

export default seo;

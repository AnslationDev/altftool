const seo = {
  title: "Audio Pitch & Tempo Shifter with ffmpeg Filter",
  metaDescription:
    "Shift pitch in semitones and tempo in percent independently — get the resample rate and a copy-ready atempo chain split into ffmpeg's 0.5–2.0 limit.",
  steps: [
    "Set Pitch shift (semitones) from −24 to +24, Fine tune (cents), Tempo (% of original) from 10 to 400, and the Sample rate (Hz) of your source.",
    "Optionally load a local file under Audio file to preview (optional) and pick a preview mode: Tempo only, pitch preserved, or Pitch and speed linked (tape effect).",
    "Read the Resample to rate and atempo filters needed in the results, then press Copy ffmpeg command for the asetrate/aresample/atempo chain; a rubberband alternative is printed below it.",
  ],
  intro:
    "An audio pitch and tempo shifter changes how high a recording sounds and how fast it plays as two separate controls, instead of the single tape-speed knob that moves both at once. The maths is twelve-tone equal temperament: a shift of n semitones multiplies every frequency by 2^(n/12), so +12 semitones doubles pitch and turns A4's 440 Hz into 880 Hz, while a tempo of 50% doubles the running time without touching pitch. This page gives you the exact numbers and the filter chain that performs the change.",
  useCases: [
    "Drop a backing track two semitones so it sits in a singer's range, without slowing the song down",
    "Slow a language lesson or a guitar solo to 70% speed for practice while keeping every note at its written pitch",
    "Work out the resample rate and atempo chain for a batch script before running ffmpeg over a folder of files",
  ],
  benefits: [
    ["Two independent controls", "Pitch in semitones and cents, tempo in percent — the tool works out the speed correction that keeps them separate."],
    ["Copy-ready filter chain", "The atempo values are pre-split into ffmpeg's legal 0.5–2.0 range, so long chains do not fail at the command line."],
    ["Preview without uploading", "Tempo-preserved and linked playback both run on the local file in your browser; nothing is sent anywhere."],
  ],
  faqs: [
    [
      "How do you change pitch without changing speed?",
      "Resample the audio by the pitch ratio, then time-stretch by the inverse. In ffmpeg that is asetrate=SR×r, aresample=SR, atempo=1/r. For a one-octave rise at 44.1 kHz, r = 2, so you resample to 88,200 Hz and then apply atempo=0.5 to bring the running time back to the original.",
    ],
    [
      "Why does ffmpeg's atempo filter need to be chained?",
      "One atempo instance accepts a factor between 0.5 and 2.0 only. Anything outside that has to be expressed as a product — a 4× speed-up is atempo=2,atempo=2, and a quarter-speed is atempo=0.5,atempo=0.5. This tool splits the factor into equal steps so the product is exactly what you asked for.",
    ],
    [
      "How many semitones can I shift before it sounds wrong?",
      "Plain resampling moves vowel formants along with the pitch, and past roughly four semitones voices start to sound like a chipmunk or a giant. Music tolerates more than speech. A formant-preserving stretcher such as ffmpeg's rubberband filter keeps the vocal tract resonances fixed and stays natural over a much wider range.",
    ],
    [
      "Can a browser shift pitch on its own?",
      "Only partly. An HTML audio element with preservesPitch set to true changes speed while holding pitch, and with preservesPitch set to false it moves both like tape speed. There is no built-in way to move pitch alone, which is why the true independent shift is offered here as an ffmpeg command.",
    ],
  ],
};

export default seo;

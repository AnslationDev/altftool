const seo = {
  intro:
    "The Vocal Remover & Stem Splitter runs FFmpeg in your browser to pull four approximate stems out of a stereo audio file: an instrumental made by centre-channel cancellation (left minus right), a vocal pass band-limited to 120 Hz–5 kHz and downmixed to mono, a bass stem low-passed at 250 Hz, and a drum stem high-passed at 250 Hz with 4:1 compression above -18 dB. It is for musicians, karaoke makers and video editors who need a usable backing track or a rough isolated part in minutes. These are deterministic filter approximations rather than neural source separation, so expect some leakage and check the result before you use it.",
  useCases: [
    "You want a karaoke backing track for a song you own: pick the instrumental profile, and the left-minus-right cancellation drops most of the centre-panned lead vocal while keeping the wide-panned instruments.",
    "You are editing a video and the music bed is fighting the narration, so you export the bass stem (everything under 250 Hz) to duck only the low end instead of the whole track.",
    "You are transcribing a drum part by ear and want the kit clearer — the drums profile high-passes at 250 Hz and compresses 4:1 above -18 dB so the hits sit forward of the bass and pads.",
  ],
  benefits: [
    ["Four stems from one pass", "Instrumental, vocals, bass and drums are separate profiles you can render one at a time from the same source file, each written out as WAV."],
    ["Deterministic, inspectable filtering", "Every profile is a fixed FFmpeg filter chain with published crossover points, so the same input always gives the same output — no model randomness to re-roll."],
    ["Honest about what it is", "The tool states plainly that this is frequency and centre-channel approximation, not AI source separation, so you know to listen for leakage rather than trust it blind."],
  ],
  faqs: [
    [
      "Does this actually remove vocals completely?",
      "No — it removes centre-panned content, which is usually where the lead vocal sits, using a left-minus-right phase cancellation. Anything else panned to the centre (often kick, snare and bass) is removed with it, and reverb tails or double-tracked vocals panned wide will survive.",
    ],
    [
      "What frequency ranges does each stem use?",
      "The vocal profile keeps 120 Hz to 5 kHz and folds to mono, bass keeps everything below 250 Hz, and drums keep everything above 250 Hz with a 4:1 compressor engaged at -18 dB. The instrumental profile is not a filter at all — it is the L−R / R−L centre cancellation.",
    ],
    [
      "Is this the same as AI stem separation like Demucs or Spleeter?",
      "No. Those use trained neural models that can separate overlapping instruments in the same frequency band; this uses fixed FFmpeg filters and channel maths, so a bass guitar and a kick drum sharing 80 Hz will land in the same stem. Use it for a fast usable result, not for a clean multitrack.",
    ],
    [
      "Is my audio uploaded anywhere?",
      "No — FFmpeg is loaded as WebAssembly and the file is processed inside the page, then handed back to you as a WAV download. Only use it on audio you own or have the right to process, since stem-splitting a commercial release can still be a copyright issue regardless of where the processing happens.",
    ],
  ],
};

export default seo;

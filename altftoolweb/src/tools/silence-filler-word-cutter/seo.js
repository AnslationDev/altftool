const seo = {
  intro:
    "The Silence & Filler-Word Cutter runs FFmpeg's silenceremove filter over an audio file in your browser, deleting any stretch that stays below your chosen loudness threshold for longer than 0.65 seconds. You pick the threshold — -35 dB, -40 dB or -45 dB — upload the recording, and get back a WAV with the dead air taken out and the speech left untouched. It is aimed at podcasters, course recorders and anyone whose raw take is padded with pauses they would otherwise trim by hand.",
  useCases: [
    "A solo podcaster records a 50-minute episode in one take with long thinking pauses between answers, and wants the gaps gone before the file goes into an editor for the real cut.",
    "Someone recording a training module keeps stopping to check notes, leaving five or six seconds of room tone each time — one pass at -40 dB collapses those without touching the narration.",
    "An interviewer with a noisy room finds -45 dB leaves the pauses in because the noise floor is too high, so they step the threshold up to -35 dB and re-run it to see how much more gets cut.",
  ],
  benefits: [
    ["The threshold is yours to set", "Three explicit levels (-35, -40, -45 dB) let you match the cut to your actual noise floor instead of trusting a hidden auto-detect."],
    ["Short pauses survive", "Only silence lasting more than 0.65 seconds is removed, so natural breaths and beat-pauses between sentences stay in and speech does not sound clipped together."],
    ["The file never leaves the machine", "Processing runs on an FFmpeg WebAssembly build inside the tab, so unreleased interviews and client recordings are not uploaded anywhere."],
  ],
  faqs: [
    [
      "Does it actually remove filler words like um and uh?",
      "No — it removes silence, not fillers. Cutting an \"um\" reliably needs transcript timestamps that a human has reviewed, and guessing at them from the waveform alone would take out real words, so filler removal is left to a reviewed edit.",
    ],
    [
      "How long does a pause have to be before it gets cut?",
      "Longer than 0.65 seconds below your chosen threshold. Anything shorter is kept, which is why normal breaths and sentence gaps come through intact.",
    ],
    [
      "Which threshold should I pick?",
      "Start at -40 dB for a reasonably quiet room. Use -35 dB if pauses are surviving because of a high noise floor (fan, street, mic hiss), and -45 dB if speech tails or quiet words are being clipped off.",
    ],
    [
      "What format does it give back?",
      "A WAV file, regardless of what you put in. WAV is uncompressed, so the output is larger than an MP3 input but loses nothing before you take it into an editor for the rest of the work.",
    ],
  ],
};

export default seo;

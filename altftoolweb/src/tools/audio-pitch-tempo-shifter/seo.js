const seo = {
  intro:
    "The Audio Pitch & Tempo Shifter changes the speed of an audio file without moving its pitch, or moves its pitch by two semitones without changing its length, using FFmpeg compiled to WebAssembly and run inside your own browser. Tempo presets apply atempo=0.8 and atempo=1.25 (80% and 125% of original speed); pitch presets resample by a factor of 1.12246, which is exactly two equal-tempered semitones, then compensate with the inverse tempo change so the running time comes back. The result downloads as a WAV, and the source file is written to FFmpeg's in-memory filesystem rather than uploaded anywhere.",
  useCases: [
    "Slowing a guitar solo to 80% speed so you can hear the individual notes, without the recording dropping into a lower key that makes it useless for practice.",
    "Dropping a backing track two semitones because the singer cannot reach the top note, while keeping the arrangement exactly the same length as the click track.",
    "Speeding an interview recording to 125% for a faster transcription pass, with the speaker's voice still sounding like themselves instead of chipmunked.",
  ],
  benefits: [
    [
      "Pitch and tempo move independently",
      "The pitch presets chain asetrate with a compensating atempo, so a two-semitone shift leaves the duration where it was — a plain speed change would have moved both together.",
    ],
    [
      "Lossless WAV output",
      "Results are written as uncompressed WAV, so a file you plan to edit further does not pick up a second generation of lossy encoding on the way through.",
    ],
    [
      "The engine loads only when you ask",
      "The FFmpeg WebAssembly core is fetched on first press of Process, not on page load, so simply opening the page costs you nothing.",
    ],
  ],
  faqs: [
    [
      "How much does the pitch actually change?",
      "Two semitones — one whole tone — up or down. The resampling factor is 1.12246, which is 2 raised to the power 2/12, the exact ratio between notes a whole step apart in equal temperament. Pitch-up multiplies the playback rate by it and pitch-down divides by it.",
    ],
    [
      "How much faster or slower do the tempo presets run?",
      "Slower plays at 0.8x, so a 5-minute track becomes 6 minutes 15 seconds; faster plays at 1.25x, turning 5 minutes into 4 minutes. Both use FFmpeg's atempo filter, which time-stretches without transposing.",
    ],
    [
      "Will speeding up or pitch-shifting make the audio sound worse?",
      "Some artefacts are expected. Time-stretching works on overlapping windows, so transients such as drum hits and hard consonants can smear slightly, and the effect grows the further you move from 1.0x. At 0.8x and 1.25x it is usually mild on speech and noticeable on percussive material.",
    ],
    [
      "Is my audio uploaded to a server?",
      "No. The file is read by the page and written into the WebAssembly engine's in-memory filesystem, processed there, and downloaded straight back to you. The only network request is the one that fetches the FFmpeg core itself the first time you run a job.",
    ],
  ],
};

export default seo;

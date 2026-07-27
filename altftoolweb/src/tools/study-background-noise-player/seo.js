const seo = {
  intro:
    "Study Background Noise Player synthesises white, pink or brown noise in the browser and loops it seamlessly for a timed study session, with a slow volume ramp at the start and an automatic fade to silence at the end. The three colours differ by spectral slope — white is flat, pink falls about 3 dB per octave and brown about 6 dB per octave — which is why pink and brown sound progressively deeper and less hissy. Nothing is streamed or downloaded, so it keeps working offline and costs no bandwidth.",
  useCases: [
    "Mask conversation in a shared office or library with pink noise while you read or write.",
    "Set a 90-minute session that fades out on its own so the sound does not run all afternoon.",
    "Start at 10% volume and ramp to 60% over five minutes so your ears adjust instead of being hit at full level.",
    "Compare white, pink and brown at the same volume to find the one you stop noticing fastest.",
  ],
  benefits: [
    ["Three real noise colours", "Pink noise uses a proper multi-pole filter bank, not just a low-passed white noise approximation."],
    ["Seamless loop", "The end of the buffer is equal-power crossfaded into the start, so there is no click at the loop point."],
    ["Runs offline", "Samples are generated locally with the Web Audio API — no streaming, no account, no data use."],
  ],
  faqs: [
    [
      "What is the difference between white, pink and brown noise?",
      "They differ in how energy falls off with frequency: white noise is flat across the spectrum, pink noise drops about 3 dB per octave so every octave carries equal energy, and brown noise drops about 6 dB per octave. In practice white sounds like hiss, pink like steady rain, and brown like distant surf or a waterfall.",
    ],
    [
      "Which noise is best for studying or concentration?",
      "Most people find pink or brown noise easiest to ignore because the harsh high frequencies are rolled off, while white noise masks nearby speech more effectively. Evidence on noise improving concentration is mixed and varies by person, so try each for a few sessions at a low, steady volume.",
    ],
    [
      "How loud should background noise be?",
      "Keep it just loud enough to cover distractions and no louder — you should still be able to hold a conversation over it. Prolonged exposure above roughly 80 dB can damage hearing over time, and headphones reach that easily, so start low and use the ramp instead of turning it up.",
    ],
    [
      "Does this work offline and does it use data?",
      "Yes to offline and no to data. The noise is generated sample by sample in your browser with the Web Audio API rather than fetched from a server, so once the page is loaded nothing else is downloaded no matter how long the session runs.",
    ],
  ],
};

export default seo;

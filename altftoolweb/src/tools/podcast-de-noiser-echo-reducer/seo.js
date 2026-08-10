const seo = {
  title: "Podcast De-noiser: 70 Hz High-Pass + FFT Denoise",
  metaDescription:
    "Clean a spoken-word track in the browser: 70 Hz high-pass, 14 kHz low-pass and afftdn at -22, -28 or -35 dB, out as WAV. It cuts noise, not reverb.",
  steps: [
    "Pick your recording in the Source file field, which accepts audio/* files.",
    "Set Strength to light, medium or strong — afftdn noise floors of -22, -28 and -35 dB — and press Process locally.",
    "The cleaned altftool-podcast-de-noiser-echo-reducer.wav is written out and downloaded from the page.",
  ],
  intro:
    "The Podcast De-noiser & Echo Reducer cleans a spoken-word recording in your browser by running an FFmpeg chain of a 70 Hz high-pass, a 14 kHz low-pass and the afftdn FFT noise reducer at one of three noise-floor settings (-22, -28 or -35 dB). Load an audio file, pick light, medium or strong, and a cleaned WAV is written back out without the file ever leaving the machine. It is for podcasters and interviewers who recorded in an untreated room and need hum, rumble and tape-style hiss pulled down before editing.",
  useCases: [
    "You recorded an interview next to a running air conditioner and the constant hiss sits under every sentence you now have to edit.",
    "A remote guest's track carries mains hum and desk rumble, and you want the low end cleaned before you drop it into the multitrack session.",
    "A lecture recording from a phone sounds thin and noisy, and you want the strongest available reduction before running it through a transcription pass.",
  ],
  benefits: [
    [
      "Three honest strength steps",
      "Light, medium and strong map to concrete afftdn noise floors of -22, -28 and -35 dB rather than a vague slider, so you can retry one notch at a time when speech starts sounding processed.",
    ],
    [
      "The file stays on your machine",
      "FFmpeg is compiled to WebAssembly and loaded only when you press Process; the audio is written to its in-memory filesystem, never to a server.",
    ],
    [
      "Lossless WAV out",
      "Output is uncompressed WAV, so the cleaned track goes into your editor without a second generation of lossy encoding.",
    ],
  ],
  faqs: [
    [
      "What does each strength setting actually change?",
      "Only the FFT denoiser's noise-floor figure: light uses -22 dB, medium -28 dB and strong -35 dB. The band limiting is identical at every setting — a high-pass at 70 Hz to drop rumble and mains hum, and a low-pass at 14 kHz to cut hiss above the speech band.",
    ],
    [
      "Does it actually remove room echo?",
      "Not really — it reduces broadband noise, not reverb tails. Filtering and spectral subtraction thin out hiss and hum and can make a room sound slightly drier, but true de-reverberation needs a different class of processing; the reliable fix is recording closer to the mic in a softer room.",
    ],
    [
      "Is my recording uploaded anywhere?",
      "No. Processing runs entirely in the browser tab through FFmpeg WebAssembly; only the FFmpeg core binary itself is fetched, and that happens after you click Process, not when the page loads.",
    ],
    [
      "Why does my voice sound hollow on the strong setting?",
      "Because at a -35 dB noise floor the FFT denoiser starts subtracting energy that belongs to speech, not just to noise. Step back to medium or light, and remember the 14 kHz low-pass also removes air and sibilance detail at every setting.",
    ],
  ],
};

export default seo;

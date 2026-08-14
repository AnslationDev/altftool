const seo = {
  title: "WAV Spectrogram Analyzer: FFmpeg in Your Browser",
  metaDescription:
    "Renders any audio file as a 1600x900 spectrogram PNG with a labelled legend, using FFmpeg's showspectrumpic filter compiled to WebAssembly in-browser.",
  steps: [
    "Pick an audio file — WAV, MP3, AAC, FLAC, OGG or M4A — in the Source file field.",
    "Set Scale to log, sqrt or lin, then press Process locally; the FFmpeg WebAssembly engine loads only at that point.",
    "The showspectrumpic render downloads as altftool-wav-spectrogram-analyzer.png, a 1600x900 image carrying its frequency and amplitude legend.",
  ],
  intro:
    "WAV Spectrogram Analyzer renders an audio file as a single 1600×900 spectrogram image — time along one axis, frequency up to the Nyquist limit on the other, energy as colour — using FFmpeg's showspectrumpic filter compiled to WebAssembly and run inside your browser. You choose whether intensity is mapped on a log, sqrt or linear scale, and the labelled legend lets you read frequencies and levels straight off the picture. It is for anyone who needs to see a recording rather than just hear it: mains hum, clipping, a lossy encoder's cutoff, or a dead high end all show up as shapes.",
  useCases: [
    "An interview recording has a faint buzz you cannot place, and the spectrogram shows a solid horizontal line at 50 or 60 Hz plus its harmonics, confirming mains hum rather than room noise",
    "Someone sends you a 'lossless' WAV and you check for a hard brick wall around 16 kHz that would give away an MP3 that was simply re-wrapped",
    "You are QC-ing a podcast episode before publishing and want to spot the stretches where the waveform is slammed into the ceiling and the spectrogram smears with clipping harmonics",
  ],
  benefits: [
    [
      "Three intensity scales, one file",
      "Switching between log, sqrt and linear changes how quiet detail is mapped to colour — log pulls up low-level noise floors that a linear plot hides entirely.",
    ],
    [
      "A legend you can measure against",
      "The render is produced with the frequency and amplitude legend enabled, so you can read the height of a hum line or a cutoff edge instead of estimating it.",
    ],
    [
      "Real FFmpeg decoding, not a Web Audio approximation",
      "The same showspectrumpic filter you would run at the command line handles the decode and the FFT, so the picture matches what a desktop FFmpeg run would give you.",
    ],
  ],
  faqs: [
    [
      "What does the spectrogram output actually look like?",
      "A single 1600×900 PNG covering the whole file, with time on the horizontal axis, frequency on the vertical axis up to the Nyquist frequency (22.05 kHz for 44.1 kHz audio, 24 kHz for 48 kHz), and brightness or colour showing energy at that point. It is one still image, not a scrolling display, so long files are compressed horizontally.",
    ],
    [
      "Which intensity scale should I pick?",
      "Use log when you are hunting for quiet artefacts — hum, hiss, low-level bleed — because it expands the bottom of the dynamic range; use lin when you only care about the loud content and want quiet material to stay dark. Sqrt sits between the two and is a reasonable default for general inspection.",
    ],
    [
      "Does it only accept WAV files?",
      "No — it accepts any audio file your browser can hand to FFmpeg, including MP3, AAC, FLAC, OGG and M4A, though WAV and other uncompressed sources give the truest picture because nothing has already been discarded by an encoder.",
    ],
    [
      "How do I spot a re-encoded lossy file?",
      "Look for a flat horizontal edge above which the picture is completely black — most MP3 encoders low-pass around 16 kHz at 128 kbps and roughly 19–20 kHz at 320 kbps, so a hard cutoff there in a file claiming to be lossless means it passed through a lossy encoder at some point.",
    ],
  ],
};

export default seo;

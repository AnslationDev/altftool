const seo = {
  title: "Sound Event Logger: Timestamp, RMS, Hz and Note",
  metaDescription:
    "Log loud events from your mic as ISO timestamp, RMS, dominant frequency in Hz and nearest note. Rows are written above RMS 0.08 and no audio is stored.",
  steps: [
    "Press Start with permission and allow microphone access; the stream feeds a 4096-point Web Audio analyser and no audio buffer is retained.",
    "On roughly every twelfth animation frame the window's RMS is measured and a row is written only when it exceeds 0.08, with pitch found by autocorrelation.",
    "Watch Live local readings fill with its Timestamp, RMS, Frequency (Hz) and Note columns, newest last, then press Stop sensor to end the session.",
  ],
  intro:
    "The Local Sound-Event Logger listens through your microphone and writes a timestamped row every time the signal crosses a loudness threshold, recording the ISO 8601 time, the RMS amplitude, the dominant frequency in hertz and the nearest musical note with its cent deviation. It uses a 4096-point Web Audio analyser, computes RMS from the float time-domain buffer, estimates pitch by autocorrelation across lag offsets of 20 to 1000 samples, and only logs when RMS exceeds 0.08 — so background hum is ignored and loud events are not. Nothing is uploaded and no audio is stored; only the derived numbers stay in the on-screen timeline.",
  useCases: [
    "A neighbour's noise is intermittent and you want a timestamped record of when the loud events actually occurred, without keeping recordings of anyone's conversations.",
    "You are chasing a machine that clatters unpredictably on a production line or a compressor that kicks in at night, and want the times plus the dominant frequency of each event.",
    "You want to check how often a room crosses a loudness threshold during a meeting or a class, and prefer a running log to watching a live meter.",
  ],
  benefits: [
    [
      "Logs events, not a continuous stream",
      "Rows are written only when RMS crosses 0.08, so a long session produces a short, readable timeline instead of thousands of idle samples.",
    ],
    [
      "Each event carries pitch, not just loudness",
      "Autocorrelation over lags of 20 to 1000 samples gives a dominant frequency and the nearest note with cent offset, which helps distinguish one recurring source from another.",
    ],
    [
      "Derived numbers only",
      "The microphone stream feeds an analyser node and is discarded — no audio buffer is saved, uploaded or made downloadable, so the log contains no recorded speech.",
    ],
  ],
  faqs: [
    [
      "How loud does a sound have to be before it gets logged?",
      "It has to push the RMS amplitude of the analysis window above 0.08 on the normalised -1 to 1 scale. That threshold is fixed, and it is checked on roughly every twelfth animation frame, so events shorter than a few dozen milliseconds may fall between samples.",
    ],
    [
      "Does this record or save the audio?",
      "No. The microphone stream is routed into a Web Audio analyser and read as numbers; no audio buffer is retained, written to disk or transmitted. The timeline holds only timestamps, RMS values, frequencies and note names, and the most recent 200 rows are kept on screen.",
    ],
    [
      "What does the frequency column mean?",
      "It is the dominant pitch of that event, estimated by autocorrelation and reported in hertz alongside the nearest equal-temperament note referenced to A4 = 440 Hz, with the deviation in cents. It is reliable for tonal sources such as alarms or motors and much less meaningful for broadband noise like a door slam.",
    ],
    [
      "Can I use this log as evidence in a noise complaint?",
      "Treat it as an informal aid, not calibrated measurement. It reports relative RMS from an uncalibrated device microphone rather than sound pressure in decibels, and browser gain handling varies by device, so it cannot establish a legal noise level. For a formal complaint, ask your local authority about a calibrated sound-level survey.",
    ],
  ],
};

export default seo;

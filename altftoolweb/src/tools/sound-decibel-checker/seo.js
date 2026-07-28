const seo = {
  title: "Decibel Meter Online — Free Sound Level Checker",
  h1: "Sound Decibel Checker — Live Online dB Meter",
  metaDescription:
    "Free online decibel meter: your mic plus the Web Audio API give live dB, a 64-band spectrum and the last 50 readings. Nothing is recorded or uploaded.",
  intro:
    "The Sound Decibel Checker turns your device microphone into a live sound level readout. It opens the mic with getUserMedia, feeds it into a Web Audio API AnalyserNode (fftSize 2048, smoothing 0.8), and on every animation frame takes the RMS of the time-domain waveform and converts it with 20 × log10(RMS) + 100, clamped to a 0–120 range. The same node's frequency data drives a 64-bar spectrum and a canvas visualiser, while a history graph keeps the previous 50 readings. Because the +100 is a fixed offset rather than a calibration against a reference level, the number is a relative dB scale — useful for comparison, not a certified SPL measurement.",
  useCases: [
    "Checking whether a home office, nursery or bedroom sits in the quiet band before a call or bedtime",
    "Comparing two rooms, two fans, or two positions in the same space to see which is measurably louder",
    "Using the 64-bar spectrum to see which frequency range a hum, rattle or whine actually occupies",
  ],
  benefits: [
    [
      "Live, not a snapshot",
      "The measurement loop runs on requestAnimationFrame, so the gauge, spectrum, visualiser and history all refresh on every frame while the mic is open.",
    ],
    [
      "Five labelled bands",
      "Readings are sorted into Whisper Quiet (under 30), Quiet Room (under 50), Normal Conversation (under 70), Loud Environment (under 85) and Very Loud (85 and above).",
    ],
    [
      "Last 50 readings plotted",
      "A history graph draws the previous 50 measurements as a line on a 0–120 dB grid, so short spikes are visible instead of being lost in the current number.",
    ],
    [
      "Nothing leaves the browser",
      "The source has no upload, recording or storage calls at all. Stopping the meter stops every microphone track and closes the AudioContext.",
    ],
  ],
  faqs: [
    [
      "How accurate is an online decibel meter?",
      "Treat it as relative, not calibrated. This tool computes dB from the microphone's RMS signal level and adds a fixed +100 offset to place the result on a 0–120 scale, and no browser API exposes your microphone's actual sensitivity, so the reading is not tied to a reference sound pressure level. It is dependable for comparing two rooms or before-and-after changes; it is not a replacement for a calibrated Class 1 or Class 2 sound level meter.",
    ],
    [
      "How do I measure noise levels in my browser without an app?",
      "Press Start Measuring and allow microphone access when prompted. Everything runs client-side with the Web Audio API — no download, no account, no software to install. The page has to be on HTTPS, because browsers only grant getUserMedia on a secure origin.",
    ],
    [
      "Is my microphone audio recorded or uploaded anywhere?",
      "No. The tool's code contains no fetch, upload, MediaRecorder or localStorage calls — the mic stream goes straight into an AnalyserNode and only numeric levels are read back out. Pressing Stop Measuring calls stop() on every audio track and closes the AudioContext, releasing the microphone.",
    ],
    [
      "What decibel level counts as loud on this meter?",
      "On this tool's scale, 85 and above is labelled Very Loud, 70–84 Loud Environment, 50–69 Normal Conversation, 30–49 Quiet Room, and under 30 Whisper Quiet. Those labels describe the reading itself. Since the scale is uncalibrated, don't use it to judge occupational exposure limits or hearing safety — that needs a calibrated meter.",
    ],
    [
      "Why does the reading stay at 0 dB?",
      "Most often a permission or input issue. If microphone access is denied, the control panel shows a \"Microphone access denied\" message and the value never leaves 0. Otherwise check that the browser is using the input device you expect, and note that the formula clamps at 0, so a very quiet room simply bottoms out.",
    ],
    [
      "What do the frequency spectrum bars actually show?",
      "The AnalyserNode's byte frequency data, downsampled to 64 bars. With fftSize 2048 the analyser produces 1024 bins across the Nyquist range, and the display samples every fourth bin — so the bars concentrate on the lower part of the spectrum. The 20 Hz to 20 kHz labels under the graph are a rough guide, not a per-bar calibration.",
    ],
    [
      "Can I save or export the decibel readings?",
      "No. There is no export, and the history graph holds only the last 50 values in memory. Pressing Start Measuring clears the history, and refreshing or closing the tab discards it.",
    ],
    [
      "Does it work on a phone?",
      "Yes, in any mobile browser that supports getUserMedia and the Web Audio API, which includes current Chrome, Safari and Firefox. The layout is responsive down to small screens, and tapping Start Measuring supplies the user gesture browsers require before audio can begin.",
    ],
  ],
  steps: [
    "Press Start Measuring and allow microphone access when the browser asks.",
    "Read the gauge for the current dB value and its band label, with the spectrum and neon visualiser showing live frequency content and the history graph tracking recent readings.",
    "Press Stop Measuring to release the microphone — the last 50 readings stay on the graph until you start a new session.",
  ],
};

export default seo;

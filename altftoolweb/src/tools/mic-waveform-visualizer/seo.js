const seo = {
  title: "Microphone Visualizer — Live Mic Waveform Online",
  h1: "Microphone Visualizer — Live Mic Waveform",
  metaDescription:
    "See your mic live as an oscilloscope wave, frequency spectrum, circular ring or bars, with volume, peak and dominant-pitch readouts. Free, no signup.",
  intro:
    "The Mic Waveform Visualizer turns live microphone input into a real-time visual using the Web Audio API's AnalyserNode at an FFT size of 2048, which gives 1,024 frequency bins. Four displays are one tap apart — an oscilloscope trace of the raw waveform, a frequency spectrum, a circular radial ring, and animated bars — and three colour schemes (Solid, Gradient, Spectrum) restyle whichever one is on. Alongside the canvas, three live readouts report volume as an RMS percentage, a slowly decaying peak that turns red above 85%, and the dominant frequency in hertz, taken from the loudest FFT bin. A Smoothing slider (0–99%) sets the analyser's smoothing time constant, and a Gain slider (0.5x–5x) scales both the drawn amplitude and the meters. Audio is analysed in the page for drawing only: there is no recording, no upload and no account.",
  useCases: [
    "Checking that a microphone is actually picking up sound, and how hot it is running, before a call, podcast or recording take",
    "Putting a live oscilloscope trace or spectrum on screen as a stream or performance visual that reacts to voice or an instrument",
    "Showing amplitude, frequency and waveform shape in a music or physics lesson, with a real signal instead of a static diagram",
  ],
  benefits: [
    [
      "Four displays, switchable live",
      "Oscilloscope, Frequency, Circular and Bars each redraw from the same analyser, so you can flip between them mid-sentence without restarting the microphone.",
    ],
    [
      "Real meters, not just a pretty wave",
      "Volume as an RMS percentage, a peak meter that decays slowly and turns red past 85% so you can spot clipping, and the dominant frequency in Hz read from the loudest of 1,024 FFT bins.",
    ],
    [
      "Smoothing and gain you control",
      "Smoothing runs 0–99% for a jittery or a silky trace, and Gain from 0.5x to 5x scales both the drawn amplitude and the meters, which makes a quiet laptop mic readable.",
    ],
    [
      "Nothing recorded, nothing uploaded",
      "The stream from getUserMedia feeds an AnalyserNode and a canvas and goes nowhere else — no MediaRecorder, no file, no server call — and Stop releases the microphone.",
    ],
  ],
  faqs: [
    [
      "Does this microphone visualizer record my audio?",
      "No. The live stream is connected to a Web Audio AnalyserNode purely so the canvas can be drawn from it. There is no recorder, no download and no network request carrying audio, and pressing Stop shuts the audio context and clears the canvas.",
    ],
    [
      "Why is my browser asking for microphone permission?",
      "Because drawing a live waveform needs live input, and the page calls getUserMedia to get it. It is your browser's standard microphone prompt and you can revoke it at any time in site settings. If you decline, the tool shows a permission message rather than failing silently.",
    ],
    [
      "What visual modes are available?",
      "Four: Oscilloscope plots the raw time-domain waveform; Frequency draws a spectrum across the FFT bins; Circular wraps the waveform into a radial ring; and Bars animates a bar-per-band display. On top of those, three colour schemes — Solid, Gradient and Spectrum — restyle whichever mode is active.",
    ],
    [
      "Can I use this as an oscilloscope for audio testing?",
      "For a quick visual check, yes — Oscilloscope mode plots the time-domain waveform straight from the analyser, so you can see shape, symmetry and clipping. It is not a calibrated instrument: the vertical scale is relative and moves with the Gain slider, and the horizontal window is whatever one 2048-sample analyser frame covers.",
    ],
    [
      "What does the Frequency readout show?",
      "The dominant pitch in hertz — the tool scans all 1,024 frequency bins, takes the loudest one, and converts its index to Hz using your audio context's sample rate. Whistle and it tracks the whistle; on speech or a busy room it jumps around, because the loudest bin changes constantly.",
    ],
    [
      "The wave looks flat. What should I change?",
      "Raise Gain — it goes to 5x and multiplies both the drawn amplitude and the meters, which is usually enough for a quiet built-in microphone. If Volume still reads near zero, the browser is likely using a different input device than you expect; check the microphone selected in your operating system's sound settings.",
    ],
    [
      "Does it work on mobile?",
      "Yes — any modern mobile or desktop browser that supports the Web Audio API and getUserMedia. The canvas resizes to the device's pixel ratio, and the mode, colour and slider controls are laid out for a phone screen.",
    ],
  ],
  steps: [
    "Press Start and allow microphone access when your browser asks.",
    "Pick a display — Oscilloscope, Frequency, Circular or Bars — and a colour scheme, then set Smoothing and Gain until the trace reads well.",
    "Watch the Volume, Peak and Frequency cards as you speak, sing or play, and press Stop to release the microphone when you are done.",
  ],
};

export default seo;

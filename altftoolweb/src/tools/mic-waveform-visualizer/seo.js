const seo = {
  title: "Mic Waveform Visualizer — Live Audio, Free Online",
  h1: "Mic Waveform Visualizer",
  metaDescription:
    "Turn your live microphone input into a real-time oscilloscope wave, frequency spectrum, or circular visual — free, right in your browser.",
  intro:
    "The Mic Waveform Visualizer turns your live microphone input into a real-time visual using the Web Audio API's AnalyserNode — choose an oscilloscope waveform, a frequency spectrum, animated bars, or a circular display, all updating live as you speak, sing, or play sound. Audio is analyzed entirely in your browser; nothing is recorded or uploaded.",
  useCases: [
    "Visualizing voice or instrument input for a stream overlay, recording session, or live performance",
    "Checking microphone levels and signal visually before a call, podcast, or recording",
    "Demonstrating sound waves, frequency, and amplitude for a music or physics class",
  ],
  benefits: [
    [
      "Four visual modes",
      "Switch between oscilloscope, frequency spectrum, circular, and bar displays to match what you're demonstrating or recording against.",
    ],
    [
      "Real-time, low latency",
      "Built on the Web Audio API's AnalyserNode, so the visual tracks your microphone input live with no noticeable delay.",
    ],
    [
      "Nothing recorded or uploaded",
      "Audio is analyzed directly in your browser for the visualization only — no audio is saved or sent anywhere.",
    ],
    [
      "No install, free",
      "Works in any modern browser with a microphone; just grant mic access and go.",
    ],
  ],
  faqs: [
    [
      "Does this microphone visualizer record my audio?",
      "No. It reads live audio through the Web Audio API purely to draw the visualization — nothing is recorded, saved, or uploaded anywhere.",
    ],
    [
      "Why is my browser asking for microphone permission?",
      "The visualizer needs live access to your mic input to draw the waveform in real time — this is your browser's standard one-time microphone permission prompt, and you can revoke it at any time in your browser settings.",
    ],
    [
      "What visual modes are available?",
      "Four: an oscilloscope-style waveform, a frequency spectrum (bars by frequency), a circular radial display, and an animated bar visualizer — switch between them live while the microphone is active.",
    ],
    [
      "Can I use this as an oscilloscope for audio testing?",
      "Yes — oscilloscope mode plots the live waveform the same way a hardware oscilloscope would, useful for a quick visual check of signal shape and amplitude.",
    ],
    [
      "Does it work on mobile?",
      "Yes, on any modern mobile or desktop browser that supports the Web Audio API and allows microphone access.",
    ],
  ],
  steps: [
    "Open the tool and allow microphone access when your browser asks.",
    "Pick a visual mode — oscilloscope, frequency, circular, or bars.",
    "Speak, sing, or play sound and watch the visualization respond in real time.",
  ],
};

export default seo;

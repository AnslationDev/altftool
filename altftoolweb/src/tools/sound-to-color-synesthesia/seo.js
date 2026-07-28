const seo = {
  title: "Sound to Color Synesthesia — Chromesthesia Visualizer",
  h1: "Sound to Color Synesthesia Visualizer",
  metaDescription:
    "Turn songs or live mic input into color: each semitone maps to 30° of hue, so every C is red and every A violet. In-browser, nothing uploaded.",
  intro:
    "The Sound to Color Synesthesia visualizer maps pitch to hue using the Web Audio API's AnalyserNode with a 2048-point FFT, picking the loudest frequency bin each frame (about 21.5 Hz resolution at a 44.1 kHz sample rate) and converting that peak into a MIDI note number with 12 × log2(f/440) + 69. The note number is multiplied by 30° of hue, so the twelve semitones of an octave cover the full color wheel — C is red, E green, G# blue, A violet — while amplitude drives the saturation and lightness of the resulting HSL color. Everything is painted to a Canvas 2D layer as six radial gradient rings, 128 circular frequency bars, a live waveform trace and 60 amplitude-driven particles, with a second canvas holding a scrolling chromatic history of the track so far. Songs you drop in are read locally through URL.createObjectURL; the tool makes no network requests, so no audio is uploaded, recorded, or stored.",
  useCases: [
    "Generating a live color backdrop for a track while producing, DJing, or streaming",
    "Teaching pitch, frequency and octaves by showing that loudness changes brightness while only pitch changes hue",
    "Testing what color a fixed chromesthesia mapping assigns to your singing, whistling, or a live instrument through the mic",
  ],
  benefits: [
    [
      "Pitch sets the hue, loudness sets the rest",
      "The dominant frequency picks a hue on a 30°-per-semitone wheel; amplitude sets saturation between 30% and 100% and lightness between 20% and 75%, so quiet passages read deep and muted, loud ones bright and saturated.",
    ],
    [
      "Your files stay on your device",
      "Dropped-in songs play from a local object URL through your browser's own audio element. There is no upload step, no server round-trip, and no account to create.",
    ],
    [
      "Numbers, not just pretty visuals",
      "Frequency in Hz, the detected note and octave, and the exact hsl() value update every frame, next to a scrolling chromatic history strip showing every color the track has produced.",
    ],
    [
      "Playlist and microphone in one tool",
      "Queue multiple audio files by drag-and-drop with play/pause, prev/next, click-to-seek and auto-advance — or switch to Microphone mode to visualize live sound instead.",
    ],
  ],
  faqs: [
    [
      "What color is each musical note in this sound to color mapping?",
      "C is red at hue 0°, and every semitone above it shifts the hue by 30°: C# 30°, D 60°, D# 90°, E 120°, F 150°, F# 180°, G 210°, G# 240°, A 270°, A# 300°, B 330°. Twelve semitones complete the 360° wheel, so notes an octave apart land on the identical hue — every C is red, whichever octave it is played in.",
    ],
    [
      "How does the tool decide which color to show?",
      "It runs a 2048-point FFT through the Web Audio API's AnalyserNode on every animation frame, scans the bins from roughly 43 Hz to 16.5 kHz for the loudest one, and treats that peak as the dominant frequency. The frequency becomes a MIDI note number via 12 × log2(f/440) + 69, that number × 30 becomes the hue, and the peak's magnitude (0–255, normalised to 0–1) becomes the saturation and lightness.",
    ],
    [
      "Can I visualize my own songs, not just the microphone?",
      "Yes. My Songs mode accepts audio files by drag-and-drop or file picker and queues them as a playlist with play/pause, prev/next, click-to-seek and automatic advance to the next track when one ends. Any audio format your browser can play will work.",
    ],
    [
      "Does it upload my music files anywhere?",
      "No. The tool makes no network requests at all — audio files are loaded with URL.createObjectURL and decoded locally by your browser's audio element, and microphone audio is read in-page through getUserMedia. Nothing is recorded, stored, or sent to a server, and there is no signup.",
    ],
    [
      "Is this what real synesthesia looks like?",
      "No — it is a fixed, deterministic mapping, not a reproduction of anyone's perception. Real chromesthesia is involuntary and highly individual, and two people who experience it rarely agree on the color of the same note. This tool assigns the same hue to the same pitch every time so the pitch-to-color relationship stays readable and teachable.",
    ],
    [
      "Why does the color barely change during some parts of a song?",
      "Because it tracks one dominant frequency rather than the whole spectrum. In a dense mix a single bin — usually the bass or the loudest lead partial — wins most frames, and since octaves share a hue, a bass line moving between octaves of the same note holds a single color. Solo instruments, voice and sparse arrangements produce far more color movement.",
    ],
    [
      "Can I export or download the visualization as a video?",
      "Not from the tool itself — there is no built-in recording or export. To keep a clip, run your operating system's or browser's screen recorder while the canvas is playing.",
    ],
    [
      "Does the sound to color visualizer work on a phone?",
      "Yes, in any modern mobile browser that supports the Web Audio API and Canvas 2D. Microphone mode needs the page served over HTTPS plus a permission grant, while My Songs mode works with any audio file your mobile browser can play.",
    ],
  ],
  steps: [
    "Pick My Songs and drop in an audio file, or pick Microphone and allow access when your browser asks.",
    "Press Play (or Begin Listening) — the canvas starts mapping the dominant frequency to color in real time.",
    "Read the Frequency, Note and hsl() panels and the chromatic history strip to see exactly which pitch produced which color.",
  ],
};

export default seo;

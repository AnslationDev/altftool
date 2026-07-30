const seo = {
  title: "Interval Ear Trainer — Free Ear Training",
  h1: "Interval Ear Trainer — Melodic and Harmonic Ear Training",
  metaDescription:
    "Free interval ear training quiz — identify all 12 intervals, minor 2nd to octave, melodic or harmonic. Web Audio tones, no signup, runs in-browser.",
  intro:
    "The Interval Ear Trainer plays two notes and asks you to name the distance between them. Every tone is synthesised live by the Web Audio API — one triangle-wave OscillatorNode per note, shaped by a GainNode envelope with a 20 ms attack and a 0.8-second total length — driven by a built-in equal-temperament frequency table running from C4 (261.63 Hz) to A5 (880 Hz), with A4 at 440 Hz. It covers all 12 chromatic intervals from the minor 2nd to the octave, in melodic mode (root, then the top note 0.9 s later) or harmonic mode (both notes struck together). Nothing is uploaded, recorded, or downloaded: the audio engine, the quiz logic, and the scoring all run inside your browser tab.",
  useCases: [
    "Music students drilling for an aural skills or grade exam, isolating the intervals they keep missing — tritone versus perfect 5th, minor 6th versus major 6th — instead of running the full 12 every round.",
    "Singers and instrumentalists warming up pitch recognition before a rehearsal, using harmonic mode to train the tuning-sensitive simultaneous intervals and melodic mode for line-reading.",
    "Producers, arrangers and transcribers building the reflex to name a leap by ear, so a melody or bassline can be written down without hunting for it on a keyboard.",
  ],
  benefits: [
    [
      "All 12 chromatic intervals, individually switchable",
      "The trainer knows every interval from the minor 2nd (1 semitone) through the octave (12 semitones). Open the Intervals panel and toggle off whatever you already own — the quiz only draws from the ones left on, so you can drill a two-interval pair until it sticks. At least one interval always stays active.",
    ],
    [
      "Melodic and harmonic playback",
      "Melodic mode plays the root, then the upper note 0.9 seconds later, which is how intervals appear in a line. Harmonic mode sounds both notes at the same instant, which is the harder ear and the one that matters for tuning and chord recognition. Switch modes mid-session without losing your score.",
    ],
    [
      "Live scoring, streaks and a mistake log",
      "Accuracy, correct count, total, current streak and best streak update after every answer. A Recent History panel keeps your last 10 questions and, when you miss, records what you guessed instead — so the confusion pattern shows itself rather than disappearing.",
    ],
    [
      "No account, no install, nothing uploaded",
      "The page is free and requires no signup. Tones are generated on your device by the browser's own audio engine, and the tool makes no network requests while you practise — no microphone, no recordings, no files leaving your machine.",
    ],
  ],
  faqs: [
    [
      "What is interval ear training?",
      "It's the practice of naming the pitch distance between two notes purely by listening. An interval is measured in semitones — a perfect 5th is 7, an octave is 12 — and this trainer plays a random pair from its C4-to-A5 range, then asks you to pick the right name from m2 through P8. Repetition builds the reflex that lets you transcribe a melody or spot a chord tone without an instrument.",
    ],
    [
      "What's the difference between melodic and harmonic mode?",
      "Timing. Melodic mode plays the lower note first and the upper note 0.9 seconds later, so you hear the leap as a movement. Harmonic mode starts both notes at exactly the same moment, so they fuse into one sound and you have to identify the interval from its colour and beating. Harmonic is generally the harder of the two — most people start on melodic.",
    ],
    [
      "Which intervals does this ear trainer cover?",
      "All 12 chromatic intervals within an octave: minor 2nd (1 semitone), major 2nd (2), minor 3rd (3), major 3rd (4), perfect 4th (5), tritone (6), perfect 5th (7), minor 6th (8), major 6th (9), minor 7th (10), major 7th (11) and the octave (12). Compound intervals beyond the octave are not included.",
    ],
    [
      "How do I practise only certain intervals, like thirds and fifths?",
      "Click the Intervals button to open the selection panel, then switch off everything you don't want. The quiz draws its questions only from the intervals still enabled, and the answer grid shrinks to match, so a two-interval drill really is a two-way choice. The counter beside the toolbar shows how many of the 12 are active; the tool won't let you disable the last one.",
    ],
    [
      "Is this interval ear trainer free, and do I need an account?",
      "Yes, it's free, and no account or download is needed. The whole trainer is client-side JavaScript — the notes are synthesised by your browser's Web Audio engine, and no audio or answer data is sent anywhere while you practise.",
    ],
    [
      "Why can't I hear any sound?",
      "Almost always because the browser hasn't unlocked audio yet. Browsers create the AudioContext in a suspended state and only resume it after a user gesture, so the first click on Start Session is what turns the sound on — if you loaded the page and heard nothing, press Start (or Replay) once. After that, check your system and tab volume; the tool plays at a fixed gain of 0.32, well below full scale.",
    ],
    [
      "Does the trainer save my score between sessions?",
      "No. Accuracy, streak, best streak and the 10-question history live in the page's memory only. Reloading the tab or pressing Reset clears them, and nothing is written to your device or to a server. Note your accuracy down before you leave if you want to track progress over weeks.",
    ],
    [
      "What note range and tuning does it use?",
      "A 22-note chromatic range from C4 (261.63 Hz) up to A5 (880 Hz), in 12-tone equal temperament with A4 = 440 Hz. Each question picks a random root low enough that the upper note still fits inside that range, so an octave question never starts above A4. Timbre is a triangle wave — brighter than a sine, cleaner than a saw — which keeps the upper partials audible without masking the interval.",
    ],
  ],
  steps: [
    "Press Start Session. That first click both unlocks browser audio and plays your first randomly chosen interval — optionally set melodic or harmonic mode, and open the Intervals panel first if you want to drill a subset.",
    "Listen, hitting Replay as many times as you need, then click the interval you think you heard from the answer grid. Each button shows the abbreviation, the full name and its semitone count.",
    "Read the instant feedback — a miss tells you the correct interval and logs what you guessed — then press Next Interval. Accuracy, streak, best streak and the last 10 answers update as you go; Reset clears the session.",
  ],
};

export default seo;

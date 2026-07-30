const seo = {
  intro:
    "The Chromatic Instrument Tuner listens through your microphone, finds the pitch you are playing by autocorrelation, and reports the nearest equal-tempered note plus how many cents sharp or flat you are from it, with A4 fixed at 440 Hz. It is for guitarists, violinists, wind players and singers who want a running log of readings rather than a single wobbling needle. Audio is analysed in the page through the Web Audio API and never uploaded.",
  useCases: [
    "You are restringing a guitar and the new strings keep dropping — playing each string in turn shows whether you are settling flat and by how many cents, so you know when the stretch has finished.",
    "A violin or cello student wants to check that their fourth-finger notes are actually in tune, not just close, and needs the cents deviation rather than a green light.",
    "You are tuning a woodwind before rehearsal and want to see whether the instrument is running consistently sharp as it warms up, which the timestamped reading log makes visible.",
  ],
  benefits: [
    [
      "Cents, not just a needle",
      "Every reading gives the signed deviation in cents from the nearest semitone, so 'slightly flat' becomes a number you can act on.",
    ],
    [
      "Autocorrelation, not peak-picking",
      "Pitch comes from the time-domain autocorrelation of a 4096-sample window, which tracks the fundamental of a rich instrument tone instead of latching onto a loud harmonic.",
    ],
    [
      "A log you can review",
      "Readings are timestamped with signal level, frequency and note, so drift over a warm-up or a set is visible after the fact rather than gone the moment you stop playing.",
    ],
  ],
  faqs: [
    [
      "What reference pitch does the tuner use?",
      "A4 = 440 Hz, the standard concert pitch, with all other notes derived by equal temperament. The MIDI note number is computed as 69 + 12 × log₂(f ÷ 440) rounded to the nearest whole number, and cents are 1200 × log₂(f ÷ target).",
    ],
    [
      "What is a cent, and how close is close enough?",
      "A cent is one hundredth of a semitone, so 100 cents separates adjacent notes. Most players aim to stay inside a few cents of zero; deviations beyond about 10 cents are audible as out of tune to a trained ear.",
    ],
    [
      "What pitch range can it detect?",
      "The autocorrelation searches lags of 20 to 1000 samples, which at a 44.1 kHz sample rate covers roughly 44 Hz up to about 2.2 kHz — from a bass guitar's low E to well above the top of a violin's normal range.",
    ],
    [
      "Does my microphone audio leave the device?",
      "No. The page opens the microphone through getUserMedia and analyses the waveform locally with the Web Audio API; no audio is recorded to a file or sent anywhere. You will be asked for microphone permission before it can start.",
    ],
  ],
};

export default seo;

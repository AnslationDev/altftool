const seo = {
  title: "Voice Steadiness Visualizer: Pitch and Volume",
  metaDescription:
    "Reads your mic and reports current volume, estimated pitch in Hz, average volume and pitch spread. Autocorrelation over 70-500 Hz; nothing is recorded.",
  steps: [
    "Press Start microphone and grant the browser permission prompt.",
    "Sustain a comfortable vowel or read a short sentence — pitch is estimated by autocorrelation across the 70-500 Hz range and frames below an RMS of 0.01 return no pitch.",
    "Watch Current volume, Estimated pitch, Average volume and Pitch spread with the rolling 40-sample bar chart, then press Stop microphone.",
  ],
  intro:
    "The Voice Steadiness Visualizer listens through your microphone and shows how consistent your loudness and pitch are while you speak or hold a vowel, sampling roughly five times a second and reporting current volume, estimated fundamental frequency in Hz, average volume and pitch spread. Pitch is found by autocorrelation over the 70–500 Hz range on a 2048-sample window, and frames quieter than an RMS of 0.01 are treated as silence. It is a practice and awareness aid for speech exercises, presentation rehearsal and voice training — it is not a medical device and produces no diagnosis.",
  useCases: [
    "You are rehearsing a talk and keep trailing off at the end of sentences — the rolling volume bars make the drop visible so you can practise holding level through the last few words.",
    "A speech-language therapist has asked you to sustain an /a/ vowel at home; you watch the pitch spread figure and try to get the standard deviation down across the held note.",
    "You are doing voice training and want to know where your speaking pitch actually sits, so you read a paragraph and read the average of the voiced frames in Hz instead of guessing.",
  ],
  benefits: [
    ["Spread, not just a number", "It reports the standard deviation of pitch across voiced frames alongside the average, so you can see steadiness rather than a single instantaneous reading."],
    ["Honest about unvoiced frames", "Frames below the RMS gate and frames where autocorrelation finds no clear period are excluded from the averages instead of being scored as zero Hz."],
    ["A short rolling window", "Only the most recent 40 samples — roughly the last seven seconds — are charted, so the display reflects the attempt you just made, not everything since you pressed start."],
  ],
  faqs: [
    [
      "What pitch range can it detect?",
      "70 Hz to 500 Hz, which covers typical adult speaking and most singing fundamentals. Anything outside that window, plus any frame with an RMS below 0.01, returns no pitch and is shown as a dash rather than a wrong number.",
    ],
    [
      "How does it estimate pitch?",
      "By autocorrelation: it takes a 2048-sample time-domain window from the Web Audio analyser, tests each lag between sampleRate/500 and sampleRate/70, and converts the best-correlating lag into a frequency. This is robust for a steady vowel but can octave-jump on breathy, noisy or whispered input.",
    ],
    [
      "Can this tell me if something is wrong with my voice?",
      "No. It is explicitly non-diagnostic — it measures signal properties of your microphone input, and tremor, hoarseness or fatigue can look identical to a cheap mic, a noisy room or a bad angle. Talk to a doctor or a speech-language pathologist about any persistent change in your voice.",
    ],
    [
      "Is my voice recorded or uploaded?",
      "No. The microphone stream is analysed live in the page and nothing is stored or sent anywhere; there is no recording to download. The stream starts only after you press the button and grant permission, and stops when you press stop or leave the page.",
    ],
  ],
};

export default seo;

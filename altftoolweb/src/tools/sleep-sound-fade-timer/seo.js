const seo = {
  title: "Sleep Sound Fade Timer: Fades to Silence",
  metaDescription:
    "Plays brown noise, steady rain, ocean surf or fan hum, then fades to silence over your chosen curve — synthesised in-browser with the Web Audio API.",
  steps: [
    "Pick a Sound — Brown noise, Steady rain, Ocean surf or Fan hum — then set Total play time (minutes) (1-480), Fade length (minutes) (1-120), Volume (%), Fade curve and Start time.",
    "Press Play: the loop is synthesised with the Web Audio API, holds steady, then follows your Logarithmic, Linear or S-curve fade.",
    "Watch the Until silence countdown and Silent at clock time over the level chart; Copy plan copies the timer settings.",
  ],
  intro:
    "Sleep Sound Fade Timer plays brown noise, rain, ocean surf or fan hum at a steady level while you fall asleep, then fades it to complete silence over a fade time you set. You choose the curve: a logarithmic fade drops an equal number of decibels each minute, which the ear hears as perfectly even, while linear and S-curve fades feel different in the last few minutes. Everything is synthesised in the browser, so it runs offline and no audio file is downloaded.",
  useCases: [
    "Fall asleep to brown noise that is completely silent 45 minutes later, instead of running all night.",
    "Mask a partner's snoring or street traffic for the 20 minutes it takes you to drop off.",
    "Give a baby or toddler a fan-hum wind-down that fades out rather than stopping abruptly.",
    "Set the start time and see the exact clock time the room will be quiet again.",
  ],
  benefits: [
    ["Fades, never cuts", "A sudden stop can wake you; the level slides to true silence instead."],
    ["Three fade curves", "Logarithmic matches how hearing works, linear is faster at the end, S-curve is gentlest at both ends."],
    ["No files, no account", "Sound is generated locally with the Web Audio API, so it works offline and uses no data."],
  ],
  faqs: [
    [
      "How long should a sleep sound timer run?",
      "Most people fall asleep within 10 to 20 minutes, so a 30 to 60 minute timer with the last 10 to 15 minutes as a fade covers the whole sleep-onset window. Running sound all night is a personal choice, but a timer avoids it disturbing the lighter sleep stages later in the night.",
    ],
    [
      "Why does a logarithmic fade sound smoother than a linear one?",
      "Because loudness is perceived roughly on a decibel scale, not a linear amplitude scale. A linear fade spends most of its time in the quiet region where changes are barely audible and then seems to disappear at the end, while a logarithmic fade drops an equal number of decibels per minute so each step sounds the same size.",
    ],
    [
      "Is brown noise good for sleep?",
      "Many people find brown noise easier to sleep to than white noise because its energy falls about 6 dB per octave, removing the harsh high frequencies. Research on noise and sleep quality is mixed and results vary between individuals, so treat it as a comfort aid rather than a treatment.",
    ],
    [
      "Will the sound keep playing if my phone screen locks?",
      "It may stop. Browsers can suspend audio in a backgrounded or locked tab, so keep the tab in the foreground, or add the page to your home screen and stop the screen from sleeping. On a laptop, sleep mode will also stop playback.",
    ],
  ],
};

export default seo;

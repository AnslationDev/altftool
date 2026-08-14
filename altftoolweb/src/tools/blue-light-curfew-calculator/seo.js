const seo = {
  title: "Blue Light Curfew Calculator — Screens-Down Time",
  metaDescription:
    "Work back from your alarm through sleep and fall-asleep time to tonight's night-mode, screens-down and lights-out times, with 90-minute cycle alignment.",
  steps: [
    "Set 'Wake-up time' and 'Target sleep (hours)' — any value from 3 to 14 hours, defaulting to 8 — for the night you are planning.",
    "Enter 'Time you take to fall asleep (minutes)' and a screen curfew, typed in minutes or picked from the Light — 30 min, Standard — 60 min and Strict — 120 min presets.",
    "Read 'Screens down at' plus the 'Warm / night mode from', 'Lights out, in bed' and 'Cycle-aligned lights out' rows, then use 'Copy result' to save tonight's schedule.",
  ],
  intro:
    "A blue light curfew calculator works backwards from your alarm to show the exact clock time you should stop using bright screens tonight. It chains four steps — alarm minus target sleep gives the time you need to be asleep, minus your sleep-onset latency gives lights-out, minus your chosen curfew gives screens-down, and an extra lead time marks when to switch devices to warm or night mode. Useful for anyone who keeps missing their intended bedtime because the wind-down never actually starts.",
  useCases: [
    "You have a 5:30 am flight alarm and want to know the last moment you can be scrolling and still get seven hours of sleep.",
    "You are trialling a 60-minute no-screens rule and want the specific time it starts each night rather than a vague 'an hour before bed'.",
    "Shift work moves your wake-up time around, so the whole wind-down chain has to be recalculated for each roster block.",
    "You want lights-out aligned to whole 90-minute sleep cycles so the alarm is less likely to land in deep sleep.",
  ],
  benefits: [
    ["Backwards from the alarm", "The fixed point is your wake-up time, so the schedule reflects the sleep you actually need."],
    ["Sleep-onset latency included", "The gap between getting into bed and falling asleep is counted, not ignored."],
    ["Cycle-aligned option", "Shows the lights-out time that fits whole 90-minute cycles before your alarm."],
  ],
  faqs: [
    [
      "How long before bed should I stop looking at screens?",
      "Common sleep-hygiene guidance is 30 to 60 minutes of no bright screens before lights out, and up to 2 hours if evening light seems to be delaying your sleep. The calculator lets you pick the gap and shows the exact time it starts for your alarm.",
    ],
    [
      "Does blue light actually keep you awake?",
      "Short-wavelength light in the evening suppresses melatonin release and can push your circadian timing later, which delays sleep onset. Brightness and how close the screen is to your eyes matter as much as colour, so dimming the display helps alongside a warm colour filter.",
    ],
    [
      "Do night mode and blue light filters replace a screen curfew?",
      "They reduce the short-wavelength component but not the overall brightness or the mental engagement of the content, so they soften the effect rather than remove it. Treat night mode as the earlier, gentler step and still keep a screens-down window before lights out.",
    ],
    [
      "Why does the calculator add time for falling asleep?",
      "Healthy sleep onset typically takes about 10 to 20 minutes, so lights-out has to be earlier than the time you need to be asleep. Entering your own usual figure keeps the whole chain honest; if it regularly exceeds 30 minutes, that is worth raising with a doctor or sleep specialist.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Analog Clock with Alarm — Free Fullscreen Clock",
  h1: "Analog Clock & Alarm",
  metaDescription:
    "A live analog clock with a smooth sweeping second hand, fullscreen mode, and unlimited alarms with snooze — free, no signup, all saved in your browser.",
  intro:
    "The Analog Clock & Alarm draws a scalable SVG clock face and rotates the hour, minute, and second hands on every animation frame with requestAnimationFrame. Because the second-hand angle includes milliseconds, it sweeps smoothly rather than ticking once per second. Alarms are checked once a second against your device clock and ring through the Web Audio API, where each sound is synthesised live from oscillator tones — an 880 Hz beep, a 523/659/784 Hz chime, a 1046 Hz bell, or a 200 Hz sawtooth buzzer. Your alarms are saved in your browser's localStorage; nothing is sent to a server.",
  useCases: [
    "Keeping a large, readable clock on a second monitor, a spare tablet, or a classroom projector using one-click fullscreen mode",
    "Setting a wake-up or reminder alarm on a computer where you don't want to install an app — the alarm lives in the browser tab",
    "Practising or teaching how to read an analog clock, with hour numbers and 60 tick marks you can toggle on and off",
  ],
  benefits: [
    [
      "Smooth sweeping second hand",
      "Hands are repositioned every animation frame with requestAnimationFrame at sub-second precision, so the second hand glides continuously instead of jumping once per second — and the hour hand advances fractionally as the minutes pass.",
    ],
    [
      "Fullscreen clock in one click",
      "The fullscreen button calls the browser's Fullscreen API on the clock panel, expanding the face, digital time, date, and timezone label to fill your whole display. Press Esc to exit.",
    ],
    [
      "Alarms with real repeat rules",
      "Each alarm carries a label (up to 40 characters), an AM/PM time, a repeat pattern of one-time, daily, Mon–Fri, Sat–Sun, or any custom set of days, a snooze of 1 to 30 minutes, one of four sounds, and a 0–100% volume.",
    ],
    [
      "Nothing leaves your browser",
      "Alarms are written to a single localStorage key on your own device, and the clock reads your system time. There's no account, no sync, and no server call — free with no signup.",
    ],
  ],
  faqs: [
    [
      "Does the alarm still go off if I close the tab?",
      "No — the tab has to stay open. The alarm loop is a one-second interval running inside the page, so closing or reloading the page past an alarm's time means that alarm is skipped. Minimising or switching tabs usually still works, but browsers throttle background timers and the check requires an exact second match, so keeping the tab visible is the most reliable setup.",
    ],
    [
      "Is there a limit on how many alarms I can set?",
      "No fixed limit — the tool doesn't cap the number of alarms. They're all stored in one localStorage entry on your device, so in practice you're bound only by the browser's roughly 5 MB per-origin storage quota, which is thousands of alarms.",
    ],
    [
      "What alarm sounds does it have?",
      "Four, and all of them are generated live by the Web Audio API rather than loaded as audio files: Beep (an 880 Hz sine pulse), Chime (a three-note 523/659/784 Hz sequence), Bell (a 1046 Hz tone held for 0.8 seconds), and Buzzer (a 200 Hz sawtooth). Each pattern repeats 10 times, and volume is adjustable from 0 to 100% — the default is 80%.",
    ],
    [
      "How do I make the analog clock full screen?",
      "Click the fullscreen icon just below the digital time readout. It requests fullscreen on the clock panel, so the clock face, the time, the date, and your timezone fill the display. Click it again or press Esc to return.",
    ],
    [
      "Can I set an alarm for weekdays only?",
      "Yes. Each alarm's Repeat setting offers One-time, Daily, Weekdays (Mon–Fri), Weekends (Sat–Sun), or Custom Days, where you tick any combination of the seven days. One-time alarms switch themselves off automatically once you dismiss them.",
    ],
    [
      "How long is the snooze?",
      "You pick it per alarm: 1, 3, 5, 10, 15, or 30 minutes, with 5 minutes as the default. Snoozing moves that alarm forward by your chosen interval from the current moment and re-enables it, wrapping past midnight if it needs to.",
    ],
    [
      "Does the analog clock show seconds and my timezone?",
      "Yes. The second hand is on by default and can be toggled off, and the digital readout below shows hours, minutes and seconds in 12- or 24-hour format, the long-form date, and your timezone's short label read from the browser's Intl API. It follows your device clock, so it's exactly as accurate as your system time.",
    ],
    [
      "Is this analog clock free, and do I need an account?",
      "It's free with no signup. Everything runs client-side in your browser — the clock reads your device time and alarms are saved in localStorage — so no data is uploaded to a server.",
    ],
  ],
  steps: [
    "Open the Clock tab to see the live analog face, then use Clock Options to switch between the Modern, Classic, Minimal, and Glass themes, pick an accent colour, or toggle 24-hour time, the seconds hand, hour numbers, and tick marks.",
    "Switch to the Alarms tab, click Add Alarm, and set the time, label, repeat pattern, sound, volume, and snooze length, then save.",
    "Leave the tab open — when the time arrives, a full-screen alert appears with Snooze and Dismiss buttons, and the header shows how long until your next alarm.",
  ],
};

export default seo;

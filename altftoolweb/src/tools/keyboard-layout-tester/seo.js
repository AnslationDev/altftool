const seo = {
  title: "Keyboard Tester: Rollover, Key Log & WPM Counter",
  metaDescription:
    "Keys stay lit while physically held, so rollover limits show. Logs the last 100 keystrokes, counts each key, and reports elapsed time and estimated WPM.",
  steps: [
    "Press any key — the Visual Keyboard highlights it from keydown to keyup, so holding four or five at once shows how many your board can report together.",
    "Keep typing or hold combinations; 'Key Log (last 100)' records each keystroke and Key Frequency ranks the 15 most-pressed keys with their counts.",
    "Session Stats reports Keys Pressed, Unique Keys, Elapsed (s) and Est. WPM — keystrokes divided by five per elapsed minute — and Reset clears the log, the counts and the timer.",
  ],
  intro:
    "The Keyboard Layout Tester lights up an on-screen ANSI keyboard as you press keys, holding a key highlighted for as long as it is physically down so you can see which presses actually register and how many register at once. It logs the last 100 keystrokes, counts how often each key fired, and reports elapsed time plus an estimated WPM using the standard five-characters-per-word convention. It is for anyone diagnosing a suspect keyboard — a key that misses, a key that repeats itself, or a combination the board cannot report.",
  useCases: [
    "One key on your laptop occasionally does nothing and you want to press it fifty times and see from the count whether every press registered.",
    "You just bought a mechanical keyboard and want to check how many keys it can report simultaneously by holding down four or five at once.",
    "A key seems to be chattering — producing two characters from one press — and you want the keystroke log to confirm the double entry.",
  ],
  benefits: [
    ["Shows held keys, not just typed ones", "Keys stay highlighted between keydown and keyup, so pressing several together reveals rollover limits that a text box would hide."],
    ["Per-key frequency counts", "Every key you press is tallied and ranked, which turns an intermittent fault into a number you can compare against your press count."],
    ["Keystrokes stay on the page", "Key events are captured and their default action suppressed, so testing does not scroll, submit or type into anything."],
  ],
  faqs: [
    [
      "How do I test keyboard rollover?",
      "Hold several keys down at once and count how many stay highlighted. A keyboard using the USB HID boot protocol reports at most six non-modifier keys plus modifiers, while an N-key rollover board will keep registering every additional key you add.",
    ],
    [
      "How is the WPM figure calculated?",
      "Total keystrokes divided by five, divided by elapsed minutes — the standard convention that counts a word as five characters. It counts every key including backspace and modifiers, so treat it as a rough typing-speed indicator rather than an accuracy-checked test score.",
    ],
    [
      "Why does one key show a huge count after I held it?",
      "Because the operating system's auto-repeat fires a fresh keydown many times a second while a key is held, and each one is counted. Tap keys individually when you are checking whether a specific key registers reliably.",
    ],
    [
      "Why don't some shortcuts show up?",
      "Combinations claimed by the operating system or the browser chrome — things like Cmd+Tab, Alt+F4 or the window-close shortcut — are intercepted before any web page sees them. Everything else is captured, and the last 100 keystrokes are kept in the log.",
    ],
  ],
};

export default seo;

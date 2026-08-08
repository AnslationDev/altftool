const seo = {
  title: "Keyboard Shortcut Trainer: Press 135 Shortcuts",
  metaDescription:
    "Drills 135 shortcuts for Windows, macOS, Linux, VS Code, Chrome, Figma, Photoshop and Excel — you press the keys, and modifiers must match exactly.",
  intro:
    "The Keyboard Shortcut Trainer drills 135 shortcuts across eight platforms and apps — Windows, macOS, Linux, VS Code, Chrome, Figma, Photoshop and Excel — by asking you to physically press the combination rather than pick it from a list. A press only counts as correct when every modifier matches exactly, so Ctrl+Shift+N is not accepted for Ctrl+N, and each app is split into easy, medium and hard tiers with progress saved per tier. It is for anyone moving to a new editor, OS or design tool who wants the shortcuts in muscle memory instead of on a cheat sheet.",
  useCases: [
    "You just switched from Windows to a Mac and keep hitting Ctrl instead of Cmd, so you want repetitions until the modifier stops being a decision.",
    "You have used VS Code for a year without learning multi-cursor or Go to Symbol, and want to drill the shortcuts you keep skipping.",
    "You are prepping for a spreadsheet-heavy job and want the Excel set — Ctrl+; for the date, Alt+= for AutoSum — practised rather than read.",
  ],
  benefits: [
    ["Press it, don't recognise it", "The answer is the actual key combination on your keyboard, which trains the finger movement instead of testing whether you can spot the right option."],
    ["Exact modifier matching", "Ctrl, Alt, Shift and Cmd are each compared against what the shortcut requires, so an extra or missing modifier is marked wrong rather than close enough."],
    ["Streaks and accuracy per tier", "Correct count, incorrect count, accuracy percentage and best streak are tracked live, and mastered shortcuts persist per app and difficulty."],
  ],
  faqs: [
    [
      "How many shortcuts does it cover?",
      "135 in total, spread across eight platforms and applications: Windows, macOS, Linux, VS Code, Chrome, Figma, Photoshop and Excel. Each is divided into easy, medium and hard sets so you can start with the everyday ones and work up.",
    ],
    [
      "Do I type the answer or press the keys?",
      "You press the keys. In practice mode the tool captures the real keydown event and compares the key plus the exact state of Ctrl, Alt, Shift and Cmd, then shows immediately whether it matched. Study mode is the flashcard alternative when you just want to read and flip.",
    ],
    [
      "What happens to shortcuts my browser or OS intercepts?",
      "Most in-page defaults are suppressed so practising Ctrl+S will not open a save dialog, but combinations claimed by the operating system — Alt+Tab, Cmd+Q, Alt+F4 — never reach a web page at all. Use study mode's flashcards for those.",
    ],
    [
      "Is my progress saved?",
      "Yes, per platform and per difficulty tier in your browser's local storage, and the category cards show how many of each app's shortcuts you have mastered. Clearing site data for this browser resets it, and progress does not follow you to another device.",
    ],
  ],
};

export default seo;

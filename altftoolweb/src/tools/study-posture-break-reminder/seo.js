const seo = {
  intro:
    "This tool builds a break schedule for a long study session — 20-20-20 eye breaks every 20 minutes, a posture reset roughly every 30 minutes and a stand-and-move break each hour — and runs a live timer that tells you when each one is due. It follows the American Academy of Ophthalmology's 20-20-20 rule and standard ergonomics guidance on breaking up seated work. It is built for students facing multi-hour study days who want the breaks decided in advance instead of relying on willpower.",
  useCases: [
    "A board-exam aspirant planning a 3-hour evening revision block and wanting eye and posture breaks pre-scheduled before starting",
    "A student with neck stiffness from laptop study who wants a posture-reset cue every 30 minutes without installing an app",
    "Someone preparing for a competitive exam who copies the break timeline into their study planner for each daily session",
  ],
  benefits: [
    ["Evidence-aligned intervals", "Defaults follow the 20-20-20 rule and hourly sit-break guidance, and every interval is adjustable."],
    ["One merged timeline", "Overlapping eye, posture and stand breaks are combined so you pause once, not three times."],
    ["Live countdown", "Start the timer when you sit down and it shows exactly which break is next and in how long."],
  ],
  faqs: [
    [
      "What is the 20-20-20 rule for studying?",
      "Every 20 minutes of screen or close-up work, look at something about 20 feet (6 metres) away for at least 20 seconds. The rule is promoted by the American Academy of Ophthalmology and the American Optometric Association as a simple way to reduce digital eye strain during long study sessions.",
    ],
    [
      "How often should I take a posture break while studying?",
      "Roughly every 30 minutes, reset your posture for 30 to 60 seconds — feet flat, shoulders relaxed, screen at eye level — and at least once an hour stand up and move for a couple of minutes. Ergonomics guidance, including the UK HSE's display screen equipment advice, favours frequent short pauses over rare long ones.",
    ],
    [
      "Do short breaks hurt my study momentum?",
      "No — the breaks scheduled here total only a few minutes per hour. A 20-second eye break and a 45-second posture reset are micro-pauses; research on sustained attention suggests brief interruptions can help maintain focus across a long session rather than break it.",
    ],
    [
      "Why are some breaks combined in the timeline?",
      "When two intervals land on the same minute — for example the 60-minute mark hits the eye, posture and stand intervals together — the tool merges them into one pause, and only the longest break counts toward total pause time, because you can do the eye break while standing.",
    ],
  ],
};

export default seo;

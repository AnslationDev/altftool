const seo = {
  title: "Coder Eye Break Timer: 20-20-20 Around Builds",
  metaDescription:
    "Counts every build or test wait of 20 seconds or more as an eye break, then schedules only the extra 20-20-20 breaks your cycle misses.",
  steps: [
    "Set Session length (minutes), Editing between builds (minutes) and Build or test wait (seconds), or tap a preset chip such as Unit test run 15s, Full build 180s or CI pipeline or deploy 600s.",
    "Press Start and the countdown runs the schedule, while 'Does a build wait count as a break?' answers yes or no against the 20-second minimum and 'Build waits cover' reports what percentage of the requirement they supply.",
    "Use Copy plan to take the schedule and the Extra prompted breaks scheduled figure, Restart to rerun the same session, or Reset all to return every field to its default.",
  ],
  intro:
    "This timer fits the 20-20-20 eye break rule around a programmer's real rhythm of editing and waiting for builds. It treats any build, test or deploy wait of at least 20 seconds as a usable eye break, works out how many of the required breaks that already covers, and prompts only for the ones that fall inside long uninterrupted stretches of editing. The rule itself — after at most 20 minutes of near work, look about 6.1 metres away for 20 seconds — is the standard advice from the American Academy of Ophthalmology for digital eye strain.",
  useCases: [
    "See that a 25 minute edit cycle with a 90 second build still leaves gaps the builds cannot cover, and how many extra prompts that means over four hours.",
    "Compare a fast hot-reload loop against a slow CI pipeline and find out which one is actually worse for your eyes.",
    "Work out how much of a long day is spent waiting on builds, and how much of that time could be doing double duty as eye rest.",
    "Set a schedule for a pairing session so both people break at the same points instead of one waiting on the other.",
  ],
  benefits: [
    ["Uses waits you already have", "Counts qualifying build and test waits as breaks instead of adding interruptions on top of them."],
    ["Tracks the near-work clock properly", "A sub-20-second wait does not reset the clock, and the schedule reflects that."],
    ["Shows the gap", "Reports what percentage of the required breaks your build cycle covers, and how many prompts fill the rest."],
  ],
  faqs: [
    [
      "Does waiting for a build count as an eye break?",
      "Only if it is at least 20 seconds and you actually look away. A 90 second build gives you more than enough time, but staring at the log as it scrolls is still near work and does not rest the focusing muscle. A 5 second incremental compile is too short to count at all.",
    ],
    [
      "How often should a programmer take eye breaks?",
      "At least once every 20 minutes of near work, for a minimum of 20 seconds, looking at something around 6 metres away. On a four hour session that is twelve breaks — which sounds like a lot until you notice that a build-heavy workflow already supplies most of them for free.",
    ],
    [
      "Does dark mode reduce eye strain?",
      "It can reduce glare in a dim room, but it does not address the two main causes of digital eye strain: sustained focus at reading distance and a blink rate that roughly halves during concentrated work. Breaks and distance still matter regardless of theme.",
    ],
    [
      "Do blue light glasses help with coding all day?",
      "The evidence for blue-filtering lenses improving eye strain symptoms is weak; systematic reviews have not found a clear benefit over ordinary lenses. Break frequency, screen distance, correct prescription and room lighting have far more support. If eye strain persists despite good habits, see an optometrist rather than buying filters — this tool is informational and not a substitute for an eye examination.",
    ],
  ],
};

export default seo;

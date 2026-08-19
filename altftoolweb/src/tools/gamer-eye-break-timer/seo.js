const seo = {
  title: "20-20-20 Eye Break Timer Between Matches",
  metaDescription:
    "Schedules 20-20-20 eye breaks on match boundaries, not a blind 20-minute loop, counts lobby time as rest, and says when a 32-minute MOBA cannot meet it.",
  steps: [
    "Pick a Match format preset such as Team shooter round at 12 min or MOBA match at 32 min, or type your own Match length (minutes).",
    "Set Session length (minutes) and Lobby and queue time (seconds), then press Start.",
    "Follow the countdown, which puts each 20-second break in the lobby between matches, and press Copy plan for the schedule.",
  ],
  intro:
    "This timer schedules 20-20-20 eye breaks on match boundaries instead of on a blind 20 minute loop, so a prompt never lands mid-round. It works out how many matches fit inside a 20 minute near-work window, whether your lobby and queue time is already long enough to serve as the break, and — for formats like MOBAs where a single match runs past 20 minutes — states plainly that the rule cannot be met without abandoning a live game. The underlying guidance is the standard one for digital eye strain: after at most 20 minutes of near work, look about 6.1 metres away for at least 20 seconds.",
  useCases: [
    "Find out that a 5 minute arcade format lets you break every third match and still stay inside the rule.",
    "See how far a 32 minute MOBA match overshoots the 20 minute window, and where the safe mid-match glances are.",
    "Check whether a 60 second queue is already doing the job, or whether you need to hold off requeueing for a few extra seconds.",
    "Plan a three-hour session so the eye breaks and the once-an-hour stand-up breaks are decided before you start.",
  ],
  benefits: [
    ["Breaks land in the lobby", "Prompts are placed between matches, so nothing interrupts a ranked round."],
    ["Honest about long formats", "Says when a match format simply cannot satisfy the rule rather than pretending otherwise."],
    ["Counts queue time as rest", "If the lobby is already 20 seconds or more, it uses that instead of adding time."],
  ],
  faqs: [
    [
      "How often should gamers take eye breaks?",
      "Aim for a break every 20 minutes of screen time, lasting at least 20 seconds, looking around 6 metres away. In practice that means breaking on a match boundary — after every third round in a 5 minute format, or after every single match in anything longer than 20 minutes.",
    ],
    [
      "What can I do if a match is longer than 20 minutes?",
      "You cannot leave, so use the dead moments the game already gives you: respawn and death timers, the drafting or loadout phase, a downed teammate's bleed-out, the walk back from spawn. Look away from the screen for a few seconds each time, then take the full 20 second break in the lobby as soon as the match ends.",
    ],
    [
      "Does gaming in the dark damage your eyes?",
      "It does not cause lasting damage, but a bright screen against a dark surround makes the eye work harder and tends to feel worse after a long session. A modest light behind or beside the monitor, so the wall around the screen is not black, is the usual fix.",
    ],
    [
      "Do gaming glasses with blue light filters help?",
      "Systematic reviews have not found convincing evidence that blue-filtering lenses reduce eye strain compared with ordinary lenses. Break frequency, viewing distance, room lighting and having an up-to-date prescription have far better support. This tool is informational — if eye strain, headaches or blurred vision persist despite sensible habits, see an optometrist.",
    ],
  ],
};

export default seo;

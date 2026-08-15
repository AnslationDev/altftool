const seo = {
  title: "Video Lecture Speed Planner - Finish Date at 1x to 2x",
  metaDescription:
    "Enter your lecture backlog, daily watch minutes and pause overhead to get an exact finish date at 1x-2x playback, with a days-saved comparison table.",
  steps: [
    "Enter Remaining content (hours at 1x), Daily watch time (minutes), a Start date and your Pause / rewind / note-taking overhead (%), then pick a Playback speed from 1x to 2x.",
    "The planner shows the exact Finish date at your speed - counting the start date as day 1 - along with Days needed, Content cleared per day and Days saved vs 1x.",
    "Compare all five speeds (1x, 1.25x, 1.5x, 1.75x and 2x) in the Every speed compared table, then press Copy result to put the full plan on the clipboard as text.",
  ],
  intro:
    "This planner computes the exact date you finish a video lecture backlog at each playback speed, using the model that watching at speed s for W minutes consumes W x s minutes of content, minus a pause-and-notes overhead you set. It is for coaching students and self-paced learners staring at a 100-hour backlog who want a concrete answer to 'does 1.5x actually get me done before the mock test?' — with a side-by-side table for 1x through 2x.",
  useCases: [
    "A JEE dropper with 120 hours of recorded lectures and 3 hours a day decides between 1.5x and 1.75x to finish before the next major mock",
    "A working aspirant with only 90 minutes on weeknights checks whether 2x playback makes an online course finishable before the exam window",
    "A student who pauses often for notes adds a 20% overhead to see their realistic finish date instead of the optimistic one",
  ],
  benefits: [
    ["Real finish dates", "Turns 'about a month' into an exact calendar date for every speed from 1x to 2x."],
    ["Overhead-aware", "Accounts for the pause, rewind and note-taking time that plain duration maths ignores."],
    ["Days-saved table", "Shows precisely how many days each speed step buys, so the trade-off is explicit."],
  ],
  faqs: [
    [
      "How much time does watching lectures at 2x actually save?",
      "Exactly half the playback time: a 100-hour backlog needs 50 hours of watching at 2x. Whether that halves your calendar days depends on your daily sitting time and pause overhead, which is what this planner computes — enter your numbers and read the days-saved column.",
    ],
    [
      "Does watching lectures at higher speed hurt comprehension?",
      "Research on speeded lecture viewing, including a 2022 UCLA study in Applied Cognitive Psychology, found comprehension holds up well at up to about 2x for typical lecture material, though it degrades beyond that. Dense derivations, proofs and brand-new topics are the exception — most learners should take those at 1x.",
    ],
    [
      "How do I estimate my pause and note-taking overhead?",
      "Time one real session: if a 60-minute sitting clears only 48 minutes of video, your overhead is 20%. Note-heavy subjects commonly run 10-30%; passive revision watching is close to 0%.",
    ],
    [
      "Why does the finish date count the start date as day 1?",
      "Because if the whole remaining backlog fits inside your first day's watch time, you finish on the start date itself, not the day after. The planner divides content by daily cleared content, rounds up to whole days, and adds days-minus-one to the start date.",
    ],
  ],
};

export default seo;

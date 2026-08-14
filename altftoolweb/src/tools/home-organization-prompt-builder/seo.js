const seo = {
  title: "Home Organization Prompt Builder: Time-Boxed Plan",
  metaDescription:
    "Estimates declutter time from floor area, clutter level and a minutes-per-m² rate, then splits it into sessions, weeks and 25-minute Pomodoro blocks.",
  steps: [
    "Pick the Room and a Method — Four-Box method, KonMari, 20/20 rule, OHIO (Only Handle It Once) or the 12-12-12 challenge — then enter Floor area with its Area unit and a Clutter level.",
    "Set 'Minutes per m² at normal clutter' (6 by default), Session length (minutes) and Sessions per week; the workload rescales as you type.",
    "Read Sessions needed alongside Estimated total work, Finishes in and Pomodoro blocks per session, then press Copy prompt to take the generated plan prompt.",
  ],
  intro:
    "The Home Organization Prompt Builder estimates how long a room will actually take to declutter — floor area in square metres multiplied by a minutes-per-square-metre rate and a clutter multiplier — then divides that workload into sessions, calendar weeks and 25-minute Pomodoro blocks. It hands those numbers to an AI along with a named method (Four-Box, KonMari, the 20/20 rule, OHIO or the 12-12-12 challenge) so the plan you get back fits the time you really have. Useful for anyone who stalls because the job feels unbounded.",
  useCases: [
    "Turn a very cluttered 14 m² bedroom into three 45-minute sessions instead of one impossible weekend.",
    "Plan a garage clear-out at a higher minutes-per-square-metre rate because storage density is much greater.",
    "Get a KonMari plan that follows the correct category order rather than going room by room.",
    "Produce a session plan you can share with a partner or flatmate so the work is genuinely split.",
  ],
  benefits: [
    ["A bounded job", "Area, clutter level and your own rate give a total in minutes, not a vague 'a weekend'."],
    ["Sessions you will finish", "Workload divides into your real session length and weekly frequency, rounded up."],
    ["Methods quoted correctly", "Each method is described the way its author defines it, including KonMari's fixed category order."],
  ],
  faqs: [
    [
      "How long does it take to declutter a room?",
      "This tool budgets 6 minutes per square metre at normal lived-in clutter, so a 14 m² bedroom is about 84 minutes, rising to roughly 126 minutes at 'very cluttered' and 189 at 'overwhelming'. That is a planning rate you can adjust, not a measured average — storage-dense spaces like garages and lofts need a much higher figure.",
    ],
    [
      "What is the Four-Box method?",
      "You label four boxes Keep, Donate, Relocate and Trash, and every item you pick up goes into exactly one of them before you pick up the next. The rule that makes it work is that nothing is allowed to go back down undecided.",
    ],
    [
      "In what order should I declutter with KonMari?",
      "Marie Kondo's order is fixed and by category rather than by room: clothes, then books, then papers, then komono (miscellaneous items), then sentimental items last. The order matters because it trains the keep-or-discard decision on easy items before you reach the ones loaded with memory.",
    ],
    [
      "Should I buy storage boxes first?",
      "No — buy storage only after the sorting is done, because containers bought early get filled with things you were going to discard. The prompt this tool builds explicitly instructs the model to put the shopping list after the decluttering, not before.",
    ],
  ],
};

export default seo;

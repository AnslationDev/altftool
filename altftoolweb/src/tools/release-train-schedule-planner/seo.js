const seo = {
  title: "Release Train Planner: Code Freeze, RC and GA Dates",
  metaDescription:
    "Generate every code freeze, RC cut and GA date from one first GA date and a weekly cadence, with weekend milestones pulled back to Friday.",
  steps: [
    "Set the 'First GA date' and the 'Cadence (weeks between GAs)' from 1 to 26, then 'Releases to plan' from 1 to 24 and an optional Version prefix such as v7.",
    "Enter 'Code freeze lead (days before GA)' and 'RC cut lead (days before GA)' up to 90 — the RC comes from the frozen branch so it cannot exceed the freeze lead — and tick 'Shift weekend milestones back to Friday'.",
    "Read the Release / Code freeze / RC cut / GA table with each milestone's weekday and the stabilisation window in days, then press 'Copy schedule' for a Markdown pipe table to paste into a wiki.",
  ],
  intro:
    "This planner generates a fixed-cadence release train schedule — the code freeze, release candidate (RC) and general availability (GA) date for every cycle — from one starting GA date and a cadence in weeks. It follows the train model used by Chromium's 4-week release cycle and SAFe's Agile Release Train: releases leave on schedule and unfinished features catch the next train. Release managers and engineering leads get a publishable milestone table, with weekend ship dates automatically pulled back to Friday.",
  useCases: [
    "A release manager moving a team from ad-hoc releases to a 4-week train publishes six months of freeze, RC and GA dates in one go",
    "An engineering lead checks whether a 14-day stabilisation window is even possible on a 2-week cadence before proposing it",
    "A platform team pastes the generated Markdown table into their wiki so every squad can see exactly when the next freeze lands",
  ],
  benefits: [
    ["Three milestones per cycle", "Every release gets a code freeze, RC cut and GA date derived from your lead-time settings."],
    ["Weekend-safe shipping", "Milestones landing on Saturday or Sunday shift back to Friday — dates only ever move earlier."],
    ["Cadence sanity checks", "The planner rejects impossible setups, like a freeze lead longer than the cadence itself."],
  ],
  faqs: [
    [
      "What is a release train in software development?",
      "A release train is a fixed-schedule release model: versions ship on a set cadence (every 2, 4 or 6 weeks) and any feature that is not ready simply waits for the next train instead of delaying the release. Chromium and Firefox ship on 4-week trains, and SAFe formalises the idea as the Agile Release Train.",
    ],
    [
      "What is the difference between code freeze, RC and GA?",
      "Code freeze is the date the release branch stops accepting new features — only critical fixes land after it. The release candidate (RC) is a build cut from that frozen branch for final validation, and GA (general availability) is the date the release ships to all users. The freeze-to-GA gap is the stabilisation window, commonly one to two weeks.",
    ],
    [
      "How long should a code freeze be before release?",
      "Most teams on a 4-week train freeze 7–14 days before GA, cutting the RC about a week out. The freeze must be strictly shorter than the cadence — a 14-day freeze on a 1-week train would mean freezing before the previous release has even shipped, which this planner flags as an error.",
    ],
    [
      "Why not release on a Friday or weekend?",
      "Nobody staffs weekends to catch a bad release, so trains avoid shipping into them; this planner moves Saturday and Sunday milestones back to Friday, and many teams go further and target Tuesday–Thursday. Shifting earlier rather than later keeps the published date a worst-case deadline.",
    ],
  ],
};

export default seo;

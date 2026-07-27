const seo = {
  intro:
    "The Onboarding Doc Prompt Builder turns a job title, role family, seniority and access list into an AI prompt that produces a complete first-week onboarding document with an hour-by-hour timetable. It divides the week's available hours across six standard sections — access and tooling, team and mission, product primer, how the work gets done, a supervised first contribution, and rituals and feedback — using the largest-remainder method on quarter-hour blocks, so the allocations always add back to the exact total instead of drifting through rounding. It is built for hiring managers and people-ops teams who need the generated document to carry a real schedule, a named first deliverable and 30/60/90-day checkpoints rather than an open-ended reading list.",
  useCases: [
    "An engineering manager builds a first-week runbook for a mid-level backend hire with 5 productive hours a day, and gets 6 h 15 m budgeted to the supervised first contribution and 3 h 45 m to access and tooling out of a 25-hour week.",
    "A people-ops lead generates the same document for a junior support hire and a senior data hire, with the prompt automatically shifting from step-by-step instructions to architecture context and open questions.",
    "A startup founder produces a flat day-by-day checklist for a first sales hire, where every line names an owner and a completion signal instead of ending in 'get familiar with'.",
  ],
  benefits: [
    [
      "A timetable, not a reading list",
      "The week's hours are apportioned by section weight in 15-minute blocks, so the generated document says how long each part should take and the parts sum to the exact total.",
    ],
    [
      "Role and seniority actually change the output",
      "Eight role families set the first-week deliverable and the emphasis, and four seniority levels change how much scaffolding the document provides — a junior gets defined jargon, a lead gets the stakeholder map and pending decisions.",
    ],
    [
      "No invented company facts",
      "Any link, tool, person or policy you did not supply is written into the prompt as TODO(fill) with a description of what belongs there, so nothing fabricated reaches a new hire.",
    ],
  ],
  faqs: [
    [
      "What should a first-week onboarding document include?",
      "Six sections, in this order: accounts and access, team and mission, product and domain primer, how the work actually gets done, one supervised first contribution, and rituals plus the feedback loop. Access comes first because a new joiner blocked on a login cannot start anything else. This tool generates a prompt that demands all six with a time budget for each.",
    ],
    [
      "How many hours of onboarding should a new hire get in week one?",
      "Budget for productive onboarding time rather than the full working day — 4 to 6 hours a day is realistic once meetings, setup friction and breaks are removed, giving roughly 20 to 30 hours in a five-day week. This tool takes your figure and splits it, allocating the largest share (25%) to the supervised first contribution and 15% to access and tooling.",
    ],
    [
      "What is a 30-60-90 day plan and does this cover it?",
      "It is the conventional set of ramp checkpoints at 30, 60 and 90 days, each stating what 'on track' looks like. The generated prompt asks for one short paragraph per horizon written in observable terms — shipped work, decisions owned, systems understood — rather than sentiments like 'feels settled'.",
    ],
    [
      "Should the onboarding doc be a wiki page, a Markdown runbook or a checklist?",
      "Use a Markdown runbook when it lives in the repo next to the code, a collapsible wiki page when it must scan in under a minute, and a flat checklist when the priority is completion tracking rather than context. This tool writes a format-specific prompt for any of the three from the same inputs, including the exact structural rules for that format.",
    ],
  ],
};

export default seo;

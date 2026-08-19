const seo = {
  title: "Shot List Planner: Setups, Takes & Days You Need",
  metaDescription:
    "Costs each shot as setup + rig + rehearsal + takes × (length + reset) against a 10-hour day less the meal break and 15% contingency.",
  steps: [
    "Under Day settings, set Shooting day (hours), Meal break (minutes) and Contingency (%).",
    "Add each shot with its Scene, Framing, Camera move, Setup complexity, Planned takes, Shot length (seconds) and Status, then press Add shot for the next.",
    "Read Shooting days needed alongside Productive time per day, Shots remaining, Screen time in the cut and Shooting ratio, then press Copy sheet.",
  ],
  intro:
    "The Shot List Planner estimates how long a shoot will actually take by costing every shot as setup + rig + rehearsal + takes × (shot length + reset), the same setup-driven arithmetic an assistant director uses when boarding a schedule. Setup is 15 minutes for a simple pickup, 30 for a standard relight, 60 for a complex lit setup and 90 for a stunt or VFX shot, and the day is a 10-hour call minus a 1-hour meal break and a 15% contingency. It is for directors, DPs, producers and video creators who need a defensible day count before booking crew.",
  useCases: [
    "Checking whether a 24-shot short film really fits into the two days you have booked the location for",
    "Seeing how much time a scene loses when three shots move from a locked-off tripod to a crane",
    "Exporting a printable shooting sheet with framing, takes and gear notes for the crew's call sheet",
  ],
  benefits: [
    ["Setups, not screen time", "Time is driven by camera setups and lighting, which is what actually consumes a shooting day."],
    ["Realistic day capacity", "A 10-hour day yields about 7 hours 39 minutes of productive time after the meal break and contingency."],
    ["Status-aware", "Shots marked shot or cut drop out of the remaining time, so the plan stays honest mid-shoot."],
  ],
  faqs: [
    [
      "How many shots can you get in a day?",
      "Roughly 12 standard setups. A 10-hour day leaves about 459 productive minutes after a 1-hour meal break and 15% contingency, and a standard shot — 30-minute setup, 5-minute rehearsal, 3 takes — costs around 39 minutes. Simple pickups reusing the existing lighting go far faster; stunt and VFX setups far slower.",
    ],
    [
      "How long does a camera setup take?",
      "Plan on 30 minutes for a standard new camera position with a relight on a small crew, 15 minutes when you are only re-framing under lighting that already works, 60 minutes for a complex multi-light setup, and 90 minutes for anything involving a stunt or practical effect that needs a safety brief.",
    ],
    [
      "What is a shooting ratio?",
      "The amount of footage recorded for every unit that reaches the finished cut — 3:1 means three minutes shot for each minute used. Documentary work often runs 20:1 or higher, while tightly boarded commercial and narrative work is usually between 3:1 and 10:1. This planner derives it from your takes and shot lengths.",
    ],
    [
      "How much contingency should a shooting schedule include?",
      "15% is the usual planning buffer, which is what this tool applies by default. It absorbs company moves, weather holds, battery and card swaps, and the takes you did not plan for. Location work with travel between setups often justifies 20–25%.",
    ],
  ],
};

export default seo;

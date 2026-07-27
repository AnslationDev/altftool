const seo = {
  intro:
    "This planner finds a deployment window that avoids business and peak-traffic hours in every region an application serves: it converts each region's local avoid range to UTC, maps all 24 UTC hours as clear or blocked, and recommends the start hour whose window overlaps the fewest blocked region-hours. It is built for release managers and on-call engineers on distributed teams who need one defensible answer to \"when can we ship without hitting anyone's daytime\".",
  useCases: [
    "A release manager serving US East, Central Europe and India finding the only 2-hour slot that misses office hours in all three",
    "An SRE planning a database migration who needs the window's local start time in every region for the change ticket",
    "A team discovering that no fully clear window exists across their five regions and choosing the least-bad start hour instead",
  ],
  benefits: [
    ["Whole-day visibility", "An hour-by-hour UTC map shows each region's local clock and whether it is inside the avoid range."],
    ["Least-conflict fallback", "When no window is fully clear, the planner minimises blocked region-hours instead of giving up."],
    ["Local times included", "The recommendation is translated into every region's local start and end for change tickets."],
  ],
  faqs: [
    [
      "What is the best time to deploy for a global audience?",
      "There is no universal hour — the right window is the UTC slot that falls outside business and peak hours in every region you actually serve. For a US East + Europe + India footprint with 08:00-22:00 local avoided, the clear slots collapse to a few hours around 00:00-03:00 UTC, which is why teams compute the window rather than guessing.",
    ],
    [
      "How do I avoid deploying during business hours across timezones?",
      "Convert each region's avoid range into UTC using its offset, then intersect the remaining free hours: an hour is safe only when it is outside the avoid range in every region. This tool does that conversion for offsets including half-hour zones like India's UTC+5:30 and handles ranges that wrap midnight, such as avoiding 22:00-06:00.",
    ],
    [
      "What if there is no time that avoids peak hours in every region?",
      "Then minimise the damage: score every possible start hour by how many region-hours of avoid time the window would overlap and pick the lowest. In practice teams pair that least-conflict window with risk reduction — canary or rolling deploys, feature flags and fast rollback — because a fully quiet globe rarely exists past three or four regions.",
    ],
    [
      "Does daylight saving time affect the deployment window?",
      "Yes — the US, UK, EU and parts of Australia shift their offsets by one hour for roughly half the year, which can move a region's business hours into what was a clear UTC slot. The offsets here are standard-time values, so re-run the plan after each DST transition or anchor your windows to a region that does not observe DST, like India or Japan.",
    ],
  ],
};

export default seo;

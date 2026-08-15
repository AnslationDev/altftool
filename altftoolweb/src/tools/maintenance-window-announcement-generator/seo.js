const seo = {
  title: "Maintenance Window Notice: UTC Times, Impact, Rollback",
  metaDescription:
    "Enter the window once in your zone; get an ISO 8601 UTC instant, a per-zone table, a notice-period check and an update cadence in a ready notice.",
  steps: [
    "Fill Service name and Reason for the work, set Start date and Start time (24-hour), pick Those times are in, then enter Work length (minutes) and Contingency buffer (minutes).",
    "Choose Expected impact and Channel, list the Affected services or features one per line, write the Rollback statement the notice refuses to generate without, and tick the zones under Show local times for.",
    "Read Total window length with its Start (UTC), End (UTC), Update cadence and Notice given rows, check any warnings about lead time or a clock change inside the window, then press Copy announcement.",
  ],
  intro:
    "The Maintenance Window Announcement Generator converts one scheduled window — a wall-clock start in your own time zone plus a work length and a contingency buffer — into a publishable notice that states the same instant in UTC and in every reader time zone you select. It is built for SRE, DevOps and IT change managers who need the announcement to carry the four things readers actually look for: exact start and end, expected impact, what to do about it, and what happens if the change is rolled back. UTC instants are printed in ISO 8601 / RFC 3339 form (2026-08-14T22:00Z), zone conversions run through the IANA Time Zone Database so daylight-saving shifts are applied for you, and the tool warns when the window crosses a clock change or when the lead time is shorter than the notice usually contracted for that impact level.",
  useCases: [
    "An SRE schedules a 90-minute database upgrade at 03:30 IST and needs the status-page post to show 2026-08-14T22:00Z alongside correct London and New York times, with Sydney or any other zone added in one click from the “Show local times for” checkboxes.",
    "A change manager checks whether a full-outage window announced 13 hours ahead meets the 7-day advance notice their enterprise agreement asks for before sending the customer email.",
    "A platform team planning a November window in America/New_York gets a warning that the clock changes offset mid-window, so the UTC times are published as the authoritative ones.",
  ],
  benefits: [
    [
      "One instant, every time zone",
      "The wall-clock start is converted to a single UTC instant and re-rendered per zone through the IANA database, so no reader has to do the arithmetic and no zone drifts by an hour at a DST boundary.",
    ],
    [
      "Notice period checked, not assumed",
      "Lead time is measured from when you publish to when the window opens and compared with the notice usually contracted for that impact tier — 24 hours for degraded, 72 hours for a partial outage, 7 days for a full outage.",
    ],
    [
      "Rollback and update cadence built in",
      "The notice will not generate without a rollback statement, and the update cadence is set from the window length: start and end notes under 30 minutes, every 30 minutes up to 2 hours, hourly up to 8 hours, then every 2 hours.",
    ],
  ],
  faqs: [
    [
      "How much notice should I give for scheduled maintenance?",
      "It depends on impact: enterprise agreements commonly require 7 days for a full outage, 72 hours for a partial outage and 24 hours for degraded performance, with no advance notice required when there is no user-visible effect. This tool measures your actual lead time and flags it when it falls short of the tier you selected — check your own contract, since these are typical clause values rather than a single published standard.",
    ],
    [
      "Should maintenance windows be announced in UTC or local time?",
      "Publish UTC as the authoritative time and list local equivalents underneath. UTC has no daylight-saving discontinuity, so a window written as 2026-08-14T22:00Z means one instant everywhere, while '10 pm' is ambiguous across a global reader base. The generator always prints both, using the ISO 8601 extended format with the Z designator that RFC 3339 profiles.",
    ],
    [
      "What must a maintenance notice actually contain?",
      "Six elements: the service affected, the exact start and end instants, the expected impact in plain terms, the specific features that go down, what the reader should do or avoid, and the rollback position. This tool refuses to generate the notice until the rollback statement is written, because that is the element most often left out and the one customers ask about first.",
    ],
    [
      "How long should a maintenance window be, and how much buffer should I add?",
      "Size the window as the rehearsed work time plus a contingency buffer — 15 minutes is a common default, and operations calendars are usually booked in 15-minute granularity. Announcing the buffered end time means an overrun stays inside the published window instead of becoming an incident. This tool takes work length and buffer separately and prints both in the notice.",
    ],
  ],
};

export default seo;

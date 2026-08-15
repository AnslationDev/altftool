const seo = {
  title: "Deprecation Planner: Announce, Warn, Brownout",
  metaDescription:
    "Turn one announcement date and three day offsets into announce, warn, brownout and removal dates, with comms templates and a 90-day notice check.",
  steps: [
    "Name the thing going away in 'What is being deprecated?', which opens with 'v1 /search endpoint', and put the migration target in 'Replacement (optional)' so it appears in the generated templates.",
    "Set the 'Announcement date' and the three offsets in days — 'Warnings start (days after announce)', 'Brownouts start (days after announce)' and 'Removal (days after announce)' — which default to 30, 120 and 180.",
    "Read the 'Removal date' and the four dated milestones, announce, warn, brownout and remove, each with its +Nd offset; under 90 days of total notice the planner flags the shortfall. 'Copy announcement' takes the announcement template, with the Runtime warning and Removal changelog entry templates below it.",
  ],
  intro:
    "This planner turns one announcement date plus three offsets into a complete deprecation timeline — announce, warn, brownout/disable and remove — with exact calendar dates and ready-to-send templates for the notice, the runtime warning and the removal changelog entry. It follows the staged lifecycle used across the industry: warnings before brownouts, brownouts before removal, as in Node.js deprecation levels and GitHub's pre-shutdown API brownouts. It also flags timelines that give less than 90 days of notice on public surfaces.",
  useCases: [
    "Scheduling the retirement of a v1 REST endpoint with warnings at 30 days, brownouts at 120 and removal at 180",
    "Drafting the deprecation announcement, warning string and changelog entry in one pass for a library method going away",
    "Sanity-checking that a proposed removal date leaves enough migration runway before publishing it in release notes",
  ],
  benefits: [
    ["Four-stage plan", "Announce, warn, brownout and remove each get a concrete date and a description of what happens."],
    ["Comms included", "Generates the announcement, the DeprecationWarning string and the removal changelog entry from your dates."],
    ["Notice-period check", "Warns when total notice falls under the common 90-day floor for public deprecations."],
  ],
  faqs: [
    [
      "What are the stages of deprecating an API or feature?",
      "The standard lifecycle has four stages: announce (documentation and notice published), warn (the old path works but emits deprecation warnings), brownout or disable (the old path is switched off temporarily so remaining users notice), and remove (permanent shutdown and code deletion). Each stage exists to convert silent consumers into migrated ones before the hard cut.",
    ],
    [
      "How much notice should I give before removing an API?",
      "It depends on the surface: 90 days is a common floor for smaller public services, while major platforms promise 6-12 months for stable APIs — Google's stable API policies, for example, commonly guarantee a year. Internal APIs with known callers can move faster. The real constraint is your consumers' release cadence: give at least one of their upgrade cycles.",
    ],
    [
      "What is an API brownout?",
      "A brownout is a scheduled, temporary disabling of a deprecated feature — for example returning errors for one hour — so consumers who ignored the written notice experience the failure while recovery is still trivial. GitHub used brownouts in 2020 before permanently removing password-based API authentication, and the practice is now common for API shutdowns.",
    ],
    [
      "Does deprecating something require a version bump?",
      "Yes, under SemVer: item 7 of the 2.0.0 specification requires at least a minor version bump when public API functionality is marked deprecated. The later removal is a breaking change and requires a major bump under item 8. The deprecation release is also where your runtime warning should first appear.",
    ],
  ],
};

export default seo;

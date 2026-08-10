const seo = {
  title: "Log Level Planner: trace, debug, info, warn, error, fatal",
  metaDescription:
    "Answer five questions about an event and get its level on the log4j/SLF4J/RFC 5424 ladder, plus minimum levels for dev, CI, staging and production.",
  steps: [
    "Tick the boxes that describe the event: 'Is the event a failure (something did not work)?', 'Does it stop the whole process or service (crash, unrecoverable state)?', 'Was it recovered automatically (retry succeeded, fallback used)?', 'Is it a significant lifecycle or business event (startup, order placed, job finished)?' and 'Would it fire on every iteration, packet or row (very high volume)?' — irrelevant follow-ups grey out.",
    "Under 'Minimum level per environment', tick 'Log volume is billed or storage-constrained' and 'The service handles high request volume' if either applies to the service.",
    "'Recommended level' shows the level in monospace with its rationale, whether it is visible in production by default and any cautions, and the table gives dev, CI, staging and production a minimum level with the reason. 'Copy result' takes the level plus the per-environment list.",
  ],
  intro:
    "This planner applies a decision tree to place any log event on the standard severity ladder — trace, debug, info, warn, error, fatal — using the semantics shared by log4j, SLF4J, Python logging and the syslog severities of RFC 5424: fatal means the process dies, error means an unrecovered failure, warn means degraded-but-succeeded, info tells the production story, debug and trace are developer diagnostics. It also recommends minimum levels per environment (dev, CI, staging, production) adjusted for traffic and log-cost pressure.",
  useCases: [
    "Settling a code-review debate about whether a caught-and-retried timeout is a warn or an error",
    "Writing a team logging convention that new services can adopt without re-arguing every level",
    "Cutting a noisy production log bill by moving per-request diagnostics from info down to debug or trace",
  ],
  benefits: [
    ["Consistent decisions", "The same questions produce the same level every time, ending case-by-case debates."],
    ["Standard semantics", "Levels match the conventions of log4j, SLF4J, Python logging and RFC 5424 syslog severities."],
    ["Environment matrix included", "Dev, CI, staging and production minimum levels come with the reasoning attached."],
  ],
  faqs: [
    [
      "When should I log at warn instead of error?",
      "Use warn when something unexpected happened but the operation still succeeded — a retry that worked, or a fallback that kicked in. Use error only when the operation failed and was not recovered, because error is the level teams alert on and page for.",
    ],
    [
      "What is the difference between debug and trace logging?",
      "Debug records diagnostic state a developer needs to understand behaviour — branch decisions, computed values — and is switched on per investigation. Trace is finer still: per-iteration or per-packet flow that would overwhelm even debug output, enabled only while chasing one specific bug.",
    ],
    [
      "What log level should production run at?",
      "Info is the usual production minimum: it keeps the lifecycle and business story visible while debug stays off. High-traffic services with billed log ingestion often run at warn and rely on per-module overrides or sampling to get info detail when needed.",
    ],
    [
      "Should I log an exception everywhere it passes through?",
      "No — log it once, at the layer that actually handles it. Logging and rethrowing at every layer turns one failure into a stack of duplicate error entries, inflating alert counts and hiding the real frequency of problems.",
    ],
  ],
};

export default seo;

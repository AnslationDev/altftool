/**
 * Telemetry vs Analytics Explainer — classification, consent test and notice generator.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 *
 * The distinction people argue about is not a legal one, but it is a useful one.
 *
 *   Telemetry measures the software. Its subject is the build: crash rate, cold start
 *   time, request latency, memory pressure. It answers "is this release healthy?"
 *
 *   Analytics measures the person's behaviour. Its subject is the user or the visit:
 *   sessions, funnels, cohorts, retention. It answers "what did people do?"
 *
 * The law does not care which word you use. Two separate tests apply.
 *
 *   1. ePrivacy Directive, Article 5(3): storing information on, or gaining access to
 *      information already stored on, a user's terminal equipment requires consent, unless
 *      it is strictly necessary to provide the service the user explicitly requested. A
 *      cookie, a localStorage entry, a device identifier and a fingerprint all count.
 *      Measurement for your own product decisions is not "strictly necessary" for the user.
 *
 *   2. GDPR: if the data relates to an identified or identifiable person, you need a
 *      lawful basis and you owe the transparency information in Article 13. The CJEU held
 *      in Breyer (C-582/14, 19 October 2016) that a dynamic IP address can be personal data
 *      in the hands of a website operator, so "we only store IPs" is not an exemption.
 *
 * France's CNIL publishes an exemption for audience measurement configured narrowly:
 * first-party only, used solely to produce anonymous statistics for the site operator, not
 * cross-referenced with other processing and not shared. Its published outer limits for
 * that exemption are a 13-month lifetime for the identifier and 25 months for the data
 * derived from it. Those figures are used below as retention checkpoints. Other national
 * authorities take different positions, so treat this as an orientation, not a ruling.
 */

/** CNIL audience-measurement exemption: outer lifetime for the identifier, in months. */
export const IDENTIFIER_LIFETIME_MONTHS = 13;
/** CNIL audience-measurement exemption: outer retention for derived data, in months. */
export const DATA_RETENTION_MONTHS = 25;
/** Mean days in a month, used only to convert a retention setting expressed in days. */
export const DAYS_PER_MONTH = 30.44;
export const MAX_RETENTION_DAYS = 3650;
export const MAX_PRODUCT_NAME = 60;

export const KINDS = {
  telemetry: {
    id: "telemetry",
    label: "Telemetry",
    subject: "The software build",
    question: "Is this release healthy?",
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    subject: "The person or the visit",
    question: "What did people do, and did they come back?",
  },
  both: {
    id: "both",
    label: "Either, depending on how it is keyed",
    subject: "Whichever identifier you attach",
    question: "Aggregated it is telemetry; keyed to a person it is analytics.",
  },
};

/** Side-by-side comparison used for the explainer table. */
export const DIMENSIONS = [
  {
    id: "subject",
    label: "What it is about",
    telemetry: "The build, the device class, the request.",
    analytics: "The person, the session, the cohort.",
  },
  {
    id: "identifier",
    label: "Usual identifier",
    telemetry: "Install or session id, often rotating.",
    analytics: "Persistent visitor or account id, kept across visits.",
  },
  {
    id: "shape",
    label: "Shape of the data",
    telemetry: "Counters, timings, distributions, mostly pre-aggregated.",
    analytics: "Event streams that can be replayed per person.",
  },
  {
    id: "consent",
    label: "Consent position",
    telemetry: "Still needs consent if it writes to the device and is not strictly necessary.",
    analytics: "Needs consent in the EU and UK in almost every realistic configuration.",
  },
  {
    id: "retention",
    label: "Sensible retention",
    telemetry: "Weeks — you only care about the current and previous releases.",
    analytics: "Months, and shorter than you think; long tails are rarely used.",
  },
  {
    id: "failure",
    label: "How it goes wrong",
    telemetry: "Stack traces and log lines quietly capture user input.",
    analytics: "URLs, referrers and replay capture identifiers you never meant to send.",
  },
];

export const SIGNAL_GROUPS = [
  { id: "health", label: "Build health" },
  { id: "performance", label: "Performance" },
  { id: "behaviour", label: "Behaviour" },
  { id: "identity", label: "Identifiers and context" },
];

export const SIGNALS = [
  {
    id: "crash-stack",
    group: "health",
    label: "Crash reports with stack traces",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: true,
    note: "Captured local variables and log breadcrumbs are the usual route for user data to escape.",
  },
  {
    id: "error-counts",
    group: "health",
    label: "Handled error counts by type",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Pure counters — the safest thing you can collect.",
  },
  {
    id: "app-version",
    group: "health",
    label: "App or build version",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Needed to attribute anything else to a release.",
  },
  {
    id: "os-device",
    group: "health",
    label: "OS version and device model",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Low risk alone; a strong fingerprinting component when combined with several other fields.",
  },
  {
    id: "cold-start",
    group: "performance",
    label: "Cold start and render timings",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Report as percentiles, not per-session rows.",
  },
  {
    id: "api-latency",
    group: "performance",
    label: "Server request latency and error rate",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Aggregate by route, and strip identifiers out of the route before you log it.",
  },
  {
    id: "memory-battery",
    group: "performance",
    label: "Memory pressure and battery drain",
    kind: "telemetry",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Device-level, not person-level, unless you key it to a user.",
  },
  {
    id: "feature-flag",
    group: "performance",
    label: "Feature flag exposure",
    kind: "both",
    identifies: false,
    deviceStorage: true,
    mayLeakPii: false,
    note: "Usually needs a stable bucketing id stored on the device, which is what triggers Article 5(3).",
  },
  {
    id: "page-path",
    group: "behaviour",
    label: "Page paths and screen names",
    kind: "analytics",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: true,
    note: "Paths routinely carry order numbers, reset tokens and email addresses. Redact before sending.",
  },
  {
    id: "referrer",
    group: "behaviour",
    label: "Referrer URLs",
    kind: "analytics",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: true,
    note: "The referring page's query string comes with it, including anything the other site put there.",
  },
  {
    id: "utm",
    group: "behaviour",
    label: "Campaign parameters",
    kind: "analytics",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Fine in itself; the risk is joining it to a person later.",
  },
  {
    id: "session-duration",
    group: "behaviour",
    label: "Session count and duration",
    kind: "analytics",
    identifies: false,
    deviceStorage: true,
    mayLeakPii: false,
    note: "A session needs something stored on the device to know the visit is continuing.",
  },
  {
    id: "scroll-depth",
    group: "behaviour",
    label: "Scroll depth and time on page",
    kind: "analytics",
    identifies: false,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Aggregates well; rarely needs to be kept per visit.",
  },
  {
    id: "funnel-step",
    group: "behaviour",
    label: "Funnel steps and conversions",
    kind: "analytics",
    identifies: false,
    deviceStorage: true,
    mayLeakPii: false,
    note: "Following someone across steps requires persistence, which is the thing consent covers.",
  },
  {
    id: "session-replay",
    group: "behaviour",
    label: "Session replay or heatmap recording",
    kind: "analytics",
    identifies: true,
    deviceStorage: true,
    mayLeakPii: true,
    note: "Records what a person typed and saw. Mask every input by default, not by exception.",
  },
  {
    id: "ab-assignment",
    group: "behaviour",
    label: "A/B test assignment",
    kind: "both",
    identifies: false,
    deviceStorage: true,
    mayLeakPii: false,
    note: "The assignment has to persist, so it stores something on the device.",
  },
  {
    id: "visitor-id",
    group: "identity",
    label: "Persistent visitor or device id",
    kind: "analytics",
    identifies: true,
    deviceStorage: true,
    mayLeakPii: false,
    note: "A unique id that follows someone across visits is personal data, whatever it is called.",
  },
  {
    id: "account-id",
    group: "identity",
    label: "Account id or email address",
    kind: "analytics",
    identifies: true,
    deviceStorage: false,
    mayLeakPii: true,
    note: "Directly identifying. Hashing it does not make it anonymous if you can still single someone out.",
  },
  {
    id: "ip-address",
    group: "identity",
    label: "Full IP address",
    kind: "both",
    identifies: true,
    deviceStorage: false,
    mayLeakPii: false,
    note: "Personal data in the hands of a site operator per CJEU Breyer (C-582/14). Truncate the last octet if you only need geography.",
  },
  {
    id: "precise-location",
    group: "identity",
    label: "Precise geolocation",
    kind: "analytics",
    identifies: true,
    deviceStorage: false,
    mayLeakPii: true,
    note: "Almost never needed for product measurement; country from a truncated IP usually is enough.",
  },
  {
    id: "cross-site",
    group: "identity",
    label: "Identifiers shared with a third-party network",
    kind: "analytics",
    identifies: true,
    deviceStorage: true,
    mayLeakPii: false,
    note: "This is the line between measurement and advertising, and it removes every consent exemption.",
  },
];

/**
 * Assess a measurement plan and generate a notice.
 *
 * @param {object} input
 * @param {string}   input.productName
 * @param {string[]} input.signalIds
 * @param {number}   input.retentionDays
 * @param {string}   input.processor       name of the analytics provider, or "" for self-hosted
 * @returns {object} assessment plus a ready-to-edit notice, or { error }
 */
export function assessMeasurementPlan({ productName, signalIds, retentionDays, processor } = {}) {
  const name = String(productName ?? "").trim();
  if (!name) return { error: "Give the product or site a name for the notice." };
  if (name.length > MAX_PRODUCT_NAME) {
    return { error: `Product name must be ${MAX_PRODUCT_NAME} characters or fewer.` };
  }
  if (!Array.isArray(signalIds)) {
    return { error: "Tick the signals you collect." };
  }
  if (signalIds.length === 0) {
    return { error: "Tick at least one signal you collect." };
  }
  const days = Number(retentionDays);
  if (!Number.isFinite(days)) return { error: "Retention must be a number of days." };
  if (days < 1) return { error: "Retention must be at least 1 day." };
  if (days > MAX_RETENTION_DAYS) {
    return { error: `Retention must be ${MAX_RETENTION_DAYS} days (10 years) or fewer.` };
  }

  const wanted = new Set(signalIds);
  const chosen = SIGNALS.filter((signal) => wanted.has(signal.id));
  if (chosen.length === 0) return { error: "None of those signals are in the list." };

  const telemetry = chosen.filter((signal) => signal.kind === "telemetry");
  const analytics = chosen.filter((signal) => signal.kind === "analytics");
  const either = chosen.filter((signal) => signal.kind === "both");

  const identifying = chosen.filter((signal) => signal.identifies);
  const storing = chosen.filter((signal) => signal.deviceStorage);
  const leaky = chosen.filter((signal) => signal.mayLeakPii);
  const crossSite = wanted.has("cross-site");

  const consentReasons = [];
  if (crossSite) {
    consentReasons.push(
      "Identifiers are shared with a third-party network, which removes every audience-measurement exemption.",
    );
  }
  if (storing.length > 0) {
    consentReasons.push(
      `${storing.length} of these signals store or read something on the user's device, which Article 5(3) of the ePrivacy Directive covers unless it is strictly necessary for the service the user asked for.`,
    );
  }
  if (identifying.length > 0) {
    consentReasons.push(
      `${identifying.length} signals identify a person, so the GDPR applies and you owe the Article 13 transparency information regardless of which lawful basis you pick.`,
    );
  }
  const consentRequired = crossSite || storing.length > 0;

  const exactMonths = days / DAYS_PER_MONTH;
  const retentionMonths = Math.round(exactMonths * 10) / 10;
  // Compare the unrounded value so a day past the checkpoint is still flagged.
  const retentionOver = exactMonths > DATA_RETENTION_MONTHS;

  const checks = [
    {
      id: "storage",
      label: "Nothing is written to the user's device",
      ok: storing.length === 0,
      detail:
        storing.length === 0
          ? "No cookie, storage entry or device identifier, so Article 5(3) is not engaged."
          : `${storing.map((signal) => signal.label).join("; ")} require persistence on the device.`,
    },
    {
      id: "identity",
      label: "No signal identifies a person",
      ok: identifying.length === 0,
      detail:
        identifying.length === 0
          ? "Nothing here singles out an individual on its own."
          : `${identifying.map((signal) => signal.label).join("; ")} identify or single out a person.`,
    },
    {
      id: "leak",
      label: "No signal is a common route for accidental personal data",
      ok: leaky.length === 0,
      detail:
        leaky.length === 0
          ? "None of these fields typically carry user input by accident."
          : `Redact before sending: ${leaky.map((signal) => signal.label).join("; ")}.`,
    },
    {
      id: "first-party",
      label: "Measurement stays first-party",
      ok: !crossSite,
      detail: crossSite
        ? "Identifiers leave for a third-party network, which makes this advertising rather than measurement."
        : "Nothing is shared with an advertising network.",
    },
    {
      id: "retention",
      label: `Retention within ${DATA_RETENTION_MONTHS} months`,
      ok: !retentionOver,
      detail: retentionOver
        ? `${retentionMonths} months is beyond the ${DATA_RETENTION_MONTHS}-month checkpoint CNIL uses for its audience-measurement exemption.`
        : `${retentionMonths} months is inside the ${DATA_RETENTION_MONTHS}-month checkpoint.`,
    },
  ];

  const passed = checks.filter((check) => check.ok).length;
  const honestyPercent = Math.round((passed / checks.length) * 100);

  const processorName = String(processor ?? "").trim();
  const destination = processorName
    ? `a processor, ${processorName}, acting on our instructions`
    : "our own servers, with no third-party analytics provider involved";

  const notice = [
    `## What ${name} measures`,
    "",
    "We measure the following, and nothing else:",
    ...chosen.map((signal) => `- ${signal.label} — ${KINDS[signal.kind].label.toLowerCase()}`),
    "",
    "### What we do not collect",
    "",
    ...(identifying.length === 0
      ? ["- Nothing that identifies you as an individual."]
      : [
          "- We do collect identifiers, listed above. They are used to make the product work and to understand how it is used, not to build an advertising profile.",
        ]),
    ...(crossSite ? [] : ["- We do not share identifiers with advertising networks."]),
    ...(leaky.length > 0
      ? ["- We strip personal data out of URLs, referrers and error reports before they are stored."]
      : []),
    "",
    "### Where it goes",
    "",
    `Measurement data is sent to ${destination}.`,
    "",
    "### How long we keep it",
    "",
    `${Math.round(days)} days (about ${retentionMonths} months), after which it is deleted.`,
    "",
    "### How to turn it off",
    "",
    consentRequired
      ? "Because this involves storing information on your device, we ask for your consent first and you can withdraw it at any time from the settings link in the footer. Withdrawing is as easy as giving it."
      : "This measurement does not store anything on your device and does not identify you. If you would still rather not be counted, contact us and we will exclude you.",
    "",
    "### Your rights",
    "",
    "You can ask us what we hold about you, ask for it to be corrected or deleted, and object to processing. Contact details are on our privacy page.",
  ].join("\n");

  return {
    telemetryCount: telemetry.length,
    analyticsCount: analytics.length,
    eitherCount: either.length,
    totalCount: chosen.length,
    identifyingCount: identifying.length,
    storingCount: storing.length,
    leakyCount: leaky.length,
    crossSite,
    consentRequired,
    consentReasons,
    retentionDays: Math.round(days),
    retentionMonths,
    retentionOver,
    checks,
    honestyPercent,
    chosen,
    notice,
  };
}

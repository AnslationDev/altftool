/**
 * Log level decision model.
 *
 * The level set and ordering follow the de-facto standard shared by log4j,
 * SLF4J, Python logging and syslog severity (RFC 5424 s6.2.1, inverted so
 * higher = more severe here):
 *   trace < debug < info < warn < error < fatal
 *
 * The decision tree encodes the widely accepted semantics:
 *   fatal — the process/service cannot continue (syslog "crit"/"alert").
 *   error — an operation failed and was not recovered; someone may need to
 *           act; the failure is visible to a user or caller.
 *   warn  — something unexpected or degraded happened but the operation
 *           still succeeded (retry worked, fallback used).
 *   info  — a normal, significant lifecycle or business event worth seeing
 *           in production (startup, config loaded, order placed).
 *   debug — diagnostic state useful to developers, off in production.
 *   trace — extremely fine-grained flow (per-iteration, per-packet),
 *           enabled only while chasing a specific bug.
 */

/** Questions the decision tree asks, in order, with input keys. */
export const QUESTIONS = [
  {
    id: "isFailure",
    label: "Is the event a failure (something did not work)?",
  },
  {
    id: "isServiceWide",
    label: "Does it stop the whole process or service (crash, unrecoverable state)?",
    dependsOn: "isFailure",
  },
  {
    id: "wasRecovered",
    label: "Was it recovered automatically (retry succeeded, fallback used)?",
    dependsOn: "isFailure",
  },
  {
    id: "isSignificant",
    label: "Is it a significant lifecycle or business event (startup, order placed, job finished)?",
  },
  {
    id: "isHighVolume",
    label: "Would it fire on every iteration, packet or row (very high volume)?",
  },
];

/**
 * Recommend a log level for one event.
 *
 * @param {object} input
 * @param {boolean} input.isFailure       The event represents a failure.
 * @param {boolean} [input.isServiceWide] Failure kills/blocks the whole service.
 * @param {boolean} [input.wasRecovered]  Failure was automatically recovered.
 * @param {boolean} [input.isSignificant] Non-failure event is a notable
 *                                        lifecycle/business event.
 * @param {boolean} [input.isHighVolume]  Fires per-iteration/per-packet.
 * @returns {{ level, rationale, productionVisible, cautions }|{ error }}
 */
export function recommendLevel({
  isFailure,
  isServiceWide = false,
  wasRecovered = false,
  isSignificant = false,
  isHighVolume = false,
}) {
  if (typeof isFailure !== "boolean") {
    return { error: "Answer whether the event is a failure." };
  }

  const cautions = [];

  if (isFailure) {
    if (isServiceWide) {
      return {
        level: "fatal",
        rationale:
          "The process cannot continue — log at fatal (syslog critical) immediately before shutdown so the last line explains the death.",
        productionVisible: true,
        cautions: [
          "Fatal should be followed by an orderly exit; a service that logs fatal and keeps running erodes the level's meaning.",
        ],
      };
    }
    if (wasRecovered) {
      return {
        level: "warn",
        rationale:
          "The operation ultimately succeeded via retry or fallback. It is degradation worth counting, not an error demanding action per occurrence.",
        productionVisible: true,
        cautions: [
          "If the same warn fires constantly, it is telling you the fallback has become the normal path — fix the primary or demote the log.",
        ],
      };
    }
    return {
      level: "error",
      rationale:
        "An operation failed and was not recovered — the caller or user saw the failure. Error is for events that should be investigated, alerting when the rate rises.",
      productionVisible: true,
      cautions: [
        "Log an error once, at the place that handles it — logging and rethrowing at every layer multiplies one failure into five alerts.",
      ],
    };
  }

  if (isHighVolume) {
    return {
      level: "trace",
      rationale:
        "Per-iteration or per-packet detail belongs at trace, enabled only while chasing a specific bug. At any higher level it would drown the signal and inflate log costs.",
      productionVisible: false,
      cautions: [
        "Guard expensive message construction so it is skipped when trace is disabled (lazy interpolation / isTraceEnabled).",
      ],
    };
  }

  if (isSignificant) {
    return {
      level: "info",
      rationale:
        "A normal, significant event an operator should see in production: lifecycle transitions, completed jobs, business milestones — the story of the system working.",
      productionVisible: true,
      cautions: [
        "Keep info low-frequency and meaningful; if it fires hundreds of times a minute it belongs at debug.",
      ],
    };
  }

  return {
    level: "debug",
    rationale:
      "Diagnostic detail useful to a developer — branch decisions, computed values, cache hits. Off in production by default, switched on to investigate.",
    productionVisible: false,
    cautions,
  };
}

/**
 * Per-environment minimum-level policy.
 *
 * @param {object} input
 * @param {boolean} [input.costSensitive]  Log volume is billed / storage-tight.
 * @param {boolean} [input.highTraffic]    The service handles heavy request volume.
 * @returns {{ environments: Array<{env, minLevel, reason}> }}
 */
export function recommendEnvironmentLevels({ costSensitive = false, highTraffic = false } = {}) {
  const prodLevel = costSensitive && highTraffic ? "warn" : "info";
  return {
    environments: [
      {
        env: "Local development",
        minLevel: "debug",
        reason: "Developers need diagnostic detail; volume and cost are irrelevant on a laptop.",
      },
      {
        env: "CI / test runs",
        minLevel: "info",
        reason:
          "Keep test output readable; bump to debug per-run when investigating a flaky failure.",
      },
      {
        env: "Staging",
        minLevel: "debug",
        reason:
          "Staging exists to catch problems — the extra detail is cheap at staging traffic levels and mirrors what you would wish you had in production.",
      },
      {
        env: "Production",
        minLevel: prodLevel,
        reason:
          prodLevel === "warn"
            ? "High traffic plus billed log volume: keep warn and above always on, and rely on sampling or targeted per-module overrides for info."
            : "Info tells the story of the system working; debug stays off and is enabled per-module, temporarily, when investigating.",
      },
    ],
    note:
      "Prefer per-module level overrides and temporary raises over blanket changes — modern frameworks (log4j2, SLF4J/Logback, Python logging) all support per-logger configuration at runtime.",
  };
}

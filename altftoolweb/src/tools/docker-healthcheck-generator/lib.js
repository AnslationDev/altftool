/**
 * Dockerfile HEALTHCHECK / compose healthcheck generation.
 *
 * Defaults and semantics per the Dockerfile reference (HEALTHCHECK) and the
 * Compose Specification (services.<name>.healthcheck):
 *  - --interval default 30s, --timeout default 30s, --retries default 3,
 *    --start-period default 0s, --start-interval default 5s (needs Docker
 *    Engine 25.0+ and BuildKit 1.13+).
 *  - A container is marked unhealthy after `retries` CONSECUTIVE probe
 *    failures. Probes run every `interval`; a probe that runs longer than
 *    `timeout` counts as failed.
 *  - Probe exit codes: 0 healthy, 1 unhealthy (2 is reserved).
 */

export const INTERVAL_DEFAULT = 30; // seconds, Dockerfile reference
export const TIMEOUT_DEFAULT = 30; // seconds, Dockerfile reference
export const RETRIES_DEFAULT = 3; // Dockerfile reference
export const START_PERIOD_DEFAULT = 0; // seconds, Dockerfile reference
export const START_INTERVAL_DEFAULT = 5; // seconds, Docker Engine 25.0+

/** Guard rails: durations under 1s or over 1h are almost always mistakes. */
export const DURATION_MIN = 1;
export const DURATION_MAX = 3600;
export const RETRIES_MAX = 100;

export const CHECK_TYPES = [
  { id: "curl", label: "HTTP via curl (image has curl)" },
  { id: "wget", label: "HTTP via wget (busybox/alpine images)" },
  { id: "tcp", label: "TCP port open via nc" },
  { id: "custom", label: "Custom command" },
];

const isPort = (value) => Number.isInteger(value) && value >= 1 && value <= 65535;

/** Build the probe command string for the chosen check type. */
export function buildProbeCommand({ checkType, port, path, customCommand }) {
  if (checkType === "curl") {
    // -f: fail on HTTP >= 400; -s: quiet; -o /dev/null: discard body.
    return `curl -fs -o /dev/null http://localhost:${port}${path} || exit 1`;
  }
  if (checkType === "wget") {
    // --spider: HEAD-style check without saving; busybox wget lacks curl's -f but errors on >=400.
    return `wget -q --tries=1 --spider http://localhost:${port}${path} || exit 1`;
  }
  if (checkType === "tcp") {
    // -z: scan without sending data.
    return `nc -z localhost ${port} || exit 1`;
  }
  return customCommand;
}

/**
 * Generate HEALTHCHECK instruction, compose block and failure-detection timing.
 *
 * @param {object} input
 * @param {"curl"|"wget"|"tcp"|"custom"} input.checkType
 * @param {number} input.port                for curl/wget/tcp checks.
 * @param {string} input.path                URL path for curl/wget, must start with "/".
 * @param {string} input.customCommand       shell command for custom checks.
 * @param {number} input.intervalSeconds
 * @param {number} input.timeoutSeconds
 * @param {number} input.retries
 * @param {number} input.startPeriodSeconds
 * @param {boolean} input.useStartInterval   emit --start-interval (Engine 25.0+).
 * @param {number} input.startIntervalSeconds
 * @returns {{dockerfile, compose, command, worstCaseSeconds, notes} | {error}}
 */
export function buildHealthcheck({
  checkType,
  port,
  path = "/health",
  customCommand = "",
  intervalSeconds,
  timeoutSeconds,
  retries,
  startPeriodSeconds,
  useStartInterval = false,
  startIntervalSeconds = START_INTERVAL_DEFAULT,
}) {
  if (!CHECK_TYPES.some((type) => type.id === checkType)) {
    return { error: "Choose a probe type." };
  }
  const interval = Number(intervalSeconds);
  const timeout = Number(timeoutSeconds);
  const tries = Number(retries);
  const startPeriod = Number(startPeriodSeconds);
  const startInterval = Number(startIntervalSeconds);

  if (!Number.isInteger(interval) || interval < DURATION_MIN || interval > DURATION_MAX) {
    return { error: `Interval must be a whole number between ${DURATION_MIN} and ${DURATION_MAX} seconds.` };
  }
  if (!Number.isInteger(timeout) || timeout < DURATION_MIN || timeout > DURATION_MAX) {
    return { error: `Timeout must be a whole number between ${DURATION_MIN} and ${DURATION_MAX} seconds.` };
  }
  if (!Number.isInteger(tries) || tries < 1 || tries > RETRIES_MAX) {
    return { error: `Retries must be a whole number between 1 and ${RETRIES_MAX}.` };
  }
  if (!Number.isInteger(startPeriod) || startPeriod < 0 || startPeriod > DURATION_MAX) {
    return { error: `Start period must be between 0 and ${DURATION_MAX} seconds.` };
  }
  if (useStartInterval && (!Number.isInteger(startInterval) || startInterval < DURATION_MIN || startInterval > DURATION_MAX)) {
    return { error: `Start interval must be between ${DURATION_MIN} and ${DURATION_MAX} seconds.` };
  }

  if (checkType === "curl" || checkType === "wget" || checkType === "tcp") {
    if (!isPort(Number(port))) {
      return { error: "Port must be a whole number from 1 to 65535." };
    }
  }
  let cleanPath = "/";
  if (checkType === "curl" || checkType === "wget") {
    cleanPath = typeof path === "string" ? path.trim() : "";
    if (cleanPath === "" || !cleanPath.startsWith("/") || /\s/.test(cleanPath)) {
      return { error: "URL path must start with / and contain no spaces." };
    }
  }
  let command;
  if (checkType === "custom") {
    command = typeof customCommand === "string" ? customCommand.trim() : "";
    if (command === "") {
      return { error: "Enter the custom probe command to run inside the container." };
    }
    if (/\r|\n/.test(command)) {
      return { error: "The probe command must be a single line." };
    }
  } else {
    command = buildProbeCommand({ checkType, port: Number(port), path: cleanPath, customCommand });
  }

  const flags = [
    `--interval=${interval}s`,
    `--timeout=${timeout}s`,
    `--start-period=${startPeriod}s`,
  ];
  if (useStartInterval) flags.push(`--start-interval=${startInterval}s`);
  flags.push(`--retries=${tries}`);

  const dockerfile = `HEALTHCHECK ${flags.join(" ")} \\\n  CMD ${command}`;

  const composeLines = [
    "healthcheck:",
    `  test: ["CMD-SHELL", "${command.replace(/"/g, '\\"')}"]`,
    `  interval: ${interval}s`,
    `  timeout: ${timeout}s`,
    `  retries: ${tries}`,
    `  start_period: ${startPeriod}s`,
  ];
  if (useStartInterval) composeLines.push(`  start_interval: ${startInterval}s`);
  const compose = composeLines.join("\n");

  /**
   * Unhealthy needs `retries` consecutive failures. Counting from the moment
   * the first failing probe starts: (retries - 1) further probes spaced
   * `interval` apart, and the last one may take up to `timeout` to fail.
   */
  const worstCaseSeconds = (tries - 1) * interval + timeout;

  const notes = [];
  if (timeout >= interval) {
    notes.push(
      "Timeout is not shorter than the interval — a hung probe can overlap the next scheduled one; most checks use a timeout of a few seconds.",
    );
  }
  if (useStartInterval) {
    notes.push("--start-interval needs Docker Engine 25.0+ (BuildKit 1.13+); older engines ignore it.");
  }
  if (checkType === "curl") {
    notes.push("curl must exist in the final image — distroless and many slim images ship without it.");
  }
  if (checkType === "wget") {
    notes.push("Busybox wget (alpine) supports --spider and --tries; this probe avoids curl-only flags.");
  }
  notes.push(
    "During start-period, failures do not count toward retries, but one success marks the container healthy immediately.",
  );

  return { dockerfile, compose, command, worstCaseSeconds, startPeriodSeconds: startPeriod, notes };
}

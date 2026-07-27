/**
 * Blue-green deployment cutover planner.
 *
 * Pure logic only: given the shape of the service and the switch mechanism it
 * derives the safe DNS wait, the canary ramp ladder, the rollback trigger
 * thresholds and the ordered checklist. No React, no DOM, no clock reads.
 */

/**
 * Caching resolvers and stub resolvers are allowed to serve a record until its
 * TTL expires (RFC 1035 §3.2.1), and many home routers / corporate resolvers
 * clamp very low TTLs upward. Waiting two full TTLs before decommissioning the
 * old ("blue") environment is the long-standing operational safety margin.
 */
export const DNS_TTL_SAFETY_FACTOR = 2;

/** Practical bounds for a record TTL you would use on a cutover day. */
export const MIN_DNS_TTL_SECONDS = 30;
export const MAX_DNS_TTL_SECONDS = 86400; // 24 h, the usual registrar maximum

/**
 * Canary ladder used by most progressive-delivery controllers (Argo Rollouts,
 * Flagger, AWS CodeDeploy linear configs). Steps are read from the end so the
 * ramp always finishes at 100 %.
 */
export const CANARY_LADDER = [1, 5, 10, 25, 50, 100];
export const MIN_RAMP_STEPS = 1;
export const MAX_RAMP_STEPS = CANARY_LADDER.length;

/** Fixed phase allowances used to size the change window, in minutes. */
export const PRECHECK_MINUTES = 15;
export const VERIFY_MINUTES = 15;

/**
 * A service with a 0 % baseline error rate still needs a usable trigger, so the
 * rollback threshold is never tighter than baseline + this absolute floor.
 */
export const ERROR_TRIGGER_FLOOR_PCT = 0.1;

export const SWITCH_MECHANISMS = [
  {
    id: "dns",
    label: "DNS record swap",
    note: "Slowest to take effect and slowest to roll back — clients cache the old answer.",
  },
  {
    id: "load-balancer",
    label: "Load balancer target group swap",
    note: "Switch is immediate for new connections; existing connections drain.",
  },
  {
    id: "ingress",
    label: "Kubernetes ingress / service selector",
    note: "Immediate; rollback is a single manifest apply.",
  },
  {
    id: "service-mesh",
    label: "Service mesh weighted routing",
    note: "Finest control — supports true percentage canaries and instant revert.",
  },
];

export const APP_TYPES = [
  { id: "stateless-api", label: "Stateless API" },
  { id: "web-sessions", label: "Web app with user sessions" },
  { id: "background-workers", label: "Background workers / consumers" },
  { id: "realtime", label: "Realtime (WebSocket / SSE)" },
];

export const MIGRATION_STRATEGIES = [
  { id: "none", label: "No schema change" },
  { id: "expand-contract", label: "Expand / contract (backward compatible)" },
  { id: "breaking", label: "Breaking change in one release" },
];

export const SESSION_STORES = [
  { id: "shared", label: "Shared store (Redis / database)" },
  { id: "signed-cookie", label: "Signed cookie / JWT" },
  { id: "in-memory", label: "In-memory on each instance" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Percentage steps for a canary ramp.
 * @param {number} steps how many increments before 100 %
 * @returns {number[]} ascending percentages ending at 100
 */
export function buildRampLadder(steps) {
  const n = clamp(Math.round(steps), MIN_RAMP_STEPS, MAX_RAMP_STEPS);
  return CANARY_LADDER.slice(CANARY_LADDER.length - n);
}

/**
 * Seconds to wait after flipping a DNS record before the old environment may be
 * shut down. Non-DNS mechanisms need no propagation wait.
 */
export function dnsPropagationWaitSeconds(mechanism, ttlSeconds) {
  if (mechanism !== "dns") return 0;
  if (!isNum(ttlSeconds) || ttlSeconds <= 0) return 0;
  return Math.round(ttlSeconds * DNS_TTL_SAFETY_FACTOR);
}

/**
 * Abort thresholds derived from the pre-cutover baseline.
 * @returns {{errorRatePct:number, p95LatencyMs:number}}
 */
export function rollbackTriggers({
  baselineErrorRatePct,
  errorBudgetMultiplier,
  baselineP95Ms,
  latencyTolerancePct,
}) {
  const errorRatePct = Math.max(
    baselineErrorRatePct * errorBudgetMultiplier,
    baselineErrorRatePct + ERROR_TRIGGER_FLOOR_PCT,
  );
  const p95LatencyMs = baselineP95Ms * (1 + latencyTolerancePct / 100);
  return { errorRatePct: round2(errorRatePct), p95LatencyMs: Math.round(p95LatencyMs) };
}

function phaseItems(input, derived) {
  const {
    appType,
    mechanism,
    migrationStrategy,
    sessionStore,
    connectionDrainSeconds,
  } = input;
  const { ramp, dnsWaitSeconds, triggers } = derived;
  const mech = SWITCH_MECHANISMS.find((m) => m.id === mechanism);

  const prepare = [
    "Tag the exact commit / image digest going to green and record it in the change ticket.",
    "Bring green up at full production capacity — never cut over to a smaller fleet.",
    "Run the smoke suite against green using its private hostname, before any user traffic.",
    `Record the blue baseline for the last 30 minutes: error rate ${round2(input.baselineErrorRatePct)}%, p95 ${Math.round(input.baselineP95Ms)} ms.`,
    "Confirm blue stays fully running and untouched for the whole window — it is the rollback path.",
    "Name a single cutover driver and a single rollback decider before you start.",
  ];

  if (mechanism === "dns") {
    prepare.push(
      `Lower the record TTL to ${input.dnsTtlSeconds}s at least one old-TTL period before cutover day.`,
    );
  }

  if (migrationStrategy === "expand-contract") {
    prepare.push(
      "Ship the expand migration (add nullable columns / new tables) ahead of the cutover and verify blue still works against it.",
    );
  }
  if (migrationStrategy === "breaking") {
    prepare.push(
      "Breaking schema change: blue and green cannot share the database. Plan a read-only window and a tested restore, or convert this to expand/contract first.",
    );
  }
  if (migrationStrategy !== "none") {
    prepare.push("Take a fresh backup / snapshot and time a restore so rollback duration is known, not guessed.");
  }

  if (sessionStore === "in-memory") {
    prepare.push(
      "In-memory sessions do not survive the swap — move them to a shared store or accept that every logged-in user is signed out.",
    );
  }
  if (sessionStore === "shared") {
    prepare.push("Confirm green reads the same session store and uses the same cookie name, domain and signing secret.");
  }
  if (sessionStore === "signed-cookie") {
    prepare.push("Confirm green trusts the current signing key and that key rotation is not part of this release.");
  }

  if (appType === "background-workers") {
    prepare.push("Decide whether blue and green consumers run together: check the queue for non-idempotent or ordered work first.");
  }
  if (appType === "realtime") {
    prepare.push("Long-lived sockets will not move on their own — plan a client reconnect nudge or accept a long tail on blue.");
  }

  const cutover = ramp.map((pct, index) =>
    index === ramp.length - 1
      ? `Send 100% of traffic to green via ${mech.label.toLowerCase()}, then hold and watch.`
      : `Shift ${pct}% of traffic to green and hold for ${input.perStepSoakMinutes} minutes watching error rate and p95.`,
  );
  cutover.unshift("Silence noisy alerts that will fire on the deploy itself, but keep the SLO alerts armed.");
  if (mechanism === "load-balancer" || mechanism === "ingress") {
    cutover.push(
      `Let blue drain for ${connectionDrainSeconds}s before touching it; in-flight requests are still on it.`,
    );
  }
  if (migrationStrategy === "breaking") {
    cutover.push("Apply the breaking migration only once traffic is fully on green and blue is confirmed idle.");
  }

  const verify = [
    `Abort if error rate exceeds ${triggers.errorRatePct}% for 5 consecutive minutes.`,
    `Abort if p95 latency exceeds ${triggers.p95LatencyMs} ms for 5 consecutive minutes.`,
    "Walk one real end-to-end journey by hand: sign in, the main write action, and a payment or equivalent side effect.",
    "Check the business metric, not just the infra one — orders, signups or messages per minute against the same hour last week.",
    "Compare green's logs for new exception signatures that blue never produced.",
  ];
  if (appType === "web-sessions") {
    verify.push("Confirm an existing logged-in session still works after the swap, from a browser that was signed in before it.");
  }
  if (appType === "realtime") {
    verify.push("Confirm reconnect storms are not overloading green — watch connection rate, not just request rate.");
  }

  const rollback = [
    `Rollback is: point ${mech.label.toLowerCase()} back at blue. Rehearse this command before cutover.`,
    "Roll back on the trigger, not on a discussion — the decider calls it and the debate happens afterwards.",
  ];
  if (mechanism === "dns") {
    rollback.push(
      `DNS rollback is not instant: expect up to ${Math.round(dnsWaitSeconds / 60)} minutes for cached answers to expire.`,
    );
  }
  if (migrationStrategy === "expand-contract") {
    rollback.push("Do not run the contract (drop) migration until after the soak — it is what makes rollback impossible.");
  }
  if (migrationStrategy === "breaking") {
    rollback.push("Rollback here means restore-from-backup with data loss back to the snapshot. Confirm who signs that off.");
  }

  const closeOut = [];
  if (dnsWaitSeconds > 0) {
    closeOut.push(
      `Keep blue running for at least ${Math.round(dnsWaitSeconds / 60)} minutes (${DNS_TTL_SAFETY_FACTOR}× TTL) so cached clients still land somewhere healthy.`,
    );
  }
  closeOut.push(
    `Soak for ${input.soakMinutes} minutes at 100% before declaring the release done.`,
    "Only then scale blue down. Keep the image and config so it can be re-created.",
    "Restore the DNS TTL and re-enable any alerts you silenced.",
    "Run the contract / cleanup migration as a separate later change, if one is pending.",
    "Write the timeline down while it is fresh: what you watched, what surprised you, what you would automate.",
  );

  return [
    { id: "prepare", title: "1. Before the cutover", items: prepare },
    { id: "cutover", title: "2. Shifting traffic", items: cutover },
    { id: "verify", title: "3. Verify on green", items: verify },
    { id: "rollback", title: "4. Rollback plan", items: rollback },
    { id: "close", title: "5. Soak and decommission", items: closeOut },
  ];
}

/**
 * Build the full cutover plan.
 * @returns {{error:string}|{phases:Array,ramp:number[],dnsWaitSeconds:number,triggers:object,windowMinutes:number,itemCount:number,markdown:string}}
 */
export function buildCutoverPlan(input) {
  const {
    appType,
    mechanism,
    migrationStrategy,
    sessionStore,
    dnsTtlSeconds,
    rampSteps,
    perStepSoakMinutes,
    soakMinutes,
    connectionDrainSeconds,
    baselineErrorRatePct,
    errorBudgetMultiplier,
    baselineP95Ms,
    latencyTolerancePct,
  } = input || {};

  if (!SWITCH_MECHANISMS.some((m) => m.id === mechanism)) {
    return { error: "Pick how traffic is switched from blue to green." };
  }
  if (!APP_TYPES.some((a) => a.id === appType)) return { error: "Pick the workload type." };
  if (!MIGRATION_STRATEGIES.some((m) => m.id === migrationStrategy)) {
    return { error: "Pick a database migration strategy." };
  }
  if (!SESSION_STORES.some((s) => s.id === sessionStore)) return { error: "Pick where sessions live." };

  const numbers = {
    dnsTtlSeconds,
    rampSteps,
    perStepSoakMinutes,
    soakMinutes,
    connectionDrainSeconds,
    baselineErrorRatePct,
    errorBudgetMultiplier,
    baselineP95Ms,
    latencyTolerancePct,
  };
  const bad = Object.keys(numbers).find((key) => !isNum(numbers[key]));
  if (bad) return { error: "Enter a valid number in every field." };

  if (mechanism === "dns" && (dnsTtlSeconds < MIN_DNS_TTL_SECONDS || dnsTtlSeconds > MAX_DNS_TTL_SECONDS)) {
    return { error: `DNS TTL must be between ${MIN_DNS_TTL_SECONDS} and ${MAX_DNS_TTL_SECONDS} seconds.` };
  }
  if (rampSteps < MIN_RAMP_STEPS || rampSteps > MAX_RAMP_STEPS) {
    return { error: `Ramp steps must be between ${MIN_RAMP_STEPS} and ${MAX_RAMP_STEPS}.` };
  }
  if (perStepSoakMinutes <= 0 || perStepSoakMinutes > 240) {
    return { error: "Hold time per ramp step must be between 1 and 240 minutes." };
  }
  if (soakMinutes <= 0 || soakMinutes > 2880) {
    return { error: "Final soak must be between 1 minute and 48 hours (2880 minutes)." };
  }
  if (connectionDrainSeconds < 0 || connectionDrainSeconds > 3600) {
    return { error: "Connection drain must be between 0 and 3600 seconds." };
  }
  if (baselineErrorRatePct < 0 || baselineErrorRatePct > 100) {
    return { error: "Baseline error rate must be between 0% and 100%." };
  }
  if (errorBudgetMultiplier < 1 || errorBudgetMultiplier > 20) {
    return { error: "Error multiplier must be between 1× and 20× the baseline." };
  }
  if (baselineP95Ms <= 0 || baselineP95Ms > 600000) {
    return { error: "Baseline p95 latency must be between 1 ms and 600000 ms." };
  }
  if (latencyTolerancePct < 0 || latencyTolerancePct > 500) {
    return { error: "Latency tolerance must be between 0% and 500%." };
  }

  const ramp = buildRampLadder(rampSteps);
  const dnsWaitSeconds = dnsPropagationWaitSeconds(mechanism, dnsTtlSeconds);
  const triggers = rollbackTriggers({
    baselineErrorRatePct,
    errorBudgetMultiplier,
    baselineP95Ms,
    latencyTolerancePct,
  });

  // The last ramp entry is 100 %, which is covered by the final soak instead.
  const rampMinutes = (ramp.length - 1) * perStepSoakMinutes;
  const drainMinutes = mechanism === "dns" ? 0 : connectionDrainSeconds / 60;
  const windowMinutes = Math.round(
    PRECHECK_MINUTES + rampMinutes + VERIFY_MINUTES + drainMinutes + soakMinutes + dnsWaitSeconds / 60,
  );

  const normalised = {
    ...input,
    baselineErrorRatePct,
    baselineP95Ms,
    perStepSoakMinutes,
    soakMinutes,
    connectionDrainSeconds,
    dnsTtlSeconds,
  };
  const phases = phaseItems(normalised, { ramp, dnsWaitSeconds, triggers });
  const itemCount = phases.reduce((sum, phase) => sum + phase.items.length, 0);

  const markdown = [
    "# Blue-green cutover checklist",
    "",
    `- Switch mechanism: ${SWITCH_MECHANISMS.find((m) => m.id === mechanism).label}`,
    `- Workload: ${APP_TYPES.find((a) => a.id === appType).label}`,
    `- Schema: ${MIGRATION_STRATEGIES.find((m) => m.id === migrationStrategy).label}`,
    `- Traffic ramp: ${ramp.map((p) => `${p}%`).join(" -> ")}`,
    `- Rollback triggers: error rate > ${triggers.errorRatePct}% or p95 > ${triggers.p95LatencyMs} ms`,
    dnsWaitSeconds > 0 ? `- Keep blue alive for ${dnsWaitSeconds}s after the swap (${DNS_TTL_SAFETY_FACTOR}x TTL)` : null,
    `- Planned change window: ~${windowMinutes} minutes`,
    "",
    ...phases.flatMap((phase) => [`## ${phase.title}`, ...phase.items.map((item) => `- [ ] ${item}`), ""]),
  ]
    .filter((line) => line !== null)
    .join("\n")
    .trim();

  return { phases, ramp, dnsWaitSeconds, triggers, windowMinutes, itemCount, markdown };
}

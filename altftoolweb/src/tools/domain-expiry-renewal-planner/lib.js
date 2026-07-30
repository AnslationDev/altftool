/**
 * Domain expiry and renewal planner for gTLDs.
 *
 * Losing a domain is never a single event on the expiry date — it is a chain
 * of registry-defined windows, each with its own cost and its own point of no
 * return. This module dates that chain from your expiry date and works out
 * which window you are in today.
 *
 * The windows, as defined by ICANN policy and the gTLD registry agreements:
 *
 *  - Add Grace Period: 5 days after an initial registration, during which a
 *    deletion is refunded.
 *  - Auto-Renew Grace Period: up to 45 days after expiry at the registry. What
 *    your registrar passes on to you is shorter and varies, which is why it is
 *    an input here rather than a constant.
 *  - Redemption Grace Period: 30 days. The name is out of the zone and can
 *    only be recovered by paying the registrar's redemption fee, which is
 *    typically several times a normal renewal.
 *  - Pending Delete: 5 days. Nothing can be restored. At the end the name is
 *    released and anyone can register it.
 *
 * The Expired Registration Recovery Policy (ERRP), in force since 31 August
 * 2013, requires a gTLD registrar to send renewal reminders approximately one
 * month and approximately one week before expiry, plus one notice within five
 * days after expiry. ERRP also requires the registrar to interrupt DNS
 * resolution for an expired name rather than leave it quietly resolving, which
 * is why a site usually goes dark well before the name is actually lost.
 *
 * Transfer locks under the ICANN Transfer Policy: a name cannot be transferred
 * to another registrar within 60 days of its initial registration, and within
 * 60 days of a completed inter-registrar transfer. A change of registrant can
 * also trigger a 60-day lock depending on your registrar and the current
 * version of the policy — ICANN has been revising the Transfer Policy, so
 * confirm the present rule with your registrar before planning a move.
 *
 * Informational only, and gTLD-focused. Country-code TLDs set their own
 * lifecycles and some have no redemption period at all.
 */

export const MS_PER_DAY = 86400000;

/** Registry-defined windows, in days. */
export const REDEMPTION_GRACE_DAYS = 30;
export const PENDING_DELETE_DAYS = 5;
export const ADD_GRACE_DAYS = 5;
export const MAX_AUTO_RENEW_GRACE_DAYS = 45;

/** ERRP notice schedule, in days relative to expiry. */
export const ERRP_NOTICE_OFFSETS = [-30, -7, 5];

/** ERRP requires DNS resolution to be interrupted for an expired name. Most
 *  registrars do it around this many days after expiry. */
export const TYPICAL_DNS_INTERRUPT_DAY = 8;

/** ICANN Transfer Policy inter-registrar transfer lock, in days. */
export const TRANSFER_LOCK_DAYS = 60;

/** A transfer request needs time to clear the five-day approval window. */
export const TRANSFER_LEAD_DAYS = 15;

/** How far ahead this planner is willing to date things. */
export const MAX_HORIZON_DAYS = 3650;

export const PHASES = [
  {
    id: "active",
    label: "Active",
    tone: "success",
    meaning: "The name resolves normally and is fully under your control.",
  },
  {
    id: "expiring",
    label: "Expiring soon",
    tone: "warning",
    meaning:
      "Inside the ERRP reminder window. Renew now, and do not start a registrar transfer this close to expiry.",
  },
  {
    id: "auto-renew-grace",
    label: "Expired — registrar renewal grace",
    tone: "warning",
    meaning:
      "Expired but still recoverable at roughly the normal renewal price. DNS has probably already been interrupted, so the site is down.",
  },
  {
    id: "redemption",
    label: "Redemption grace period",
    tone: "danger",
    meaning:
      "Out of the zone. Recovery requires the registrar's redemption fee and a restore request, and it cannot be done by simply paying a renewal.",
  },
  {
    id: "pending-delete",
    label: "Pending delete",
    tone: "danger",
    meaning:
      "Nothing can be restored. The name is queued for release and drop-catchers are already watching it.",
  },
  {
    id: "dropped",
    label: "Released",
    tone: "danger",
    meaning: "The name has dropped and anyone can register it. It is no longer yours in any sense.",
  },
];

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

const addDays = (ms, days) => ms + days * MS_PER_DAY;
const daysBetween = (fromMs, toMs) => Math.round((toMs - fromMs) / MS_PER_DAY);

/**
 * Build the full renewal and lifecycle plan for one domain.
 *
 * @param {object} input
 * @param {string} input.expiryDate  Registry expiry date, YYYY-MM-DD.
 * @param {string} input.today       Reference date, YYYY-MM-DD.
 * @param {string} [input.registeredOn] Registration or last transfer date, YYYY-MM-DD.
 * @param {number} input.graceDays   Registrar's post-expiry renewal grace, 0-45.
 * @param {boolean} input.autoRenew  Auto-renew is switched on and the card is valid.
 * @param {boolean} input.registrarLock  clientTransferProhibited is set.
 * @param {boolean} input.contactCurrent Registrant email is monitored and current.
 * @param {boolean} input.twoFactor  The registrar account has two-factor auth.
 * @param {number} [input.renewalPrice] Normal renewal price.
 * @param {number} [input.redemptionFee] Registrar's restore fee.
 * @returns {object} plan, or { error }.
 */
export function planDomainRenewal({
  expiryDate,
  today,
  registeredOn = "",
  graceDays = 30,
  autoRenew = true,
  registrarLock = true,
  contactCurrent = true,
  twoFactor = true,
  renewalPrice = 0,
  redemptionFee = 0,
} = {}) {
  const expiryMs = parseIsoDate(expiryDate);
  if (Number.isNaN(expiryMs)) return { error: "Enter the expiry date as a real calendar date." };

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const grace = Number(graceDays);
  if (!Number.isFinite(grace)) {
    return { error: "Enter the registrar's renewal grace period as a number of days." };
  }
  if (grace < 0 || grace > MAX_AUTO_RENEW_GRACE_DAYS) {
    return {
      error: `The registry auto-renew grace period is capped at ${MAX_AUTO_RENEW_GRACE_DAYS} days, so enter 0 to ${MAX_AUTO_RENEW_GRACE_DAYS}.`,
    };
  }

  const price = Number(renewalPrice);
  const restore = Number(redemptionFee);
  if (!Number.isFinite(price) || !Number.isFinite(restore) || price < 0 || restore < 0) {
    return { error: "Renewal price and redemption fee must be zero or a positive number." };
  }

  const daysToExpiry = daysBetween(todayMs, expiryMs);
  if (Math.abs(daysToExpiry) > MAX_HORIZON_DAYS) {
    return { error: "That expiry date is more than ten years from today — check the year." };
  }

  const graceEndMs = addDays(expiryMs, grace);
  const redemptionStartMs = graceEndMs;
  const redemptionEndMs = addDays(redemptionStartMs, REDEMPTION_GRACE_DAYS);
  const pendingDeleteEndMs = addDays(redemptionEndMs, PENDING_DELETE_DAYS);
  const dnsInterruptMs = addDays(expiryMs, Math.min(grace, TYPICAL_DNS_INTERRUPT_DAY));

  const timeline = [
    {
      id: "expiry",
      label: "Registry expiry date",
      date: toIsoDate(expiryMs),
      daysAway: daysBetween(todayMs, expiryMs),
      detail: "Last day of the paid term. Auto-renew, if it works, charges on or around this date.",
    },
    {
      id: "dns-interrupt",
      label: "DNS resolution interrupted",
      date: toIsoDate(dnsInterruptMs),
      daysAway: daysBetween(todayMs, dnsInterruptMs),
      detail:
        "ERRP requires the registrar to stop an expired name resolving normally. In practice the website and email stop working here, not on the expiry date.",
    },
    {
      id: "grace-end",
      label: "Registrar renewal grace ends",
      date: toIsoDate(graceEndMs),
      daysAway: daysBetween(todayMs, graceEndMs),
      detail: `Last day to recover the name at roughly the normal renewal price. You entered ${grace} days; registrars set this anywhere from 0 to ${MAX_AUTO_RENEW_GRACE_DAYS}.`,
    },
    {
      id: "redemption-end",
      label: "Redemption grace period ends",
      date: toIsoDate(redemptionEndMs),
      daysAway: daysBetween(todayMs, redemptionEndMs),
      detail: `${REDEMPTION_GRACE_DAYS} days in which the name can still be restored, but only by paying the redemption fee. This is the last realistic chance.`,
    },
    {
      id: "drop",
      label: "Name released to the public",
      date: toIsoDate(pendingDeleteEndMs),
      daysAway: daysBetween(todayMs, pendingDeleteEndMs),
      detail: `After ${PENDING_DELETE_DAYS} days of pending delete the name drops and anyone can register it. Expired names with traffic are caught within seconds.`,
    },
  ];

  const reminders = ERRP_NOTICE_OFFSETS.map((offset) => {
    const ms = addDays(expiryMs, offset);
    return {
      id: `errp-${offset}`,
      date: toIsoDate(ms),
      daysAway: daysBetween(todayMs, ms),
      label:
        offset < 0
          ? `ERRP reminder, about ${Math.abs(offset)} days before expiry`
          : "ERRP notice after expiry",
    };
  });

  let phase = "active";
  if (todayMs >= pendingDeleteEndMs) phase = "dropped";
  else if (todayMs >= redemptionEndMs) phase = "pending-delete";
  else if (todayMs >= redemptionStartMs) phase = "redemption";
  else if (todayMs >= expiryMs) phase = "auto-renew-grace";
  else if (daysToExpiry <= 30) phase = "expiring";

  const phaseInfo = PHASES.find((item) => item.id === phase);

  // Transfer lock, if a registration or transfer date was supplied.
  let transfer = null;
  if (registeredOn) {
    const startMs = parseIsoDate(registeredOn);
    if (Number.isNaN(startMs)) {
      return { error: "Enter the registration or last transfer date as a real calendar date." };
    }
    if (startMs > expiryMs) {
      return { error: "The registration date cannot be after the expiry date." };
    }
    const lockEndMs = addDays(startMs, TRANSFER_LOCK_DAYS);
    const addGraceEndMs = addDays(startMs, ADD_GRACE_DAYS);
    transfer = {
      lockEnd: toIsoDate(lockEndMs),
      lockDaysLeft: Math.max(0, daysBetween(todayMs, lockEndMs)),
      locked: todayMs < lockEndMs,
      addGraceEnd: toIsoDate(addGraceEndMs),
      inAddGrace: todayMs < addGraceEndMs,
      safeTransferBy: toIsoDate(addDays(expiryMs, -TRANSFER_LEAD_DAYS)),
      safeTransferDaysLeft: daysBetween(todayMs, addDays(expiryMs, -TRANSFER_LEAD_DAYS)),
    };
  }

  // Cost comparison. Only meaningful if the user supplied figures.
  const costs =
    price > 0
      ? {
          renewNow: price,
          restoreLater: restore > 0 ? restore + price : null,
          multiple: restore > 0 ? Math.round((restore + price) / price * 10) / 10 : null,
        }
      : null;

  // Risk scoring. Each item is a concrete, checkable failure mode.
  const risks = [];
  if (!autoRenew) {
    risks.push({
      weight: 30,
      title: "Auto-renew is off",
      detail:
        "Every expired-domain outage starts here. Auto-renew turns a missed email into a non-event.",
    });
  }
  if (!contactCurrent) {
    risks.push({
      weight: 25,
      title: "Registrant contact address is stale",
      detail:
        "The ERRP reminders and the expiry notice go to the registrant email on file. If that address bounces or belongs to someone who left, nobody sees any of them.",
    });
  }
  if (!twoFactor) {
    risks.push({
      weight: 20,
      title: "No two-factor authentication on the registrar account",
      detail:
        "A registrar account takeover is the fastest route to a hijacked domain, because the attacker can unlock the name and pull the auth code themselves.",
    });
  }
  if (!registrarLock) {
    risks.push({
      weight: 15,
      title: "Registrar transfer lock is off",
      detail:
        "clientTransferProhibited is the last barrier to an unauthorised transfer. Leave it on and clear it deliberately when you actually intend to move.",
    });
  }
  if (grace <= 5) {
    risks.push({
      weight: 10,
      title: "Very short renewal grace period",
      detail: `Your registrar gives you ${grace} day(s) after expiry before the redemption fee applies. That is a narrow margin for a payment failure over a weekend.`,
    });
  }
  if (phase === "expiring" || phase === "auto-renew-grace") {
    risks.push({
      weight: 20,
      title: "Inside the danger window right now",
      detail: "The name is at or past expiry. Renew before doing anything else on this list.",
    });
  }
  if (phase === "redemption" || phase === "pending-delete") {
    risks.push({
      weight: 40,
      title: "Recovery already costs a redemption fee",
      detail:
        "Contact the registrar today and ask for a restore, not a renewal. A renewal payment will not bring the name back from redemption.",
    });
  }
  if (phase === "dropped") {
    risks.push({
      weight: 100,
      title: "The registration has already lapsed and dropped",
      detail:
        "The name left your control at the end of pending delete. Nothing in this list prevents that any more — check whether it is still available, and assume any mailbox on that domain is now readable by whoever holds it.",
    });
  }

  const riskScore = Math.min(100, risks.reduce((sum, item) => sum + item.weight, 0));
  const riskBand =
    riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : riskScore > 0 ? "low" : "none";

  const actions = [];
  if (phase === "dropped") {
    actions.push("The name has dropped. Check availability — if someone else has taken it, a backorder or a UDRP claim are the only routes left, and neither is quick.");
  } else if (phase === "pending-delete" || phase === "redemption") {
    actions.push("Open a restore request with the registrar today and quote the domain's redemption status. Do not simply pay a renewal — it will not work.");
  } else if (phase === "auto-renew-grace") {
    actions.push("Renew immediately. You are still inside the cheap window, but DNS has probably already been cut.");
  } else if (phase === "expiring") {
    actions.push("Renew now, and add several years while you are in there. Do not start a registrar transfer this close to expiry.");
  } else {
    actions.push("Nothing urgent. Use the quiet period to fix auto-renew, contacts and two-factor rather than waiting for the reminder emails.");
  }
  if (!autoRenew) actions.push("Turn auto-renew on and confirm the card on file has not expired.");
  if (!contactCurrent) {
    actions.push("Point the registrant email at a shared mailbox that outlives any individual, and verify it receives mail.");
  }
  if (!twoFactor) actions.push("Enable two-factor authentication on the registrar account.");
  if (!registrarLock) actions.push("Switch the registrar transfer lock back on.");
  actions.push("Record the auth code procedure and where the account credentials live, so a renewal is not blocked by one person being unavailable.");

  return {
    phase,
    phaseInfo,
    daysToExpiry,
    expiry: toIsoDate(expiryMs),
    timeline,
    reminders,
    transfer,
    costs,
    risks,
    riskScore,
    riskBand,
    actions,
    graceDays: grace,
    dropDate: toIsoDate(pendingDeleteEndMs),
    daysUntilDrop: daysBetween(todayMs, pendingDeleteEndMs),
  };
}

/** Plain-text export for the copy button. */
export function formatDomainPlan(plan, domain) {
  if (!plan || plan.error) return "";
  const name = domain && domain.trim() ? domain.trim() : "This domain";
  const lines = [
    `Domain renewal plan — ${name}`,
    `Status: ${plan.phaseInfo.label} · expiry ${plan.expiry} (${plan.daysToExpiry} days)`,
    `Risk score ${plan.riskScore}/100`,
    "",
    "TIMELINE:",
    ...plan.timeline.map((item) => `  ${item.date}  ${item.label} (${item.daysAway} days)`),
    "",
    "ERRP REMINDERS:",
    ...plan.reminders.map((item) => `  ${item.date}  ${item.label}`),
    "",
    "DO THIS:",
    ...plan.actions.map((item) => `  - ${item}`),
  ];
  if (plan.transfer) {
    lines.push(
      "",
      "TRANSFER:",
      `  Inter-registrar lock ends ${plan.transfer.lockEnd}${plan.transfer.locked ? ` (${plan.transfer.lockDaysLeft} days to go)` : " — clear"}`,
      `  Start any transfer by ${plan.transfer.safeTransferBy} to leave room for the approval window`,
    );
  }
  return lines.join("\n");
}

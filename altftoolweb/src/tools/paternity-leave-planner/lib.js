/**
 * Paternity leave planning maths.
 *
 * Checks a set of requested leave blocks against four things every paternity
 * leave rule has: a total day allowance, a window measured from the birth date,
 * a minimum block length, and a maximum number of separate blocks.
 *
 * Pure module — dates come in as ISO "YYYY-MM-DD" strings, nothing reads the clock.
 */

const MS_PER_DAY = 86400000;

export const DAYS_PER_WEEK = 7;

/**
 * Preset rules. Each preset records the source of its numbers; a plan is only as
 * accurate as the policy you pick, so "custom" exists for company policies.
 */
export const PATERNITY_POLICIES = [
  {
    id: "india-ccs",
    label: "India — Central Government (CCS Leave Rules, Rule 43-A)",
    totalDays: 15,
    windowLength: 6,
    windowUnit: "months",
    earliestBeforeBirthDays: 15,
    minBlockDays: 1,
    maxBlocks: 1,
    note:
      "15 days for a male central government servant with fewer than two surviving children, from 15 days before delivery up to 6 months after it. There is no equivalent statutory paternity leave for private-sector employees in India.",
  },
  {
    id: "uk-statutory",
    label: "UK — Statutory Paternity Leave",
    totalDays: 14,
    windowLength: 52,
    windowUnit: "weeks",
    earliestBeforeBirthDays: 0,
    minBlockDays: 7,
    blockStepDays: 7,
    maxBlocks: 2,
    note:
      "Two weeks, taken as one block of two weeks or two separate blocks of one week, within 52 weeks of the birth. Each block must be a whole week.",
  },
  {
    id: "singapore-gppl",
    label: "Singapore — Government-Paid Paternity Leave",
    totalDays: 28,
    windowLength: 12,
    windowUnit: "months",
    earliestBeforeBirthDays: 0,
    minBlockDays: 1,
    maxBlocks: 4,
    note:
      "Four weeks for eligible fathers of Singaporean children, taken in one stretch or flexibly in blocks within 12 months of the birth.",
  },
  {
    id: "custom",
    label: "Custom company policy",
    totalDays: 10,
    windowLength: 12,
    windowUnit: "months",
    earliestBeforeBirthDays: 0,
    minBlockDays: 1,
    maxBlocks: 3,
    note: "Enter the numbers from your own HR policy document.",
  },
];

export function getPolicy(id) {
  return PATERNITY_POLICIES.find((policy) => policy.id === id) ?? null;
}

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const probe = new Date(ts);
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

export function toISODate(ts) {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toISOString().slice(0, 10);
}

export function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

/** Calendar-month addition with end-of-month clamping. */
export function addMonths(ts, months) {
  const date = new Date(ts);
  const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(
    monthStart.getUTCFullYear(),
    monthStart.getUTCMonth(),
    Math.min(date.getUTCDate(), lastDay),
  );
}

export function daysBetween(fromTs, toTs) {
  return Math.round((toTs - fromTs) / MS_PER_DAY);
}

/**
 * Build the permitted window around a birth date.
 * @returns {{windowStart:number, windowEnd:number}} UTC timestamps
 */
export function leaveWindow(birthTs, policy) {
  const windowStart = addDays(birthTs, -Math.max(0, policy.earliestBeforeBirthDays || 0));
  const windowEnd =
    policy.windowUnit === "weeks"
      ? addDays(birthTs, policy.windowLength * DAYS_PER_WEEK)
      : addMonths(birthTs, policy.windowLength);
  return { windowStart, windowEnd };
}

/**
 * Validate a set of leave blocks against a policy.
 *
 * @param {object} input
 * @param {string} input.birthDate ISO date of birth / expected delivery
 * @param {object} input.policy    { totalDays, windowLength, windowUnit, earliestBeforeBirthDays, minBlockDays, blockStepDays, maxBlocks }
 * @param {Array}  input.blocks    [{ id, start: ISO date, days: number }]
 * @returns {object} plan, or { error } when the inputs cannot be evaluated
 */
export function planPaternityLeave({ birthDate, policy, blocks = [] } = {}) {
  if (!policy || typeof policy !== "object") {
    return { error: "Choose a leave policy first." };
  }

  const totalDays = Number(policy.totalDays);
  const minBlockDays = Number(policy.minBlockDays);
  const maxBlocks = Number(policy.maxBlocks);
  const windowLength = Number(policy.windowLength);
  const blockStepRaw = policy.blockStepDays;
  const blockStepDays =
    blockStepRaw === undefined || blockStepRaw === null || blockStepRaw === ""
      ? 1
      : Number(blockStepRaw);

  if (!Number.isFinite(totalDays) || totalDays <= 0 || totalDays > 365) {
    return { error: "Total paternity leave allowance must be between 1 and 365 days." };
  }
  if (!Number.isFinite(minBlockDays) || minBlockDays < 1 || minBlockDays > totalDays) {
    return { error: "Minimum block length must be at least 1 day and no more than the allowance." };
  }
  if (!Number.isFinite(blockStepDays) || blockStepDays < 1 || blockStepDays > totalDays) {
    return { error: "Block length step must be at least 1 day and no more than the allowance." };
  }
  if (!Number.isFinite(maxBlocks) || maxBlocks < 1 || maxBlocks > 20) {
    return { error: "Number of separate blocks allowed must be between 1 and 20." };
  }
  if (!Number.isFinite(windowLength) || windowLength <= 0) {
    return { error: "The window after the birth must be a positive number." };
  }

  const birthTs = parseISODate(birthDate);
  if (birthTs === null) {
    return { error: "Enter a valid birth or expected delivery date." };
  }

  const { windowStart, windowEnd } = leaveWindow(birthTs, policy);

  const evaluated = [];
  for (const block of blocks) {
    const startTs = parseISODate(block?.start);
    const days = Number(block?.days);
    const issues = [];

    if (startTs === null) {
      evaluated.push({
        id: block?.id,
        start: block?.start ?? "",
        days: Number.isFinite(days) ? days : 0,
        end: "",
        valid: false,
        issues: ["Enter a valid start date."],
      });
      continue;
    }
    if (!Number.isFinite(days) || days < 1 || !Number.isInteger(days)) {
      evaluated.push({
        id: block?.id,
        start: toISODate(startTs),
        days: 0,
        end: "",
        valid: false,
        issues: ["Block length must be a whole number of days, 1 or more."],
      });
      continue;
    }
    if (days > totalDays) {
      issues.push(`Longer than the ${totalDays}-day allowance.`);
    }
    if (days < minBlockDays) {
      issues.push(`Shorter than the ${minBlockDays}-day minimum block.`);
    }
    if (blockStepDays > 1 && days % blockStepDays !== 0) {
      issues.push(`Must be a whole number of ${blockStepDays}-day blocks (not ${days} days).`);
    }

    const endTs = addDays(startTs, days - 1);
    if (startTs < windowStart) {
      issues.push(`Starts before the earliest permitted date (${toISODate(windowStart)}).`);
    }
    if (endTs > windowEnd) {
      issues.push(`Ends after the window closes on ${toISODate(windowEnd)}.`);
    }

    evaluated.push({
      id: block?.id,
      start: toISODate(startTs),
      startTs,
      end: toISODate(endTs),
      endTs,
      days,
      valid: issues.length === 0,
      issues,
    });
  }

  // Overlap check on blocks that parsed cleanly, in date order.
  const datedBlocks = evaluated.filter((item) => Number.isFinite(item.startTs));
  const ordered = [...datedBlocks].sort((a, b) => a.startTs - b.startTs);
  let runningMaxEnd = ordered.length > 0 ? ordered[0].endTs : -Infinity;
  let runningMaxSource = ordered.length > 0 ? ordered[0] : null;
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].startTs <= runningMaxEnd) {
      const message = `Overlaps the block starting ${runningMaxSource.start}.`;
      ordered[i].issues.push(message);
      ordered[i].valid = false;
    }
    if (ordered[i].endTs > runningMaxEnd) {
      runningMaxEnd = ordered[i].endTs;
      runningMaxSource = ordered[i];
    }
  }

  const usedDays = datedBlocks.reduce((sum, item) => sum + item.days, 0);
  const remainingDays = totalDays - usedDays;

  const planIssues = [];
  if (evaluated.length > maxBlocks) {
    planIssues.push(
      `Policy allows ${maxBlocks} separate block${maxBlocks === 1 ? "" : "s"}; you have planned ${evaluated.length}.`,
    );
  }
  if (usedDays > totalDays) {
    planIssues.push(`Planned ${usedDays} days against a ${totalDays}-day allowance.`);
  }

  const blockIssueCount = evaluated.reduce((sum, item) => sum + item.issues.length, 0);

  return {
    birthDate: toISODate(birthTs),
    windowStart: toISODate(windowStart),
    windowEnd: toISODate(windowEnd),
    windowDays: daysBetween(windowStart, windowEnd) + 1,
    totalDays,
    minBlockDays,
    maxBlocks,
    usedDays,
    remainingDays,
    blocks: evaluated.map(({ startTs, endTs, ...rest }) => rest),
    orderedBlocks: ordered.map((item) => ({
      id: item.id,
      start: item.start,
      end: item.end,
      days: item.days,
    })),
    planIssues,
    compliant: planIssues.length === 0 && blockIssueCount === 0 && evaluated.length > 0,
  };
}

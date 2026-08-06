/**
 * Study/break ratio optimisation.
 *
 * The tool matches the longest work block you can genuinely sustain (your
 * focus span) to the best-known work/break protocol, then lays the chosen
 * ratio across your available time as an alternating schedule.
 *
 * Protocols and their sources:
 *  - 25/5   — the Pomodoro Technique (Francesco Cirillo).
 *  - 50/10  — the common university study-skills recommendation of ~50-minute
 *             lectures/blocks with 10-minute breaks.
 *  - 52/17  — the ratio DeskTime reported from its most productive users'
 *             tracked computer time (2014 analysis).
 *  - 90/20  — aligned with the ~90-minute ultradian alertness cycle
 *             (basic rest-activity cycle described by Nathaniel Kleitman).
 *
 * Selection rule: the protocol with the longest work block that does not
 * exceed the focus span. Below 25 minutes a custom block is built at the
 * Pomodoro-style 5:1 work:break ratio.
 */

export const PROTOCOLS = [
  {
    id: "pomodoro",
    label: "Pomodoro 25/5",
    workMinutes: 25,
    breakMinutes: 5,
    basis: "Francesco Cirillo's Pomodoro Technique — the classic for short focus spans.",
  },
  {
    id: "fifty-ten",
    label: "50/10 blocks",
    workMinutes: 50,
    breakMinutes: 10,
    basis: "Standard university study-skills advice: near-lecture-length blocks with 10-minute breaks.",
  },
  {
    id: "desktime",
    label: "52/17 rhythm",
    workMinutes: 52,
    breakMinutes: 17,
    basis: "The work/break ratio DeskTime observed among its most productive tracked users.",
  },
  {
    id: "ultradian",
    label: "90/20 ultradian",
    workMinutes: 90,
    breakMinutes: 20,
    basis: "Matches the ~90-minute ultradian alertness cycle; for trained deep workers.",
  },
];

/** Below the shortest standard protocol we build a custom 5:1 block. */
export const CUSTOM_RATIO_WORK_PER_BREAK = 5; // Pomodoro's 25:5 ratio.
export const MIN_CUSTOM_BREAK_MINUTES = 2;

/** Sanity bounds. */
export const MIN_FOCUS_SPAN_MINUTES = 5;
export const MAX_FOCUS_SPAN_MINUTES = 180;
export const MIN_TOTAL_MINUTES = 15;
export const MAX_TOTAL_MINUTES = 720; // 12 hours of planning at most.

/** Pick the protocol for a given focus span (pure). */
export function pickProtocol(focusSpanMinutes) {
  const eligible = PROTOCOLS.filter((p) => p.workMinutes <= focusSpanMinutes);
  if (eligible.length > 0) {
    return eligible.reduce((a, b) => (b.workMinutes > a.workMinutes ? b : a));
  }
  // Never round a stated focus limit upward: someone who enters 24.9 minutes
  // should not be prescribed a 25-minute block that exceeds that limit.
  const work = Math.max(1, Math.floor(focusSpanMinutes));
  const brk = Math.max(
    MIN_CUSTOM_BREAK_MINUTES,
    Math.round(work / CUSTOM_RATIO_WORK_PER_BREAK),
  );
  // Integer break minutes can't always land exactly on a 5:1 ratio (e.g. work
  // minutes not divisible by 5, or the MIN_CUSTOM_BREAK_MINUTES floor), so the
  // basis states the ratio this specific plan actually produces instead of
  // asserting a fixed 5:1 that would be false for most inputs in this range.
  const actualRatio = Math.round((work / brk) * 10) / 10;
  const ratioLabel = Number.isInteger(actualRatio) ? `${actualRatio}:1` : `${actualRatio.toFixed(1)}:1`;
  return {
    id: "custom",
    label: `Custom ${work}/${brk}`,
    workMinutes: work,
    breakMinutes: brk,
    basis: `Built from your focus span, modelled on the Pomodoro-style ${CUSTOM_RATIO_WORK_PER_BREAK}:1 work:break ratio — this plan works out to roughly ${ratioLabel}.`,
  };
}

/**
 * Build the alternating schedule.
 *
 * @param {object} input
 * @param {number|string} input.focusSpanMinutes  Longest block you can hold focus.
 * @param {number|string} input.totalMinutes      Time available for the whole session.
 * @returns {object} plan, or { error }.
 */
export function buildBreakPlan({ focusSpanMinutes, totalMinutes }) {
  const span = Number(focusSpanMinutes);
  const total = Number(totalMinutes);

  if (!Number.isFinite(span) || span < MIN_FOCUS_SPAN_MINUTES || span > MAX_FOCUS_SPAN_MINUTES) {
    return {
      error: `Focus span must be between ${MIN_FOCUS_SPAN_MINUTES} and ${MAX_FOCUS_SPAN_MINUTES} minutes.`,
    };
  }
  if (!Number.isFinite(total) || total < MIN_TOTAL_MINUTES || total > MAX_TOTAL_MINUTES) {
    return {
      error: `Available time must be between ${MIN_TOTAL_MINUTES} and ${MAX_TOTAL_MINUTES} minutes.`,
    };
  }

  const protocol = pickProtocol(span);

  // Lay work/break blocks across the available time, oldest first.
  const segments = [];
  let remaining = total;
  let cursor = 0;
  while (remaining > 0) {
    const work = Math.min(protocol.workMinutes, remaining);
    segments.push({ type: "work", startMinute: cursor, minutes: work });
    cursor += work;
    remaining -= work;
    if (remaining > 0) {
      const brk = Math.min(protocol.breakMinutes, remaining);
      segments.push({ type: "break", startMinute: cursor, minutes: brk });
      cursor += brk;
      remaining -= brk;
    }
  }
  // Never end a session on a break — drop a trailing break block.
  if (segments.length > 0 && segments[segments.length - 1].type === "break") {
    const dropped = segments.pop();
    cursor -= dropped.minutes;
  }

  const studyMinutes = segments
    .filter((s) => s.type === "work")
    .reduce((sum, s) => sum + s.minutes, 0);
  const breakMinutes = segments
    .filter((s) => s.type === "break")
    .reduce((sum, s) => sum + s.minutes, 0);
  const fullCycles = segments.filter(
    (s) => s.type === "work" && s.minutes === protocol.workMinutes,
  ).length;

  return {
    protocolId: protocol.id,
    protocolLabel: protocol.label,
    protocolBasis: protocol.basis,
    workMinutes: protocol.workMinutes,
    breakMinutes: protocol.breakMinutes,
    segments,
    studyMinutes,
    totalBreakMinutes: breakMinutes,
    plannedMinutes: cursor,
    unusedMinutes: total - cursor,
    fullWorkBlocks: fullCycles,
    // Share of the user's requested total time actually spent studying (not
    // just the planned/trimmed time) so this stays consistent with the
    // "unused time" figure, which is also measured against `total`.
    studySharePercent: Math.round((studyMinutes / total) * 1000) / 10,
  };
}

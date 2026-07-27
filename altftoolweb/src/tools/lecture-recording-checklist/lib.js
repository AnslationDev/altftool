/**
 * Lecture recording pre-flight checklist.
 *
 * Scoring rule: every item carries a weight by severity, and readiness is the
 * share of total weight that is ticked. Severity weights are 3 / 2 / 1 so a
 * single critical item outranks a single optional one three to one.
 *
 * Any unticked "critical" item blocks the shoot outright, regardless of score —
 * those are the faults that cannot be repaired in post (clipped audio, a
 * silhouetted subject, a screen capture recorded below delivery resolution).
 *
 * The item text encodes standard broadcast/e-learning practice:
 *  - Dialogue peaks at −12 to −6 dBFS leaves headroom before 0 dBFS clipping.
 *  - 48 kHz is the sample rate video production runs at (44.1 kHz is the CD rate).
 *  - Capture at the delivery resolution: scaling 1080p up from a smaller window
 *    is the usual cause of unreadable code in recorded lectures.
 */

export const SEVERITY_WEIGHTS = {
  critical: 3,
  important: 2,
  optional: 1,
};

export const SEVERITY_LABELS = {
  critical: "Critical",
  important: "Important",
  optional: "Nice to have",
};

export const CHECKLIST_SECTIONS = [
  {
    id: "audio",
    title: "Audio",
    note: "Audio is the one channel students will not forgive. Fix it before anything else.",
    items: [
      { id: "a1", severity: "critical", text: "Mic 15–20 cm from your mouth and slightly off-axis, so plosives miss the capsule." },
      { id: "a2", severity: "critical", text: "Test take peaks between −12 and −6 dBFS and never touches 0 dBFS." },
      { id: "a3", severity: "critical", text: "Recording at 48 kHz — the sample rate video runs at — with 24-bit depth if offered." },
      { id: "a4", severity: "important", text: "Headphones on and monitoring live, so cable rustle and clipping are caught in the room." },
      { id: "a5", severity: "important", text: "Air conditioning, fans, fridge and phone notifications all off." },
      { id: "a7", severity: "important", text: "Clap or slate at the top of each take so audio and video sync in the edit." },
      { id: "a6", severity: "optional", text: "Soft furnishings, rug or duvet behind the mic to kill flutter echo." },
    ],
  },
  {
    id: "framing",
    title: "Framing and lighting",
    note: "Eye-line and contrast do most of the work; expensive cameras do very little of it.",
    items: [
      { id: "f1", severity: "critical", text: "Lens at eye level, with your eyes sitting on the upper-third line of frame." },
      { id: "f3", severity: "critical", text: "Key light about 45° to one side and slightly above, brighter than the background." },
      { id: "f2", severity: "important", text: "A thumb's width of head room — crown not cropped, no dead ceiling above you." },
      { id: "f4", severity: "important", text: "No window directly behind you; backlight turns you into a silhouette." },
      { id: "f5", severity: "important", text: "White balance, exposure and focus locked manually so they cannot drift mid-take." },
      { id: "f6", severity: "optional", text: "Background tidy and at least a metre behind you for depth separation." },
    ],
  },
  {
    id: "screen",
    title: "Screen capture",
    note: "Most unreadable lecture recordings are a resolution or a font-size mistake, not a camera one.",
    items: [
      { id: "s1", severity: "critical", text: "Capturing at the delivery resolution (1920×1080), not a scaled or partial window." },
      { id: "s2", severity: "critical", text: "Editor and browser text enlarged so body text is at least 24 px at 1080p." },
      { id: "s3", severity: "important", text: "Do Not Disturb on; chat, mail and calendar pop-ups silenced." },
      { id: "s4", severity: "important", text: "Bookmarks bar, personal tabs, desktop clutter, tokens and API keys hidden." },
      { id: "s5", severity: "important", text: "Cursor highlight or click visualisation switched on." },
      { id: "s6", severity: "optional", text: "Notes on a second screen so you never look away from the captured display." },
    ],
  },
  {
    id: "files",
    title: "Power, storage and continuity",
    note: "The cheapest insurance in the whole list. Check it once, before every session.",
    items: [
      { id: "c1", severity: "critical", text: "Free storage confirmed at roughly twice the expected file size." },
      { id: "c2", severity: "critical", text: "Batteries charged and mains power connected wherever the camera allows it." },
      { id: "c3", severity: "important", text: "File naming convention agreed before the first take, not after." },
      { id: "c4", severity: "important", text: "Ten-second test take recorded AND played back on the actual media." },
      { id: "c5", severity: "optional", text: "Backup recorder or phone rolling as a safety audio track." },
    ],
  },
];

export const ALL_ITEMS = CHECKLIST_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title })),
);

export const ALL_ITEM_IDS = ALL_ITEMS.map((item) => item.id);

/** Readiness bands, applied only once every critical item is ticked. */
export const READINESS_BANDS = [
  { min: 100, status: "Ready to record", tone: "success" },
  { min: 85, status: "Ready — minor gaps", tone: "success" },
  { min: 60, status: "Nearly there", tone: "warn" },
  { min: 0, status: "Not ready yet", tone: "warn" },
];

const weightOf = (item) => SEVERITY_WEIGHTS[item.severity] ?? 0;

/**
 * Score a set of ticked item ids.
 * @param {string[]} checkedIds
 * @returns {{error: string} | object}
 */
export function scoreChecklist(checkedIds) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Checklist state is unreadable — reset the list and start again." };
  }

  const ticked = new Set(checkedIds.filter((id) => ALL_ITEM_IDS.includes(id)));

  const totalWeight = ALL_ITEMS.reduce((sum, item) => sum + weightOf(item), 0);
  if (!(totalWeight > 0)) {
    return { error: "The checklist has no scorable items." };
  }

  const earnedWeight = ALL_ITEMS.reduce(
    (sum, item) => sum + (ticked.has(item.id) ? weightOf(item) : 0),
    0,
  );
  const score = Math.round((earnedWeight / totalWeight) * 100);

  const criticalItems = ALL_ITEMS.filter((item) => item.severity === "critical");
  const blockers = criticalItems.filter((item) => !ticked.has(item.id));

  const sections = CHECKLIST_SECTIONS.map((section) => {
    const sectionWeight = section.items.reduce((sum, item) => sum + weightOf(item), 0);
    const sectionEarned = section.items.reduce(
      (sum, item) => sum + (ticked.has(item.id) ? weightOf(item) : 0),
      0,
    );
    return {
      id: section.id,
      title: section.title,
      note: section.note,
      doneCount: section.items.filter((item) => ticked.has(item.id)).length,
      itemCount: section.items.length,
      percent: sectionWeight > 0 ? Math.round((sectionEarned / sectionWeight) * 100) : 0,
      items: section.items.map((item) => ({
        ...item,
        checked: ticked.has(item.id),
        weight: weightOf(item),
        severityLabel: SEVERITY_LABELS[item.severity],
      })),
    };
  });

  const band = READINESS_BANDS.find((entry) => score >= entry.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1];
  const blocked = blockers.length > 0;

  const summaryText = [
    `Lecture recording pre-flight — ${score}% ready`,
    blocked
      ? `HOLD: ${blockers.length} critical item${blockers.length === 1 ? "" : "s"} outstanding`
      : band.status,
    "",
    ...sections.map(
      (section) =>
        `${section.title}: ${section.doneCount}/${section.itemCount} done (${section.percent}%)`,
    ),
    ...(blocked ? ["", "Outstanding critical items:", ...blockers.map((item) => `- ${item.text}`)] : []),
  ].join("\n");

  return {
    score,
    earnedWeight,
    totalWeight,
    doneCount: ticked.size,
    itemCount: ALL_ITEMS.length,
    criticalCount: criticalItems.length,
    criticalDone: criticalItems.length - blockers.length,
    blockers,
    blocked,
    status: blocked ? "Hold — critical item outstanding" : band.status,
    tone: blocked ? "danger" : band.tone,
    sections,
    summaryText,
  };
}

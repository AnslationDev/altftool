/**
 * Slack AI Prompt Builder — Slack platform limits, output budgeting and
 * prompt assembly for thread summaries, recaps and action extraction.
 *
 * Platform constants below are Slack's documented API limits.
 */

/** Maximum characters in the `text` field of one Slack message (chat.postMessage). */
export const SLACK_MESSAGE_MAX_CHARS = 40000;
/** Maximum characters in the text of one Block Kit `section` block. */
export const SLACK_SECTION_BLOCK_MAX_CHARS = 3000;
/** Maximum Block Kit blocks in one message. */
export const SLACK_MAX_BLOCKS_PER_MESSAGE = 50;
/** Maximum characters in a Slack channel name. */
export const SLACK_CHANNEL_NAME_MAX = 80;

/**
 * Estimation constants used to size the requested output. These are this
 * tool's own averages for English prose written in Slack mrkdwn, not Slack
 * limits: mean English word length is a little under five letters, and one
 * space plus mrkdwn markers round it to six characters per word.
 */
export const AVERAGE_CHARS_PER_WORD = 6;
/** Characters spent on a bullet marker, indent and newline. */
export const BULLET_OVERHEAD_CHARS = 4;
/** Characters spent on a bold section heading and its blank line. */
export const SECTION_HEADING_CHARS = 40;

/** Input guard rails so the estimate stays meaningful. */
export const MIN_BULLETS = 1;
export const MAX_BULLETS = 200;
export const MIN_WORDS_PER_BULLET = 3;
export const MAX_WORDS_PER_BULLET = 60;

export const TASK_TYPES = [
  {
    id: "thread-summary",
    label: "Summarise a thread",
    sections: ["What this thread is about", "Where it landed", "Still open"],
    instruction:
      "Summarise this Slack thread for someone who was not in it and will not read the messages.",
    deliverable:
      "the outcome first, then the reasoning that produced it, then anything still unresolved",
    rules: [
      "Lead with the conclusion. Do not narrate the thread in the order it happened.",
      "Attribute every decision to the person who made it, using their display name.",
      "If the thread reached no conclusion, say so plainly rather than manufacturing one.",
    ],
  },
  {
    id: "channel-recap",
    label: "Recap a channel",
    sections: ["Decisions", "In progress", "Needs attention"],
    instruction:
      "Recap what happened in this channel over the time window below for someone catching up after time away.",
    deliverable: "a short recap grouped by decisions, work in progress and anything needing attention",
    rules: [
      "Group by topic, not by day or by person.",
      "Skip social chatter, deploy bots and standing reminders.",
      "Say how many separate topics you merged into each bullet.",
    ],
  },
  {
    id: "action-items",
    label: "Extract action items",
    sections: ["Owned and dated", "Owner unclear", "No date agreed"],
    instruction:
      "Extract every action item from these messages and separate the ones that are actually actionable from the ones that are not.",
    deliverable: "one line per action as: owner, the action in a verb phrase, and the due date",
    rules: [
      "Only list an action if someone actually committed to it — do not promote a suggestion into a task.",
      "Put actions with no named owner or no agreed date in their own group rather than guessing.",
      "Quote the message that created each action so it can be checked.",
    ],
  },
  {
    id: "decision-log",
    label: "Build a decision log",
    sections: ["Decision", "Why", "Who agreed", "What it rules out"],
    instruction:
      "Turn this conversation into a decision log entry that will still make sense in six months.",
    deliverable: "each decision with the reasoning, the people who agreed, and the options it rejected",
    rules: [
      "Record the options that were considered and dropped, not only the one chosen.",
      "Mark a decision as provisional if the thread shows it still needs sign-off.",
      "Use the date the decision was made, not today's date.",
    ],
  },
  {
    id: "standup-digest",
    label: "Standup digest",
    sections: ["Shipped", "In flight", "Blocked"],
    instruction: "Roll these standup updates into one digest for the wider team.",
    deliverable: "a digest grouped into shipped, in flight and blocked, with the owner on each line",
    rules: [
      "Merge duplicate updates about the same piece of work into a single line.",
      "Put anything described as blocked at the top of its group with the blocker named.",
      "Do not add status you cannot see in the messages.",
    ],
  },
  {
    id: "escalation-summary",
    label: "Escalation summary",
    sections: ["Impact", "Timeline", "Current status", "Ask"],
    instruction:
      "Write an escalation summary from this incident or complaint thread for someone senior who has 30 seconds.",
    deliverable: "impact first, then a timestamped timeline, then current status, then the specific ask",
    rules: [
      "State the customer or business impact in the first sentence, with a number if one exists.",
      "Use message timestamps for the timeline; do not estimate times.",
      "End with one concrete ask — a decision, a person or a resource.",
    ],
  },
  {
    id: "feedback-rollup",
    label: "Roll up customer feedback",
    sections: ["Themes", "Direct quotes", "One-offs"],
    instruction: "Group the customer feedback in these messages into themes.",
    deliverable: "themes ordered by how often they appear, each with the count and two real quotes",
    rules: [
      "Count how many separate people raised each theme and show the count.",
      "Keep quotes verbatim; do not tidy the customer's wording.",
      "Keep single mentions in a separate group rather than inflating a theme.",
    ],
  },
];

export const OUTPUT_FORMATS = [
  {
    id: "thread-reply",
    label: "A reply in the thread",
    limit: SLACK_MESSAGE_MAX_CHARS,
    note: "Posted as one message, so it must fit the message character limit.",
  },
  {
    id: "channel-post",
    label: "A new channel post",
    limit: SLACK_MESSAGE_MAX_CHARS,
    note: "Long posts get collapsed with a Show more link after a few lines.",
  },
  {
    id: "block-kit",
    label: "Block Kit blocks",
    limit: SLACK_SECTION_BLOCK_MAX_CHARS * SLACK_MAX_BLOCKS_PER_MESSAGE,
    note: "Each section block caps at 3,000 characters and a message holds 50 blocks.",
  },
  {
    id: "canvas",
    label: "A canvas or doc",
    limit: SLACK_MESSAGE_MAX_CHARS,
    note: "Long-form, so structure matters more than brevity.",
  },
];

export const TONES = [
  { id: "neutral", label: "Neutral and factual", line: "Neutral and factual. No hype, no apology." },
  { id: "brief", label: "Extremely brief", line: "As short as possible. Cut every word that is not load-bearing." },
  { id: "exec", label: "Executive", line: "Written for a senior reader: conclusion first, detail only if it changes the conclusion." },
  { id: "friendly", label: "Friendly team voice", line: "Warm and plain-spoken, the way a teammate would write it." },
];

const CHANNEL_STRIP_RE = /[^a-z0-9_-]+/g;

/**
 * Slack channel names are lowercase, hold no spaces or periods, and are
 * limited to 80 characters. Returns the name Slack would accept.
 */
export function normalizeChannelName(raw) {
  const lowered = String(raw ?? "")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase();
  if (!lowered) return "";
  const cleaned = lowered
    .replace(/[\s.]+/g, "-")
    .replace(CHANNEL_STRIP_RE, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned.slice(0, SLACK_CHANNEL_NAME_MAX);
}

/**
 * Estimate how long the requested summary will be and how it packs into Slack.
 * Pure arithmetic on the estimation constants above.
 */
export function planSlackOutput({ sectionCount = 3, bulletCount = 8, wordsPerBullet = 18 } = {}) {
  const sections = Math.trunc(Number(sectionCount));
  const bullets = Math.trunc(Number(bulletCount));
  const words = Math.trunc(Number(wordsPerBullet));

  if (!Number.isFinite(sections) || sections < 1) {
    return { error: "A summary needs at least one section." };
  }
  if (!Number.isFinite(bullets) || bullets < MIN_BULLETS || bullets > MAX_BULLETS) {
    return { error: `Ask for between ${MIN_BULLETS} and ${MAX_BULLETS} bullet points.` };
  }
  if (!Number.isFinite(words) || words < MIN_WORDS_PER_BULLET || words > MAX_WORDS_PER_BULLET) {
    return {
      error: `Each bullet should be between ${MIN_WORDS_PER_BULLET} and ${MAX_WORDS_PER_BULLET} words.`,
    };
  }

  const headingChars = sections * SECTION_HEADING_CHARS;
  const bulletChars = bullets * (words * AVERAGE_CHARS_PER_WORD + BULLET_OVERHEAD_CHARS);
  const estimatedChars = headingChars + bulletChars;
  const estimatedWords = bullets * words;
  const sectionBlocksNeeded = Math.ceil(estimatedChars / SLACK_SECTION_BLOCK_MAX_CHARS);

  return {
    sections,
    bullets,
    wordsPerBullet: words,
    estimatedChars,
    estimatedWords,
    headingChars,
    bulletChars,
    sectionBlocksNeeded,
    fitsOneMessage: estimatedChars <= SLACK_MESSAGE_MAX_CHARS,
    fitsOneSectionBlock: estimatedChars <= SLACK_SECTION_BLOCK_MAX_CHARS,
    fitsBlockLimit: sectionBlocksNeeded <= SLACK_MAX_BLOCKS_PER_MESSAGE,
  };
}

/**
 * Assemble the finished prompt.
 * Returns { error } for unusable input rather than a partial prompt.
 */
export function buildSlackPrompt({
  channel = "",
  topic = "",
  participants = "",
  messageCount = 40,
  timeWindow = "the last 7 days",
  taskId = "thread-summary",
  audience = "",
  outputFormat = "thread-reply",
  bulletCount = 8,
  wordsPerBullet = 18,
  toneId = "neutral",
  useMrkdwn = true,
  keepNames = true,
  extraContext = "",
} = {}) {
  const channelName = normalizeChannelName(channel);
  if (!channelName) {
    return { error: "Enter the channel name the messages come from." };
  }

  const task = TASK_TYPES.find((entry) => entry.id === taskId);
  if (!task) return { error: "Pick what the assistant should produce." };

  const topicText = String(topic ?? "").trim();
  if (!topicText) return { error: "Say in one line what the thread or channel is about." };

  const audienceText = String(audience ?? "").trim();
  if (!audienceText) return { error: "Say who will read the summary — it changes what gets cut." };

  const messages = Math.trunc(Number(messageCount));
  if (!Number.isFinite(messages) || messages < 1) {
    return { error: "Enter how many messages the assistant is reading (at least 1)." };
  }

  const plan = planSlackOutput({
    sectionCount: task.sections.length,
    bulletCount,
    wordsPerBullet,
  });
  if (plan.error) return { error: plan.error };

  const format = OUTPUT_FORMATS.find((entry) => entry.id === outputFormat) || OUTPUT_FORMATS[0];
  const tone = TONES.find((entry) => entry.id === toneId) || TONES[0];

  const people = String(participants ?? "")
    .split(/[\n,]+/)
    .map((part) => part.trim().replace(/^@+/, ""))
    .filter(Boolean);

  const warnings = [];
  if (normalizeChannelName(channel) !== String(channel ?? "").trim().replace(/^#+/, "")) {
    warnings.push(`Slack would store that channel as #${channelName} — lowercase, no spaces or periods.`);
  }
  if (!plan.fitsOneMessage) {
    warnings.push(
      `About ${plan.estimatedChars.toLocaleString("en-US")} characters is over the ${SLACK_MESSAGE_MAX_CHARS.toLocaleString("en-US")} character limit for one Slack message — split it or cut bullets.`,
    );
  }
  if (format.id === "block-kit" && !plan.fitsOneSectionBlock) {
    warnings.push(
      `At roughly ${plan.estimatedChars.toLocaleString("en-US")} characters this needs ${plan.sectionBlocksNeeded} section blocks; one block holds ${SLACK_SECTION_BLOCK_MAX_CHARS.toLocaleString("en-US")} characters.`,
    );
  }
  if (format.id === "block-kit" && !plan.fitsBlockLimit) {
    warnings.push(
      `${plan.sectionBlocksNeeded} blocks exceeds the ${SLACK_MAX_BLOCKS_PER_MESSAGE} block limit for one message.`,
    );
  }
  if (plan.estimatedWords > messages * 12) {
    warnings.push(
      `You are asking for about ${plan.estimatedWords.toLocaleString("en-US")} words from only ${messages.toLocaleString("en-US")} messages — the assistant will have to pad. Ask for fewer or shorter bullets.`,
    );
  }
  if (people.length === 0) {
    warnings.push("No participants listed, so the assistant cannot attribute decisions to anyone by name.");
  }

  const lines = [];
  lines.push(
    `You are reading ${messages.toLocaleString("en-US")} Slack messages from #${channelName}, covering ${String(timeWindow).trim() || "the period given below"}.`,
  );
  lines.push(`Subject: ${topicText}`);
  if (people.length > 0) {
    lines.push(`People in the conversation: ${people.map((person) => `@${person}`).join(", ")}.`);
  }
  lines.push(`This is for: ${audienceText}.`);
  lines.push("");
  lines.push(`Task: ${task.instruction}`);
  lines.push(`Return: ${task.deliverable}.`);
  lines.push("");
  lines.push("Structure it under exactly these headings:");
  task.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section}`);
  });
  lines.push("");
  lines.push(
    `Length: about ${plan.bullets} bullet${plan.bullets === 1 ? "" : "s"} in total, roughly ${plan.wordsPerBullet} words each — around ${plan.estimatedWords.toLocaleString("en-US")} words and ${plan.estimatedChars.toLocaleString("en-US")} characters.`,
  );
  lines.push(`Destination: ${format.label}. ${format.note}`);
  lines.push(`Tone: ${tone.line}`);
  lines.push("");
  lines.push("Rules:");
  task.rules.forEach((rule) => lines.push(`- ${rule}`));
  if (keepNames) {
    lines.push("- Keep real display names and @ mentions exactly as they appear; do not anonymise them.");
  } else {
    lines.push("- Replace every name with a role (for example 'the on-call engineer') so the summary can be shared outside the team.");
  }
  if (useMrkdwn) {
    lines.push(
      "- Use Slack mrkdwn, not standard Markdown: *bold*, _italic_, ~strike~, `code`, > for a quote. Slack does not render ** for bold or # for headings.",
    );
  } else {
    lines.push("- Plain text only. No markup characters of any kind.");
  }
  lines.push("- Do not invent anything that is not in the messages. If something is unclear, list it as an open question instead of resolving it.");
  lines.push("- Say explicitly when the messages do not contain enough information to fill a heading.");

  const context = String(extraContext ?? "").trim();
  if (context) {
    lines.push("");
    lines.push(`Extra context: ${context}`);
  }

  const prompt = lines.join("\n");

  return {
    prompt,
    warnings,
    plan,
    channelName,
    participantCount: people.length,
    format,
    characterCount: prompt.length,
  };
}

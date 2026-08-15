const seo = {
  title: "Standup Notes Generator for Slack, Markdown",
  metaDescription:
    "Paste rough bullets for yesterday, today and blockers and get a daily scrum update in Slack mrkdwn, Markdown, Jira wiki markup or plain text.",
  steps: [
    "Fill the Yesterday, Today and Blockers boxes one item per line — leading -, *, • and 1. markers are stripped automatically.",
    "Pick an Output format: Slack (mrkdwn), Markdown, Plain text or Jira wiki markup, and optionally include the date in the heading.",
    "Press Copy result to take the formatted update from the preview; the Characters count warns before a paste would exceed Slack's 40,000-character limit.",
  ],
  intro:
    "The Standup Notes Generator formats a daily scrum update around the three standard questions — what I did, what I will do next, and what is blocking me — and outputs it in Slack mrkdwn, Markdown, Jira wiki markup or plain text. Bullet characters, hyphens and 1. numbering are stripped from whatever you paste, so a messy scratchpad becomes a consistent update in one step. It suits developers, designers and project managers on distributed teams who post a written standup instead of attending a call.",
  useCases: [
    "Posting an async written standup in a Slack channel when your team spans several time zones",
    "Pasting yesterday's terminal notes and rough todos into a structured update before a 15-minute scrum",
    "Adding a formatted daily update as a Jira comment on the sprint ticket you are working on",
  ],
  benefits: [
    ["Correct markup per target", "Slack bold uses a single asterisk while Markdown uses two — each format is emitted with the syntax that platform actually parses."],
    ["Messy input accepted", "Leading -, *, • and 1. markers are removed automatically, so you can paste straight from notes."],
    ["Length checked for Slack", "Character count is shown and anything past Slack's 40,000-character message limit is flagged before you paste it."],
  ],
  faqs: [
    [
      "What are the three questions in a daily standup?",
      "What did I do since the last standup, what will I do before the next one, and what is blocking my progress. The Scrum Guide does not mandate these exact questions, but they remain the most common structure for the 15-minute Daily Scrum that Scrum does prescribe.",
    ],
    [
      "How do I write a good async standup update?",
      "Name the outcome rather than the activity — 'refund API on staging, awaiting QA' beats 'worked on refunds' — and always give a blocker an owner and a next action. Two to four items per section is usually enough; long lists get skimmed.",
    ],
    [
      "Why does Slack bold use one asterisk instead of two?",
      "Slack messages use mrkdwn, not Markdown, and mrkdwn defines *bold*, _italic_ and ~strike~. Typing **bold** in Slack shows the asterisks literally, which is why this tool switches syntax when you change the output format.",
    ],
    [
      "How long can a Slack standup message be?",
      "A Slack message tops out at 40,000 characters via chat.postMessage, and individual section blocks are limited to 3,000. A normal standup is a few hundred characters, but the tool shows the count and warns if a pasted update would be rejected.",
    ],
  ],
};

export default seo;

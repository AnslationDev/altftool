const seo = {
  title: "Slack AI Prompt Builder for Summaries and Recaps",
  metaDescription:
    "Build thread summary, recap, action-item or escalation prompts with fixed headings, sized against Slack's 40,000-character message limit.",
  steps: [
    "Fill in Channel, 'Time window' and 'How many messages?', then pick under 'What should it produce?' — Summarise a thread, Recap a channel, Extract action items, Build a decision log, Escalation summary and the rest each force their own fixed headings.",
    "Describe 'What is the conversation about?' and 'Who reads the summary?', list the 'People in the conversation' so decisions can be attributed, set 'Total bullet points' and 'Words per bullet', and leave 'Use Slack mrkdwn formatting' ticked so the answer uses *bold* rather than Markdown.",
    "Check the Requested length panel — Estimated characters, 'Fits one Slack message' against the 40,000-character limit, and 'Section blocks needed' for the 3,000-character block cap — then press 'Copy prompt' to take the text shown under 'Your prompt'.",
  ],
  intro:
    "Slack AI Prompt Builder writes the prompt for a thread summary, channel recap, action-item list or escalation note, fixing the headings the answer must use and the number of bullets it may contain. It then sizes that answer against Slack's real limits — 40,000 characters in one message, 3,000 characters in a Block Kit section block and 50 blocks per message — so you find out before posting that a recap will not fit. It is for anyone who gets summaries back that are three times too long, attribute decisions to nobody, or quietly invent conclusions the thread never reached.",
  useCases: [
    "Turn a 200-message launch thread into a four-heading decision log an exec can read in thirty seconds.",
    "Pull action items out of a standup channel and keep the ones with no owner or no date in a separate group instead of guessing.",
    "Check that a channel recap sized at 8 bullets of 18 words will fit a single Slack message before you paste it.",
    "Ask for the same escalation summary format every time so incident notes stay comparable week to week.",
  ],
  benefits: [
    ["Fixed headings", "Each task type forces the same section structure, so summaries stay comparable instead of drifting."],
    ["Length you can check", "Bullets times words gives an estimated character count and the number of section blocks it needs."],
    ["Correct Slack formatting", "Reminds the assistant that Slack uses *bold* and _italic_, not the ** and # of standard Markdown."],
  ],
  faqs: [
    [
      "What is the character limit for a Slack message?",
      "One Slack message holds up to 40,000 characters in its text field. If you post with Block Kit instead, each section block caps at 3,000 characters and a single message holds at most 50 blocks, so a long recap has to be split across blocks.",
    ],
    [
      "Why does my AI summary use ** for bold and it does not work in Slack?",
      "Slack renders mrkdwn, not standard Markdown. Bold is a single asterisk on each side (*bold*), italic is underscores (_italic_), strikethrough is tildes (~strike~) and there are no # headings. Assistants default to Markdown unless the prompt says otherwise, which is why this tool adds that instruction.",
    ],
    [
      "How do I stop a summary inventing decisions the thread never made?",
      "Tell it explicitly to list unresolved points as open questions and to say when a heading cannot be filled. A summary asked for a fixed set of headings will otherwise fabricate content for the empty ones, which is the most common failure in thread summarisation.",
    ],
    [
      "Is it safe to paste work conversations into an AI assistant?",
      "That depends on your employer's policy and the tool's data handling, not on this page. This builder never receives your messages — it only assembles the instruction text in your browser — but you should confirm your workspace rules before pasting internal threads into any external assistant.",
    ],
  ],
};

export default seo;

const seo = {
  title: "Meeting Transcript to Action Items, Owners, Dates",
  metaDescription:
    "Paste a transcript and get action items, decisions and key points split out, with @mentions as owners and date phrases as deadlines — in-browser.",
  steps: [
    "Paste your transcript into Paste Meeting Transcript, one utterance per line, or press Load Sample to load the built-in sprint-planning example.",
    "Press Extract Actions; each line is tested against action cues (action item, todo, follow up, responsible, [x]) first, then decision cues (decision, agreed, decided, concluded, going with), then key-point cues, so it lands in exactly one bucket.",
    "Stat cards count Action Items, Decisions, Key Points and Owners, each item card carries its @owner and deadline badges, and Copy Summary or Download Report saves the result as meeting-summary.txt.",
  ],
  intro:
    "The Meeting Transcript Action Extractor scans a pasted meeting transcript line by line and sorts it into action items, decisions and key points using cue-phrase patterns such as \"action item\", \"todo\", \"follow up\", \"decision\", \"agreed\", \"decided\" and \"key point\". It also pulls out @mentions as owners and phrases like \"deadline:\", \"due by\" or \"by Friday\" as due dates, so a raw call log becomes a structured follow-up list. Meeting notetakers, scrum leads and anyone who records calls get a copyable summary and a downloadable .txt report in one pass.",
  useCases: [
    "You have a 40-minute sprint planning transcript from your call recorder and need the assigned tasks pulled out before standup tomorrow, without rereading the whole thing.",
    "A client call ended with several commitments buried in small talk, and you want a written list of who agreed to what so you can send a recap that matches the transcript.",
    "You are auditing last quarter's project decisions and want to isolate every line where the team said \"decided\", \"agreed\" or \"going with\" across several transcripts.",
  ],
  benefits: [
    ["Three buckets, not one blob", "Each line is classified as an action, a decision or a key point instead of being dumped into a single summary paragraph."],
    ["Owners and deadlines attached", "@mentions become owner tags and date phrases become deadline tags on the individual action item they appeared with."],
    ["Deterministic, not generative", "The same transcript always yields the same output because extraction is pattern matching, so nothing is paraphrased or invented."],
  ],
  faqs: [
    [
      "How does it decide what counts as an action item?",
      "It matches each line against action cue patterns: \"action item\", \"todo\", \"follow up\", \"responsible\", a [x] checkbox, an assignment phrase, or a modal like will / need to / must / should. A line is tested for actions first, then decisions, then key points, so each line lands in exactly one bucket.",
    ],
    [
      "Does my transcript get uploaded anywhere?",
      "No. The regex matching, owner detection and summary formatting all run in your browser tab, and the downloaded meeting-summary.txt is generated locally from a blob, so confidential call content never leaves the device.",
    ],
    [
      "How should I format the transcript so extraction works well?",
      "Keep one utterance per line and use explicit cue words. Prefixing tasks with \"Action item:\", decisions with \"Decision:\" and owners with @handle gives the cleanest result; lines longer than 20 characters that match no cue and are not header lines fall through to key points.",
    ],
    [
      "Can it handle transcripts from Zoom, Teams or Google Meet?",
      "Yes, if you paste the plain-text export. Speaker-labelled exports work because classification is per line; timestamps are simply carried along as part of the line text, and you can strip them first if you want tighter output.",
    ],
  ],
};

export default seo;

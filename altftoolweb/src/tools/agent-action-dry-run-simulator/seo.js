const seo = {
  title: "Dry-Run AI Agent Tool Calls Before You Approve",
  metaDescription:
    "Paste agent tool-call JSON to see which calls write, delete, message or move money, the target, the missing safeguard and a review score. Nothing runs.",
  steps: [
    "Paste into 'Proposed tool calls' one JSON object, a bare array, or a calls/toolCalls/tool_calls/actions wrapper — up to 200 calls — or press 'Load safe demo'.",
    "Analysis updates locally as you type: check the Calls, Side effects, Highest review and Missing prompts metrics for the batch.",
    "Read each call's effect type, extracted target and named missing safeguard, then use Copy report or Download report to save agent-action-dry-run-report.txt.",
  ],
  intro:
    "The Agent Action Dry-Run Simulator reads a proposed AI tool call as JSON and tells you what it would probably do before anything runs: it classifies each call into write, deletion, message, money movement, external side effect, code execution or read-only, pulls out the concrete targets from the arguments, checks which safeguards are present, and scores how much review the call deserves. It is for anyone wiring up an agent — a developer testing a new tool schema, or a reviewer looking at a plan an agent produced — who wants a second opinion before granting execution. No call is connected, sent or executed; the analysis is deterministic pattern matching over the JSON you paste, entirely in the browser.",
  useCases: [
    "An agent has proposed a batch of tool calls and you want to see, before approving, which ones send messages or move money rather than just reading data",
    "You are designing a new tool schema and want to check that its arguments expose a reviewable target and a confirmation flag rather than hiding the destination",
    "You are writing an incident review and need a plain-text report listing every irreversible step in a plan and the safeguards that were missing from each",
  ],
  benefits: [
    ["Separates irreversible from recoverable", "Messages and payments are marked likely irreversible outright, while deletions and code execution downgrade to potentially reversible only when a backup, snapshot, rollback or undo signal is actually present in the arguments."],
    ["Names the target, skips the secret", "Destination-shaped keys such as recipient, path, url, endpoint, repository, table and bucket are surfaced for review, while anything matching password, token, secret or private key is deliberately excluded."],
    ["Tells you which safeguard is absent", "Rather than a bare score, each call lists the specific missing control — confirmation, dry-run flag, recovery, idempotency key, or a narrow scope — matched to the effects it actually has."],
  ],
  faqs: [
    [
      "Does this actually run or send the tool call?",
      "No. Nothing is connected, sent, saved or executed — the JSON is parsed and pattern-matched locally, and the only output is a report. That is the point of a dry run: you get the preview without the side effect.",
    ],
    [
      "How is the risk score calculated?",
      "Each detected effect adds a fixed weight — money movement 6, deletion 5, code execution 5, messaging 4, write 3, external side effect 2 — plus 2 if no confirmation signal is present, 1 if no explicit target could be found, and 1 more for a deletion with no recovery signal. A total of 10 or more reads as critical review, 7 to 9 as high, 4 to 6 as moderate, and below that as low signal.",
    ],
    [
      "What input format does it accept?",
      "Any JSON containing tool calls: a single object, a bare array, or an object with a calls, toolCalls, tool_calls or actions array. Arguments may be a nested object or a JSON string, OpenAI-style function blocks are unwrapped automatically, and up to 200 calls can be analysed at once.",
    ],
    [
      "Does a low score mean the action is safe?",
      "No. The classifier reads tool names, argument keys and HTTP methods, so a custom or misleadingly named tool can be scored low while doing something drastic, and a well-named read-only call can look riskier than it is. Treat the output as a prompt for human review, not as an authorisation — runtime permissions, policy and explicit approval still have to be checked separately.",
    ],
  ],
};

export default seo;
